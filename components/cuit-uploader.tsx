"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Loader2 } from "lucide-react"

interface CuitUploaderProps {
  onConsulta: (cuits: string[]) => void
  isLoading: boolean
}

export function CuitUploader({ onConsulta, isLoading }: CuitUploaderProps) {
  const [textInput, setTextInput] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateCuit = (cuit: string): boolean => {
    // Remover guiones y espacios
    const cleanCuit = cuit.replace(/[-\s]/g, "")

    // Verificar que tenga 11 dígitos
    if (!/^\d{11}$/.test(cleanCuit)) {
      return false
    }

    // Algoritmo de validación de CUIT
    const digits = cleanCuit.split("").map((d) => Number.parseInt(d, 10))
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

    let sum = 0
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * multipliers[i]
    }

    const remainder = sum % 11
    const checkDigit = remainder < 2 ? remainder : 11 - remainder

    return checkDigit === digits[10]
  }

  const processCuitsFromText = (): string[] => {
    const lines = textInput.split("\n")
    const cuits: string[] = []

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (trimmedLine) {
        if (validateCuit(trimmedLine)) {
          cuits.push(trimmedLine.replace(/[-\s]/g, ""))
        } else {
          console.warn(`CUIT inválido en línea ${index + 1}: ${trimmedLine}`)
        }
      }
    })

    return cuits
  }

  const processCuitsFromCSV = async (): Promise<string[]> => {
    if (!csvFile) return []

    const text = await csvFile.text()
    const lines = text.split("\n")
    const cuits: string[] = []

    lines.forEach((line, index) => {
      // Asumir que el CUIT está en la primera columna
      const columns = line.split(",")
      const cuit = columns[0]?.trim()

      if (cuit && cuit !== "CUIT" && cuit !== "cuit") {
        // Skip header
        if (validateCuit(cuit)) {
          cuits.push(cuit.replace(/[-\s]/g, ""))
        } else {
          console.warn(`CUIT inválido en línea ${index + 1}: ${cuit}`)
        }
      }
    })

    return cuits
  }

  const handleSubmitText = async () => {
    const cuits = processCuitsFromText()
    if (cuits.length === 0) {
      alert("No se encontraron CUITs válidos en el texto ingresado")
      return
    }
    onConsulta(cuits)
  }

  const handleSubmitCSV = async () => {
    const cuits = await processCuitsFromCSV()
    if (cuits.length === 0) {
      alert("No se encontraron CUITs válidos en el archivo CSV")
      return
    }
    onConsulta(cuits)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
    } else {
      alert("Por favor seleccione un archivo CSV válido")
    }
  }

  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="text">Pegar CUITs</TabsTrigger>
        <TabsTrigger value="csv">Subir CSV</TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cuits-text">CUITs (uno por línea)</Label>
          <Textarea
            id="cuits-text"
            placeholder="20123456789&#10;27987654321&#10;30456789123"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={8}
            className="font-mono"
          />
        </div>
        <Button onClick={handleSubmitText} disabled={!textInput.trim() || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Consultando...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Consultar CUITs
            </>
          )}
        </Button>
      </TabsContent>

      <TabsContent value="csv" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file">Archivo CSV</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="flex-1"
            />
          </div>
          {csvFile && <p className="text-sm text-muted-foreground">Archivo seleccionado: {csvFile.name}</p>}
        </div>
        <div className="text-sm text-muted-foreground">
          <p>El archivo CSV debe tener los CUITs en la primera columna.</p>
          <p>Ejemplo: CUIT,Nombre,Email</p>
        </div>
        <Button onClick={handleSubmitCSV} disabled={!csvFile || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Consultando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Consultar desde CSV
            </>
          )}
        </Button>
      </TabsContent>
    </Tabs>
  )
}
