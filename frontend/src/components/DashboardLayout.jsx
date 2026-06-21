import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import ToastHost from "./ToastHost";
import api from "../services/api";
import { clearSession, getUsername } from "../services/session";
import { getTheme, setTheme, toggleTheme } from "../services/theme";

function DashboardLayout({ title, subtitle, actions, children }) {
    const [theme, setThemeState] = useState(getTheme());

    useEffect(() => {
        setTheme(theme);
    }, [theme]);

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            // Session state is cleared locally regardless of network outcome.
        } finally {
            clearSession();
            window.location.href = "/";
        }
    };

    return (
        <div className="dashboard-shell">
            <ToastHost />
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-mark">PB</div>
                    <div>
                        <div className="sidebar-title">ProjectBoard</div>
                        <div className="sidebar-subtitle">Project tracking</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/projects" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                        Projects
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-card">
                        <span className="user-card-label">Signed in as</span>
                        <span className="user-card-name">{getUsername()}</span>
                    </div>

                    <button
                        className="button button-sidebar"
                        type="button"
                        onClick={() => setThemeState(toggleTheme())}
                    >
                        {theme === "dark" ? "Light mode" : "Dark mode"}
                    </button>

                    <button className="button button-sidebar" type="button" onClick={logout}>
                        Logout
                    </button>
                </div>
            </aside>

            <div className="workspace">
                <header className="workspace-header">
                    <div>
                        <div className="eyebrow">ProjectBoard</div>
                        <h1>{title}</h1>
                        {subtitle ? <p>{subtitle}</p> : null}
                    </div>

                    <div className="workspace-actions">{actions}</div>
                </header>

                <main className="workspace-content">{children}</main>
            </div>
        </div>
    );
}

export default DashboardLayout;
