import { Link } from "react-router-dom";
import api from "../services/api";
import { clearSession, getUsername } from "../services/session";

function TopBar({ title, subtitle, actionLabel, actionTo }) {
    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            // Session is already local; always clear it.
        } finally {
            clearSession();
            window.location.href = "/";
        }
    };

    return (
        <header className="topbar">
            <div>
                <div className="eyebrow">ProjectBoard</div>
                <h1>{title}</h1>
                {subtitle ? <p>{subtitle}</p> : null}
            </div>
            <div className="topbar-actions">
                {actionLabel && actionTo ? (
                    <Link className="button button-secondary" to={actionTo}>
                        {actionLabel}
                    </Link>
                ) : null}
                <div className="user-chip">{getUsername()}</div>
                <button className="button button-ghost" onClick={logout}>
                    Logout
                </button>
            </div>
        </header>
    );
}

export default TopBar;
