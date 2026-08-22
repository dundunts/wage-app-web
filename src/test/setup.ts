import "@testing-library/jest-dom/vitest";
import {afterEach} from "vitest";
import {cleanup} from "@testing-library/react";

class ResizeObserverStub implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: ResizeObserverStub,
});

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }),
});

Object.defineProperty(Element.prototype, "scrollTo", {
    writable: true,
    value: () => {},
});

afterEach(() => cleanup());
