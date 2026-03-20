"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInventory } from "@/hooks/use-inventory"
import { useToast } from "@/hooks/use-toast"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const { suppliers, units, addProduct, updateProduct } = useInventory()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    supplierId: "",
    stock: "", // Used as Weight/KG
    quality: "", // Used as Grade
    assignedUnit: "",
    deliveryDate: "",
    salesPrice: "",
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        supplierId: product.supplierId || "",
        stock: product.stock?.toString() || "",
        quality: product.quality || "",
        assignedUnit: product.assignedUnit || "",
        deliveryDate: product.deliveryDate || "",
        salesPrice: product.salesPrice?.toString() || "",
      })
    } else {
      setFormData({
        name: "",
        supplierId: "",
        stock: "",
        quality: "",
        assignedUnit: "",
        deliveryDate: "",
        salesPrice: "",
      })
    }
  }, [product, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      name: formData.name,
      supplierId: formData.supplierId,
      stock: Number.parseInt(formData.stock) || 0,
      quality: formData.quality,
      assignedUnit: formData.assignedUnit,
      deliveryDate: formData.deliveryDate,
      salesPrice: Number.parseFloat(formData.salesPrice) || 0,
      // Default values for other required fields if any
      sku: `TM-${Date.now()}`,
      categoryId: "textile", // default
      purchasePrice: 0,
      sellingPrice: 0,
      minStock: 0,
    }

    if (product) {
      updateProduct(product.id, productData)
      toast({
        title: "Item updated",
        description: "Queue item has been updated successfully.",
      })
    } else {
      addProduct(productData)
      toast({
        title: "Added to Queue",
        description: "New item has been added to the production queue.",
      })
    }

    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Queue Item" : "Add to Production Queue"}</DialogTitle>
          <DialogDescription>
            Enter the details for the textile production batch.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">

          <div className="space-y-2">
            <Label htmlFor="name">Thread Name *</Label>
            <Input
              id="name"
              placeholder="e.g. 2/10s kw"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select value={formData.supplierId} onValueChange={(value) => handleInputChange("supplierId", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.length > 0 ? (
                    suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-suppliers" disabled>No suppliers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedUnit">Assign Unit *</Label>
              <Select value={formData.assignedUnit} onValueChange={(value) => handleInputChange("assignedUnit", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.length > 0 ? (
                    units.map((u) => (
                      <SelectItem key={u.id} value={u.unit}>
                        {u.unit} ({u.status === 'running' ? 'Busy' : 'Idle'})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-units" disabled>No units available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Weight/KG *</Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality">Grade *</Label>
              <Select value={formData.quality} onValueChange={(value) => handleInputChange("quality", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Grade A</SelectItem>
                  <SelectItem value="B">Grade B</SelectItem>
                  <SelectItem value="C">Grade C</SelectItem>
                  <SelectItem value="D">Grade D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salesPrice">Sales Amount (₹) *</Label>
              <Input
                id="salesPrice"
                type="number"
                placeholder="0"
                value={formData.salesPrice}
                onChange={(e) => handleInputChange("salesPrice", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {product ? "Update Item" : "Add to Queue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  )
}
