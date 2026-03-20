"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Package } from "lucide-react"
import { useInventory } from "@/hooks/use-inventory"
import { useAuth } from "@/components/providers/auth-provider"
import { ProductDialog } from "@/components/products/product-dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function ProductsPage() {
  const { products, suppliers } = useInventory()
  const { hasPermission } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState("all")
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSupplier = selectedSupplier === "all" || product.supplierId === selectedSupplier

    return matchesSearch && matchesSupplier
  })
  const queueProducts = filteredProducts.filter((p) => (p.processStatus ?? "pending") !== "done")
  const handleAddProduct = () => {
    if (hasPermission("products.add")) {
      setEditingProduct(null)
      setIsProductDialogOpen(true)
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to add products",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = (product: any) => {
    if (hasPermission("products.edit")) {
      setEditingProduct(product)
      setIsProductDialogOpen(true)
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit products",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = (product: any) => {
    if (hasPermission("products.delete")) {
      toast({
        title: "Delete Product",
        description: "Delete functionality will be implemented soon",
      })
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete products",
        variant: "destructive",
      })
    }
  }

  const getStatus = (product: any) => {
    const status = product.processStatus ?? "pending"
    if (status === "running") return { label: "Running", variant: "default" as const, className: "bg-[#1F5A63] text-white hover:bg-[#1A4A52]" }
    return { label: "Yet to be Processed", variant: "secondary" as const, className: "bg-gray-100 text-gray-600" }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Queue</h1>
          <p className="text-muted-foreground">Manage your production queue</p>
        </div>
        {hasPermission("products.add") && (
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Queue ({queueProducts.length})</CardTitle>
          <CardDescription>Items waiting to be processed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Product</TableHead>
                  <TableHead className="min-w-[100px]">Supplier</TableHead>
                  <TableHead className="min-w-[80px]">Weight/KG</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueProducts.map((product) => {
                  const supplier = suppliers.find((s) => s.id === product.supplierId)
                  const status = getStatus(product)

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            {product.image ? (
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-muted-foreground truncate">
                                {product.description.substring(0, 30)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{supplier?.name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>
                            {product.stock}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className={status.className}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {hasPermission("products.edit") && (
                              <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {hasPermission("products.delete") && (
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProduct(product)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {hasPermission("products.add") || hasPermission("products.edit") ? (
        <ProductDialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen} product={editingProduct} />
      ) : null}
    </div>
  )
}
