import {
    createSystem,
    defaultConfig,
    defineConfig,
    defineRecipe,
    defineSlotRecipe,
} from "@chakra-ui/react";
import type {RecipeDefinition, SlotRecipeDefinition} from "@chakra-ui/react";
import {
    buttonRecipe as chakraButtonRecipe,
    cardSlotRecipe as chakraCardSlotRecipe,
    checkboxSlotRecipe as chakraCheckboxSlotRecipe,
    headingRecipe as chakraHeadingRecipe,
    inputRecipe as chakraInputRecipe,
    selectSlotRecipe as chakraSelectSlotRecipe,
} from "@chakra-ui/react/theme";

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
    compoundVariants: [
        ...(chakraButtonRecipe.compoundVariants ?? []),
        {
            colorPalette: "brand",
            variant: "solid",
            css: {
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
                    quiet: {value: "#706b64"},
                    neon: {value: "#32f5d2"},
                    teal: {value: "#0f766e"},
                    tealHover: {value: "#11877e"},
                    green: {value: "#5dd39e"},
                    blue: {value: "#75a7ff"},
                    amber: {value: "#e5b567"},
                    red: {value: "#ff7a7a"},
                    violet: {value: "#a98cff"},
                },
                ledgerLight: {
                    canvas: {value: "#f7f6f2"},
                    canvasWarm: {value: "#f1efe8"},
                    surface: {value: "#fffefa"},
                    raised: {value: "#ffffff"},
                    soft: {value: "#ebe8df"},
                    text: {value: "#1c1a17"},
                    muted: {value: "#5f5a52"},
                    quiet: {value: "#71695f"},
                    accent: {value: "#00796f"},
                    focus: {value: "#007f73"},
                    success: {value: "#21734d"},
                    info: {value: "#245eaa"},
                    warning: {value: "#855600"},
                    danger: {value: "#b42332"},
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
                        value: {_light: "white", _dark: "#062d28"},
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
                        value: {_light: "white", _dark: "white"},
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
                danger: {
                    contrast: {
                        value: {_light: "white", _dark: "#2d080b"},
                    },
                    fg: {
                        value: {_light: "{colors.ledgerLight.danger}", _dark: "{colors.ledger.red}"},
                    },
                    subtle: {
                        value: {_light: "{colors.ledgerLight.danger/10}", _dark: "{colors.ledger.red/10}"},
                    },
                    muted: {
                        value: {_light: "{colors.ledgerLight.danger/18}", _dark: "{colors.ledger.red/16}"},
                    },
                    emphasized: {
                        value: {_light: "{colors.ledgerLight.danger/26}", _dark: "{colors.ledger.red/24}"},
                    },
                    solid: {
                        value: {_light: "{colors.ledgerLight.danger}", _dark: "{colors.ledger.red}"},
                    },
                    focusRing: {
                        value: {_light: "{colors.ledgerLight.danger}", _dark: "{colors.ledger.red}"},
                    },
                    border: {
                        value: {_light: "{colors.ledgerLight.danger/36}", _dark: "{colors.ledger.red/34}"},
                    },
                },
                warning: {
                    contrast: {
                        value: {_light: "white", _dark: "#2b1b00"},
                    },
                    fg: {
                        value: {_light: "{colors.ledgerLight.warning}", _dark: "{colors.ledger.amber}"},
                    },
                    subtle: {
                        value: {_light: "{colors.ledgerLight.warning/10}", _dark: "{colors.ledger.amber/10}"},
                    },
                    muted: {
                        value: {_light: "{colors.ledgerLight.warning/18}", _dark: "{colors.ledger.amber/16}"},
                    },
                    emphasized: {
                        value: {_light: "{colors.ledgerLight.warning/26}", _dark: "{colors.ledger.amber/24}"},
                    },
                    solid: {
                        value: {_light: "{colors.ledgerLight.warning}", _dark: "{colors.ledger.amber}"},
                    },
                    focusRing: {
                        value: {_light: "{colors.ledgerLight.warning}", _dark: "{colors.ledger.amber}"},
                    },
                    border: {
                        value: {_light: "{colors.ledgerLight.warning/36}", _dark: "{colors.ledger.amber/34}"},
                    },
                },
                chart: {
                    primary: {
                        value: {_light: "{colors.ledgerLight.accent}", _dark: "{colors.ledger.neon}"},
                    },
                    blue: {
                        value: {_light: "{colors.ledgerLight.info}", _dark: "{colors.ledger.blue}"},
                    },
                    violet: {
                        value: {_light: "{colors.purple.700}", _dark: "{colors.ledger.violet}"},
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
                        value: {_light: "white", _dark: "white"},
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
            button: buttonRecipe,
            heading: headingRecipe,
            input: inputRecipe,
        },
        slotRecipes: {
            card: cardSlotRecipe,
            checkbox: checkboxSlotRecipe,
            select: selectSlotRecipe,
        },
    },
});

export const system = createSystem(defaultConfig, config);
