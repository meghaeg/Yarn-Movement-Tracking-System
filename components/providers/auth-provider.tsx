"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  role: "admin" | "manager" | "staff"
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: "admin" | "manager" | "staff") => boolean
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
  ],
  manager: [
    "products.manage",
    "products.view",
    "products.add",
    "products.edit",
    "reports.view",
    "reports.export",
    "stock.manage",
    "stock.view",
    "orders.manage",
    "orders.view",
    "categories.manage",
    "suppliers.manage",
  ],
  staff: ["products.view", "stock.manage", "stock.view", "orders.view"],
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

  const login = (email: string, password: string, role: "admin" | "manager" | "staff") => {
    // Simple demo authentication - in real app, this would be an API call
    if (email && password) {
      const newUser: User = {
        id: Date.now().toString(),
        email,
        role,
        name: email.split("@")[0] || "User",
      }
      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
      return true
    }
    return false
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
