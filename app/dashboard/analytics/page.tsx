"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    Area,
    AreaChart,
} from "recharts"
import { TrendingUp, Package, DollarSign, Activity } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type ChartType = "bar" | "pie" | "line" | "histogram"

interface AnalyticsData {
    supplierSales: { name: string; sales: number }[]
    yarnTypes: { name: string; value: number }[]
    gradeProfits: { grade: string; profit: number; count: number; avgProfit: number }[]
    summary: {
        totalSales: number
        totalJobs: number
        totalWeight: number
        avgSalesPerJob: number
    }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF6B9D"]
const GRADE_COLORS = {
    A: "#10B981",
    B: "#3B82F6",
    C: "#F59E0B",
    D: "#EF4444",
}

export default function AnalyticsPage() {
    const { hasPermission, user } = useAuth()
    const router = useRouter()
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [supplierChartType, setSupplierChartType] = useState<ChartType>("bar")
    const [yarnChartType, setYarnChartType] = useState<ChartType>("pie")
    const [gradeChartType, setGradeChartType] = useState<ChartType>("bar")

    useEffect(() => {
        // Check if user has permission to view reports/analytics
        if (user && !hasPermission("reports.view")) {
            router.push("/dashboard")
            return
        }

        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/analytics", { cache: "no-store" })
                if (res.ok) {
                    const { data } = await res.json()
                    setAnalytics(data)
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [user, hasPermission, router])

    const renderChart = (data: any[], chartType: ChartType, dataKey: string, nameKey: string, title: string) => {
        switch (chartType) {
            case "bar":
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey={nameKey}
                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={100}
                            />
                            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                                formatter={(value: number) => [`₹ ${value.toLocaleString()}`, title]}
                            />
                            <Legend wrapperStyle={{ paddingTop: "20px" }} />
                            <Bar dataKey={dataKey} fill="#0088FE" name={title} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )
            case "pie":
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={(entry) => `${entry[nameKey]} (${entry[dataKey]})`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey={dataKey}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                )
            case "line":
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey={nameKey}
                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={100}
                            />
                            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                                formatter={(value: number) => [`₹ ${value.toLocaleString()}`, title]}
                            />
                            <Legend wrapperStyle={{ paddingTop: "20px" }} />
                            <Line type="monotone" dataKey={dataKey} stroke="#0088FE" strokeWidth={2} name={title} />
                        </LineChart>
                    </ResponsiveContainer>
                )
            case "histogram":
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey={nameKey}
                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={100}
                            />
                            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                                formatter={(value: number) => [`₹ ${value.toLocaleString()}`, title]}
                            />
                            <Legend wrapperStyle={{ paddingTop: "20px" }} />
                            <Area type="monotone" dataKey={dataKey} stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} name={title} />
                        </AreaChart>
                    </ResponsiveContainer>
                )
            default:
                return null
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!analytics) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Failed to load analytics data. Please try again later.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Analytics Report</h1>
                    <p className="text-muted-foreground text-lg">Data-driven insights for Sree Airson Textile Mills</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹ {analytics.summary.totalSales.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From all completed jobs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jobs Completed</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.summary.totalJobs.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Across all units</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Weight Processed</CardTitle>
                        <Package className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.summary.totalWeight.toLocaleString()} KG</div>
                        <p className="text-xs text-muted-foreground">Raw material processed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Sales Per Job</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹ {analytics.summary.avgSalesPerJob.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Average revenue per job</p>
                    </CardContent>
                </Card>
            </div>

            {/* Supplier Sales Performance */}
            <Card className="border-none shadow-sm">
                <CardHeader className="bg-white border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl font-semibold">Supplier Sales Performance</CardTitle>
                            <CardDescription>Total sales revenue generated by each supplier</CardDescription>
                        </div>
                        <Select value={supplierChartType} onValueChange={(value: ChartType) => setSupplierChartType(value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select chart type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bar">Bar Chart</SelectItem>
                                <SelectItem value="pie">Pie Chart</SelectItem>
                                <SelectItem value="line">Line Graph</SelectItem>
                                <SelectItem value="histogram">Histogram</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {analytics.supplierSales.length > 0 ? (
                        renderChart(analytics.supplierSales, supplierChartType, "sales", "name", "Sales Revenue (₹)")
                    ) : (
                        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                            No supplier sales data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Yarn Types Usage */}
            <Card className="border-none shadow-sm">
                <CardHeader className="bg-white border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl font-semibold">Yarn Types Usage Distribution</CardTitle>
                            <CardDescription>Breakdown of different yarn types processed</CardDescription>
                        </div>
                        <Select value={yarnChartType} onValueChange={(value: ChartType) => setYarnChartType(value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select chart type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bar">Bar Chart</SelectItem>
                                <SelectItem value="pie">Pie Chart</SelectItem>
                                <SelectItem value="line">Line Graph</SelectItem>
                                <SelectItem value="histogram">Histogram</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {analytics.yarnTypes.length > 0 ? (
                        renderChart(analytics.yarnTypes, yarnChartType, "value", "name", "Usage Count")
                    ) : (
                        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                            No yarn type data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Grade-based Profit Analysis */}
            <Card className="border-none shadow-sm">
                <CardHeader className="bg-white border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl font-semibold">Grade-Based Profit Analysis</CardTitle>
                            <CardDescription>Total profit distribution across quality grades (A, B, C, D)</CardDescription>
                        </div>
                        <Select value={gradeChartType} onValueChange={(value: ChartType) => setGradeChartType(value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select chart type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bar">Bar Chart</SelectItem>
                                <SelectItem value="pie">Pie Chart</SelectItem>
                                <SelectItem value="line">Line Graph</SelectItem>
                                <SelectItem value="histogram">Histogram</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {analytics.gradeProfits.length > 0 ? (
                        gradeChartType === "bar" ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={analytics.gradeProfits}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="grade" tick={{ fill: "#6b7280", fontSize: 14, fontWeight: 600 }} />
                                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        }}
                                        formatter={(value: number, name: string) => {
                                            if (name === "profit") return [`₹ ${value.toLocaleString()}`, "Total Profit"]
                                            if (name === "avgProfit") return [`₹ ${value.toLocaleString()}`, "Avg Profit"]
                                            return [value, name]
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                                    <Bar dataKey="profit" name="Total Profit (₹)" radius={[8, 8, 0, 0]}>
                                        {analytics.gradeProfits.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade as keyof typeof GRADE_COLORS] || "#8884d8"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : gradeChartType === "pie" ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={analytics.gradeProfits}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={(entry) => `Grade ${entry.grade} (₹${entry.profit.toLocaleString()})`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="profit"
                                    >
                                        {analytics.gradeProfits.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade as keyof typeof GRADE_COLORS] || "#8884d8"} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        }}
                                        formatter={(value: number) => [`₹ ${value.toLocaleString()}`, "Profit"]}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : gradeChartType === "line" ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={analytics.gradeProfits}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="grade" tick={{ fill: "#6b7280", fontSize: 14, fontWeight: 600 }} />
                                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        }}
                                        formatter={(value: number) => [`₹ ${value.toLocaleString()}`, "Profit"]}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                                    <Line type="monotone" dataKey="profit" stroke="#0088FE" strokeWidth={2} name="Total Profit (₹)" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={analytics.gradeProfits}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="grade" tick={{ fill: "#6b7280", fontSize: 14, fontWeight: 600 }} />
                                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        }}
                                        formatter={(value: number) => [`₹ ${value.toLocaleString()}`, "Profit"]}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                                    <Area type="monotone" dataKey="profit" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} name="Total Profit (₹)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )
                    ) : (
                        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                            No grade profit data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Grade Details Table */}
            <Card className="border-none shadow-sm">
                <CardHeader className="bg-white border-b border-gray-100">
                    <CardTitle className="text-xl font-semibold">Grade Performance Details</CardTitle>
                    <CardDescription>Detailed breakdown of each quality grade</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Jobs</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Profit</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg Profit/Job</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.gradeProfits.map((grade) => (
                                    <tr key={grade.grade} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <span
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold"
                                                style={{ backgroundColor: GRADE_COLORS[grade.grade as keyof typeof GRADE_COLORS] }}
                                            >
                                                {grade.grade}
                                            </span>
                                        </td>
                                        <td className="text-right py-3 px-4 text-gray-700">{grade.count}</td>
                                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                                            ₹ {grade.profit.toLocaleString()}
                                        </td>
                                        <td className="text-right py-3 px-4 text-gray-700">₹ {grade.avgProfit.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
