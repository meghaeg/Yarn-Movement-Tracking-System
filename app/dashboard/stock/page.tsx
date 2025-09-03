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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Minus, Search, Package, History, Scan } from "lucide-react"
import { useInventory } from "@/hooks/use-inventory"
import { useToast } from "@/hooks/use-toast"

export default function StockPage() {
  const { products, updateStock, stockMovements } = useInventory()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [stockChange, setStockChange] = useState("")
  const [reason, setReason] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [movementType, setMovementType] = useState<"add" | "remove">("add")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStockUpdate = (product: any, type: "add" | "remove") => {
    setSelectedProduct(product)
    setMovementType(type)
    setStockChange("")
    setReason("")
    setIsDialogOpen(true)
  }

  const handleSubmitStockUpdate = () => {
    if (!selectedProduct || !stockChange || !reason) return

    const quantity = Number.parseInt(stockChange)
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid positive number",
        variant: "destructive",
      })
      return
    }

    const finalQuantity = movementType === "add" ? quantity : -quantity

    updateStock(selectedProduct.id, finalQuantity, reason)

    toast({
      title: "Stock updated",
      description: `${movementType === "add" ? "Added" : "Removed"} ${quantity} units ${movementType === "add" ? "to" : "from"} ${selectedProduct.name}`,
    })

    setIsDialogOpen(false)
    setSelectedProduct(null)
    setStockChange("")
    setReason("")
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (stock <= minStock) return { label: "Low Stock", variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stock Management</h1>
          <p className="text-muted-foreground">Track and update inventory levels</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Scan className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
          <Button variant="outline">
            <History className="h-4 w-4 mr-2" />
            Movement History
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Stock Levels</CardTitle>
          <CardDescription>Manage stock quantities for all products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.minStock)

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.category}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${product.stock <= product.minStock ? "text-red-600" : "text-green-600"}`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>{product.minStock}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(product.updatedAt || Date.now()).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleStockUpdate(product, "add")}>
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockUpdate(product, "remove")}
                            disabled={product.stock === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Movement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{movementType === "add" ? "Add Stock" : "Remove Stock"}</DialogTitle>
            <DialogDescription>
              {movementType === "add"
                ? `Add stock to ${selectedProduct?.name}`
                : `Remove stock from ${selectedProduct?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={stockChange}
                onChange={(e) => setStockChange(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for stock movement"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            {selectedProduct && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm">
                  <strong>Current Stock:</strong> {selectedProduct.stock}
                </p>
                {stockChange && (
                  <p className="text-sm">
                    <strong>New Stock:</strong>{" "}
                    {movementType === "add"
                      ? selectedProduct.stock + Number.parseInt(stockChange || "0")
                      : selectedProduct.stock - Number.parseInt(stockChange || "0")}
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitStockUpdate}>{movementType === "add" ? "Add Stock" : "Remove Stock"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recent Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
          <CardDescription>Latest stock changes and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stockMovements.slice(0, 10).map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      movement.type === "add" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {movement.type === "add" ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{movement.productName}</p>
                    <p className="text-sm text-muted-foreground">{movement.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${movement.type === "add" ? "text-green-600" : "text-red-600"}`}>
                    {movement.type === "add" ? "+" : "-"}
                    {movement.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(movement.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
