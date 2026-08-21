import {existsSync, readFileSync, readdirSync} from "node:fs";
import {join, relative} from "node:path";
import ts from "typescript";
import {describe, expect, it} from "vitest";
import type {FeedbackActionKey} from "@/feedback/messages";

const projectRoot = process.cwd();
const sourceRoot = join(projectRoot, "src");

function walk(directory: string): string[] {
    return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? walk(path) : [path];
    });
}

const activeProductionFiles = walk(sourceRoot).filter((path) => {
    const projectPath = relative(projectRoot, path);
    return /\.tsx?$/.test(path)
        && !/\.(?:test|spec)\.tsx?$/.test(path)
        && !projectPath.startsWith("src/sample/");
});

const read = (projectPath: string) =>
    readFileSync(join(projectRoot, projectPath), "utf8");

function parse(projectPath: string): ts.SourceFile {
    return ts.createSourceFile(
        projectPath,
        read(projectPath),
        ts.ScriptTarget.Latest,
        true,
        projectPath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
}

function importedBindings(
    sourceFile: ts.SourceFile,
    moduleName: string,
    importedName: string,
): string[] {
    return sourceFile.statements.flatMap((statement) => {
        if (!ts.isImportDeclaration(statement)
            || !ts.isStringLiteral(statement.moduleSpecifier)
            || statement.moduleSpecifier.text !== moduleName
            || !statement.importClause?.namedBindings
            || !ts.isNamedImports(statement.importClause.namedBindings)) {
            return [];
        }

        return statement.importClause.namedBindings.elements
            .filter((element) => (element.propertyName ?? element.name).text === importedName)
            .map((element) => element.name.text);
    });
}

function countJsxElements(sourceFile: ts.SourceFile, binding: string): number {
    let count = 0;
    const visit = (node: ts.Node) => {
        if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
            && ts.isIdentifier(node.tagName)
            && node.tagName.text === binding) {
            count += 1;
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return count;
}

function usesNativePrompt(sourceFile: ts.SourceFile): boolean {
    let found = false;
    const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
            const expression = node.expression;
            found ||= ts.isIdentifier(expression) && ["alert", "confirm"].includes(expression.text);
            found ||= ts.isPropertyAccessExpression(expression)
                && ts.isIdentifier(expression.expression)
                && ["window", "globalThis"].includes(expression.expression.text)
                && ["alert", "confirm"].includes(expression.name.text);
            found ||= ts.isElementAccessExpression(expression)
                && ts.isIdentifier(expression.expression)
                && ["window", "globalThis"].includes(expression.expression.text)
                && ts.isStringLiteral(expression.argumentExpression)
                && ["alert", "confirm"].includes(expression.argumentExpression.text);
        }
        if (!found) ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return found;
}

function callableBody(projectPath: string, callableName: string): string {
    const sourceFile = parse(projectPath);
    let body: ts.ConciseBody | undefined;
    const visit = (node: ts.Node) => {
        if (ts.isFunctionDeclaration(node) && node.name?.text === callableName) {
            body = node.body;
        }
        if (ts.isVariableDeclaration(node)
            && ts.isIdentifier(node.name)
            && node.name.text === callableName
            && node.initializer
            && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
            body = node.initializer.body;
        }
        if (!body) ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    if (!body) throw new Error(`Callable ${callableName} not found in ${projectPath}`);
    return body.getText(sourceFile);
}

interface ActionContract {
    flow: string;
    file: string;
    handler: string;
    action: FeedbackActionKey;
    pendingGuard: string;
    pendingInComponent?: boolean;
    failureMethod: "error" | "retryableError";
}

const actionContracts = [
    {flow: "login", file: "src/app/auth/page.tsx", handler: "onSubmit", action: "login", pendingGuard: "isLoading", failureMethod: "error"},
    {flow: "logout", file: "src/components/navigation/Header.tsx", handler: "handleLogout", action: "logout", pendingGuard: "isLoggingOut", failureMethod: "error"},
    {flow: "Company create", file: "src/components/company/company-list.tsx", handler: "handleCreate", action: "companyCreate", pendingGuard: "isActionLoading", failureMethod: "error"},
    {flow: "Company update", file: "src/app/(admin)/company/[id]/page.tsx", handler: "handleUpdate", action: "companyUpdate", pendingGuard: "isActionLoading", failureMethod: "error"},
    {flow: "Company delete list", file: "src/components/company/company-list.tsx", handler: "handleDelete", action: "companyDelete", pendingGuard: "isActionLoading", failureMethod: "error"},
    {flow: "Company delete detail", file: "src/app/(admin)/company/[id]/page.tsx", handler: "handleDelete", action: "companyDelete", pendingGuard: "isActionLoading", failureMethod: "error"},
    {flow: "Employee create", file: "src/components/dialog/employee-modal.tsx", handler: "onSubmit", action: "employeeCreate", pendingGuard: "isSubmitting", pendingInComponent: true, failureMethod: "error"},
    {flow: "Employee update", file: "src/components/dialog/employee-modal.tsx", handler: "onSubmit", action: "employeeUpdate", pendingGuard: "isSubmitting", pendingInComponent: true, failureMethod: "error"},
    {flow: "Employee delete list", file: "src/app/(admin)/employee/page.tsx", handler: "confirmDelete", action: "employeeDelete", pendingGuard: "isDeleting", failureMethod: "error"},
    {flow: "Employee delete detail", file: "src/app/(admin)/employee/[id]/page.tsx", handler: "handleDelete", action: "employeeDelete", pendingGuard: "isDeleting", failureMethod: "error"},
    {flow: "Shift Session open", file: "src/components/session/session.open.dialog.tsx", handler: "submit", action: "shiftSessionOpen", pendingGuard: "isPending", failureMethod: "error"},
    {flow: "Shift Session update", file: "src/app/(main)/calculator/checkpoints/page.tsx", handler: "handleUpdateSessionTime", action: "shiftSessionUpdateTime", pendingGuard: "isUpdatingTime", failureMethod: "error"},
    {flow: "Shift Session close", file: "src/app/(main)/calculator/checkpoints/page.tsx", handler: "handleCloseSession", action: "shiftSessionClose", pendingGuard: "isClosingSession", failureMethod: "error"},
    {flow: "Checkpoint create", file: "src/app/(main)/calculator/checkpoints/page.tsx", handler: "handleCreateCheckpoint", action: "checkpointCreate", pendingGuard: "isCreatingCheckpoint", failureMethod: "error"},
    {flow: "Checkpoint update", file: "src/app/(main)/calculator/checkpoints/page.tsx", handler: "handleUpdateCheckpoint", action: "checkpointUpdate", pendingGuard: "isUpdatingCheckpoint", failureMethod: "error"},
    {flow: "Checkpoint delete", file: "src/app/(main)/calculator/checkpoints/page.tsx", handler: "handleDeleteCheckpoint", action: "checkpointDelete", pendingGuard: "isDeletingCheckpoint", failureMethod: "error"},
    {flow: "Shift Result Draft confirm", file: "src/app/(main)/calculator/draft/page.tsx", handler: "handleAcceptResults", action: "shiftResultDraftConfirm", pendingGuard: "pendingAction", failureMethod: "error"},
    {flow: "Shift Result Draft discard", file: "src/app/(main)/calculator/draft/page.tsx", handler: "handleBackToCheckpoints", action: "shiftResultDraftDiscard", pendingGuard: "pendingAction", failureMethod: "error"},
    {flow: "Shift Result create/update", file: "src/components/results/ShiftResultModal.tsx", handler: "onSubmit", action: "shiftResultSave", pendingGuard: "isSubmitting", pendingInComponent: true, failureMethod: "error"},
    {flow: "Shift Result delete list", file: "src/app/(main)/results/page.tsx", handler: "handleDelete", action: "shiftResultDelete", pendingGuard: "isDeletePending", failureMethod: "error"},
    {flow: "Shift Result delete detail", file: "src/app/(main)/results/[id]/page.tsx", handler: "handleDelete", action: "shiftResultDelete", pendingGuard: "isDeletePending", failureMethod: "error"},
    {flow: "Payroll Excel", file: "src/app/(main)/results/page.tsx", handler: "handleDownload", action: "payrollExport", pendingGuard: "isDownloadPending", failureMethod: "retryableError"},
] satisfies ActionContract[];

describe("feedback migration contract", () => {
    it("keeps Chakra toaster operations behind the feedback boundary", () => {
        const allowedStoreUsers = new Set([
            "src/components/ui/toaster.tsx",
            "src/feedback/feedback.ts",
        ]);
        const offenders = activeProductionFiles.flatMap((path) => {
            const projectPath = relative(projectRoot, path);
            const sourceFile = parse(projectPath);
            const importsToaster = importedBindings(sourceFile, "@/feedback/toast-store", "toaster").length > 0;
            const importsFactory = importedBindings(sourceFile, "@chakra-ui/react", "createToaster").length > 0;
            if (importsFactory && projectPath !== "src/feedback/toast-store.ts") return [projectPath];
            if (importsToaster && !allowedStoreUsers.has(projectPath)) return [projectPath];
            return [];
        });

        expect(offenders).toEqual([]);
    });

    it("mounts exactly one global renderer and has no page-local copies", () => {
        const wrapperMounts = activeProductionFiles.flatMap((path) => {
            const projectPath = relative(projectRoot, path);
            const sourceFile = parse(projectPath);
            const bindings = [
                ...importedBindings(sourceFile, "@/components/ui/toaster", "Toaster"),
                ...importedBindings(sourceFile, "./toaster", "Toaster"),
            ];
            return bindings
                .flatMap((binding) => Array.from(
                    {length: countJsxElements(sourceFile, binding)},
                    () => projectPath,
                ));
        });
        const chakraRendererUsers = activeProductionFiles.flatMap((path) => {
            const projectPath = relative(projectRoot, path);
            return importedBindings(parse(projectPath), "@chakra-ui/react", "Toaster").length > 0
                ? [projectPath]
                : [];
        });

        expect(wrapperMounts).toEqual(["src/components/ui/provider.tsx"]);
        expect(chakraRendererUsers).toEqual(["src/components/ui/toaster.tsx"]);
        expect(read("src/app/layout.tsx")).toContain("<Provider");
    });

    it("has no native prompts or duplicate legacy confirmation components", () => {
        const promptUsers = activeProductionFiles
            .filter((path) => usesNativePrompt(parse(relative(projectRoot, path))))
            .map((path) => relative(projectRoot, path));

        expect(promptUsers).toEqual([]);
        expect(existsSync(join(projectRoot, "src/components/dialog/delete-confirm-modal.tsx"))).toBe(false);
        expect(existsSync(join(projectRoot, "src/components/dialog/components.dialog.confirmation.delete.tsx"))).toBe(false);
    });

    it("keeps services free of catch-log-reject wrappers", () => {
        const offenders = activeProductionFiles
            .filter((path) => relative(projectRoot, path).startsWith("src/service/"))
            .filter((path) => /console\.(?:error|log)|Promise\.reject/.test(readFileSync(path, "utf8")))
            .map((path) => relative(projectRoot, path));

        expect(offenders).toEqual([]);
    });

    it.each(actionContracts)("records success, failure, and pending protection in $flow", ({file, handler, action, pendingGuard, pendingInComponent, failureMethod}) => {
        const body = callableBody(file, handler);

        expect(body).toContain(`\"${action}\"`);
        expect(pendingInComponent ? read(file) : body).toContain(pendingGuard);
        expect(body).toMatch(/\.success\s*\(/);
        expect(body).toContain(`.${failureMethod}(`);
    });
});
