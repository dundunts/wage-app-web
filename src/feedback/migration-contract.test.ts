import {existsSync, readFileSync, readdirSync} from "node:fs";
import {join, relative} from "node:path";
import {describe, expect, it} from "vitest";

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

describe("feedback migration contract", () => {
    it("keeps Chakra toaster operations behind the feedback boundary", () => {
        const allowedOwners = new Set([
            "src/components/ui/toaster.tsx",
            "src/feedback/feedback.ts",
            "src/feedback/toast-store.ts",
        ]);
        const offenders = activeProductionFiles
            .filter((path) => !allowedOwners.has(relative(projectRoot, path)))
            .filter((path) => /\bcreateToaster\b|\btoaster\.(?:create|update|dismiss)\s*\(/.test(readFileSync(path, "utf8")))
            .map((path) => relative(projectRoot, path));

        expect(offenders).toEqual([]);
    });

    it("mounts exactly one global renderer and has no page-local copies", () => {
        const renderers = activeProductionFiles.flatMap((path) => {
            const count = readFileSync(path, "utf8").match(/<Toaster\b/g)?.length ?? 0;
            return Array.from({length: count}, () => relative(projectRoot, path));
        });

        expect(renderers).toEqual(["src/components/ui/provider.tsx"]);
        expect(read("src/app/layout.tsx")).toContain("<Provider");
    });

    it("has no native prompts or duplicate legacy confirmation components", () => {
        const promptUsers = activeProductionFiles
            .filter((path) => /\b(?:window\.)?(?:alert|confirm)\s*\(/.test(readFileSync(path, "utf8")))
            .map((path) => relative(projectRoot, path));

        expect(promptUsers).toEqual([]);
        expect(existsSync(join(projectRoot, "src/components/dialog/delete-confirm-modal.tsx"))).toBe(false);
        expect(existsSync(join(projectRoot, "src/components/dialog/components.dialog.confirmation.delete.tsx"))).toBe(false);
    });

    it("keeps services free of catch-log-reject wrappers", () => {
        const serviceFiles = activeProductionFiles.filter((path) =>
            relative(projectRoot, path).startsWith("src/service/"),
        );
        const offenders = serviceFiles
            .filter((path) => /console\.(?:error|log)|Promise\.reject/.test(readFileSync(path, "utf8")))
            .map((path) => relative(projectRoot, path));

        expect(offenders).toEqual([]);
    });

    it.each([
        ["login", "src/app/auth/page.tsx", "login", "isLoading", "error"],
        ["logout", "src/components/navigation/Header.tsx", "logout", "isLoggingOut", "error"],
        ["Company create", "src/components/company/company-list.tsx", "companyCreate", "isActionLoading", "error"],
        ["Company update", "src/app/(admin)/company/[id]/page.tsx", "companyUpdate", "isActionLoading", "error"],
        ["Company delete", "src/components/company/company-list.tsx", "companyDelete", "isActionLoading", "error"],
        ["Employee create", "src/components/dialog/employee-modal.tsx", "employeeCreate", "isSubmitting", "error"],
        ["Employee update", "src/components/dialog/employee-modal.tsx", "employeeUpdate", "isSubmitting", "error"],
        ["Employee delete", "src/app/(admin)/employee/page.tsx", "employeeDelete", "isDeleting", "error"],
        ["Shift Session open", "src/components/session/session.open.dialog.tsx", "shiftSessionOpen", "isPending", "error"],
        ["Shift Session update", "src/app/(main)/calculator/checkpoints/page.tsx", "shiftSessionUpdateTime", "isUpdatingTime", "error"],
        ["Shift Session close", "src/app/(main)/calculator/checkpoints/page.tsx", "shiftSessionClose", "isClosingSession", "error"],
        ["Checkpoint create", "src/app/(main)/calculator/checkpoints/page.tsx", "checkpointCreate", "isCreatingCheckpoint", "error"],
        ["Checkpoint update", "src/app/(main)/calculator/checkpoints/page.tsx", "checkpointUpdate", "isUpdatingCheckpoint", "error"],
        ["Checkpoint delete", "src/app/(main)/calculator/checkpoints/page.tsx", "checkpointDelete", "isDeletingCheckpoint", "error"],
        ["Shift Result Draft confirm", "src/app/(main)/calculator/draft/page.tsx", "shiftResultDraftConfirm", "pendingAction", "error"],
        ["Shift Result Draft discard", "src/app/(main)/calculator/draft/page.tsx", "shiftResultDraftDiscard", "pendingAction", "error"],
        ["Shift Result save", "src/components/results/ShiftResultModal.tsx", "shiftResultSave", "isSubmitting", "error"],
        ["Shift Result delete", "src/app/(main)/results/page.tsx", "shiftResultDelete", "isDeletePending", "error"],
        ["Payroll Excel", "src/app/(main)/results/page.tsx", "payrollExport", "isDownloadPending", "retryableError"],
    ])("records success, failure, and pending protection for %s", (_flow, file, action, pending, failure) => {
        const source = read(file);

        expect(source).toContain(`\"${action}\"`);
        expect(source).toContain(pending);
        expect(source).toMatch(/\.success\s*\(/);
        expect(source).toContain(`.${failure}(`);
    });
});
