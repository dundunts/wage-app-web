"use client";

import {
    Box,
    Button,
    CloseButton,
    Drawer,
    Flex,
    HStack,
    IconButton,
    Popover,
    Portal,
    StackSeparator,
    Text,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import type {ButtonProps} from "@chakra-ui/react";
import {ChevronLeft, ChevronRight, LogOut, Menu} from "lucide-react";
import {useState} from "react";
import {NavItem, navItems} from "@/components/navigation/navigation";
import {usePathname, useRouter} from "next/navigation";
import {authService} from "@/service/auth.service";
import useUserStore from "@/store/userStore";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";

function filterNavItems(items: NavItem[], permissions: string[]): NavItem[] {
    return items.filter(item => {
        const requiredPermissions = item.requiredPermissions || []
        if (!requiredPermissions) return true;
        return requiredPermissions.every(permission => permissions.includes(permission))
    })
}

function isRouteActive(item: NavItem, pathname: string): boolean {
    if (isDestinationCurrent(item, pathname)) {
        return true;
    }

    return item.children?.some((child) => isRouteActive(child, pathname)) ?? false;
}

function isDestinationCurrent(item: NavItem, pathname: string): boolean {
    return Boolean(
        item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    );
}

function NavigationButton({
                              active,
                              current,
                              children,
                              ...props
                          }: ButtonProps & { active: boolean; current: boolean }) {
    return (
        <Button
            {...props}
            variant="subtle"
            position="relative"
            color={active ? "accent" : "fg.muted"}
            bg={active ? "accent.subtle" : "transparent"}
            aria-current={current ? "page" : undefined}
            _hover={{
                color: active ? "accent" : "fg",
                bg: active ? "accent.subtle" : "bg.subtle",
            }}
            _after={active ? {
                content: '""',
                position: "absolute",
                insetInline: "3",
                bottom: "0",
                h: "2px",
                bg: "accent",
                borderRadius: "full",
            } : undefined}
        >
            {children}
        </Button>
    );
}

export function Header() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        const logoutFeedback = feedback.beginAction("logout");
        try {
            await authService.logout();
            logoutFeedback.success();
        } catch (error) {
            logoutFeedback.error(error);
        } finally {
            setIsLoggingOut(false);
            router.replace("/auth");
        }
    };

    return (
        <Box
            as="header"
            position="sticky"
            top={0}
            zIndex={100}
            bg="bg.canvasWarm/88"
            backdropFilter="auto"
            backdropBlur="12px"
            borderBottomWidth="1px"
            borderColor="border"
        >
            <Flex
                h="64px"
                align="center"
                justify="space-between"
                px={{base: 4, md: 8}}
                maxW="1400px"
                mx="auto"
            >
                <Text color="fg" fontSize="lg" fontWeight="700" letterSpacing="-0.02em">
                    WageApp
                </Text>

                {/* Desktop navigation */}
                <DesktopNavigation/>

                <HStack>
                    <LogoutButton onLogout={handleLogout} isLoggingOut={isLoggingOut}/>

                    <MobileNavigation onLogout={handleLogout} isLoggingOut={isLoggingOut}/>
                </HStack>
            </Flex>
        </Box>
    );
}

function LogoutButton({
                          onLogout,
                          isLoggingOut,
                          mobile = false,
                      }: {
    onLogout: () => Promise<void>;
    isLoggingOut: boolean;
    mobile?: boolean;
}) {
    return (
        <Button
            variant="subtle"
            display={mobile ? undefined : {base: "none", md: "inline-flex"}}
            w={mobile ? "full" : undefined}
            onClick={onLogout}
            loading={isLoggingOut}
            loadingText={feedbackMessages.logout.loading}
            disabled={isLoggingOut}
        >
            <LogOut size={18}/> Выйти
        </Button>
    );
}

