import { useState } from "react";
import { Navigate } from "react-router-dom";
import { homeFor, useAuth } from "../auth";

const DEMO_ACCOUNTS = [
    { label: "Employer", email: "employer@salarite.com", password: "employer123" },
    { label: "Virtual HR (Priya)", email: "hr1@salarite.com", password: "hr123" },
    { label: "Virtual HR (Rahul)", email: "hr2@salarite.com", password: "hr123" },
];

export default function Login() {
    const { user, login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (user) return <Navigate to={homeFor(user.role)} replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);   // on success, `user` is set and the redirect above kicks in
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-page">
            <form className="card login-card" onSubmit={handleSubmit}>
                <h1>Salarite Virtual HR</h1>
                <p className="muted">Sign in to continue</p>

                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                {error && <div className="error">{error}</div>}

                <button className="btn" type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                <div className="demo-box">
                    <p className="muted">Demo accounts (click to fill):</p>
                    {DEMO_ACCOUNTS.map((a) => (
                        <button
                            key={a.email}
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { setEmail(a.email); setPassword(a.password); }}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>
            </form>

        </div>
    );
}