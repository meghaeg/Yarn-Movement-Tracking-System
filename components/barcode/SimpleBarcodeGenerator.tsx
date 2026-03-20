"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Barcode, Download } from 'lucide-react'

interface YarnData {
  yarnName: string
  grade: string
  supplier: string
  weight: number
  cost: number
}

interface SimpleBarcodeGeneratorProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SimpleBarcodeGenerator({ open, onOpenChange }: SimpleBarcodeGeneratorProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [yarnName, setYarnName] = useState('')
  const [grade, setGrade] = useState('')
  const [supplier, setSupplier] = useState('')
  const [weight, setWeight] = useState(0)
  const [cost, setCost] = useState(0)
  const [barcodeImage, setBarcodeImage] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Use controlled state if props are provided
  const dialogOpen = open !== undefined ? open : isOpen
  const setDialogOpen = onOpenChange || setIsOpen

  const handleGenerateBarcode = async () => {
    setError('')
    setLoading(true)

    try {
      // Validate form
      if (!yarnName || !grade || !supplier || !weight || !cost) {
        setError('Please fill in all fields with valid values')
        setLoading(false)
        return
      }

      if (weight <= 0 || cost <= 0) {
        setError('Weight and cost must be positive numbers')
        setLoading(false)
        return
      }

      const yarnData: YarnData = {
        yarnName,
        grade,
        supplier,
        weight,
        cost
      }

      const response = await fetch('/api/generate-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(yarnData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate barcode')
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      setBarcodeImage(imageUrl)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate barcode')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (barcodeImage) {
      const link = document.createElement('a')
      link.href = barcodeImage
      link.download = `barcode-${yarnName}-${Date.now()}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const resetForm = () => {
    setYarnName('')
    setGrade('')
    setSupplier('')
    setWeight(0)
    setCost(0)
    setBarcodeImage('')
    setError('')
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Barcode className="h-4 w-4 mr-2" />
          Generate Barcode
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Yarn Barcode</DialogTitle>
          <DialogDescription>
            Enter yarn details to generate barcode
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="yarnName">Yarn Name</Label>
            <Input
              id="yarnName"
              value={yarnName}
              onChange={(e) => setYarnName(e.target.value)}
              placeholder="Enter yarn name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Input
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Enter grade"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supplier">Yarn Supplier</Label>
            <Input
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Enter supplier name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              placeholder="Enter weight"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cost">Cost (₹)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
              placeholder="Enter cost"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {barcodeImage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generated Barcode</CardTitle>
                <CardDescription>Right-click to save or use download button</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <img src={barcodeImage} alt="Generated Barcode" className="border rounded" />
                  <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Barcode
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <Button onClick={handleGenerateBarcode} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Barcode'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
