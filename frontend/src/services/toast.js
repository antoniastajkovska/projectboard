export function showToast(message, variant = "success") {
    if (!message || typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(
        new CustomEvent("projectboard-toast", {
            detail: {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                message,
                variant
            }
        })
    );
}
