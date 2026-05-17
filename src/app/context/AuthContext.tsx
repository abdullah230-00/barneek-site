/**
 * AuthContext — إدارة صلاحيات الدخول عبر sessionStorage
 * الجلسة تنتهي عند إغلاق التبويب تلقائياً
 */
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Role = "callcenter" | "admin";

type AuthState = {
  callcenter: boolean;
  admin: boolean;
};

type AuthContextType = {
  login: (role: Role) => void;
  logout: (role: Role) => void;
  isAuthenticated: (role: Role) => boolean;
};

/* مفتاح التخزين في sessionStorage */
const STORAGE_KEY = "barneek_auth_v1";

const AuthContext = createContext<AuthContextType | null>(null);

function readFromSession(): AuthState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      /* تحقق صارم من شكل البيانات قبل الاستخدام */
      if (
        typeof parsed === "object" &&
        typeof parsed.callcenter === "boolean" &&
        typeof parsed.admin === "boolean"
      ) {
        return parsed;
      }
    }
  } catch {
    /* تجاهل أخطاء الـ JSON */
  }
  return { callcenter: false, admin: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(readFromSession);

  /* مزامنة مع sessionStorage عند كل تغيير */
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } catch {
      /* sessionStorage ممتلئ أو غير متاح */
    }
  }, [auth]);

  const login = (role: Role) =>
    setAuth((prev) => ({ ...prev, [role]: true }));

  const logout = (role: Role) =>
    setAuth((prev) => ({ ...prev, [role]: false }));

  const isAuthenticated = (role: Role) => auth[role];

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  }
  return ctx;
}
