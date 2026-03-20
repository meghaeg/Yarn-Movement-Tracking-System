"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import {
  LayoutDashboard,
  Package,
  Building2,
  BarChart3,
  Settings,
  Menu,
  X,
  Factory,
  FileText,
  Users,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: null },
  { name: "Live Production", href: "/dashboard/live-production", icon: Factory, permission: null },
  { name: "Unit 1 History", href: "/dashboard/units/UNIT1", icon: FileText, permission: "units.view_history" },
  { name: "Unit 2 History", href: "/dashboard/units/UNIT2", icon: FileText, permission: "units.view_history" },
  { name: "Unit 3 History", href: "/dashboard/units/UNIT3", icon: FileText, permission: "units.view_history" },
  { name: "Queue", href: "/dashboard/products", icon: Package, permission: "products.view" },
  { name: "Suppliers", href: "/dashboard/suppliers", icon: Building2, permission: "suppliers.manage" },
  { name: "Users", href: "/dashboard/users", icon: Users, permission: "users.manage" },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3, permission: "reports.view" },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, permission: "reports.view" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, permission: "settings.manage" },
]

export function PremiumNavbar() {
  const [isMenuOpen] = useState(true)
  const [isAnimating] = useState(false)
  const pathname = usePathname()
  const { hasPermission, user, logout } = useAuth()
  const router = useRouter()
  const navbarRef = useRef<HTMLDivElement>(null)

  // Filter navigation items based on permissions
  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission) return true
    if (user?.role === 'manager' && item.name === 'Queue') return false
    if (!user) return false
    return hasPermission(item.permission)
  })

  return (
    <div ref={navbarRef} className="relative">
      <nav className="w-full mx-4 mt-4">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg shadow-gray-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-gray-300/50">
          <div className="px-6 sm:px-8 lg:px-10">
            <div className="flex justify-between items-center h-[68px]">
              {/* Left: Empty Space */}
              <div className="flex items-center">
              </div>

              {/* Center: Logo and Brand */}
              <div className="flex items-center flex-1 justify-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl shadow-sm">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900 tracking-tight">
                    Sree Airson Textile Mills
                  </span>
                </div>
              </div>

              {/* Right: Profile and Logout */}
              <div className="flex items-center space-x-3">
                {/* User Profile */}
                <Button 
                  variant="ghost" 
                  className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 transition-all duration-200 hover:from-gray-200 hover:to-gray-300 shadow-sm"
                >
                  <span className="text-sm font-medium">{user?.name?.charAt(0) || "V"}</span>
                </Button>

                {/* Logout Button */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    logout()
                    router.push("/login")
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 transition-all duration-200 rounded-xl px-4"
                >
                  Logout
                </Button>
              </div>
            </div>

            {/* Expandable Module Section - Always Open */}
            <div className="transition-all duration-300 ease-in-out max-h-96 opacity-100">
              <div className="px-6 py-6 bg-gradient-to-b from-gray-50/80 to-white/90 border-t border-gray-200/30">
                <div className="flex flex-wrap gap-1 pb-2">
                  {filteredNavigation.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200/60 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300/60 hover:bg-gray-50/50 whitespace-nowrap",
                          isActive
                            ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 shadow-md ring-2 ring-primary/20"
                            : "hover:translate-y-[-1px]",
                        )}
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        <item.icon className="h-4 w-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-900">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      </div>
  )
}
