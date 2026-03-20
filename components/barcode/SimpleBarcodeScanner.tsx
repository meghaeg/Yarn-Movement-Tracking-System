"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Scan, AlertCircle, Package } from 'lucide-react'

interface YarnData {
  yarnName: string
  grade: string
  supplier: string
  weight: number
  cost: number
}

interface SimpleBarcodeScannerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SimpleBarcodeScanner({ open, onOpenChange }: SimpleBarcodeScannerProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<YarnData | null>(null)
  const [error, setError] = useState('')
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<any>(null)

  // Use controlled state if props are provided
  const dialogOpen = open !== undefined ? open : isOpen
  const setDialogOpen = onOpenChange || setIsOpen

  useEffect(() => {
    checkCameraPermission()
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
      }
    }
  }, [])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setCameraPermission(true)
    } catch (err) {
      setCameraPermission(false)
    }
  }

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      setCameraPermission(true)
    } catch (err) {
      setCameraPermission(false)
      setError('Camera permission denied. Please allow camera access to scan barcodes.')
    }
  }

  const startScanning = async () => {
    setError('')
    setIsScanning(true)

    try {
      // Dynamically import html5-qrcode
      const { Html5QrcodeScanner } = await import('html5-qrcode')

      // Create scanner instance
      const scanner = new Html5QrcodeScanner(
        "barcode-scanner",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [0] // 0 = SCAN_TYPE_CAMERA
        },
        false
      )

      scannerRef.current = scanner

      // Set up success callback
      scanner.render(
        async (decodedText: string) => {
          try {
            // Stop scanning
            scanner.clear()
            setIsScanning(false)

            // Decode barcode data
            const response = await fetch('/api/decode-barcode', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ barcodeData: decodedText }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Invalid barcode data')
            }

            const result = await response.json()
            setScannedData(result.data)

          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to decode barcode')
            setIsScanning(false)
          }
        },
        (error: any) => {
          console.error('Scanner error:', error)
        }
      )

    } catch (err) {
      setError('Failed to initialize scanner. Please ensure camera is available.')
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const resetScanner = () => {
    setScannedData(null)
    setError('')
    stopScanning()
  }

  const closeDialog = () => {
    setIsOpen(false)
    resetScanner()
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Scan className="h-4 w-4 mr-2" />
          Scan Barcode
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Barcode Scanner</DialogTitle>
          <DialogDescription>
            Scan yarn barcode to view details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {cameraPermission === false && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Camera permission is required to scan barcodes. Please enable camera access.
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2"
                  onClick={requestCameraPermission}
                >
                  Request Permission
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!scannedData && !isScanning && cameraPermission !== false && (
            <div className="text-center py-8">
              <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Click "Start Scanning" to begin</p>
              <Button onClick={startScanning}>
                <Scan className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Position barcode within frame</p>
              </div>
              <div id="barcode-scanner" className="w-full" />
              <div className="text-center">
                <Button variant="outline" onClick={stopScanning}>
                  Stop Scanning
                </Button>
              </div>
            </div>
          )}

          {scannedData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Package className="h-5 w-5 mr-2" />
                  Sree Airson Textile Mills
                </CardTitle>
                <CardDescription>Barcode successfully scanned and decoded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Yarn Name</label>
                    <p className="text-lg font-semibold">{scannedData.yarnName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Grade</label>
                    <p className="text-lg font-semibold">{scannedData.grade}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Yarn Supplier</label>
                    <p className="text-lg font-semibold">{scannedData.supplier}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Weight</label>
                    <p className="text-lg font-semibold">{scannedData.weight} kg</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cost</label>
                    <p className="text-lg font-semibold">₹{scannedData.cost.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={resetScanner}>
                    Scan Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
