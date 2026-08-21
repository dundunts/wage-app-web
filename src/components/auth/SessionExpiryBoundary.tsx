"use client";

import {useEffect, useRef, useSyncExternalStore} from "react";
import {useRouter} from "next/navigation";
import {
    sessionExpiryHandler,
    type SessionExpiryHandler,
} from "@/auth/session-expiry";
import {feedback} from "@/feedback/feedback";

export default function SessionExpiryBoundary({
                                                  handler = sessionExpiryHandler,
                                              }: {
    handler?: SessionExpiryHandler;
}) {
    const router = useRouter();
    const event = useSyncExternalStore(handler.subscribe, handler.getSnapshot, () => null);
    const presented = useRef<typeof event>(null);

    useEffect(() => {
        if (!event || presented.current === event) return;
        presented.current = event;
        let active = true;
        queueMicrotask(() => {
            if (!active) return;
            feedback.beginAction("sessionExpired").error(event.error);
            router.replace(event.destination);
        });
        return () => {
            active = false;
        };
    }, [event, router]);

    return null;
}
