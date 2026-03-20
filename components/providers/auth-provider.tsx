"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  role: "admin" | "manager"
  name: string
  unit?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: "admin" | "manager") => Promise<boolean>
  logout: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const rolePermissions = {
  admin: [
    "users.manage",
    "products.manage",
    "products.view",
    "products.add",
    "products.edit",
    "products.delete",
    "reports.view",
    "reports.export",
    "stock.manage",
    "stock.view",
    "orders.manage",
    "orders.view",
    "categories.manage",
    "suppliers.manage",
    "settings.manage",
    "units.view_history",
  ],
  manager: ["products.view", "stock.manage", "stock.view", "orders.view"],
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem("user")
      }
    }
  }, [])

  const login = async (email: string, password: string, role: "admin" | "manager") => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })
      if (!res.ok) return false
      const { user: loggedIn } = await res.json()
      if (!loggedIn) return false
      setUser(loggedIn)
      localStorage.setItem("user", JSON.stringify(loggedIn))
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const hasPermission = (permission: string) => {
    if (!user || !user.role) return false
    const permissions = rolePermissions[user.role]
    if (!permissions || !Array.isArray(permissions)) return false
    return permissions.includes(permission)
  }

  return <AuthContext.Provider value={{ user, login, logout, hasPermission }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
