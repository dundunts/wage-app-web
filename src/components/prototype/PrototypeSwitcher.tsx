"use client";

import {Box, HStack, IconButton, Text, VStack} from "@chakra-ui/react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {usePathname, useRouter} from "next/navigation";
import {useCallback, useEffect} from "react";

type PrototypeSwitcherProps<TVariant extends string> = {
    current: TVariant;
    variants: readonly TVariant[];
    names: Record<TVariant, string>;
    stateSummary: string;
};

export function PrototypeSwitcher<TVariant extends string>({
    current,
    variants,
    names,
    stateSummary,
}: PrototypeSwitcherProps<TVariant>) {
    const pathname = usePathname();
    const router = useRouter();
    const currentIndex = variants.indexOf(current);

    const select = useCallback((offset: number) => {
        const nextIndex = (currentIndex + offset + variants.length) % variants.length;
        router.replace(`${pathname}?variant=${variants[nextIndex]}`, {scroll: false});
    }, [currentIndex, pathname, router, variants]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target;
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                (target instanceof HTMLElement && target.isContentEditable)
            ) {
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                select(-1);
            }
            if (event.key === "ArrowRight") {
                event.preventDefault();
                select(1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [select]);

    if (process.env.NODE_ENV === "production") {
        return null;
    }

    return (
        <Box
            position="fixed"
            left="50%"
            bottom={{base: 4, md: 6}}
            transform="translateX(-50%)"
            zIndex={1000}
            bg="#f4f0e8"
            color="#171513"
            border="1px solid rgba(255,255,255,.38)"
            borderRadius="full"
            boxShadow="0 18px 60px rgba(0,0,0,.5)"
            px={2}
            py={2}
            maxW="calc(100vw - 24px)"
        >
            <HStack gap={2}>
                <IconButton
                    aria-label="Предыдущий вариант"
                    size="sm"
                    variant="ghost"
                    borderRadius="full"
                    onClick={() => select(-1)}
                >
                    <ChevronLeft size={18}/>
                </IconButton>
                <VStack gap={0} minW={{base: "190px", md: "280px"}} align="center">
                    <Text fontSize="xs" fontWeight="800" letterSpacing=".08em" textTransform="uppercase">
                        {current} — {names[current]}
                    </Text>
                    <Text fontSize="10px" color="#68625c" truncate maxW={{base: "180px", md: "270px"}}>
                        {stateSummary}
                    </Text>
                </VStack>
                <IconButton
                    aria-label="Следующий вариант"
                    size="sm"
                    variant="ghost"
                    borderRadius="full"
                    onClick={() => select(1)}
                >
                    <ChevronRight size={18}/>
                </IconButton>
            </HStack>
        </Box>
    );
}
