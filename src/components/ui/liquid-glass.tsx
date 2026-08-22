"use client";

import {Button, Drawer, Separator} from "@chakra-ui/react";
import type {ButtonProps} from "@chakra-ui/react";
import type {ComponentProps, PointerEvent} from "react";
import {forwardRef} from "react";

type GlassPointerTarget = HTMLElement;

function canUseReactiveHighlight(event: PointerEvent<GlassPointerTarget>) {
    if (event.pointerType === "touch") return false;

    return typeof window === "undefined"
        || typeof window.matchMedia !== "function"
        || window.matchMedia("(pointer: fine)").matches;
}

function updatePointerPosition(event: PointerEvent<GlassPointerTarget>) {
    if (!canUseReactiveHighlight(event)) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;

    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    event.currentTarget.style.setProperty("--glass-pointer-x", `${x}%`);
    event.currentTarget.style.setProperty("--glass-pointer-y", `${y}%`);
}

export interface LiquidGlassActionProps extends ButtonProps {
    selected?: boolean;
    reactiveHighlight?: boolean;
}

export const LiquidGlassAction = forwardRef<HTMLButtonElement, LiquidGlassActionProps>(
    function LiquidGlassAction(
        {
            selected = false,
            reactiveHighlight = true,
            onPointerMove,
            children,
            ...props
        },
        ref,
    ) {
        return (
            <Button
                {...props}
                ref={ref}
                variant="subtle"
                position="relative"
                overflow="hidden"
                borderWidth="1px"
                borderColor={selected ? "glass.border" : "transparent"}
                borderRadius="glassControl"
                color={selected ? "accent" : "fg.muted"}
                bg={selected ? "glass.activeMid" : "transparent"}
                backgroundImage={selected
                    ? "radial-gradient(circle at var(--glass-pointer-x, 22%) var(--glass-pointer-y, 18%), {colors.glass.activeHighlight}, transparent 32%), linear-gradient(112deg, {colors.glass.activeStart}, {colors.glass.activeMid} 58%, {colors.glass.activeEnd})"
                    : "none"}
                backdropFilter={selected ? "blur(20px) saturate(180%)" : undefined}
                boxShadow={selected ? "glassAction" : "none"}
                data-selected={selected ? "true" : undefined}
                transitionProperty="color, background, border-color, box-shadow, transform"
                transitionDuration="quiet"
                transitionTimingFunction="quiet"
                _before={selected ? {
                    content: '""',
                    position: "absolute",
                    inset: "1px",
                    borderRadius: "calc({radii.glassControl} - 2px)",
                    pointerEvents: "none",
                    backgroundImage: "linear-gradient(118deg, {colors.glass.sheen}, transparent 38%)",
                } : undefined}
                _after={selected ? {
                    content: '""',
                    position: "absolute",
                    top: "-36%",
                    left: "-18%",
                    w: "42%",
                    h: "170%",
                    pointerEvents: "none",
                    backgroundImage: "linear-gradient(90deg, transparent, {colors.glass.sheen}, transparent)",
                    transform: "rotate(16deg)",
                    transitionProperty: "left",
                    transitionDuration: "quiet",
                    transitionTimingFunction: "quiet",
                } : undefined}
                _hover={{
                    color: selected ? "accent" : "fg",
                    bg: selected ? "glass.activeMid" : "glass.hover",
                    borderColor: selected ? "glass.border" : "transparent",
                    _after: selected ? {left: "82%"} : undefined,
                }}
                _focusVisible={{
                    outline: "2px solid",
                    outlineColor: "focus.ring",
                    outlineOffset: "-2px",
                }}
                _motionReduce={{
                    transitionDuration: "0ms",
                    transform: "none",
                    _after: {transitionDuration: "0ms"},
                }}
                onPointerMove={(event) => {
                    onPointerMove?.(event);
                    if (!event.defaultPrevented && reactiveHighlight && selected) {
                        updatePointerPosition(event);
                    }
                }}
            >
                {children}
            </Button>
        );
    },
);

type DrawerContentProps = ComponentProps<typeof Drawer.Content>;

export interface LiquidGlassDrawerContentProps extends DrawerContentProps {
    reactiveHighlight?: boolean;
}

export const LiquidGlassDrawerContent = forwardRef<HTMLDivElement, LiquidGlassDrawerContentProps>(
    function LiquidGlassDrawerContent(
        {reactiveHighlight = true, onPointerMove, children, ...props},
        ref,
    ) {
        return (
            <Drawer.Content
                {...props}
                ref={ref}
                position="relative"
                overflow="hidden"
                isolation="isolate"
                bg="glass.overlayEnd"
                backgroundImage="radial-gradient(circle at var(--glass-pointer-x, 78%) var(--glass-pointer-y, 10%), {colors.glass.glow}, transparent 22%), linear-gradient(118deg, {colors.glass.overlayStart}, {colors.glass.overlayEnd})"
                backdropFilter="blur(26px) saturate(165%)"
                borderInlineStartWidth="1px"
                borderColor="border"
                boxShadow="glassOverlay"
                css={{WebkitBackdropFilter: "blur(26px) saturate(165%)"}}
                _before={{
                    content: '""',
                    position: "absolute",
                    inset: "0",
                    zIndex: "-1",
                    pointerEvents: "none",
                    backgroundImage: "linear-gradient(104deg, {colors.glass.sheen}, transparent 24%, transparent 72%, {colors.glass.edge}), radial-gradient(circle at 16% 92%, {colors.glass.sheen}, transparent 28%)",
                }}
                onPointerMove={(event) => {
                    onPointerMove?.(event);
                    if (!event.defaultPrevented && reactiveHighlight) {
                        updatePointerPosition(event);
                    }
                }}
            >
                {children}
            </Drawer.Content>
        );
    },
);

type LiquidGlassSeparatorProps = ComponentProps<typeof Separator>;
export const LIQUID_GLASS_SEPARATOR_GAP = "4" as const;

export function LiquidGlassSeparator(props: LiquidGlassSeparatorProps) {
    return (
        <Separator
            {...props}
            flexShrink="0"
            h="1px"
            mx="4"
            my={LIQUID_GLASS_SEPARATOR_GAP}
            borderWidth="0"
            backgroundImage="linear-gradient(90deg, transparent, {colors.glass.separator} 14%, {colors.glass.separator} 86%, transparent)"
        />
    );
}
