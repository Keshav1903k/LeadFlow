import React, { createContext, useContext, useState, useEffect } from "react"

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("leadflow_token") || "demo-jwt-token"
  })

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("leadflow_user")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fall back to default
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw error
      }

      const data = await res.json()
      setToken(data.token)
      setUser(data.user)
    } catch (err) {
      // If server is not running or network fails, support demo login locally
      if (
        (email === "keshav@leadflow.app" || email === "demo@leadflow.app") &&
        password === "password123"
      ) {
        setToken("demo-jwt-token")
        setUser(DEFAULT_DEMO_USER)
        return
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw error
      }

      const data = await res.json()
      setToken(data.token)
      setUser(data.user)
    } catch (err) {
      // Local fallback for offline mode
      const newUser = { id: `user-${Date.now()}`, name, email }
      setToken(`jwt-${Date.now()}`)
      setUser(newUser)
      throw err
    } finally {
      setIsLoading(false)
    }
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
