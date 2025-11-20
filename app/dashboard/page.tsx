"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  Plus,
  FileText,
  Scan,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useInventory } from "@/hooks/use-inventory"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { BarcodeScanner } from "@/components/barcode-scanner"

const salesData = [
  { name: "Jan", sales: 400000, purchases: 240000 },
  { name: "Feb", sales: 300000, purchases: 139800 },
  { name: "Mar", sales: 200000, purchases: 98000 },
  { name: "Apr", sales: 278000, purchases: 390800 },
  { name: "May", sales: 189000, purchases: 480000 },
  { name: "Jun", sales: 239000, purchases: 380000 },
]

const categoryData = [
  { name: "Electronics", value: 400, color: "#0088FE" },
  { name: "Clothing", value: 300, color: "#00C49F" },
  { name: "Food", value: 300, color: "#FFBB28" },
  { name: "Books", value: 200, color: "#FF8042" },
]

export default function DashboardPage() {
  const { products, orders } = useInventory()
  const { hasPermission } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string>("all")

  const totalProducts = products.length
  const lowStockItems = products.filter((p) => p.stock <= p.minStock).length
  const totalValue = products.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0)
  const totalOrders = orders.length
  const totalRevenue = orders.filter(order => order.status === "completed").reduce((sum, order) => sum + order.totalAmount, 0)
  
  // Calculate inventory value for selected product
  const getInventoryValue = () => {
    if (selectedProduct === "all") {
      return totalValue
    }
    const product = products.find(p => p.id === selectedProduct)
    return product ? product.sellingPrice * product.stock : 0
  }
  
  const currentInventoryValue = getInventoryValue()

  const recentActivity = [
    { id: 1, action: "Stock Added", product: "iPhone 14", quantity: 50, user: "John Doe", time: "2 hours ago" },
    { id: 2, action: "Sale", product: "Samsung TV", quantity: 2, user: "Jane Smith", time: "4 hours ago" },
    { id: 3, action: "Product Added", product: "MacBook Pro", quantity: 10, user: "Admin", time: "6 hours ago" },
  ]

  const handleAddProduct = () => {
    if (hasPermission("products.add")) {
      router.push("/dashboard/products")
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to add products",
        variant: "destructive",
      })
    }
  }

  const handleGenerateReport = () => {
    if (hasPermission("reports.view")) {
      router.push("/dashboard/reports")
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view reports",
        variant: "destructive",
      })
    }
  }

  const handleScanBarcode = () => {
    if (hasPermission("stock.manage")) {
      setIsScannerOpen(true)
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to scan barcodes",
        variant: "destructive",
      })
    }
  }

  const handleProductFound = (product: any) => {
    toast({
      title: "Product Found",
      description: `${product.name} - Stock: ${product.stock} units`,
    })
    // You can add more logic here, like navigating to product details
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {hasPermission("products.add") && (
            <Button onClick={handleAddProduct} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
          {hasPermission("reports.view") && (
            <Button variant="outline" onClick={handleGenerateReport} size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          )}
          {hasPermission("stock.manage") && (
            <Button variant="outline" onClick={handleScanBarcode} size="sm">
              <Scan className="h-4 w-4 mr-2" />
              Scan Barcode
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold break-all">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold break-all">
              ₹{currentInventoryValue.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedProduct === "all" ? (
                <>
                  <TrendingDown className="h-3 w-3 inline mr-1" />
                  -2% from last month
                </>
              ) : (
                `Stock: ${products.find(p => p.id === selectedProduct)?.stock || 0} units`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Only show if user has permission */}
      {hasPermission("reports.view") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales vs Purchases</CardTitle>
              <CardDescription>Monthly comparison of sales and purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, ""]} />
                  <Bar dataKey="sales" fill="#8884d8" />
                  <Bar dataKey="purchases" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Distribution of products by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest inventory movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{activity.action}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.product} - Qty: {activity.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">by {activity.user}</p>
                  </div>
                  <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products
                .filter((p) => p.stock <= p.minStock)
                .slice(0, 5)
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <Badge variant="destructive">{product.stock} left</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Min: {product.minStock}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barcode Scanner */}
      <BarcodeScanner open={isScannerOpen} onOpenChange={setIsScannerOpen} onProductFound={handleProductFound} />
    </div>
  )
}
