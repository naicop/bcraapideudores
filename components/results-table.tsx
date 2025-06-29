"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Download, Search } from "lucide-react"
import type { ConsultaResult } from "@/types/bcra"

interface ResultsTableProps {
  results: ConsultaResult[]
}

export function ResultsTable({ results }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredResults = results.filter(
    (result) =>
      result.cuit.includes(searchTerm) ||
      result.denominacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.situacion?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getSituacionBadge = (situacion: string) => {
    switch (situacion?.toLowerCase()) {
      case "normal":
        return (
          <Badge variant="default" className="bg-green-500">
            Normal
          </Badge>
        )
      case "con seguimiento especial":
        return <Badge variant="secondary">Seguimiento Especial</Badge>
      case "con problemas":
        return <Badge variant="destructive">Con Problemas</Badge>
      case "irrecuperable":
        return (
          <Badge variant="destructive" className="bg-red-700">
            Irrecuperable
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive" className="bg-orange-500">
            Error
          </Badge>
        )
      case "sin datos":
        return <Badge variant="outline">Sin Datos</Badge>
      default:
        return <Badge variant="outline">{situacion || "Sin datos"}</Badge>
    }
  }

  const exportToCSV = () => {
    const headers = ["CUIT", "Denominación", "Situación", "Fecha Consulta", "Observaciones"]
    const csvContent = [
      headers.join(","),
      ...filteredResults.map((result) =>
        [
          result.cuit,
          `"${result.denominacion || ""}"`,
          `"${result.situacion || ""}"`,
          result.fechaConsulta,
          `"${result.observaciones || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `consulta_bcra_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por CUIT, denominación o situación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CUIT</TableHead>
              <TableHead>Denominación</TableHead>
              <TableHead>Situación</TableHead>
              <TableHead>Fecha Consulta</TableHead>
              <TableHead>Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map((result, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">{result.cuit}</TableCell>
                <TableCell>{result.denominacion || "Sin datos"}</TableCell>
                <TableCell>{getSituacionBadge(result.situacion || "Sin datos")}</TableCell>
                <TableCell>{result.fechaConsulta}</TableCell>
                <TableCell className="max-w-xs truncate" title={result.observaciones}>
                  {result.observaciones || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No se encontraron resultados</div>
      )}
    </div>
  )
}
