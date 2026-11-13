import { useAuth } from "../auth";

export default function Layout({ title, children }) {
    const { user, logout } = useAuth();
    return (
        <div className="app">
            <header className="topbar">
                <h1>Salarite Virtual HR</h1>
                <div className="topbar-right">
                    <span>{user.name} · {user.role === "hr" ? "Virtual HR" : "Employer"}</span>
                    <button className="btn btn-secondary" onClick={logout}>Log out</button>
                </div>
            </header>
            <main className="content">
                <h2>{title}</h2>
                {children}
            </main>
        </div>
    );
}