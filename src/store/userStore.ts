// @/store/userStore.ts
import {create} from "zustand";
import {persist} from "zustand/middleware";

export type UserStore = {
    isAuthenticated: boolean;
    uuid: string | null;
    email: string | null;
    permissions: string[];
    setAuth: (uuid: string, email: string, roles: string[]) => void;
    clearAuth: () => void;
};

const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            uuid: null,
            email: null,
            permissions: [],
            setAuth: (uuid: string, email: string, permissions: string[]) =>
                set(() => ({
                    isAuthenticated: true,
                    uuid,
                    email,
                    permissions: permissions,
                })),
            clearAuth: () =>
                set(() => ({
                    isAuthenticated: false,
                    uuid: null,
                    email: null,
                    permissions: [],
                })),
        }),
        {
            name: "user-store", // ключ в localStorage
        }
    )
);

export default useUserStore;
