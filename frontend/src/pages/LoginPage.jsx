import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import api from "../services/api";
import { setSession } from "../services/session";
import { buildFieldErrors, getGeneralErrorMessage } from "../services/validation";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const login = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setFieldErrors({});

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            setSession(response);
            navigate("/dashboard");
        } catch (requestError) {
            const message = requestError?.response?.data?.message || "Login failed. Check your credentials.";
            const parsedFieldErrors = buildFieldErrors(message, ["email", "password"]);
            setFieldErrors(parsedFieldErrors);
            setError(getGeneralErrorMessage(message, parsedFieldErrors) || "Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-shell auth-shell-login">
            <div className="auth-orb auth-orb-one" aria-hidden="true" />
            <div className="auth-orb auth-orb-two" aria-hidden="true" />

            <section className="auth-card auth-login-card">
                <div className="auth-login-header">
                   

                    <div className="auth-login-copy">
                        <h1>Welcome back</h1>
                        <p>Sign in to continue managing your projects</p>
                    </div>
                </div>

                <form className="auth-form auth-login-form" onSubmit={login}>
                    <label>
                        Email
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            className={fieldErrors.email ? "input-error" : ""}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                if (fieldErrors.email) {
                                    setFieldErrors((current) => ({ ...current, email: "" }));
                                }
                            }}
                        />
                        {fieldErrors.email ? <span className="field-error-text">{fieldErrors.email}</span> : null}
                    </label>
                    <label>
                        Password
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            className={fieldErrors.password ? "input-error" : ""}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                if (fieldErrors.password) {
                                    setFieldErrors((current) => ({ ...current, password: "" }));
                                }
                            }}
                        />
                        {fieldErrors.password ? <span className="field-error-text">{fieldErrors.password}</span> : null}
                    </label>

                    <AlertMessage variant="error">{error}</AlertMessage>

                    <button className="button button-primary auth-login-button" type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Log in"}
                    </button>

                    <p className="auth-switch auth-login-switch">
                        New here? <Link to="/register">Create account</Link>
                    </p>
                </form>
            </section>
        </main>
    );
}

export default LoginPage;