function DesktopNavigation() {
    const router = useRouter()
    const pathname = usePathname()

    function navTo(item: NavItem) {
        if (item.href) router.push(item.href)
    }

    return (
        <HStack display={{base: "none", md: "flex"}}>
            {filterNavItems(navItems, useUserStore().permissions).map((level1) =>
                level1.children && level1.children.length > 0
                    ? <Popover.Root key={level1.label}>
                        <Popover.Trigger asChild>
                            <NavigationButton
                                active={isRouteActive(level1, pathname)}
                                current={isDestinationCurrent(level1, pathname)}
                                fontWeight="medium"
                            >
                                {level1.label}
                            </NavigationButton>
                        </Popover.Trigger>

                        <Portal>
                            <Popover.Positioner>
                                <Popover.Content
                                    p={4}
                                    width="max-content"
                                    minW="12rem"
                                >
                                    <HStack align="start" separator={<StackSeparator/>}>
                                        {level1.children?.map((level2) => (
                                            <VStack key={level2.label} align="start">
                                                {level2.children && level2.children.length > 0 ? (
                                                    <>
                                                            <NavigationButton
                                                                active={isRouteActive(level2, pathname)}
                                                                current={isDestinationCurrent(level2, pathname)}
                                                                variant="subtle"
                                                                fontSize="sm"
                                                                fontWeight="semibold"
                                                            >
                                                                {level2.label}
                                                            </NavigationButton>

                                                        {level2.children.map((level3) => (
                                                            <NavigationButton
                                                                key={level3.href}
                                                                active={isRouteActive(level3, pathname)}
                                                                current={isDestinationCurrent(level3, pathname)}
                                                                size="sm"
                                                                justifyContent="flex-start"
                                                                onClick={() => navTo(level3)}
                                                            >
                                                                {level3.label}
                                                            </NavigationButton>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <NavigationButton
                                                        active={isRouteActive(level2, pathname)}
                                                        current={isDestinationCurrent(level2, pathname)}
                                                        size="sm"
                                                        fontWeight="medium"
                                                        justifyContent="flex-start"
                                                        onClick={() => navTo(level2)}
                                                    >
                                                        {level2.label}
                                                    </NavigationButton>
                                                )}
                                            </VStack>
                                        ))}
                                    </HStack>
                                </Popover.Content>
                            </Popover.Positioner>
                        </Portal>
                    </Popover.Root>
                    : <NavigationButton
                        key={level1.label}
                        active={isRouteActive(level1, pathname)}
                        current={isDestinationCurrent(level1, pathname)}
                        fontWeight="medium"
                        onClick={() => navTo(level1)}
                    >
                        {level1.label}
                    </NavigationButton>
            )}
        </HStack>
    );
}

function MobileNavigation({
                              onLogout,
                              isLoggingOut,
                          }: {
    onLogout: () => Promise<void>;
    isLoggingOut: boolean;
}) {
    const {open, onOpen, onClose} = useDisclosure();
    const [level1, setLevel1] = useState<number | null>(null);
    const [level2, setLevel2] = useState<number | null>(null);

    const filteredNavItems = filterNavItems(navItems, useUserStore().permissions)

    const router = useRouter()
    const pathname = usePathname()

    const reset = () => {
        setLevel1(null);
        setLevel2(null);
    };

    function navTo(item: NavItem) {
        if (item.href) {
            router.push(item.href)
            onClose()
            reset()
        }
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
                    <Drawer.Content>
                        <Drawer.Header>
                            <Drawer.Title>Навигация</Drawer.Title>
                        </Drawer.Header>

                        <Drawer.Body>
                            <VStack align="stretch">
                                {/* BACK BUTTON */}
                                {(level1 !== null || level2 !== null) &&
                                    <Button
                                        variant="subtle"
                                        justifyContent="space-between"
                                        onClick={() => level2 !== null ? setLevel2(null) : setLevel1(null)}
                                    >
                                        <HStack justifyContent='start'>
                                            <ChevronLeft/>
                                            Назад
                                        </HStack>
                                    </Button>
                                }

                                {/* LEVEL 1 */}
                                {level1 === null &&
                                    filteredNavItems.map((item, i) => (
                                        <NavigationButton
                                            key={item.label}
                                            active={isRouteActive(item, pathname)}
                                            current={isDestinationCurrent(item, pathname)}
                                            justifyContent="space-between"
                                            onClick={() => {
                                                if (item.children) setLevel1(i)
                                                else navTo(item)
                                            }}
                                        >
                                            {item.label}
                                            <ChevronRight/>
                                        </NavigationButton>
                                    ))}

                                {/* LEVEL 2 */}
                                {level1 !== null && level2 === null &&
                                    filteredNavItems[level1].children?.map((item, i) => (
                                        <NavigationButton
                                            key={item.label}
                                            active={isRouteActive(item, pathname)}
                                            current={isDestinationCurrent(item, pathname)}
                                            justifyContent="space-between"
                                            onClick={() => {
                                                if (item.children) setLevel2(i)
                                                else navTo(item)
                                            }}
                                        >
                                            {item.label}
                                            <ChevronRight/>
                                        </NavigationButton>
                                    ))}

                                {/* LEVEL 3 */}
                                {level1 !== null && level2 !== null &&
                                    filteredNavItems[level1].children?.[level2].children?.map(
                                        (item) => (
                                            <NavigationButton
                                                key={item.href}
                                                active={isRouteActive(item, pathname)}
                                                current={isDestinationCurrent(item, pathname)}
                                                justifyContent="flex-start"
                                                onClick={() => {
                                                    navTo(item);
                                                }}
                                            >
                                                {item.label}
                                            </NavigationButton>
                                        )
                                    )}

                                <Box pt={4} borderTopWidth="1px" borderColor="border.subtle">
                                    <LogoutButton
                                        onLogout={onLogout}
                                        isLoggingOut={isLoggingOut}
                                        mobile
                                    />
                                </Box>
                            </VStack>
                        </Drawer.Body>

                        <Drawer.CloseTrigger asChild>
                            <CloseButton size="sm"/>
                        </Drawer.CloseTrigger>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}
