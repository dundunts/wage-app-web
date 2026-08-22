/**
 * Recharts cannot consume Chakra token names directly, so production charts use
 * these semantic CSS variables as their single palette boundary.
 */
export const chartPalette = {
    primary: "var(--chakra-colors-chart-primary)",
    blue: "var(--chakra-colors-chart-blue)",
    violet: "var(--chakra-colors-chart-violet)",
    amber: "var(--chakra-colors-chart-amber)",
    neutral: "var(--chakra-colors-chart-neutral)",
    axis: "var(--chakra-colors-chart-axis)",
    grid: "var(--chakra-colors-chart-grid)",
    cursor: "var(--chakra-colors-chart-cursor)",
    surface: "var(--chakra-colors-bg-raised)",
} as const;

/** Teal leads; secondary series follow the documented blue/violet/amber/neutral order. */
export const chartSeriesPalette = [
    chartPalette.primary,
    chartPalette.blue,
    chartPalette.violet,
    chartPalette.amber,
    chartPalette.neutral,
] as const;

const chartSeriesDashPatterns = ["6 3", "2 3", "8 3 2 3", "1 3"] as const;

/** Repeated colors gain a distinct dashed outline instead of relying on color alone. */
export function getChartSeriesStyle(index: number) {
    const paletteIndex = index % chartSeriesPalette.length;
    const repetition = Math.floor(index / chartSeriesPalette.length);
    const dashArray = repetition === 0
        ? undefined
        : chartSeriesDashPatterns[(repetition - 1) % chartSeriesDashPatterns.length];

    return {
        color: chartSeriesPalette[paletteIndex],
        dashArray,
        fillOpacity: dashArray ? 0.68 : 1,
    };
}
