// @/auth/auth.check.ts

import {tokenService} from "@/auth/auth.tokens.service";
import useUserStore from "@/store/userStore";
import {parseJwt} from "@/utils/jwtUtils";

export async function checkAuth() {
    const refresh = tokenService.getRefreshToken();
    const { clearAuth, setAuth } = useUserStore.getState();

    if (!refresh) {
        clearAuth();
        return;
    }

    const payload = parseJwt(refresh);

    const now = Date.now() / 1000;

    if (payload?.exp && payload.exp <= now) {
        try {
            const newAccess = await tokenService.refresh();
            const accessPayload = parseJwt(newAccess);

            if (accessPayload) {
                setAuth(accessPayload.sub, accessPayload.email, accessPayload.resource_access.account.roles);
            }
        } catch (err) {
            clearAuth();
        }
    }
}
