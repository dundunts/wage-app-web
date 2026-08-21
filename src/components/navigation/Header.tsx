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
import {ChevronLeft, ChevronRight, LogOut, Menu} from "lucide-react";
import {useState} from "react";
import {NavItem, navItems} from "@/components/navigation/navigation";
import {useRouter} from "next/navigation";
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
            bg="blackAlpha.800"   // прозрачность 80%
            backdropFilter="auto"
            backdropBlur="12px"
            borderBottomWidth="1px"
            borderColor="border.subtle"
        >
            <Flex
                h="64px"
                align="center"
                justify="space-between"
                px={{base: 4, md: 8}}
                maxW="1400px"
                mx="auto"
            >
                <Text fontSize="lg" fontWeight="bold">WageApp</Text>

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
        >
            <LogOut size={18}/> Выйти
        </Button>
    );
}

function DesktopNavigation() {
    const router = useRouter()

    function navTo(item: NavItem) {
        if (item.href) router.push(item.href)
    }

    return (
        <HStack display={{base: "none", md: "flex"}}>
            {filterNavItems(navItems, useUserStore().permissions).map((level1) =>
                level1.children && level1.children.length > 0
                    ? <Popover.Root key={level1.label}>
                        <Popover.Trigger asChild>
                            <Button variant="subtle" fontWeight="medium">
                                {level1.label}
                            </Button>
                        </Popover.Trigger>

                        <Portal>
                            <Popover.Positioner>
                                <Popover.Content p={4} borderRadius="lg" boxShadow="lg" width={'full'}>
                                    <HStack align="start" separator={<StackSeparator/>}>
                                        {level1.children?.map((level2) => (
                                            <VStack key={level2.label} align="start">
                                                {level2.children && level2.children.length > 0 ? (
                                                    <>
                                                        <Button
                                                            variant="subtle"
                                                            fontSize="sm"
                                                            fontWeight="semibold"
                                                        >
                                                            {level2.label}
                                                        </Button>

                                                        {level2.children.map((level3) => (
                                                            <Button
                                                                key={level3.href}
                                                                variant="subtle"
                                                                size="sm"
                                                                justifyContent="flex-start"
                                                                color="fg.muted"
                                                                onClick={() => navTo(level3)}
                                                            >
                                                                {level3.label}
                                                            </Button>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <Button
                                                        variant="subtle"
                                                        size="sm"
                                                        fontWeight="medium"
                                                        justifyContent="flex-start"
                                                        onClick={() => navTo(level2)}
                                                    >
                                                        {level2.label}
                                                    </Button>
                                                )}
                                            </VStack>
                                        ))}
                                    </HStack>
                                </Popover.Content>
                            </Popover.Positioner>
                        </Portal>
                    </Popover.Root>
                    : <Button key={level1.label} variant="subtle" fontWeight="medium" onClick={() => navTo(level1)}>
                        {level1.label}
                    </Button>
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

    function navTo(item: NavItem) {
        if (item.href) router.push(item.href)
    }

    const reset = () => {
        setLevel1(null);
        setLevel2(null);
    };

    return (
        <Drawer.Root placement="end" size="full" open={open}>
            <Drawer.Trigger asChild>
                <IconButton
                    aria-label="Open menu"
                    variant="subtle"
                    display={{base: "inline-flex", md: "none"}}
                    onClick={onOpen}
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
                                        <Button
                                            key={item.label}
                                            variant="subtle"
                                            justifyContent="space-between"
                                            onClick={() => {
                                                if (item.children) setLevel1(i)
                                                else navTo(item)
                                            }}
                                        >
                                            {item.label}
                                            <ChevronRight/>
                                        </Button>
                                    ))}

                                {/* LEVEL 2 */}
                                {level1 !== null && level2 === null &&
                                    filteredNavItems[level1].children?.map((item, i) => (
                                        <Button
                                            key={item.label}
                                            variant="subtle"
                                            justifyContent="space-between"
                                            onClick={() => {
                                                if (item.children) setLevel2(i)
                                                else navTo(item)
                                            }}
                                        >
                                            {item.label}
                                            <ChevronRight/>
                                        </Button>
                                    ))}

                                {/* LEVEL 3 */}
                                {level1 !== null && level2 !== null &&
                                    filteredNavItems[level1].children?.[level2].children?.map(
                                        (item) => (
                                            <Button
                                                key={item.href}
                                                variant="subtle"
                                                justifyContent="flex-start"
                                                onClick={() => {
                                                    navTo(item);
                                                    // onClose();
                                                    // reset();
                                                }}
                                            >
                                                {item.label}
                                            </Button>
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
                            <CloseButton size="sm" onClick={() => {
                                onClose();
                                reset();
                            }}/>
                        </Drawer.CloseTrigger>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}
