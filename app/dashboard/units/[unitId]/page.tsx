"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useInventory } from "@/hooks/use-inventory"
import { useEffect, useState } from "react"
import { format } from "date-fns"

export default function UnitHistoryPage() {
    const params = useParams()
    // decodeURIComponent because the unitId might contain %20 (e.g. Unit%201)
    const unitId = typeof params.unitId === 'string' ? decodeURIComponent(params.unitId) : ''
    const { units, activities, completedJobs, loading } = useInventory()

    const unit = units.find(u => u.unit === unitId)

    if (loading) return <div className="p-8">Loading history...</div>

    // Filter activities for this unit
    // Note: activities API saves 'unit' field as the unit name (e.g. "Unit 1")
    const unitActivities = (activities || [])
        .filter(a => a.unit === unitId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Filter completed jobs for this unit
    // completedJobs usually doesn't have a 'unit' field explicitly stored in the top level listing 
    // unless we added it. Let's look at the schema. 
    // Actually, standard filtered listing usually relies on name/supplier match or we need to check if 'unit' was saved.
    // In `LiveProductionPage`, we save `unit: unit.unit` in the /api/sales payload, but `addCompletedJob` only takes name/supplier/weight.
    // HOWEVER, we can guess or if we didn't save it, we might only rely on Activities for strict timeline.
    // Let's assume for now we only show Activities as the "detailed history" requested.
    // But wait, the user asked for "completed jobs processed current processed all start time and end time".
    // The `activities` log has 'start', 'done' events. We can try to pair them up if we want intervals.
    // For now, listing the raw log with timestamps IS the history including start/end times.

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-gray-900">{unitId} History</h1>
                <p className="text-muted-foreground">Detailed processing log and status history</p>
            </div>

            {/* Current Status Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Status</div>
                            <div className="font-semibold text-lg flex items-center gap-2">
                                {unit?.status === 'running' ? (
                                    <Badge className="bg-green-600">Running</Badge>
                                ) : (
                                    <Badge variant="secondary">Stopped</Badge>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Current Thread</div>
                            <div className="font-semibold text-lg">{unit?.name || "-"}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Assigned Grade</div>
                            <div className="font-semibold text-lg">{unit?.grade || "-"}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Supplier</div>
                            <div className="font-semibold text-lg">{unit?.supplier || "-"}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Combined Timeline & History */}
            <Card>
                <CardHeader>
                    <CardTitle>Production Timeline</CardTitle>
                    <CardDescription>Comprehensive history of jobs and idle periods.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Time Range</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Duration</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Thread Details</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Production Metrics</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">User</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {renderTimeline(unitActivities)}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function renderTimeline(activities: any[]) {
    if (!activities || activities.length === 0) {
        return (
            <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No history available.
                </td>
            </tr>
        )
    }

    // Sort Chronologically (Oldest -> Newest) to build timeline
    const sortedEvents = [...activities].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    const timeline: any[] = []
    let lastEndTime: Date | null = null

    for (let i = 0; i < sortedEvents.length; i++) {
        const evt = sortedEvents[i]
        const evtTime = new Date(evt.timestamp)

        // 1. Check for Idle Time since last event
        if (lastEndTime && evtTime.getTime() > lastEndTime.getTime() + 60000) { // > 1 min gap
            timeline.push({
                type: 'idle',
                start: lastEndTime,
                end: evtTime,
            })
        }

        // 2. Process Events
        if (evt.action === 'start' || evt.action === 'resume') {
            // Look ahead for matching done/stop
            let match = null
            let j = i + 1
            while (j < sortedEvents.length) {
                if ((sortedEvents[j].action === 'done' || sortedEvents[j].action === 'stop')) {
                    match = sortedEvents[j]
                    break
                }
                if (sortedEvents[j].action === 'start') break // Nested start? treat as new
                j++
            }

            if (match) {
                timeline.push({
                    type: 'job',
                    status: 'completed',
                    startEvt: evt,
                    endEvt: match,
                    user: match.byRole || evt.byRole
                })
                lastEndTime = new Date(match.timestamp)
                i = j // Skip to the matching end event
            } else {
                // Running job (no end event found)
                timeline.push({
                    type: 'job',
                    status: 'running',
                    startEvt: evt,
                    endEvt: null,
                    user: evt.byRole
                })
                lastEndTime = new Date() // Currently running, so no idle after this
            }
        } else if (evt.action === 'done' || evt.action === 'stop') {
            // Orphaned end event (e.g. from before we tracked starts, or missing data)
            timeline.push({
                type: 'job',
                status: 'completed',
                startEvt: null,
                endEvt: evt,
                user: evt.byRole
            })
            lastEndTime = evtTime
        }
    }

    // Reverse to show Newest First
    return timeline.reverse().map((item, idx) => {
        if (item.type === 'idle') {
            const diffMs = item.end.getTime() - item.start.getTime()
            const mins = Math.floor((diffMs / (1000 * 60)) % 60)
            const hrs = Math.floor((diffMs / (1000 * 60 * 60)))
            const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`

            return (
                <tr key={`idle-${idx}`} className="bg-gray-50/50">
                    <td colSpan={6} className="p-3 text-center text-gray-500 text-xs uppercase tracking-wider font-medium">
                        Idle for {durationStr}
                    </td>
                </tr>
            )
        }

        const start = item.startEvt
        const end = item.endEvt
        const isRunning = item.status === 'running'
        const details = end || start // Prefer end event for data as it usually has the totals

        // Data Consolidation
        const threadName = details?.unitName || details?.name || "-"
        const supplier = details?.supplier || "-"
        const weight = details?.weight ? `${details.weight} KG` : "-"
        const grade = details?.grade || "-"
        const amount = details?.amount ? `₹${details.amount}` : "-"

        // Time & Duration
        const startTime = start ? new Date(start.timestamp) : (details.startTime ? new Date(details.startTime) : null)
        const endTime = end ? new Date(end.timestamp) : (isRunning ? "Now" : null)

        let durationStr = "-"
        if (startTime && endTime) {
            const endD = endTime === "Now" ? new Date() : (endTime as Date)
            const diff = endD.getTime() - startTime.getTime()
            const mins = Math.floor((diff / (1000 * 60)) % 60)
            const hrs = Math.floor((diff / (1000 * 60 * 60)))
            durationStr = `${hrs}h ${mins}m`
        }

        return (
            <tr key={`job-${idx}`} className={isRunning ? "bg-blue-50/30" : "hover:bg-gray-50/30"}>
                <td className="p-4">
                    {isRunning ? (
                        <Badge className="bg-blue-600 animate-pulse">Running</Badge>
                    ) : (
                        <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>
                    )}
                </td>
                <td className="p-4 text-gray-600 text-xs">
                    <div className="flex flex-col">
                        <span>Start: {startTime ? format(startTime, "PP p") : "?"}</span>
                        {endTime !== "Now" && <span>End: {endTime ? format(endTime as Date, "PP p") : "?"}</span>}
                    </div>
                </td>
                <td className="p-4 font-medium text-gray-900">{durationStr}</td>
                <td className="p-4">
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{threadName}</span>
                        <span className="text-xs text-gray-500">{supplier}</span>
                    </div>
                </td>
                <td className="p-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <span className="text-gray-500">Weight:</span> <span className="font-medium">{weight}</span>
                        <span className="text-gray-500">Grade:</span> <span className="font-medium">{grade}</span>
                        <span className="text-gray-500">Amount:</span> <span className="font-medium text-green-600">{amount}</span>
                    </div>
                </td>
                <td className="p-4 text-gray-500 italic text-xs">
                    {item.user || "system"}
                </td>
            </tr>
        )
    })
}

