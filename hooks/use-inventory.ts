"use client"

import { useState, useEffect } from "react"

interface Product {
  id: string
  name: string
  sku: string
  description?: string
  categoryId: string
  supplierId: string
  purchasePrice: number
  sellingPrice: number
  stock: number
  minStock: number
  expiryDate?: string
  image?: string
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  description?: string
}

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface StockMovement {
  id: string
  productId: string
  productName: string
  type: "add" | "remove"
  quantity: number
  reason: string
  timestamp: string
  userId: string
}

interface Order {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  status: "pending" | "completed" | "cancelled"
  timestamp: string
  userId: string
}

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Initial load: fetch from API (MongoDB). If API is down, leave arrays empty.
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [productsRes, movementsRes, ordersRes, categoriesRes, suppliersRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/stock-movements", { cache: "no-store" }),
          fetch("/api/orders", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/suppliers", { cache: "no-store" }),
        ])

        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data.data || [])
        } else {
          throw new Error("Failed to load products")
        }

        if (movementsRes.ok) {
          const data = await movementsRes.json()
          setStockMovements(data.data || [])
        }

        if (ordersRes.ok) {
          const data = await ordersRes.json()
          setOrders(data.data || [])
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data.data || [])
        }

        if (suppliersRes.ok) {
          const data = await suppliersRes.json()
          setSuppliers(data.data || [])
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const addProduct = async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })
    if (!res.ok) throw new Error("Failed to create product")
    const { data } = await res.json()
    setProducts((prev) => [...prev, data])
  }

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })
    if (!res.ok) throw new Error("Failed to update product")
    const { data } = await res.json()
    setProducts((prev) => prev.map((p) => (p.id === id ? data : p)))
  }

  const deleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete product")
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const updateStock = async (productId: string, quantityChange: number, reason: string) => {
    const res = await fetch(`/api/products/${productId}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantityChange, reason }),
    })
    if (!res.ok) throw new Error("Failed to update stock")
    const { data } = await res.json()

    // Update product list
    if (data?.product) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)))
    }

    // Prepend movement
    if (data?.movement) {
      setStockMovements((prev) => [data.movement, ...prev])
    }
  }

  const addCategory = async (categoryData: Omit<Category, "id">) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    })
    if (!res.ok) throw new Error("Failed to create category")
    const { data } = await res.json()
    setCategories((prev) => [data, ...prev])
  }

  const addSupplier = async (supplierData: Omit<Supplier, "id">) => {
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supplierData),
    })
    if (!res.ok) throw new Error("Failed to create supplier")
    const { data } = await res.json()
    setSuppliers((prev) => [data, ...prev])
  }

  const addOrder = async (
    orderData: Omit<Order, "id" | "timestamp">
  ) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })
    if (!res.ok) throw new Error("Failed to create order")
    const { data } = await res.json()
    setOrders((prev) => [data, ...prev])
  }

  return {
    products,
    categories,
    suppliers,
    stockMovements,
    orders,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    addCategory,
    addSupplier,
    addOrder,
  }
}
