"use client";

import {Box, Flex, HStack, Text} from "@chakra-ui/react";
import {LogOut} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {DesktopNavigation} from "@/components/navigation/DesktopNavigation";
import {MobileNavigation} from "@/components/navigation/MobileNavigation";
import {LiquidGlassAction} from "@/components/ui/liquid-glass";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";
import {authService} from "@/service/auth.service";

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

                <DesktopNavigation/>

                <HStack>
                    <LiquidGlassAction
                        display={{base: "none", md: "inline-flex"}}
                        onClick={handleLogout}
                        loading={isLoggingOut}
                        loadingText={feedbackMessages.logout.loading}
                        disabled={isLoggingOut}
                    >
                        <LogOut size={18}/>
                        Выйти
                    </LiquidGlassAction>

                    <MobileNavigation
                        onLogout={handleLogout}
                        isLoggingOut={isLoggingOut}
                    />
                </HStack>
            </Flex>
        </Box>
    );
}
