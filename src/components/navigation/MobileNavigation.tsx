"use client";

import {
    CloseButton,
    Drawer,
    HStack,
    IconButton,
    Portal,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import {ChevronLeft, ChevronRight, LogOut, Menu} from "lucide-react";
import {usePathname, useRouter} from "next/navigation";
import {useState} from "react";
import {
    filterNavItems,
    isDestinationCurrent,
    isRouteActive,
    NavItem,
    navItems,
} from "@/components/navigation/navigation";
import {
    LiquidGlassAction,
    LiquidGlassDrawerContent,
    LiquidGlassSeparator,
} from "@/components/ui/liquid-glass";
import {feedbackMessages} from "@/feedback/messages";
import useUserStore from "@/store/userStore";

export interface MobileNavigationProps {
    onLogout: () => Promise<void>;
    isLoggingOut: boolean;
}

export function MobileNavigation({onLogout, isLoggingOut}: MobileNavigationProps) {
    const {open, onOpen, onClose} = useDisclosure();
    const [level1, setLevel1] = useState<number | null>(null);
    const [level2, setLevel2] = useState<number | null>(null);
    const permissions = useUserStore((state) => state.permissions);
    const filteredNavItems = filterNavItems(navItems, permissions);
    const selectedLevel1 = level1 === null ? undefined : filteredNavItems[level1];
    const selectedLevel2 = level2 === null ? undefined : selectedLevel1?.children?.[level2];
    const router = useRouter();
    const pathname = usePathname();

    const reset = () => {
        setLevel1(null);
        setLevel2(null);
    };

    function navTo(item: NavItem) {
        if (!item.href) return;

        router.push(item.href);
        onClose();
        reset();
    }

    function navigationActionProps(item: NavItem) {
        return {
            selected: isRouteActive(item, pathname),
            "aria-current": isDestinationCurrent(item, pathname) ? "page" as const : undefined,
        };
    }

    return (
        <Drawer.Root
            placement="end"
            size="full"
            open={open}
            onOpenChange={({open: nextOpen}) => {
                if (nextOpen) {
                    onOpen();
                } else {
                    onClose();
                    reset();
                }
            }}
        >
            <Drawer.Trigger asChild>
                <IconButton
                    aria-label="Open menu"
                    variant="subtle"
                    display={{base: "inline-flex", md: "none"}}
                >
                    <Menu/>
                </IconButton>
            </Drawer.Trigger>

            <Portal>
                <Drawer.Backdrop/>
                <Drawer.Positioner>
                    <LiquidGlassDrawerContent>
                        <Drawer.Header minH="20" px={{base: 5, sm: 6}}>
                            <Drawer.Title>Навигация</Drawer.Title>
                        </Drawer.Header>

                        <Drawer.Body px={{base: 5, sm: 6}} pt="0" pb="6">
                            <VStack
                                as="nav"
                                aria-label="Основная навигация"
                                align="stretch"
                                gap="1.5"
                            >
                                {(level1 !== null || level2 !== null) &&
                                    <LiquidGlassAction
                                        minH="52px"
                                        px="4"
                                        justifyContent="flex-start"
                                        onClick={() => level2 !== null ? setLevel2(null) : setLevel1(null)}
                                    >
                                        <HStack gap="2">
                                            <ChevronLeft size={20}/>
                                            Назад
                                        </HStack>
                                    </LiquidGlassAction>
                                }

                                {level1 === null && filteredNavItems.map((item, index) => (
                                    <LiquidGlassAction
                                        key={item.label}
                                        {...navigationActionProps(item)}
                                        minH="52px"
                                        px="4"
                                        fontSize="md"
                                        fontWeight="medium"
                                        justifyContent="space-between"
                                        onClick={() => {
                                            if (item.children?.length) setLevel1(index);
                                            else navTo(item);
                                        }}
                                    >
                                        {item.label}
                                        <ChevronRight size={20}/>
                                    </LiquidGlassAction>
                                ))}

                                {level1 !== null && level2 === null && selectedLevel1?.children?.map(
                                    (item, index) => (
                                        <LiquidGlassAction
                                            key={item.label}
                                            {...navigationActionProps(item)}
                                            minH="52px"
                                            px="4"
                                            fontSize="md"
                                            fontWeight="medium"
                                            justifyContent="space-between"
                                            onClick={() => {
                                                if (item.children?.length) setLevel2(index);
                                                else navTo(item);
                                            }}
                                        >
                                            {item.label}
                                            <ChevronRight size={20}/>
                                        </LiquidGlassAction>
                                    )
                                )}

                                {level1 !== null && level2 !== null && selectedLevel2?.children?.map(
                                    (item) => (
                                        <LiquidGlassAction
                                            key={item.href}
                                            {...navigationActionProps(item)}
                                            minH="52px"
                                            px="4"
                                            fontSize="md"
                                            fontWeight="medium"
                                            justifyContent="flex-start"
                                            onClick={() => navTo(item)}
                                        >
                                            {item.label}
                                        </LiquidGlassAction>
                                    )
                                )}
                            </VStack>

                            <LiquidGlassSeparator/>

                            <LiquidGlassAction
                                w="full"
                                minH="52px"
                                px="4"
                                fontSize="md"
                                fontWeight="medium"
                                justifyContent="space-between"
                                onClick={onLogout}
                                loading={isLoggingOut}
                                loadingText={feedbackMessages.logout.loading}
                                disabled={isLoggingOut}
                            >
                                <span>Выйти</span>
                                <LogOut size={20}/>
                            </LiquidGlassAction>
                        </Drawer.Body>

                        <Drawer.CloseTrigger asChild>
                            <CloseButton size="sm"/>
                        </Drawer.CloseTrigger>
                    </LiquidGlassDrawerContent>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
}
