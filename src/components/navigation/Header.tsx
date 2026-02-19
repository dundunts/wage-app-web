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
import {ChevronLeft, ChevronRight, LogOut, Menu, User} from "lucide-react";
import {useState} from "react";
import {NavItem, navItems} from "@/components/navigation/navigation";
import {useRouter} from "next/navigation";
import {authService} from "@/service/auth.service";

export function Header() {

    function handleLogout() {
        authService.logout()
    }

    return (
        <Box
            as="header"
            position="sticky"
            top={0}
            zIndex={100}
            bg="bg.surface"
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
                    <Button
                        variant="ghost"
                        display={{base: "none", md: "inline-flex"}}
                        onClick={handleLogout}
                    >
                        <LogOut size={18}/> Выйти
                    </Button>

                    <MobileNavigation/>
                </HStack>
            </Flex>
        </Box>
    );
}

function DesktopNavigation() {
    const router = useRouter()

    function navTo(item: NavItem) {
        if (item.href) router.push(item.href)
    }

    return (
        <HStack display={{base: "none", md: "flex"}}>
            {navItems.map((level1) =>
                level1.children && level1.children.length > 0
                    ? <Popover.Root key={level1.label}>
                        <Popover.Trigger asChild>
                            <Button variant="ghost" fontWeight="medium">
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
                                                            variant="ghost"
                                                            fontSize="sm"
                                                            fontWeight="semibold"
                                                        >
                                                            {level2.label}
                                                        </Button>

                                                        {level2.children.map((level3) => (
                                                            <Button
                                                                key={level3.href}
                                                                variant="ghost"
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
                                                        variant="ghost"
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
                    : <Button key={level1.label} variant="ghost" fontWeight="medium" onClick={() => navTo(level1)}>
                        {level1.label}
                    </Button>
            )}
        </HStack>
    );
}

function MobileNavigation() {
    const {open, onOpen, onClose} = useDisclosure();
    const [level1, setLevel1] = useState<number | null>(null);
    const [level2, setLevel2] = useState<number | null>(null);

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
                    variant="ghost"
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
                                        variant="ghost"
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
                                    navItems.map((item, i) => (
                                        <Button
                                            key={item.label}
                                            variant="ghost"
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
                                    navItems[level1].children?.map((item, i) => (
                                        <Button
                                            key={item.label}
                                            variant="ghost"
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
                                    navItems[level1].children?.[level2].children?.map(
                                        (item) => (
                                            <Button
                                                key={item.href}
                                                variant="ghost"
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
                                    <Button variant="outline" w="full">
                                        <User size={18}/> Профиль
                                    </Button>
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