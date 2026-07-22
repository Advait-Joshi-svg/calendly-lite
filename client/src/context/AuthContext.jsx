import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { login as loginRequest, register as registerRequest, fetchMe } from "../api/authApi";
import { setAuthToken } from "../api/apiClient";

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = "calendly_lite_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // "checking" while we restore a session on first load, so protected routes
  // don't flash a redirect to /login before we know the answer.
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setStatus("signedOut");
      return;
    }

    setAuthToken(storedToken);
    fetchMe()
      .then((data) => {
        setToken(storedToken);
        setUser(data.user);
        setStatus("signedIn");
      })
      .catch(() => {
        // Token expired/invalid — clear it quietly and treat as signed out.
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setAuthToken(null);
        setStatus("signedOut");
      });
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setStatus("signedIn");
    return data.user;
  }, []);

  // Registration does NOT sign the user in (backend returns no token) —
  // the caller should redirect to /login with a success message afterward.
  const register = useCallback(async (fields) => {
    return registerRequest(fields);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setStatus("signedOut");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
