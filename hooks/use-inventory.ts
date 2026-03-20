"use client"

import { useState, useEffect } from "react"

export interface Product {
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
  quality?: string
  // processing fields for production queue lifecycle
  processStatus?: "pending" | "running" | "done"
  assignedUnit?: string | null
  deliveryDate?: string
  salesPrice?: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export interface Unit {
  id: string
  name: string
  supplier: string
  weight: number
  grade: string
  unit: string
  status: "running" | "stopped"
  startTime?: string
  salesPrice?: number
}

export interface CompletedJob {
  id: string
  name: string
  supplier: string
  weight: number
  shortage: number
  returnWeight: number
  unit?: string
  timestamp: string
}

export interface Activity {
  id: string
  action: string
  unit: string
  unitName: string
  weight: number
  supplier: string
  timestamp: string
  byUserId?: string
  byRole?: string
}

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [productsRes, categoriesRes, suppliersRes, unitsRes, jobsRes, activitiesRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/suppliers", { cache: "no-store" }),
          fetch("/api/units", { cache: "no-store" }),
          fetch("/api/completed-jobs", { cache: "no-store" }),
          fetch("/api/activities", { cache: "no-store" }),
        ])

        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data.data || [])
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data.data || [])
        }
        if (suppliersRes.ok) {
          const data = await suppliersRes.json()
          setSuppliers(data.data || [])
        }
        if (unitsRes.ok) {
          const data = await unitsRes.json()
          setUnits(data.data || [])
        }
        if (jobsRes.ok) {
          const data = await jobsRes.json()
          setCompletedJobs(data.data || [])
        }
        if (activitiesRes.ok) {
          const data = await activitiesRes.json()
          setActivities(data.data || [])
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const addProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    })
    if (!res.ok) throw new Error("Failed to create product")
    const { data } = await res.json()
    setProducts((prev) => [...prev, data])
  }

  const deleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete product")
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const updateProduct = async (id: string, update: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    })
    if (!res.ok) throw new Error("Failed to update product")
    const { data } = await res.json()
    setProducts((prev) => prev.map(p => p.id === id ? { ...p, ...update, ...(data || {}) } : p))
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

  const updateUnit = async (id: string, updateData: Partial<Unit>) => {
    const res = await fetch("/api/units", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updateData }),
    })
    if (!res.ok) throw new Error("Failed to update unit")
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...updateData } : u)))
  }

  const addCompletedJob = async (jobData: Omit<CompletedJob, "id" | "timestamp">) => {
    const res = await fetch("/api/completed-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    })
    if (!res.ok) throw new Error("Failed to save job")
    const { data } = await res.json()
    setCompletedJobs((prev) => [data, ...prev])
    return data
  }

  return {
    products,
    categories,
    suppliers,
    units,
    completedJobs,
    activities,
    loading,
    error,
    addProduct,
    deleteProduct,
    updateProduct,
    addSupplier,
    updateUnit,
    addCompletedJob,
  }
}
