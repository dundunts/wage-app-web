import {
    createSystem,
    defaultConfig,
    defineConfig,
    defineRecipe,
    defineSlotRecipe,
} from "@chakra-ui/react";
import type {RecipeDefinition, SlotRecipeDefinition} from "@chakra-ui/react";
import {
    alertSlotRecipe as chakraAlertSlotRecipe,
    badgeRecipe as chakraBadgeRecipe,
    buttonRecipe as chakraButtonRecipe,
    cardSlotRecipe as chakraCardSlotRecipe,
    checkboxSlotRecipe as chakraCheckboxSlotRecipe,
    dialogSlotRecipe as chakraDialogSlotRecipe,
    drawerSlotRecipe as chakraDrawerSlotRecipe,
    headingRecipe as chakraHeadingRecipe,
    inputRecipe as chakraInputRecipe,
    menuSlotRecipe as chakraMenuSlotRecipe,
    popoverSlotRecipe as chakraPopoverSlotRecipe,
    selectSlotRecipe as chakraSelectSlotRecipe,
    spinnerRecipe as chakraSpinnerRecipe,
    tableSlotRecipe as chakraTableSlotRecipe,
    tabsSlotRecipe as chakraTabsSlotRecipe,
    textareaRecipe as chakraTextareaRecipe,
    toastSlotRecipe as chakraToastSlotRecipe,
    tooltipSlotRecipe as chakraTooltipSlotRecipe,
} from "@chakra-ui/react/theme";

const reducedMotion = {
    animationDuration: "0ms",
    animationName: "none",
    transitionDuration: "0ms",
    transform: "none",
} as const;

const overlayBackdropStyles = {
    bg: "overlay.backdrop",
    backdropFilter: "blur(3px)",
    _motionReduce: reducedMotion,
} as const;

const overlaySurfaceStyles = {
    bg: "bg.panel",
    color: "fg",
    borderColor: "border.emphasized",
    boxShadow: "panel",
    _motionReduce: reducedMotion,
} as const;

const liquidGlassDialogBackdropStyles = {
    ...overlayBackdropStyles,
    backdropFilter: "blur(9px) saturate(118%)",
} as const;

const liquidGlassDialogSurfaceStyles = {
    ...overlaySurfaceStyles,
    bg: "bg.panel/86",
    backdropFilter: "blur(26px) saturate(138%)",
    backgroundImage: "linear-gradient(135deg, {colors.accent.glow}, transparent 44%)",
    isolation: "isolate",
    overflow: "hidden",
} as const;

function createStatusSemanticPalette(
    lightToken: string,
    darkToken: string,
    darkContrastToken = "colors.ledger.canvas",
) {
    const token = (name: string, opacity?: number) =>
        `{${name}${opacity === undefined ? "" : `/${opacity}`}}`;

    return {
        contrast: {
            value: {
                _light: "{colors.ledgerLight.onSolid}",
                _dark: token(darkContrastToken),
            },
        },
        fg: {
            value: {_light: token(lightToken), _dark: token(darkToken)},
        },
        subtle: {
            value: {_light: token(lightToken, 10), _dark: token(darkToken, 10)},
        },
        muted: {
            value: {_light: token(lightToken, 18), _dark: token(darkToken, 16)},
        },
        emphasized: {
            value: {_light: token(lightToken, 26), _dark: token(darkToken, 24)},
        },
        solid: {
            value: {_light: token(lightToken), _dark: token(darkToken)},
        },
        focusRing: {
            value: {_light: token(lightToken), _dark: token(darkToken)},
        },
        border: {
            value: {_light: token(lightToken, 36), _dark: token(darkToken, 34)},
        },
    };
}

