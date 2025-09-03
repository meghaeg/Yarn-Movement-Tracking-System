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

const initialProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 14 Pro",
    sku: "IPH14PRO001",
    description: "Latest iPhone with advanced camera system",
    categoryId: "1",
    supplierId: "1",
    purchasePrice: 80000,
    sellingPrice: 99900,
    stock: 25,
    minStock: 10,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    sku: "SAM24001",
    description: "Premium Android smartphone",
    categoryId: "1",
    supplierId: "2",
    purchasePrice: 70000,
    sellingPrice: 89900,
    stock: 5,
    minStock: 15,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "3",
    name: 'MacBook Pro 16"',
    sku: "MBP16001",
    description: "Professional laptop for developers",
    categoryId: "1",
    supplierId: "1",
    purchasePrice: 200000,
    sellingPrice: 249900,
    stock: 8,
    minStock: 5,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "4",
    name: "Nike Air Max",
    sku: "NIKE001",
    description: "Comfortable running shoes",
    categoryId: "2",
    supplierId: "3",
    purchasePrice: 8000,
    sellingPrice: 12000,
    stock: 0,
    minStock: 20,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
]

const initialCategories: Category[] = [
  { id: "1", name: "Electronics", description: "Electronic devices and accessories" },
  { id: "2", name: "Clothing", description: "Apparel and fashion items" },
  { id: "3", name: "Food & Beverages", description: "Food items and drinks" },
  { id: "4", name: "Books", description: "Books and educational materials" },
]

const initialSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Apple Inc.",
    email: "orders@apple.com",
    phone: "+1-800-275-2273",
    address: "One Apple Park Way, Cupertino, CA 95014",
  },
  {
    id: "2",
    name: "Samsung Electronics",
    email: "b2b@samsung.com",
    phone: "+1-800-726-7864",
    address: "85 Challenger Road, Ridgefield Park, NJ 07660",
  },
  {
    id: "3",
    name: "Nike Inc.",
    email: "wholesale@nike.com",
    phone: "+1-503-671-6453",
    address: "One Bowerman Drive, Beaverton, OR 97005",
  },
]

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])

  useEffect(() => {
    // Load data from localStorage or use initial data
    const storedProducts = localStorage.getItem("inventory_products")
    const storedCategories = localStorage.getItem("inventory_categories")
    const storedSuppliers = localStorage.getItem("inventory_suppliers")
    const storedMovements = localStorage.getItem("inventory_movements")

    setProducts(storedProducts ? JSON.parse(storedProducts) : initialProducts)
    setCategories(storedCategories ? JSON.parse(storedCategories) : initialCategories)
    setSuppliers(storedSuppliers ? JSON.parse(storedSuppliers) : initialSuppliers)
    setStockMovements(storedMovements ? JSON.parse(storedMovements) : [])
  }, [])

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data))
  }

  const addProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updatedProducts = [...products, newProduct]
    setProducts(updatedProducts)
    saveToStorage("inventory_products", updatedProducts)
  }

  const updateProduct = (id: string, productData: Partial<Product>) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, ...productData, updatedAt: new Date().toISOString() } : product,
    )
    setProducts(updatedProducts)
    saveToStorage("inventory_products", updatedProducts)
  }

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id)
    setProducts(updatedProducts)
    saveToStorage("inventory_products", updatedProducts)
  }

  const updateStock = (productId: string, quantityChange: number, reason: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const newStock = Math.max(0, product.stock + quantityChange)
    updateProduct(productId, { stock: newStock })

    // Add stock movement record
    const movement: StockMovement = {
      id: Date.now().toString(),
      productId,
      productName: product.name,
      type: quantityChange > 0 ? "add" : "remove",
      quantity: Math.abs(quantityChange),
      reason,
      timestamp: new Date().toISOString(),
      userId: "1", // Current user ID
    }

    const updatedMovements = [movement, ...stockMovements]
    setStockMovements(updatedMovements)
    saveToStorage("inventory_movements", updatedMovements)
  }

  const addCategory = (categoryData: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
    }
    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    saveToStorage("inventory_categories", updatedCategories)
  }

  const addSupplier = (supplierData: Omit<Supplier, "id">) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
    }
    const updatedSuppliers = [...suppliers, newSupplier]
    setSuppliers(updatedSuppliers)
    saveToStorage("inventory_suppliers", updatedSuppliers)
  }

  return {
    products,
    categories,
    suppliers,
    stockMovements,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    addCategory,
    addSupplier,
  }
}
