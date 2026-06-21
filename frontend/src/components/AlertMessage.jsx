function AlertMessage({ variant = "info", children }) {
    if (!children) {
        return null;
    }

    return <div className={`alert alert-${variant}`}>{children}</div>;
}

export default AlertMessage;
