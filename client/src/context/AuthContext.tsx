import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";
import type { AuthResponse, User } from "../types/auth";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<void>;

  register: (
    data: RegisterData,
  ) => Promise<void>;

  logout: () => void;

  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("clientflow_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        setUser(response.data.user);
      } catch {
        localStorage.removeItem("clientflow_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    localStorage.setItem(
      "clientflow_token",
      response.data.token,
    );

    setUser(response.data.user);
  };

  const register = async (data: RegisterData) => {
    const response = await api.post<AuthResponse>(
      "/auth/register",
      data,
    );

    localStorage.setItem(
      "clientflow_token",
      response.data.token,
    );

    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem("clientflow_token");
    setUser(null);
  };

  const updateUser = (
  updatedUser: User,
) => {
  setUser(updatedUser);
};

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}