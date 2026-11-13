import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, clearToken, getToken, setToken, setUnauthorizedHandler } from "./api";

const USER_KEY = "salarite_user";
const AuthContext = createContext(null);

export const homeFor = (role) => (role === "employer" ? "/employer" : "/hr");

function loadStoredUser() {
    try {
        return getToken() ? JSON.parse(localStorage.getItem(USER_KEY)) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadStoredUser);

    const logout = useCallback(() => {
        clearToken();
        localStorage.removeItem(USER_KEY);
        setUser(null);
    }, []);

    useEffect(() => {
        setUnauthorizedHandler(logout);   // expired or invalid token → back to login
    }, [logout]);

    const login = async (email, password) => {
        const data = await api.post("/auth/login", { email, password });
        setToken(data.access_token);

        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);