const buttonRecipe = defineRecipe({
    ...chakraButtonRecipe,
    base: {
        ...chakraButtonRecipe.base,
        borderRadius: "control",
        fontWeight: "semibold",
        transitionDuration: "quiet",
        transitionTimingFunction: "quiet",
        focusRingColor: "focus.ring",
        _focusVisible: {
            outlineColor: "focus.ring",
            outlineWidth: "2px",
        },
        _motionReduce: {
            transitionDuration: "0ms",
            transform: "none",
        },
    },
    variants: {
        ...chakraButtonRecipe.variants,
        variant: {
            ...chakraButtonRecipe.variants?.variant,
            primary: {
                bg: "action.solid",
                color: "action.contrast",
                borderColor: "transparent",
                _hover: {
                    bg: "action.hover",
                    transform: "translateY(-1px)",
                },
                _active: {
                    bg: "action.hover",
                    borderColor: "accent.border",
                    boxShadow: "accent",
                },
                _motionReduce: reducedMotion,
            },
            secondary: {
                bg: "bg.subtle",
                color: "fg",
                borderWidth: "1px",
                borderColor: "border",
                _hover: {
                    bg: "accent.subtle",
                    borderColor: "accent.border",
                },
            },
            destructive: {
                bg: "danger.solid",
                color: "danger.contrast",
                borderColor: "transparent",
                _hover: {opacity: 0.9},
                _active: {opacity: 0.82},
            },
        },
    },
    compoundVariants: [
        ...(chakraButtonRecipe.compoundVariants ?? []),
        {
            colorPalette: "brand",
            variant: "solid",
            css: {
                _hover: {
                    bg: "action.hover",
                },
                _active: {
                    bg: "action.hover",
                    borderColor: "accent.border",
                    boxShadow: "accent",
                },
            },
        },
    ],
} as RecipeDefinition);

const headingRecipe = defineRecipe({
    ...chakraHeadingRecipe,
    base: {
        ...chakraHeadingRecipe.base,
        color: "fg",
        fontWeight: "700",
        letterSpacing: "-0.025em",
    },
} as RecipeDefinition);

const inputRecipe = defineRecipe({
    ...chakraInputRecipe,
    base: {
        ...chakraInputRecipe.base,
        "--focus-color": "colors.focus.ring",
        borderRadius: "control",
        bg: "bg.raised",
        color: "fg",
        transitionDuration: "quiet",
        transitionTimingFunction: "quiet",
        _motionReduce: {
            transitionDuration: "0ms",
        },
    },
    variants: {
        ...chakraInputRecipe.variants,
        variant: {
            ...chakraInputRecipe.variants?.variant,
            outline: {
                ...chakraInputRecipe.variants?.variant?.outline,
                bg: "bg.raised",
                borderColor: "border",
                _hover: {
                    borderColor: "border.emphasized",
                },
                _focusVisible: {
                    borderColor: "focus.ring",
                    outlineColor: "focus.ring",
                    outlineWidth: "2px",
                    _invalid: {
                        borderColor: "border.error",
                    },
                },
            },
        },
    },
} as RecipeDefinition);

const textareaRecipe = defineRecipe({
    ...chakraTextareaRecipe,
    base: {
        ...chakraTextareaRecipe.base,
        "--focus-color": "colors.focus.ring",
        borderRadius: "control",
        bg: "bg.raised",
        color: "fg",
        transitionDuration: "quiet",
        transitionTimingFunction: "quiet",
        _motionReduce: reducedMotion,
    },
    variants: {
        ...chakraTextareaRecipe.variants,
        variant: {
            ...chakraTextareaRecipe.variants?.variant,
            outline: {
                ...chakraTextareaRecipe.variants?.variant?.outline,
                bg: "bg.raised",
                borderColor: "border",
                _hover: {borderColor: "border.emphasized"},
                _focusVisible: {
                    borderColor: "focus.ring",
                    outlineColor: "focus.ring",
                    outlineWidth: "2px",
                },
            },
        },
    },
} as RecipeDefinition);

const badgeRecipe = defineRecipe({
    ...chakraBadgeRecipe,
    base: {
        ...chakraBadgeRecipe.base,
        borderRadius: "full",
        fontWeight: "semibold",
    },
} as RecipeDefinition);

const spinnerRecipe = defineRecipe({
    ...chakraSpinnerRecipe,
    base: {
        ...chakraSpinnerRecipe.base,
        color: "accent",
        _motionReduce: {
            animationDuration: "0ms",
        },
    },
} as RecipeDefinition);

const cardSlotRecipe = defineSlotRecipe({
    ...chakraCardSlotRecipe,
    base: {
        ...chakraCardSlotRecipe.base,
        root: {
            ...chakraCardSlotRecipe.base?.root,
            borderRadius: "panel",
            borderWidth: "1px",
            borderColor: "border",
            bg: "bg.panel",
            boxShadow: "panel",
        },
    },
} as SlotRecipeDefinition);

