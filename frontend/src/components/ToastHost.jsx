import { useEffect, useState } from "react";

function ToastHost() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleToast = (event) => {
            const toast = event.detail;
            setToasts((current) => [...current, toast]);

            window.setTimeout(() => {
                setToasts((current) => current.filter((item) => item.id !== toast.id));
            }, 3000);
        };

        window.addEventListener("projectboard-toast", handleToast);
        return () => window.removeEventListener("projectboard-toast", handleToast);
    }, []);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="toast-host" aria-live="polite" aria-atomic="true">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.variant || "success"}`}>
                    {toast.message}
                </div>
            ))}
        </div>
    );
}

export default ToastHost;
