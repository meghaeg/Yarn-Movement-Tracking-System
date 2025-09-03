"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useInventory } from "@/hooks/use-inventory"
import { Download, TrendingUp, Package, ShoppingCart, AlertTriangle } from "lucide-react"

export default function ReportsPage() {
  const inventoryData = useInventory()
  const [reportType, setReportType] = useState("overview")
  const [timeRange, setTimeRange] = useState("30")

  // Safely extract data with fallbacks
  const products = inventoryData?.products || []
  const orders = inventoryData?.orders || []

  // Calculate metrics with safety checks
  const totalProducts = products.length
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
  const lowStockProducts = products.filter((p) => (p.stock || 0) <= (p.minStock || 0)).length

  const inventoryValue = products.reduce((sum, p) => sum + (p.sellingPrice || 0) * (p.stock || 0), 0)

  const exportToCSV = () => {
    if (products.length === 0) {
      alert("No data to export")
      return
    }

    const headers = ["Name", "SKU", "Category", "Stock", "Price", "Value"]
    const csvContent = [
      headers.join(","),
      ...products.map((product) =>
        [
          `"${product.name || ""}"`,
          `"${product.sku || ""}"`,
          `"${product.category || ""}"`,
          product.stock || 0,
          product.sellingPrice || 0,
          (product.sellingPrice || 0) * (product.stock || 0),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `inventory-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for your inventory</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Orders processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Revenue generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Value */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>Current inventory status and value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Inventory Value</span>
              <span className="text-2xl font-bold">₹{inventoryValue.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>In Stock</span>
                <span>{products.filter((p) => (p.stock || 0) > (p.minStock || 0)).length} items</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Low Stock</span>
                <span>{lowStockProducts} items</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Out of Stock</span>
                <span>{products.filter((p) => (p.stock || 0) === 0).length} items</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product List */}
      {products.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Detailed view of all products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    <p className="text-sm text-muted-foreground">Category: {product.category}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">
                      ₹{((product.sellingPrice || 0) * (product.stock || 0)).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Stock: {product.stock || 0}</p>
                    <Badge
                      variant={
                        (product.stock || 0) === 0
                          ? "destructive"
                          : (product.stock || 0) <= (product.minStock || 0)
                            ? "secondary"
                            : "default"
                      }
                    >
                      {(product.stock || 0) === 0
                        ? "Out of Stock"
                        : (product.stock || 0) <= (product.minStock || 0)
                          ? "Low Stock"
                          : "In Stock"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No products found. Add some products to see reports.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
