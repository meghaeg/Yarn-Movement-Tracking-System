"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Download, ShoppingCart, Calendar, DollarSign, Minus } from "lucide-react"
import { useInventory } from "@/hooks/use-inventory"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"

const mockOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    date: "2024-01-15",
    items: 3,
    total: 1299.99 * 80,
    status: "completed",
    paymentStatus: "paid",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    date: "2024-01-14",
    items: 1,
    total: 899.99 * 80,
    status: "processing",
    paymentStatus: "paid",
  },
  {
    id: "ORD-003",
    customer: "Bob Johnson",
    date: "2024-01-13",
    items: 2,
    total: 240.0 * 80,
    status: "pending",
    paymentStatus: "pending",
  },
]

export default function OrdersPage() {
  const { products } = useInventory()
  const { hasPermission } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false)
  const [orderItems, setOrderItems] = useState([])
  const [newOrderData, setNewOrderData] = useState({
    customer: "",
    customerEmail: "",
    customerPhone: "",
  })

  const filteredOrders = mockOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleNewOrder = () => {
    if (hasPermission("orders.manage")) {
      setNewOrderData({ customer: "", customerEmail: "", customerPhone: "" })
      setOrderItems([])
      setIsNewOrderDialogOpen(true)
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create orders",
        variant: "destructive",
      })
    }
  }

  const addItemToOrder = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 1, price: 0 }])
  }

  const removeItemFromOrder = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updatedItems = orderItems.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value }
        if (field === "productId") {
          const product = products.find((p) => p.id === value)
          if (product) {
            updatedItem.price = product.sellingPrice
          }
        }
        return updatedItem
      }
      return item
    })
    setOrderItems(updatedItems)
  }

  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCreateOrder = () => {
    if (!newOrderData.customer || orderItems.length === 0) {
      toast({
        title: "Invalid Order",
        description: "Please fill customer details and add at least one item",
        variant: "destructive",
      })
      return
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`
    const orderTotal = calculateOrderTotal()

    toast({
      title: "Order Created",
      description: `Order ${orderId} created successfully for ₹${orderTotal.toLocaleString("en-IN")}`,
    })

    setIsNewOrderDialogOpen(false)
    setNewOrderData({ customer: "", customerEmail: "", customerPhone: "" })
    setOrderItems([])
  }

  const downloadInvoice = (order: any) => {
    // Create a simple invoice content
    const invoiceContent = `
INVOICE
=======
Order ID: ${order.id}
Customer: ${order.customer}
Date: ${new Date(order.date).toLocaleDateString()}
Items: ${order.items}
Total: ₹${order.total.toLocaleString("en-IN")}
Status: ${order.status}
Payment: ${order.paymentStatus}

Thank you for your business!
    `

    const blob = new Blob([invoiceContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `invoice_${order.id}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Invoice Downloaded",
      description: `Invoice for ${order.id} has been downloaded`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "processing":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and sales</p>
        </div>
        {hasPermission("orders.manage") && (
          <Button onClick={handleNewOrder}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOrders.length}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold break-all">
              ₹{mockOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A list of recent customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>{order.items} items</TableCell>
                    <TableCell className="font-semibold">₹{order.total.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusColor(order.paymentStatus) as any}>{order.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsOrderDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadInvoice(order)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>View complete order information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Order ID</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-sm text-muted-foreground">₹{selectedOrder.total.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Badge variant={getStatusColor(selectedOrder.status) as any}>{selectedOrder.status}</Badge>
                <Badge variant={getPaymentStatusColor(selectedOrder.paymentStatus) as any}>
                  {selectedOrder.paymentStatus}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedOrder && downloadInvoice(selectedOrder)}>
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Order Dialog */}
      <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>Add customer details and select products</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name *</Label>
                  <Input
                    id="customer"
                    value={newOrderData.customer}
                    onChange={(e) => setNewOrderData({ ...newOrderData, customer: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={newOrderData.customerEmail}
                    onChange={(e) => setNewOrderData({ ...newOrderData, customerEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={newOrderData.customerPhone}
                  onChange={(e) => setNewOrderData({ ...newOrderData, customerPhone: e.target.value })}
                />
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Order Items</h3>
                <Button type="button" onClick={addItemToOrder} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-end p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label>Product</Label>
                    <Select
                      value={item.productId}
                      onValueChange={(value) => updateOrderItem(index, "productId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ₹{product.sellingPrice.toLocaleString("en-IN")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="w-32">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateOrderItem(index, "price", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeItemFromOrder(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {orderItems.length > 0 && (
                <div className="text-right">
                  <p className="text-lg font-semibold">Total: ₹{calculateOrderTotal().toLocaleString("en-IN")}</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
