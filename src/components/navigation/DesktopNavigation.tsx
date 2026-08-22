"use client";

import {HStack, Popover, Portal, StackSeparator, VStack} from "@chakra-ui/react";
import {usePathname, useRouter} from "next/navigation";
import {
    filterNavItems,
    isDestinationCurrent,
    isRouteActive,
    NavItem,
    navItems,
} from "@/components/navigation/navigation";
import {LiquidGlassAction} from "@/components/ui/liquid-glass";
import useUserStore from "@/store/userStore";

export function DesktopNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const permissions = useUserStore((state) => state.permissions);
    const filteredNavItems = filterNavItems(navItems, permissions);

    function navTo(item: NavItem) {
        if (item.href) router.push(item.href);
    }

    return (
        <HStack display={{base: "none", md: "flex"}}>
            {filteredNavItems.map((level1) =>
                level1.children && level1.children.length > 0
                    ? <Popover.Root key={level1.label}>
                        <Popover.Trigger asChild>
                            <LiquidGlassAction
                                selected={isRouteActive(level1, pathname)}
                                aria-current={isDestinationCurrent(level1, pathname) ? "page" : undefined}
                                fontWeight="medium"
                            >
                                {level1.label}
                            </LiquidGlassAction>
                        </Popover.Trigger>

                        <Portal>
                            <Popover.Positioner>
                                <Popover.Content
                                    p={4}
                                    width="max-content"
                                    minW="12rem"
                                >
                                    <HStack align="start" separator={<StackSeparator/>}>
                                        {level1.children.map((level2) => (
                                            <VStack key={level2.label} align="start">
                                                {level2.children && level2.children.length > 0 ? (
                                                    <>
                                                        <LiquidGlassAction
                                                            selected={isRouteActive(level2, pathname)}
                                                            aria-current={isDestinationCurrent(level2, pathname) ? "page" : undefined}
                                                            size="sm"
                                                            fontSize="sm"
                                                            fontWeight="semibold"
                                                        >
                                                            {level2.label}
                                                        </LiquidGlassAction>

                                                        {level2.children.map((level3) => (
                                                            <LiquidGlassAction
                                                                key={level3.href}
                                                                selected={isRouteActive(level3, pathname)}
                                                                aria-current={isDestinationCurrent(level3, pathname) ? "page" : undefined}
                                                                size="sm"
                                                                justifyContent="flex-start"
                                                                onClick={() => navTo(level3)}
                                                            >
                                                                {level3.label}
                                                            </LiquidGlassAction>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <LiquidGlassAction
                                                        selected={isRouteActive(level2, pathname)}
                                                        aria-current={isDestinationCurrent(level2, pathname) ? "page" : undefined}
                                                        size="sm"
                                                        fontWeight="medium"
                                                        justifyContent="flex-start"
                                                        onClick={() => navTo(level2)}
                                                    >
                                                        {level2.label}
                                                    </LiquidGlassAction>
                                                )}
                                            </VStack>
                                        ))}
                                    </HStack>
                                </Popover.Content>
                            </Popover.Positioner>
                        </Portal>
                    </Popover.Root>
                    : <LiquidGlassAction
                        key={level1.label}
                        selected={isRouteActive(level1, pathname)}
                        aria-current={isDestinationCurrent(level1, pathname) ? "page" : undefined}
                        fontWeight="medium"
                        onClick={() => navTo(level1)}
                    >
                        {level1.label}
                    </LiquidGlassAction>
            )}
        </HStack>
    );
}
