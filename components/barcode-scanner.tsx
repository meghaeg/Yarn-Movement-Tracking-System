"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scan, Camera, X, Search } from "lucide-react"
import { useInventory } from "@/hooks/use-inventory"
import { useToast } from "@/hooks/use-toast"

interface BarcodeScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductFound?: (product: any) => void
}

export function BarcodeScanner({ open, onOpenChange, onProductFound }: BarcodeScannerProps) {
  const { products } = useInventory()
  const { toast } = useToast()
  const [manualBarcode, setManualBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [foundProduct, setFoundProduct] = useState(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Mock barcode patterns for demo
  const mockBarcodes = {
    IPH14PRO001: products.find((p) => p.sku === "IPH14PRO001"),
    SAM24001: products.find((p) => p.sku === "SAM24001"),
    MBP16001: products.find((p) => p.sku === "MBP16001"),
    NIKE001: products.find((p) => p.sku === "NIKE001"),
    "123456789": products[0], // Generic barcode for demo
    "987654321": products[1], // Generic barcode for demo
  }

  const startCamera = async () => {
    try {
      setIsScanning(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Simulate barcode detection after 3 seconds for demo
      setTimeout(() => {
        if (isScanning) {
          simulateBarcodeDetection()
        }
      }, 3000)
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please use manual entry.",
        variant: "destructive",
      })
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    setIsScanning(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const simulateBarcodeDetection = () => {
    // Simulate finding a random barcode for demo
    const barcodes = Object.keys(mockBarcodes)
    const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)]
    const product = mockBarcodes[randomBarcode as keyof typeof mockBarcodes]

    if (product) {
      setFoundProduct(product)
      setManualBarcode(randomBarcode)
      stopCamera()
      toast({
        title: "Barcode Detected",
        description: `Found: ${product.name}`,
      })
    }
  }

  const searchByBarcode = (barcode: string) => {
    // First try to find by exact barcode match
    const productByBarcode = mockBarcodes[barcode as keyof typeof mockBarcodes]
    if (productByBarcode) {
      setFoundProduct(productByBarcode)
      return
    }

    // Then try to find by SKU
    const productBySKU = products.find((p) => p.sku.toLowerCase() === barcode.toLowerCase())
    if (productBySKU) {
      setFoundProduct(productBySKU)
      return
    }

    // Finally try to find by name (partial match)
    const productByName = products.find((p) => p.name.toLowerCase().includes(barcode.toLowerCase()))
    if (productByName) {
      setFoundProduct(productByName)
      return
    }

    setFoundProduct(null)
    toast({
      title: "Product Not Found",
      description: "No product found with this barcode/SKU",
      variant: "destructive",
    })
  }

  const handleManualSearch = () => {
    if (manualBarcode.trim()) {
      searchByBarcode(manualBarcode.trim())
    }
  }

  const handleSelectProduct = () => {
    if (foundProduct && onProductFound) {
      onProductFound(foundProduct)
    }
    onOpenChange(false)
    resetScanner()
  }

  const resetScanner = () => {
    setManualBarcode("")
    setFoundProduct(null)
    stopCamera()
  }

  useEffect(() => {
    if (!open) {
      resetScanner()
    }
  }, [open])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Scan className="h-5 w-5 mr-2" />
            Barcode Scanner
          </DialogTitle>
          <DialogDescription>Scan a barcode or enter manually to find products</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Camera Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              {!isScanning ? (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Button onClick={startCamera}>
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-32 border-2 border-red-500 rounded-lg"></div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-transparent"
                    onClick={stopCamera}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="text-center mt-2 text-sm text-muted-foreground">
                    Position barcode within the red frame
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Entry Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Manual Entry</CardTitle>
              <CardDescription>Enter barcode or SKU manually</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter barcode or SKU..."
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleManualSearch()}
                />
                <Button onClick={handleManualSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Try: IPH14PRO001, SAM24001, MBP16001, or NIKE001</div>
            </CardContent>
          </Card>

          {/* Found Product */}
          {foundProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-green-600">Product Found!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Name:</Label>
                    <p className="text-sm">{foundProduct.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">SKU:</Label>
                    <p className="text-sm font-mono">{foundProduct.sku}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Price:</Label>
                    <p className="text-sm">₹{foundProduct.sellingPrice.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Stock:</Label>
                    <p className="text-sm">{foundProduct.stock} units</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {foundProduct && <Button onClick={handleSelectProduct}>Select Product</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
