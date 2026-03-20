
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Printer, RefreshCcw, QrCode } from "lucide-react"
import Barcode from "react-barcode"

interface BarcodeGeneratorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function BarcodeGenerator({ open, onOpenChange }: BarcodeGeneratorProps) {
    const [threadName, setThreadName] = useState("")
    const [grade, setGrade] = useState("")
    const [generated, setGenerated] = useState(false)

    const handleGenerate = () => {
        if (threadName && grade) {
            setGenerated(true)
        }
    }

    const handleReset = () => {
        setGenerated(false)
        setThreadName("")
        setGrade("")
    }

    // Create a value for the barcode based on inputs
    const barcodeValue = `${threadName}-${grade}`

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val)
            if (!val) setTimeout(handleReset, 300)
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Generate Barcode</DialogTitle>
                    <DialogDescription>
                        Enter the details below to generate a new barcode.
                    </DialogDescription>
                </DialogHeader>

                {!generated ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="threadName">Name of Thread</Label>
                            <Input
                                id="threadName"
                                value={threadName}
                                onChange={(e) => setThreadName(e.target.value)}
                                placeholder="e.g. Cotton 40s"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grade</Label>
                            <Input
                                id="grade"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                placeholder="e.g. A+"
                            />
                        </div>
                        <Button onClick={handleGenerate} className="w-full" disabled={!threadName || !grade}>
                            <QrCode className="mr-2 h-4 w-4" />
                            Generate Barcode
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-6 py-4">
                        <div className="text-center space-y-1">
                            <h3 className="font-bold text-xl">{threadName}</h3>
                            <p className="text-sm text-muted-foreground font-medium">Grade: {grade}</p>
                        </div>

                        <div className="p-6 bg-white border-2 border-dashed border-gray-200 rounded-xl shadow-sm flex flex-col items-center w-full overflow-hidden">
                            <Barcode
                                value={barcodeValue}
                                width={2}
                                height={80}
                                displayValue={true}
                                font="monospace"
                                textAlign="center"
                                textPosition="bottom"
                                background="transparent"
                            />
                        </div>

                        <div className="flex gap-3 w-full">
                            <Button variant="outline" className="flex-1" onClick={handleReset}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                New
                            </Button>
                            <Button className="flex-1" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
