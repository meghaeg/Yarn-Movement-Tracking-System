"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  FileText,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useInventory } from "@/hooks/use-inventory"
import { ProductDialog } from "@/components/products/product-dialog"

export default function DashboardPage() {
  const { hasPermission } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const {
    products,
    suppliers,
    deleteProduct,
    units,
    updateUnit,
    addCompletedJob,
    loading
  } = useInventory()

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)

  const logActivity = async (action: string, unitId: string) => {
    const unit = units.find(u => u.id === unitId)
    try {
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          unit: unit?.unit,
          unitName: unit?.name,
          weight: unit?.weight,
          supplier: unit?.supplier,
        }),
      })
    } catch {}
  }

  const handleStart = async (id: string) => {
    const unit = units.find(u => u.id === id)
    if (!unit) return

    if (unit.name === "Ready") {
      const nextItem = products[0]
      if (!nextItem) {
        toast({
          title: "Queue Empty",
          description: "There are no jobs in the queue to start. Add to queue first.",
          variant: "destructive"
        })
        return
      }

      const supplierObj = suppliers.find(s => s.id === nextItem.supplierId || s.name === nextItem.supplierId)
      const supplierName = supplierObj?.name || nextItem.supplierId || "Unknown"

      try {
        await updateUnit(id, {
          status: "running",
          name: nextItem.name,
          supplier: supplierName,
          weight: nextItem.stock,
          grade: nextItem.quality || "A"
        })
        await deleteProduct(nextItem.id)
        toast({
          title: "Process Started",
          description: `Loaded "${nextItem.name}" from queue into ${unit.unit}`,
        })
        await logActivity("start", id)
      } catch (err) {
        toast({ title: "Error", description: "Failed to start unit", variant: "destructive" })
      }
      return
    }

    await updateUnit(id, { status: "running" })
    await logActivity("resume", id)
  }

  const handleStop = async (id: string) => {
    await updateUnit(id, { status: "stopped" })
    await logActivity("stop", id)
    toast({ title: "Unit Stopped", description: "Production has been paused." })
  }

  const handleComplete = async (id: string) => {
    const unit = units.find(u => u.id === id)
    if (!unit || unit.name === "Ready") return

    const shortage = 0.5
    try {
      const job = await addCompletedJob({
        name: unit.name,
        supplier: unit.supplier,
        weight: unit.weight,
        shortage: shortage,
        returnWeight: unit.weight - shortage,
      })

      // Prompt for Sales value and persist
      const input = typeof window !== "undefined" ? window.prompt("Enter Sales value for this job (numbers only)") : null
      const salesValue = input ? Number.parseFloat(input) : undefined
      if (typeof salesValue === "number" && !Number.isNaN(salesValue)) {
        try {
          await fetch("/api/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              unit: unit.unit,
              value: salesValue,
              jobId: job?.id,
              name: unit.name,
              supplier: unit.supplier,
              weight: unit.weight,
            }),
          })
        } catch {}
      }

      await updateUnit(id, {
        status: "stopped",
        name: "Ready",
        supplier: "-",
        weight: 0,
        grade: "-"
      })

      await logActivity("done", id)
      toast({
        title: "Job Completed",
        description: `History updated. ${unit.unit} is now Ready.`,
      })
    } catch (err) {
      toast({ title: "Error", description: "Failed to process completion", variant: "destructive" })
    }
  }

  const handleDeleteSubJob = async (id: string) => {
    await updateUnit(id, {
      status: "stopped",
      name: "Ready",
      supplier: "-",
      weight: 0,
      grade: "-"
    })
    toast({ title: "Unit Cleared", description: "Current job removed from unit." })
  }

  const handleAddProduct = () => {
    if (hasPermission("products.add")) {
      setIsProductDialogOpen(true)
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to add to queue",
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

  if (loading && units.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Loading production data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground text-lg">All units status and overview</p>
        </div>
        {hasPermission("products.manage") && (
          <Button onClick={() => setIsProductDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Units Status</CardTitle>
              <CardDescription className="text-gray-500">UNIT1, UNIT2, UNIT3 current processing</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerateReport} size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit) => {
              const supplierObj = suppliers.find(s => s.id === unit.supplier || s.name === unit.supplier)
              const displaySupplier = supplierObj?.name || unit.supplier
              const etaMin = unit.status === 'running' && unit.weight > 0 ? Math.ceil(unit.weight * 2) : 0

              return (
                <Card key={unit.id} className="border border-gray-100 shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">{unit.unit}</CardTitle>
                      {unit.status === "running" ? (
                        <Badge className="bg-[#1F5A63] text-white hover:bg-[#1A4A52]">Running</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500">Stopped</Badge>
                      )}
                    </div>
                    <CardDescription>Yarn in process</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-gray-600">Yarn</div>
                    <div className="font-medium text-gray-900">{unit.name}</div>
                    <div className="text-sm text-gray-600 mt-2">Supplier</div>
                    <div className="text-gray-900">{displaySupplier}</div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <div className="text-xs text-gray-500">Weight</div>
                        <div className="font-semibold">{unit.weight} KG</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Grade</div>
                        <div className="font-semibold">{unit.grade}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">ETA</div>
                        <div className="font-semibold">{etaMin > 0 ? `${etaMin} mins` : "—"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>

  )
}