const checkboxSlotRecipe = defineSlotRecipe({
    ...chakraCheckboxSlotRecipe,
    compoundVariants: [
        ...(chakraCheckboxSlotRecipe.compoundVariants ?? []),
        {
            colorPalette: "brand",
            variant: "solid",
            css: {
                control: {
                    "&:is([data-state=checked], [data-state=indeterminate])": {
                        bg: "accent",
                        color: "accent.contrast",
                        borderColor: "accent",
                    },
                },
            },
        },
    ],
} as SlotRecipeDefinition);

const selectSlotRecipe = defineSlotRecipe({
    ...chakraSelectSlotRecipe,
    base: {
        ...chakraSelectSlotRecipe.base,
        label: {
            ...chakraSelectSlotRecipe.base?.label,
            color: "fg.muted",
            fontWeight: "semibold",
        },
        trigger: {
            ...chakraSelectSlotRecipe.base?.trigger,
            borderRadius: "control",
            borderColor: "border",
            bg: "bg.raised",
            color: "fg",
            transitionDuration: "quiet",
            transitionTimingFunction: "quiet",
            _hover: {
                borderColor: "border.emphasized",
            },
            _focusVisible: {
                borderColor: "focus.ring",
                outlineColor: "focus.ring",
                outlineWidth: "2px",
            },
            _motionReduce: {
                transitionDuration: "0ms",
            },
        },
        content: {
            ...chakraSelectSlotRecipe.base?.content,
            borderColor: "border",
            bg: "bg.raised",
            color: "fg",
            boxShadow: "panel",
        },
        item: {
            ...chakraSelectSlotRecipe.base?.item,
            _highlighted: {
                bg: "accent.subtle",
            },
        },
    },
} as SlotRecipeDefinition);

const tableSlotRecipe = defineSlotRecipe({
    ...chakraTableSlotRecipe,
    base: {
        ...chakraTableSlotRecipe.base,
        root: {
            ...chakraTableSlotRecipe.base?.root,
            color: "fg",
        },
        header: {
            ...chakraTableSlotRecipe.base?.header,
            bg: "bg.subtle",
        },
        row: {
            ...chakraTableSlotRecipe.base?.row,
            borderColor: "border.muted",
        },
        columnHeader: {
            ...chakraTableSlotRecipe.base?.columnHeader,
            color: "fg.quiet",
            fontWeight: "semibold",
        },
        body: {
            ...chakraTableSlotRecipe.base?.body,
            "& tr": {
                transitionDuration: "quiet",
                transitionProperty: "background",
                _hover: {bg: "accent.subtle"},
                _motionReduce: {transitionDuration: "0ms"},
            },
        },
    },
} as SlotRecipeDefinition);

const tabsSlotRecipe = defineSlotRecipe({
    ...chakraTabsSlotRecipe,
    base: {
        ...chakraTabsSlotRecipe.base,
        root: {
            ...chakraTabsSlotRecipe.base?.root,
            "--tabs-indicator-bg": "colors.accent.subtle",
        },
        trigger: {
            ...chakraTabsSlotRecipe.base?.trigger,
            color: "fg.muted",
            _focusVisible: {
                outline: "2px solid",
                outlineColor: "focus.ring",
            },
            _selected: {
                color: "accent",
            },
        },
    },
} as SlotRecipeDefinition);

const menuSlotRecipe = defineSlotRecipe({
    ...chakraMenuSlotRecipe,
    base: {
        ...chakraMenuSlotRecipe.base,
        content: {
            ...chakraMenuSlotRecipe.base?.content,
            bg: "bg.raised",
            color: "fg",
            borderWidth: "1px",
            borderColor: "border.emphasized",
            borderRadius: "control",
            boxShadow: "panel",
            _motionReduce: reducedMotion,
        },
        item: {
            ...chakraMenuSlotRecipe.base?.item,
            _highlighted: {
                bg: "accent.subtle",
                color: "fg",
            },
            _focusVisible: {
                outline: "2px solid",
                outlineColor: "focus.ring",
            },
        },
        separator: {
            ...chakraMenuSlotRecipe.base?.separator,
            bg: "border.muted",
        },
    },
} as SlotRecipeDefinition);

