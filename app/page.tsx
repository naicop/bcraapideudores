"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertTriangle } from "lucide-react"
import { CuitUploader } from "@/components/cuit-uploader"
import { ResultsTable } from "@/components/results-table"
import type { ConsultaResult } from "@/types/bcra"

export default function Home() {
  const [results, setResults] = useState<ConsultaResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConsulta = async (cuits: string[]) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Enviando consulta con CUITs:", cuits)

      const response = await fetch("/api/consulta-bcra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cuits }),
      })

      console.log("Respuesta recibida:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        throw new Error(errorData.error || `Error HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("Datos procesados:", data)

      setResults(data.results || [])
    } catch (error) {
      console.error("Error completo:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(`Error al realizar la consulta: ${errorMessage}`)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Sistema de Consultas BCRA</h1>
          <p className="text-lg text-muted-foreground">
            Consulte la situación de deudores en la Central de Deudores del BCRA
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Conectado a la API oficial del BCRA:</strong> Este sistema consulta directamente la Central de
            Deudores del Banco Central de la República Argentina usando el endpoint{" "}
            <code className="bg-muted px-1 rounded">
              https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/&#123;cuit&#125;
            </code>
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Cargar CUITs para Consulta</CardTitle>
            <CardDescription>
              Puede cargar los CUITs mediante un archivo CSV o pegándolos directamente. Se procesarán con un delay de 1
              segundo entre consultas para respetar los límites de la API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CuitUploader onConsulta={handleConsulta} isLoading={isLoading} />
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados de la Consulta</CardTitle>
              <CardDescription>
                {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}{" "}
                - Datos oficiales del BCRA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResultsTable results={results} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
