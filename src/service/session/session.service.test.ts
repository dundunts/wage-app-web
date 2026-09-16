import axios from "axios";
import {describe, expect, it, vi} from "vitest";
import {SessionApiClient} from "@/api/session/session.api.client";
import {SessionService} from "@/service/session/session.service";

describe("Session QR Tips contract", () => {
    it("requests the session endpoint and returns whole rubles without conversion", async () => {
        const adapter = vi.fn(async config => ({
            data: {tips: 1234},
            status: 200,
            statusText: "OK",
            headers: {},
            config,
        }));
        const service = new SessionService(new SessionApiClient(axios.create({adapter})));
        const controller = new AbortController();

        expect(await service.getQrTips("session-1", controller.signal)).toBe(1234);
        expect(adapter).toHaveBeenCalledWith(expect.objectContaining({
            method: "get",
            url: "/api/v1/session/session-1/qr-tips",
            signal: controller.signal,
        }));
    });
});