const dialogSlotRecipe = defineSlotRecipe({
    ...chakraDialogSlotRecipe,
    base: {
        ...chakraDialogSlotRecipe.base,
        backdrop: {
            ...chakraDialogSlotRecipe.base?.backdrop,
            ...liquidGlassDialogBackdropStyles,
        },
        content: {
            ...chakraDialogSlotRecipe.base?.content,
            ...liquidGlassDialogSurfaceStyles,
            borderWidth: "1px",
            borderRadius: "panel",
        },
    },
} as SlotRecipeDefinition);

const drawerSlotRecipe = defineSlotRecipe({
    ...chakraDrawerSlotRecipe,
    base: {
        ...chakraDrawerSlotRecipe.base,
        backdrop: {
            ...chakraDrawerSlotRecipe.base?.backdrop,
            ...overlayBackdropStyles,
        },
        content: {
            ...chakraDrawerSlotRecipe.base?.content,
            ...overlaySurfaceStyles,
        },
    },
} as SlotRecipeDefinition);

const popoverSlotRecipe = defineSlotRecipe({
    ...chakraPopoverSlotRecipe,
    base: {
        ...chakraPopoverSlotRecipe.base,
        content: {
            ...chakraPopoverSlotRecipe.base?.content,
            "--popover-bg": "colors.bg.raised",
            color: "fg",
            borderWidth: "1px",
            borderColor: "border.emphasized",
            borderRadius: "panel",
            boxShadow: "panel",
            _motionReduce: reducedMotion,
        },
        arrowTip: {
            ...chakraPopoverSlotRecipe.base?.arrowTip,
            borderColor: "border.emphasized",
        },
    },
} as SlotRecipeDefinition);

const tooltipSlotRecipe = defineSlotRecipe({
    ...chakraTooltipSlotRecipe,
    base: {
        ...chakraTooltipSlotRecipe.base,
        content: {
            ...chakraTooltipSlotRecipe.base?.content,
            "--tooltip-bg": "colors.bg.raised",
            color: "fg",
            borderWidth: "1px",
            borderColor: "border.emphasized",
            borderRadius: "control",
            boxShadow: "panel",
            _motionReduce: reducedMotion,
        },
        arrowTip: {
            ...chakraTooltipSlotRecipe.base?.arrowTip,
            borderColor: "border.emphasized",
        },
    },
} as SlotRecipeDefinition);

const alertSlotRecipe = defineSlotRecipe({
    ...chakraAlertSlotRecipe,
    base: {
        ...chakraAlertSlotRecipe.base,
        root: {
            ...chakraAlertSlotRecipe.base?.root,
            bg: "bg.panel",
            color: "fg",
            borderWidth: "1px",
            borderColor: "border",
            borderRadius: "panel",
        },
    },
    variants: {
        ...chakraAlertSlotRecipe.variants,
        status: {
            ...chakraAlertSlotRecipe.variants?.status,
            info: {root: {colorPalette: "info", borderColor: "info.border"}},
            warning: {root: {colorPalette: "warning", borderColor: "warning.border"}},
            success: {root: {colorPalette: "success", borderColor: "success.border"}},
            error: {root: {colorPalette: "danger", borderColor: "danger.border"}},
        },
    },
} as SlotRecipeDefinition);

