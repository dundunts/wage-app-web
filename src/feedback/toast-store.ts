import {createToaster} from "@chakra-ui/react";

let sessionExpiredTransitionActive = false;

export const toaster = createToaster({
    placement: "bottom-end",
    pauseOnPageIdle: true,
    max: 3,
});

const createToast = toaster.create.bind(toaster);
toaster.create = (options) => {
    if (sessionExpiredTransitionActive && options.id === undefined) return "";
    return createToast(options);
};

export function beginSessionExpiredTransition() {
    sessionExpiredTransitionActive = true;
}

export function resetSessionExpiredTransition() {
    sessionExpiredTransitionActive = false;
}
