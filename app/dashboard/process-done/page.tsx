"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, History } from "lucide-react"
import { useInventory } from "@/hooks/use-inventory"

export default function ProcessDonePage() {
    const { completedJobs, loading } = useInventory()

    if (loading && completedJobs.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">Loading history...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-start gap-1">
                <h1 className="text-4xl font-bold text-gray-900">Process Done</h1>
                <p className="text-muted-foreground text-lg">History of completed production jobs</p>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-semibold">Completed Jobs ({completedJobs.length})</CardTitle>
                        <CardDescription className="text-gray-500">List of all finalized batches</CardDescription>
                    </div>
                    <History className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0">
                    {completedJobs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead className="p-6">Thread Name</TableHead>
                                        <TableHead className="p-6">Supplier</TableHead>
                                        <TableHead className="p-6">Initial Weight</TableHead>
                                        <TableHead className="p-6 text-red-600">Shortage (KG)</TableHead>
                                        <TableHead className="p-6 text-green-600 font-bold">Return Weight</TableHead>
                                        <TableHead className="p-6">Completed At</TableHead>
                                        <TableHead className="p-6 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100">
                                    {completedJobs.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="p-6 font-medium text-gray-900">{item.name}</TableCell>
                                            <TableCell className="p-6 text-gray-600">{item.supplier}</TableCell>
                                            <TableCell className="p-6 text-gray-900 font-semibold">{item.weight} KG</TableCell>
                                            <TableCell className="p-6 text-red-500 font-medium">-{item.shortage} KG</TableCell>
                                            <TableCell className="p-6 text-green-600 font-bold">{item.returnWeight} KG</TableCell>
                                            <TableCell className="p-6 text-gray-500 text-sm">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="p-6 text-right">
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Done
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground bg-gray-50/30">
                            <div className="mb-4">
                                <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto" />
                            </div>
                            <p className="text-lg font-medium text-gray-600">No completed jobs yet</p>
                            <p>When you mark a unit as "Completed" on the dashboard, it will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