const toastSlotRecipe = defineSlotRecipe({
    ...chakraToastSlotRecipe,
    base: {
        ...chakraToastSlotRecipe.base,
        root: {
            ...chakraToastSlotRecipe.base?.root,
            bg: "bg.raised",
            color: "fg",
            borderWidth: "1px",
            borderColor: "border.emphasized",
            borderRadius: "panel",
            boxShadow: "panel",
            transitionDuration: "quiet",
            "--toast-trigger-bg": "colors.bg.subtle",
            "--toast-border-color": "colors.border.emphasized",
            "&[data-type=loading], &[data-type=info]": {
                borderColor: "info.border",
                "& [data-part=indicator]": {color: "status.info"},
            },
            "&[data-type=success]": {
                borderColor: "success.border",
                "& [data-part=indicator]": {color: "status.success"},
            },
            "&[data-type=warning]": {
                borderColor: "warning.border",
                "& [data-part=indicator]": {color: "status.warning"},
            },
            "&[data-type=error]": {
                borderColor: "danger.border",
                "& [data-part=indicator]": {color: "status.danger"},
            },
            _motionReduce: reducedMotion,
        },
        actionTrigger: {
            ...chakraToastSlotRecipe.base?.actionTrigger,
            borderRadius: "control",
            focusRingColor: "focus.ring",
        },
        closeTrigger: {
            ...chakraToastSlotRecipe.base?.closeTrigger,
            borderRadius: "control",
            focusRingColor: "focus.ring",
        },
    },
} as SlotRecipeDefinition);

