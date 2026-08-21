import {ThemePrototype, type ThemePrototypeVariant} from "./ThemePrototype";

type ThemePrototypePageProps = {
    searchParams: Promise<{variant?: string | string[]}>;
};

const variants: ThemePrototypeVariant[] = ["A", "B", "C"];

export default async function ThemePrototypePage({searchParams}: ThemePrototypePageProps) {
    const requestedVariant = (await searchParams).variant;
    const variant = variants.includes(requestedVariant as ThemePrototypeVariant)
        ? requestedVariant as ThemePrototypeVariant
        : "A";

    return <ThemePrototype variant={variant}/>;
}
