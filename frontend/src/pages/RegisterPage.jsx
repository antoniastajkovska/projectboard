import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import api from "../services/api";
import { setSession } from "../services/session";
import { buildFieldErrors, getGeneralErrorMessage } from "../services/validation";

function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const register = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setFieldErrors({});

        try {
            const response = await api.post("/auth/register", {
                username,
                email,
                password
            });

            setSession(response);
            navigate("/dashboard");
        } catch (requestError) {
            const message = requestError?.response?.data?.message || "Registration failed.";
            const parsedFieldErrors = buildFieldErrors(message, ["username", "email", "password"]);
            setFieldErrors(parsedFieldErrors);
            setError(getGeneralErrorMessage(message, parsedFieldErrors) || "Registration failed.");
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
                        <h1>Create your account</h1>
                        <p>Start organizing your projects in a clean, focused workspace</p>
                    </div>
                </div>

                <form className="auth-form auth-login-form" onSubmit={register}>
                    <label>
                        Username
                        <input
                            type="text"
                            placeholder="Alex"
                            value={username}
                            className={fieldErrors.username ? "input-error" : ""}
                            onChange={(event) => {
                                setUsername(event.target.value);
                                if (fieldErrors.username) {
                                    setFieldErrors((current) => ({ ...current, username: "" }));
                                }
                            }}
                        />
                        {fieldErrors.username ? <span className="field-error-text">{fieldErrors.username}</span> : null}
                    </label>
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
                            placeholder="At least 8 characters"
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
                        {loading ? "Creating account..." : "Create account"}
                    </button>

                    <p className="auth-switch auth-login-switch">
                        Already have an account? <Link to="/">Log in</Link>
                    </p>
                </form>
            </section>
        </main>
    );
}

export default RegisterPage;
