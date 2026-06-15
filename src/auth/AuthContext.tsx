import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { invoke, getToken, setToken, getStoredUser, setStoredUser } from "../api/client";
import { CONFIG } from "../config";

type User = { user_id?: string; login?: string; role?: any; [k: string]: any };

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
};

export type RegisterData = {
  login: string;
  password: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: "Client" | "Agent" | "Owner";
};

const Ctx = createContext<AuthCtx>(null as any);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setTok] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => setTok(getToken()), []);

  async function applyAuth(res: any, fallbackLogin?: string) {
    const access = res?.token?.access_token;
    if (!access) throw new Error("no token returned");
    setToken(access);
    setTok(access);
    const u: User = {
      user_id: res.user_id,
      login: res.user?.login ?? fallbackLogin,
      role: res.role,
      ...res.user,
    };
    setStoredUser(u);
    setUser(u);
  }

  async function login(login: string, password: string) {
    setLoading(true);
    try {
      const res = await invoke("login", { login, password }, false);
      await applyAuth(res, login);
    } finally {
      setLoading(false);
    }
  }

  async function register(data: RegisterData) {
    setLoading(true);
    try {
      const role_id = CONFIG.ROLES[data.role ?? "Client"];
      const res = await invoke(
        "register",
        {
          login: data.login,
          password: data.password,
          role_id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
        },
        false
      );
      // register returns a token too; if present, sign in directly.
      if (res?.token?.access_token) await applyAuth(res, data.login);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setStoredUser(null);
    setTok(null);
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}
