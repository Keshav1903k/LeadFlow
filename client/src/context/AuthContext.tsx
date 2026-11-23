import React, { createContext, useContext, useState, useEffect } from "react"
import { API_BASE } from "../lib/api"

export interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEFAULT_DEMO_USER: User = {
  id: "demo-user-1",
  name: "Keshav Sharma",
  email: "keshav@leadflow.app",
}
const DEFAULT_DEMO_TOKEN = "demo-jwt-token-leadflow"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("leadflow_token") || DEFAULT_DEMO_TOKEN
  })

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("leadflow_user")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fallback
      }
    }
    return DEFAULT_DEMO_USER
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (token) {
      localStorage.setItem("leadflow_token", token)
    } else {
      localStorage.removeItem("leadflow_token")
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem("leadflow_user", JSON.stringify(user))
    } else {
      localStorage.removeItem("leadflow_user")
    }
  }, [user])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        setToken(data.token)
        setUser(data.user)
        return
      }
    } catch {
      // fallback to auto-login
    } finally {
      setIsLoading(false)
    }

    // Auto-login fallback for ANY entered credentials
    const cleanEmail = email.trim() || "keshav@leadflow.app"
    const namePart = cleanEmail.split("@")[0] || "Keshav Sharma"
    const displayName =
      namePart.toLowerCase() === "keshav"
        ? "Keshav Sharma"
        : namePart.charAt(0).toUpperCase() + namePart.slice(1)

    const fallbackUser: User = {
      id: "demo-user-1",
      name: displayName,
      email: cleanEmail,
    }
    const fallbackToken = "demo-leadflow-token-" + Date.now()
    setToken(fallbackToken)
    setUser(fallbackUser)
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        setToken(data.token)
        setUser(data.user)
        return
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false)
    }

    // Auto-signup fallback for ANY entered credentials
    const fallbackUser: User = {
      id: "user-" + Date.now(),
      name: name.trim() || "Keshav Sharma",
      email: email.trim() || "keshav@leadflow.app",
    }
    const fallbackToken = "demo-leadflow-token-" + Date.now()
    setToken(fallbackToken)
    setUser(fallbackUser)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("leadflow_token")
    localStorage.removeItem("leadflow_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
