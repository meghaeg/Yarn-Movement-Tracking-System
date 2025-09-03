"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Building2,
  Tags,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: null },
  { name: "Products", href: "/dashboard/products", icon: Package, permission: "products.view" },
  { name: "Stock", href: "/dashboard/stock", icon: Warehouse, permission: "stock.view" },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart, permission: "orders.view" },
  { name: "Categories", href: "/dashboard/categories", icon: Tags, permission: "categories.manage" },
  { name: "Suppliers", href: "/dashboard/suppliers", icon: Building2, permission: "suppliers.manage" },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3, permission: "reports.view" },
  { name: "Users", href: "/dashboard/users", icon: Users, permission: "users.manage" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, permission: "settings.manage" },
]

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { hasPermission, user } = useAuth()

  // Filter navigation items based on permissions
  const filteredNavigation = navigation.filter((item) => {
    // If no permission required, show the item
    if (!item.permission) return true
    // If user is not logged in, don't show protected items
    if (!user) return false
    // Check if user has the required permission
    return hasPermission(item.permission)
  })

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <Package className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-gray-900">Inventory</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
