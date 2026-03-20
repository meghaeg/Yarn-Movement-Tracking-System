"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, TrendingUp, Activity, Weight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("30")
  const [sales, setSales] = useState<any[]>([])
  const [supplierFilter, setSupplierFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [sortOutput, setSortOutput] = useState<"none" | "desc" | "asc">("none")

  // KPIs derived dynamically from completed jobs (sales collection)
  const totalProcessed = useMemo(() => {
    return sales.reduce((sum, s) => sum + (Number(s.outputWeight ?? s.weight) || 0), 0)
  }, [sales])
  const averageEfficiency = useMemo(() => {
    const totalIn = sales.reduce((sum, s) => sum + (Number(s.weight) || 0), 0)
    const totalOut = sales.reduce((sum, s) => sum + (Number(s.outputWeight || 0) || 0), 0)
    if (totalIn <= 0) return 0
    return Math.round((totalOut / totalIn) * 100)
  }, [sales])
  const topGradeRatio = 85 // % Grade A

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/sales", { cache: "no-store" })
        if (res.ok) {
          const { data } = await res.json()
          setSales(Array.isArray(data) ? data : [])
        }
      } catch {}
    }
    load()
  }, [])

  const totalSales = useMemo(() => {
    return sales.reduce((sum, s) => sum + (Number(s.value) || 0), 0)
  }, [sales])

  const supplierOptions = useMemo(() => {
    const set = new Set<string>()
    sales.forEach((s) => {
      if (s.supplier) set.add(String(s.supplier))
    })
    return Array.from(set)
  }, [sales])

  const filteredSales = useMemo(() => {
    let data = [...sales]
    if (supplierFilter !== "all") {
      data = data.filter((s) => String(s.supplier) === supplierFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter((s) => String(s.name || "").toLowerCase().includes(q))
    }
    if (sortOutput !== "none") {
      data.sort((a, b) => (Number(a.outputWeight || 0)) - (Number(b.outputWeight || 0)))
      if (sortOutput === "desc") data.reverse()
    }
    return data
  }, [sales, supplierFilter, search, sortOutput])

  const exportToCSV = () => {
    const headers = ["Unit", "Thread Name", "Weight/KG", "Grade", "Status", "Timestamp"]
    const data = [
      ["UNIT1", "2/10s kw", "50", "A", "Completed", "2026-01-31 10:00"],
      ["UNIT2", "2/20s kw", "45", "B", "Completed", "2026-01-31 09:45"],
      ["UNIT3", "2/36s recycle Yarns", "60", "A", "Completed", "2026-01-31 09:30"],
    ]

    const csvContent = [
      headers.join(","),
      ...data.map(row => row.join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `textile-mill-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Production Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for Sree Airson Textile Mills</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Production Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weight Processed</CardTitle>
            <Weight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProcessed.toLocaleString()} KG</div>
            <p className="text-xs text-muted-foreground">+12% from previous period</p>
          </CardContent>
        </Card>

        

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Efficiency</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEfficiency}%</div>
            <p className="text-xs text-muted-foreground">High performance level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grade A Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topGradeRatio}%</div>
            <p className="text-xs text-muted-foreground">Quality assurance target met</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹ {totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Captured at completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Yarn Process Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Yarn Process Overview</CardTitle>
          <CardDescription>Recent completed batches and basic metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sales.slice(0, 6).map((s) => (
              <div key={s.id} className="flex justify-between items-center py-2 border-b">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Supplier: {s.supplier} • Unit: {s.unit}</p>
                </div>
                <div className="text-right">
                  <Badge>Completed</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{Number(s.weight || 0)} KG • {new Date(s.timestamp || Date.now()).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <div className="p-6 text-center text-muted-foreground bg-gray-50 rounded-md">No completed yarn processes yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sales Details with filters */}
      <Card>
        <CardHeader>
          <CardTitle>Sales</CardTitle>
          <CardDescription>Recorded on job completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search yarn name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <div className="flex gap-2">
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {supplierOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOutput} onValueChange={(v) => setSortOutput(v as any)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Sort</SelectItem>
                  <SelectItem value="desc">Highest Output</SelectItem>
                  <SelectItem value="asc">Lowest Output</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Thread</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="text-right">Output Weight</TableHead>
                  <TableHead className="text-right">Shortage</TableHead>
                  <TableHead className="text-right">Sales Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{new Date(s.timestamp || Date.now()).toLocaleString()}</TableCell>
                    <TableCell>{s.unit}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.supplier}</TableCell>
                    <TableCell>{s.weight} KG</TableCell>
                    <TableCell className="text-right">{Number(s.outputWeight || 0)} KG</TableCell>
                    <TableCell className="text-right">{Number(s.shortage || 0)} KG</TableCell>
                    <TableCell className="text-right">₹ {Number(s.value || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {filteredSales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No matching records
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
