import {Drawer} from "@chakra-ui/react";
import {fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {
    LIQUID_GLASS_SEPARATOR_GAP,
    LiquidGlassAction,
    LiquidGlassDrawerContent,
    LiquidGlassSeparator,
} from "@/components/ui/liquid-glass";
import {Provider} from "@/components/ui/provider";

function finePointerMediaQuery(query: string): MediaQueryList {
    return {
        matches: query === "(pointer: fine)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    };
}

function elementBounds(width = 100, height = 40): DOMRect {
    return {
        x: 10,
        y: 20,
        left: 10,
        top: 20,
        right: 10 + width,
        bottom: 20 + height,
        width,
        height,
        toJSON: () => ({}),
    };
}

describe("LiquidGlassAction", () => {
    afterEach(() => vi.restoreAllMocks());

    it("distinguishes selected and unselected actions", () => {
        render(
            <Provider defaultTheme="dark">
                <LiquidGlassAction selected>Selected</LiquidGlassAction>
                <LiquidGlassAction>Unselected</LiquidGlassAction>
            </Provider>,
        );

        expect(screen.getByRole("button", {name: "Selected"})).toHaveAttribute(
            "data-selected",
            "true",
        );
        expect(screen.getByRole("button", {name: "Unselected"})).not.toHaveAttribute(
            "data-selected",
        );
    });

    it("composes the consumer pointer handler and updates highlight coordinates", () => {
        vi.spyOn(window, "matchMedia").mockImplementation(finePointerMediaQuery);
        const onPointerMove = vi.fn();
        render(
            <Provider defaultTheme="dark">
                <LiquidGlassAction selected onPointerMove={onPointerMove}>
                    Interactive
                </LiquidGlassAction>
            </Provider>,
        );
        const action = screen.getByRole("button", {name: "Interactive"});
        vi.spyOn(action, "getBoundingClientRect").mockReturnValue(elementBounds());

        fireEvent.pointerMove(action, {clientX: 60, clientY: 30, pointerType: "mouse"});

        expect(onPointerMove).toHaveBeenCalledOnce();
        expect(action.style.getPropertyValue("--glass-pointer-x")).toBe("50%");
        expect(action.style.getPropertyValue("--glass-pointer-y")).toBe("25%");
    });

    it("keeps the highlight static for touch input", () => {
        vi.spyOn(window, "matchMedia").mockImplementation(finePointerMediaQuery);
        render(
            <Provider defaultTheme="dark">
                <LiquidGlassAction selected>Touch action</LiquidGlassAction>
            </Provider>,
        );
        const action = screen.getByRole("button", {name: "Touch action"});
        vi.spyOn(action, "getBoundingClientRect").mockReturnValue(elementBounds());

        fireEvent.pointerMove(action, {clientX: 60, clientY: 30, pointerType: "touch"});

        expect(action.style.getPropertyValue("--glass-pointer-x")).toBe("");
        expect(action.style.getPropertyValue("--glass-pointer-y")).toBe("");
    });
});

describe("LiquidGlass drawer primitives", () => {
    afterEach(() => vi.restoreAllMocks());

    it("keeps separator spacing symmetric", () => {
        render(
            <Provider defaultTheme="dark">
                <LiquidGlassSeparator/>
            </Provider>,
        );

        expect(screen.getByRole("separator")).toBeVisible();
        expect(LIQUID_GLASS_SEPARATOR_GAP).toBe("4");
    });

    it("composes pointer handling on drawer content", () => {
        vi.spyOn(window, "matchMedia").mockImplementation(finePointerMediaQuery);
        const onPointerMove = vi.fn();
        render(
            <Provider defaultTheme="dark">
                <Drawer.Root open>
                    <Drawer.Positioner>
                        <LiquidGlassDrawerContent
                            data-testid="glass-drawer"
                            onPointerMove={onPointerMove}
                        >
                            <Drawer.Title>Navigation</Drawer.Title>
                        </LiquidGlassDrawerContent>
                    </Drawer.Positioner>
                </Drawer.Root>
            </Provider>,
        );
        const content = screen.getByTestId("glass-drawer");
        vi.spyOn(content, "getBoundingClientRect").mockReturnValue(elementBounds(200, 100));

        fireEvent.pointerMove(content, {clientX: 110, clientY: 70, pointerType: "mouse"});

        expect(onPointerMove).toHaveBeenCalledOnce();
        expect(content.style.getPropertyValue("--glass-pointer-x")).toBe("50%");
        expect(content.style.getPropertyValue("--glass-pointer-y")).toBe("50%");
    });
});