const config = defineConfig({
    globalCss: {
        "html, body": {
            minHeight: "100%",
            bg: "bg.canvas",
            color: "fg",
            fontFamily: "body",
        },
        body: {
            margin: "0",
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: "'tnum' 1, 'ss01' 1",
        },
        "*::selection": {
            bg: "accent.subtle",
            color: "fg",
        },
        "*, *::before, *::after": {
            "@media (prefers-reduced-motion: reduce)": {
                animationDuration: "0.01ms !important",
                animationIterationCount: "1 !important",
                scrollBehavior: "auto !important",
                transitionDuration: "0.01ms !important",
            },
        },
    },
    theme: {
        tokens: {
            colors: {
                ledger: {
                    canvas: {value: "#0d0d0c"},
                    canvasWarm: {value: "#12110f"},
                    surface: {value: "#171613"},
                    raised: {value: "#1e1c18"},
                    soft: {value: "#24211c"},
                    text: {value: "#f4f0e8"},
                    muted: {value: "#a9a39a"},
                    quiet: {value: "#8f887e"},
                    neon: {value: "#32f5d2"},
                    teal: {value: "#0f766e"},
                    tealHover: {value: "#107b72"},
                    green: {value: "#5dd39e"},
                    blue: {value: "#75a7ff"},
                    amber: {value: "#e5b567"},
                    red: {value: "#ff7a7a"},
                    violet: {value: "#a98cff"},
                    onAccent: {value: "#062d28"},
                    onDanger: {value: "#2d080b"},
                    onWarning: {value: "#2b1b00"},
                },
                ledgerLight: {
                    canvas: {value: "#f7f6f2"},
                    canvasWarm: {value: "#f1efe8"},
                    surface: {value: "#fffefa"},
                    raised: {value: "#ffffff"},
                    soft: {value: "#ebe8df"},
                    text: {value: "#1c1a17"},
                    muted: {value: "#5f5a52"},
                    quiet: {value: "#6f675e"},
                    accent: {value: "#00796f"},
                    focus: {value: "#007f73"},
                    success: {value: "#21734d"},
                    info: {value: "#245eaa"},
                    warning: {value: "#855600"},
                    danger: {value: "#b42332"},
                    violet: {value: "#6741b4"},
                    onSolid: {value: "#ffffff"},
                },
            },
            fonts: {
                body: {value: "'Manrope Variable', Manrope, sans-serif"},
                heading: {value: "'Manrope Variable', Manrope, sans-serif"},
            },
            radii: {
                control: {value: "8px"},
                panel: {value: "12px"},
            },
            durations: {
                quiet: {value: "150ms"},
            },
            easings: {
                quiet: {value: "cubic-bezier(0.2, 0, 0, 1)"},
            },
            shadows: {
                panelDark: {
                    value: "0 18px 50px {colors.black/22}, inset 0 1px {colors.ledger.text/3}",
                },
                panelLight: {
                    value: "0 18px 50px {colors.black/12}, inset 0 1px {colors.white/60}",
                },
                accentDark: {
                    value: "0 0 0 1px {colors.ledger.neon/18}, 0 12px 34px {colors.ledger.teal/20}",
                },
                accentLight: {
                    value: "0 0 0 1px {colors.ledgerLight.accent/18}, 0 12px 34px {colors.ledger.teal/12}",
                },
            },
        },
        semanticTokens: {
            colors: {
                bg: {
                    DEFAULT: {
                        value: {_light: "{colors.ledgerLight.canvas}", _dark: "{colors.ledger.canvas}"},
                    },
                    canvas: {
                        value: {_light: "{colors.ledgerLight.canvas}", _dark: "{colors.ledger.canvas}"},
                    },
                    canvasWarm: {
                        value: {_light: "{colors.ledgerLight.canvasWarm}", _dark: "{colors.ledger.canvasWarm}"},
                    },
                    panel: {
                        value: {_light: "{colors.ledgerLight.surface}", _dark: "{colors.ledger.surface}"},
                    },
                    raised: {
                        value: {_light: "{colors.ledgerLight.raised}", _dark: "{colors.ledger.raised}"},
                    },
                    subtle: {
                        value: {_light: "{colors.ledgerLight.soft}", _dark: "{colors.ledger.soft}"},
                    },
                    muted: {
                        value: {_light: "{colors.ledgerLight.soft}", _dark: "{colors.ledger.soft}"},
                    },
                },
                fg: {
                    DEFAULT: {
                        value: {_light: "{colors.ledgerLight.text}", _dark: "{colors.ledger.text}"},
                    },
                    muted: {
                        value: {_light: "{colors.ledgerLight.muted}", _dark: "{colors.ledger.muted}"},
                    },
                    quiet: {
                        value: {_light: "{colors.ledgerLight.quiet}", _dark: "{colors.ledger.quiet}"},
                    },
                    error: {
                        value: {_light: "{colors.ledgerLight.danger}", _dark: "{colors.ledger.red}"},
                    },
                },
                border: {
                    DEFAULT: {
                        value: {_light: "{colors.ledgerLight.text/16}", _dark: "{colors.ledger.text/10}"},
                    },
                    muted: {
                        value: {_light: "{colors.ledgerLight.text/10}", _dark: "{colors.ledger.text/7}"},
                    },
                    emphasized: {
                        value: {_light: "{colors.ledgerLight.text/28}", _dark: "{colors.ledger.text/17}"},
                    },
                    error: {
                        value: {_light: "{colors.ledgerLight.danger}", _dark: "{colors.ledger.red}"},
                    },
                },
                overlay: {
                    backdrop: {
                        value: {_light: "{colors.ledgerLight.text/42}", _dark: "{colors.ledger.canvas/76}"},
                    },
                },
                accent: {
                    DEFAULT: {
                        value: {_light: "{colors.ledgerLight.accent}", _dark: "{colors.ledger.neon}"},
                    },
                    subtle: {
                        value: {_light: "{colors.ledgerLight.accent/10}", _dark: "{colors.ledger.neon/10}"},
                    },
                    border: {
                        value: {_light: "{colors.ledgerLight.accent/34}", _dark: "{colors.ledger.neon/30}"},
                    },
                    glow: {
                        value: {_light: "{colors.ledgerLight.accent/8}", _dark: "{colors.ledger.neon/7}"},
                    },
                    contrast: {
                        value: {_light: "{colors.ledgerLight.onSolid}", _dark: "{colors.ledger.onAccent}"},
                    },
                },
                action: {
                    solid: {
                        value: {_light: "{colors.ledger.teal}", _dark: "{colors.ledger.teal}"},
                    },
                    hover: {
                        value: {_light: "{colors.ledger.teal}", _dark: "{colors.ledger.tealHover}"},
                    },
                    contrast: {
                        value: {_light: "{colors.ledgerLight.onSolid}", _dark: "{colors.ledgerLight.onSolid}"},
                    },
                },
                focus: {
                    ring: {
                        value: {_light: "{colors.ledgerLight.focus}", _dark: "{colors.ledger.neon}"},
                    },
                },
                status: {
                    success: {
                        value: {_light: "{colors.ledgerLight.success}", _dark: "{colors.ledger.green}"},
                    },
                    info: {
                        value: {_light: "{colors.ledgerLight.info}", _dark: "{colors.ledger.blue}"},
                    },
                    warning: {
                        value: {_light: "{colors.ledgerLight.warning}", _dark: "{colors.ledger.amber}"},
                    },
                    danger: {
                        value: {_light: "{colors.ledgerLight.danger}", _dark: "{colors.ledger.red}"},
                    },
                },
                success: createStatusSemanticPalette(
                    "colors.ledgerLight.success",
                    "colors.ledger.green",
                ),
                info: createStatusSemanticPalette(
                    "colors.ledgerLight.info",
                    "colors.ledger.blue",
                ),
                danger: createStatusSemanticPalette(
                    "colors.ledgerLight.danger",
                    "colors.ledger.red",
                    "colors.ledger.onDanger",
                ),
                warning: createStatusSemanticPalette(
                    "colors.ledgerLight.warning",
                    "colors.ledger.amber",
                    "colors.ledger.onWarning",
                ),
                chart: {
                    primary: {
                        value: {_light: "{colors.ledgerLight.accent}", _dark: "{colors.ledger.neon}"},
                    },
                    blue: {
                        value: {_light: "{colors.ledgerLight.info}", _dark: "{colors.ledger.blue}"},
                    },
                    violet: {
                        value: {_light: "{colors.ledgerLight.violet}", _dark: "{colors.ledger.violet}"},
                    },
                    amber: {
                        value: {_light: "{colors.ledgerLight.warning}", _dark: "{colors.ledger.amber}"},
                    },
                    neutral: {
                        value: {_light: "{colors.ledgerLight.muted}", _dark: "{colors.ledger.muted}"},
                    },
                    axis: {
                        value: {_light: "{colors.ledgerLight.muted}", _dark: "{colors.ledger.muted}"},
                    },
                    grid: {
                        value: {_light: "{colors.ledgerLight.text/16}", _dark: "{colors.ledger.text/12}"},
                    },
                    cursor: {
                        value: {_light: "{colors.ledgerLight.accent/7}", _dark: "{colors.ledger.neon/7}"},
                    },
                },
                brand: {
                    contrast: {
                        value: {_light: "{colors.ledgerLight.onSolid}", _dark: "{colors.ledgerLight.onSolid}"},
                    },
                    fg: {
                        value: {_light: "{colors.ledgerLight.accent}", _dark: "{colors.ledger.neon}"},
                    },
                    subtle: {
                        value: {_light: "{colors.ledgerLight.accent/10}", _dark: "{colors.ledger.neon/10}"},
                    },
                    muted: {
                        value: {_light: "{colors.ledgerLight.accent/18}", _dark: "{colors.ledger.neon/16}"},
                    },
                    emphasized: {
                        value: {_light: "{colors.ledgerLight.accent/26}", _dark: "{colors.ledger.neon/24}"},
                    },
                    solid: {
                        value: {_light: "{colors.ledger.teal}", _dark: "{colors.ledger.teal}"},
                    },
                    focusRing: {
                        value: {_light: "{colors.ledgerLight.focus}", _dark: "{colors.ledger.neon}"},
                    },
                    border: {
                        value: {_light: "{colors.ledgerLight.accent/36}", _dark: "{colors.ledger.neon/30}"},
                    },
                },
            },
            shadows: {
                panel: {
                    value: {_light: "{shadows.panelLight}", _dark: "{shadows.panelDark}"},
                },
                accent: {
                    value: {_light: "{shadows.accentLight}", _dark: "{shadows.accentDark}"},
                },
            },
        },
        layerStyles: {
            panel: {
                value: {
                    bg: "bg.panel",
                    borderWidth: "1px",
                    borderColor: "border",
                    borderRadius: "panel",
                    boxShadow: "panel",
                },
            },
        },
        recipes: {
            badge: badgeRecipe,
            button: buttonRecipe,
            heading: headingRecipe,
            input: inputRecipe,
            spinner: spinnerRecipe,
            textarea: textareaRecipe,
        },
        slotRecipes: {
            alert: alertSlotRecipe,
            card: cardSlotRecipe,
            checkbox: checkboxSlotRecipe,
            dialog: dialogSlotRecipe,
            drawer: drawerSlotRecipe,
            menu: menuSlotRecipe,
            popover: popoverSlotRecipe,
            select: selectSlotRecipe,
            table: tableSlotRecipe,
            tabs: tabsSlotRecipe,
            toast: toastSlotRecipe,
            tooltip: tooltipSlotRecipe,
        },
    },
});

export const system = createSystem(defaultConfig, config);
