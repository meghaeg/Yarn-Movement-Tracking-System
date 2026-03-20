"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, PauseCircle, PlayCircle, Scan, QrCode, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useInventory } from "@/hooks/use-inventory"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { BarcodeGenerator } from "@/components/barcode-generator"
import { ProductDialog } from "@/components/products/product-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LiveProductionPage() {
  const { user, hasPermission } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { products, suppliers, deleteProduct, updateProduct, units, updateUnit, addCompletedJob, loading } = useInventory()

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [completeUnitId, setCompleteUnitId] = useState<string | null>(null)
  const [outputWeight, setOutputWeight] = useState("")
  const [salesValue, setSalesValue] = useState("")
  const [selectedByUnit, setSelectedByUnit] = useState<Record<string, string | null>>({})

  const visibleUnits = user?.role === "manager"
    ? (user.unit ? units.filter(u => u.unit === user.unit) : [])
    : units.filter(u => u.status === "running") // Admin sees only running units in Live Production

  // Notification for urgent items
  const [hasNotified, setHasNotified] = useState(false)

  if (!loading && products.length > 0 && !hasNotified) {
    const urgentItems = products.filter(p => {
      if (!p.deliveryDate || (p.processStatus ?? "pending") === "done") return false
      // Only check for my unit if I am a manager
      if (user?.role === "manager" && user.unit && p.assignedUnit !== user.unit) return false

      const today = new Date()
      const delivery = new Date(p.deliveryDate)
      const diffTime = delivery.getTime() - today.getTime()
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return daysRemaining <= 5
    })

    if (urgentItems.length > 0) {
      // Use setTimeout to avoid render loop warning or just run effect
      setTimeout(() => {
        toast({
          title: "Urgent Production Alert",
          description: `You have ${urgentItems.length} jobs with upcoming deadlines (< 5 days).`,
          variant: "destructive"
        })
        setHasNotified(true)
      }, 1000)
    } else {
      setHasNotified(true) // No urgent items, but mark as checked
    }
  }

  // ... (existing helper functions) ...



  const logActivity = async (action: string, unitId: string, details?: any) => {
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
          byUserId: user?.id,
          byRole: user?.role,
          ...details
        }),
      })
    } catch { }
  }

  const handleStart = async (id: string, productId?: string) => {
    const unit = units.find(u => u.id === id)
    if (!unit) return

    if (unit.name === "Ready") {
      let nextItem = productId
        ? products.find(p => p.id === productId)
        : undefined

      // If no specific product selected, find next item based on priority
      if (!nextItem) {
        const availableItems = products.filter(p =>
          (p.processStatus ?? "pending") !== "running" &&
          (p.processStatus ?? "pending") !== "done" &&
          (user?.role !== "manager" || p.assignedUnit === user.unit)
        )

        // For supervisors, sort by delivery date (earliest first)
        if (user?.role === "manager" && availableItems.length > 0) {
          availableItems.sort((a, b) => {
            if (!a.deliveryDate && !b.deliveryDate) return 0
            if (!a.deliveryDate) return 1
            if (!b.deliveryDate) return -1
            return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
          })
        }

        nextItem = availableItems[0]
      }

      if (!nextItem) {
        toast({ title: "Queue Empty", description: "There are no jobs in the queue to start. Add to queue first.", variant: "destructive" })
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
          grade: nextItem.quality || "A",
          startTime: new Date().toISOString(),
          salesPrice: nextItem.salesPrice || 0,
        })
        // Mark queue item as running and keep it in queue page
        try { await updateProduct(nextItem.id, { processStatus: "running", assignedUnit: unit.unit }) } catch { }

        await logActivity("start", id, {
          unitName: nextItem.name,
          supplier: supplierName,
          weight: nextItem.stock,
          grade: nextItem.quality || "A",
          startTime: new Date().toISOString()
        })

        toast({ title: "Process Started", description: `Loaded "${nextItem.name}" from queue into ${unit.unit}` })
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

  const openCompleteDialog = (id: string) => {
    setCompleteUnitId(id)
    setOutputWeight("")
    setSalesValue("")
    setIsCompleteDialogOpen(true)
  }

  const confirmComplete = async () => {
    const id = completeUnitId
    if (!id) return
    const unit = units.find(u => u.id === id)
    if (!unit || unit.name === "Ready") {
      setIsCompleteDialogOpen(false)
      return
    }

    const inputWeight = unit.weight
    const outNum = Number.parseFloat(outputWeight)
    // Use pre-defined sales price from the unit (product)
    const profit = unit.salesPrice || 0
    const timestamp = new Date().toISOString()

    try {
      const job = await addCompletedJob({
        name: unit.name,
        supplier: unit.supplier,
        weight: inputWeight,
        unit: unit.unit,
        shortage: Math.max(0, inputWeight - (Number.parseFloat(outputWeight) || 0)),
        returnWeight: Number.parseFloat(outputWeight) || 0,
      })

      if (!Number.isNaN(outNum)) {
        try {
          const payload: any = {
            unit: unit.unit,
            jobId: job?.id,
            name: unit.name,
            supplier: unit.supplier,
            weight: inputWeight,
            outputWeight: outNum,
            shortage: Math.max(0, inputWeight - (outNum || 0)),
            grade: unit.grade,
            value: profit,
          }
          await fetch("/api/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        } catch { }
      }

      await updateUnit(id, { status: "stopped", name: "Ready", supplier: "-", weight: 0, grade: "-" })
      // Mark the running product for this unit as done
      try {
        const running = products.find(p => (p.processStatus === "running") && p.assignedUnit === unit.unit)
        if (running) await updateProduct(running.id, { processStatus: "done", assignedUnit: null })
      } catch { }

      // Log detailed activity with start/end times and values
      await logActivity("done", id, {
        startTime: unit.startTime,
        endTime: timestamp,
        grade: unit.grade,
        amount: profit,
        outputWeight: outNum,
        shortage: Math.max(0, inputWeight - (outNum || 0))
      })

      setIsCompleteDialogOpen(false)

      toast({ title: "Job Completed", description: `History updated. ${unit.unit} is now Ready.` })
    } catch (err) {
      toast({ title: "Error", description: "Failed to process completion", variant: "destructive" })
    }
  }

  const handleAddProduct = () => {
    if (hasPermission("products.add")) {
      setIsProductDialogOpen(true)
    } else {
      toast({ title: "Access Denied", description: "You don't have permission to add to queue", variant: "destructive" })
    }
  }

  const handleGenerateReport = () => {
    if (hasPermission("reports.view")) {
      router.push("/dashboard/reports")
    } else {
      toast({ title: "Access Denied", description: "You don't have permission to view reports", variant: "destructive" })
    }
  }

  if (loading && units.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Loading production data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-4xl font-bold text-gray-900">Live Production</h1>
          <p className="text-muted-foreground text-lg">Monitor and control production units</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsScannerOpen(true)} size="sm">
            <Scan className="h-4 w-4 mr-2" />
            Scan
          </Button>
          <Button variant="outline" onClick={() => setIsGeneratorOpen(true)} size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">
                Active Units ({visibleUnits.filter(u => u.status === 'running').length}/{visibleUnits.length})
              </CardTitle>
              <CardDescription className="text-gray-500">Real-time status of production units</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddProduct} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add to Queue
              </Button>
              <Button variant="outline" onClick={handleGenerateReport} size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left font-semibold p-6 text-gray-600">Name</th>
                  <th className="text-left font-semibold p-6 text-gray-600">Supplier</th>
                  <th className="text-left font-semibold p-6 text-gray-600">Weight/KG</th>
                  <th className="text-left font-semibold p-6 text-gray-600">Grade</th>
                  <th className="text-left font-semibold p-6 text-gray-600">Unit</th>
                  <th className="text-left font-semibold p-6 text-gray-600">Status</th>
                  <th className="text-right font-semibold p-6 text-gray-600">Process</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleUnits.map((unit) => {
                  const supplierObj = suppliers.find(s => s.id === unit.supplier || s.name === unit.supplier)
                  const displaySupplier = supplierObj?.name || unit.supplier

                  return (
                    <tr key={unit.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6 font-medium text-gray-900">{unit.name}</td>
                      <td className="p-6 text-gray-600">{displaySupplier}</td>
                      <td className="p-6 text-gray-900 font-semibold">{unit.weight} KG</td>
                      <td className="p-6 text-gray-600">{unit.grade}</td>
                      <td className="p-6 text-gray-600 font-mono">{unit.unit}</td>
                      <td className="p-6">
                        {unit.status === "running" ? (
                          <Badge className="bg-[#1F5A63] text-white hover:bg-[#1A4A52]">Running</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-500">Stopped</Badge>
                        )}
                      </td>
                      <td className="p-6 text-right flex justify-end gap-2 items-center">
                        {user?.role !== "manager" ? (
                          <span className="text-muted-foreground text-sm italic">Live Monitoring</span>
                        ) : (
                          <>
                            {unit.status === "running" ? (
                              <Button variant="destructive" size="sm" onClick={() => handleStop(unit.id)} className="bg-primary/80 hover:bg-primary/70 font-bold">
                                <PauseCircle className="h-4 w-4 mr-2" />
                                Stop
                              </Button>
                            ) : (
                              <Button variant="default" size="sm" onClick={() => handleStart(unit.id)} className="bg-primary hover:bg-primary/90 font-bold">
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Start
                              </Button>
                            )}
                            {/* Select specific yarn from queue and start */}
                            {unit.status !== "running" && (
                              <>
                                <Select value={selectedByUnit[unit.id] || ""} onValueChange={(v) => setSelectedByUnit(prev => ({ ...prev, [unit.id]: v }))}>
                                  <SelectTrigger className="w-44">
                                    <SelectValue placeholder="Select yarn" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products
                                      .filter(p => (p.processStatus ?? "pending") !== "running" && (p.processStatus ?? "pending") !== "done")
                                      .filter(p => !p.assignedUnit || p.assignedUnit === unit.unit)
                                      .sort((a, b) => {
                                        // Sort by delivery date (earliest first) for supervisor
                                        if (user?.role === "manager") {
                                          if (!a.deliveryDate && !b.deliveryDate) return 0
                                          if (!a.deliveryDate) return 1
                                          if (!b.deliveryDate) return -1
                                          return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
                                        }
                                        return 0
                                      })
                                      .map(p => {
                                        const sup = suppliers.find(s => s.id === p.supplierId || s.name === p.supplierId)
                                        return (
                                          <SelectItem key={p.id} value={p.id}>{p.name} • {sup?.name || p.supplierId} • {p.stock} KG</SelectItem>
                                        )
                                      })}
                                  </SelectContent>
                                </Select>
                                <Button size="sm" variant="outline" onClick={() => selectedByUnit[unit.id] && handleStart(unit.id, selectedByUnit[unit.id] || undefined)}>
                                  Select & Start
                                </Button>
                              </>
                            )}
                            {unit.name !== "Ready" && (
                              <Button variant="outline" size="sm" onClick={() => openCompleteDialog(unit.id)} className="border-green-600 text-green-600 hover:bg-green-50">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Done
                              </Button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Production Queue</h2>
          <Badge variant="secondary" className="px-3 py-1">
            {products
              .filter(p => (p.processStatus ?? "pending") !== "done")
              .filter(p => user?.role !== "manager" || p.assignedUnit === user.unit)
              .length} In Queue
          </Badge>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="text-left font-semibold p-4 text-gray-600">Thread Name</th>
                      <th className="text-left font-semibold p-4 text-gray-600">Supplier</th>
                      <th className="text-left font-semibold p-4 text-gray-600">Weight/KG</th>
                      <th className="text-left font-semibold p-4 text-gray-600">Grade</th>
                      <th className="text-left font-semibold p-4 text-gray-600">Assigned Unit</th>
                      <th className="text-left font-semibold p-4 text-gray-600">Delivery</th>
                      <th className="text-left font-semibold p-4 text-gray-600">Status</th>
                      <th className="text-right font-semibold p-4 text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products
                      .filter(p => (p.processStatus ?? "pending") !== "done")
                      .filter(p => user?.role !== "manager" || p.assignedUnit === user.unit)
                      .sort((a, b) => {
                        // Sort by delivery date (earliest first) for supervisor module only
                        if (user?.role === "manager") {
                          if (!a.deliveryDate && !b.deliveryDate) return 0
                          if (!a.deliveryDate) return 1
                          if (!b.deliveryDate) return -1
                          return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
                        }
                        return 0
                      })
                      .map((item) => {
                        const supplier = suppliers.find(s => s.id === item.supplierId || s.name === item.supplierId)
                        const status = item.processStatus === "running" ? "Running" : "Yet to be Processed"

                        // Calculate Alert
                        let isUrgent = false
                        let daysRemaining = null
                        if (item.deliveryDate) {
                          const today = new Date()
                          const delivery = new Date(item.deliveryDate)
                          const diffTime = delivery.getTime() - today.getTime()
                          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                          if (daysRemaining <= 5) isUrgent = true
                        }

                        return (
                          <tr key={item.id} className={`hover:bg-gray-50/30 transition-colors ${isUrgent ? 'bg-red-50 border-l-4 border-red-500' : ''}`}>
                            <td className="p-4 font-medium text-gray-900">
                              {item.name}
                              {isUrgent && <span className="ml-2 text-xs text-red-600 font-bold animate-pulse">URGENT</span>}
                            </td>
                            <td className="p-4 text-gray-600">{supplier?.name || item.supplierId || "N/A"}</td>
                            <td className="p-4 text-gray-900 font-semibold">{item.stock} KG</td>
                            <td className="p-4">
                              <Badge variant="outline" className="border-gray-300">Grade {item.quality || "A"}</Badge>
                            </td>
                            <td className="p-4 text-gray-600">{item.assignedUnit || "-"}</td>
                            <td className="p-4 text-gray-600">
                              {item.deliveryDate ? (
                                <span className={isUrgent ? "text-red-600 font-bold" : ""}>
                                  {new Date(item.deliveryDate).toLocaleDateString()}
                                  {daysRemaining !== null && daysRemaining <= 5 && <div className="text-xs">Due in {daysRemaining} days</div>}
                                </span>
                              ) : "-"}
                            </td>
                            <td className="p-4">
                              {status === "Running" ? (
                                <Badge className="bg-[#1F5A63] text-white hover:bg-[#1A4A52]">Running</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">Yet to be Processed</Badge>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/products')}>
                                Manage
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground bg-gray-50/30">
                No items in queue. Click "Add to Queue" to start.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BarcodeScanner open={isScannerOpen} onOpenChange={setIsScannerOpen} onProductFound={(p) => toast({ title: "Found", description: p.name })} />
      <BarcodeGenerator open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen} />
      {(hasPermission("products.add") || hasPermission("products.edit")) && (
        <ProductDialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen} product={null as any} />
      )}

      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
            <DialogDescription>Enter the output weight and sales value for this production job.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Output Weight (KG)</div>
              <Input type="number" inputMode="decimal" placeholder="0" value={outputWeight} onChange={(e) => setOutputWeight(e.target.value)} />
            </div>
            {/* Sales Value input removed - using pre-set Sales Amount from Product */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmComplete} className="bg-blue-600 hover:bg-blue-700">Save & Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
