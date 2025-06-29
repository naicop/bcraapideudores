import { type NextRequest, NextResponse } from "next/server"
import type { ConsultaResult } from "@/types/bcra"

export async function POST(request: NextRequest) {
  try {
    const { cuits } = await request.json()

    if (!Array.isArray(cuits) || cuits.length === 0) {
      return NextResponse.json({ error: "Se requiere un array de CUITs válidos" }, { status: 400 })
    }

    console.log(`Procesando ${cuits.length} CUITs`)
    const results: ConsultaResult[] = []

    // Procesar cada CUIT
    for (let i = 0; i < cuits.length; i++) {
      const cuit = cuits[i]
      console.log(`Procesando CUIT ${i + 1}/${cuits.length}: ${cuit}`)

      try {
        const result = await consultarBCRA(cuit)
        results.push(result)

        // Delay entre consultas
        if (i < cuits.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`Error procesando CUIT ${cuit}:`, error)
        results.push({
          cuit,
          fechaConsulta: new Date().toISOString().split("T")[0],
          error: "Error en la consulta",
          observaciones: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
          situacion: "Error",
        })
      }
    }

    console.log(`Consulta completada. ${results.length} resultados`)
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error en la consulta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

async function consultarBCRA(cuit: string): Promise<ConsultaResult> {
  try {
    const url = `https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/${cuit}`
    console.log(`Consultando: ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; BCRA-Consulta/1.0)",
      },
    })

    console.log(`Status: ${response.status}`)

    if (response.status === 404) {
      return {
        cuit,
        fechaConsulta: new Date().toISOString().split("T")[0],
        observaciones: "CUIT no encontrado en la Central de Deudores",
        situacion: "Sin datos",
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`Datos recibidos:`, data)

    return {
      cuit,
      denominacion: data?.denominacion || data?.razonSocial || undefined,
      situacion: data?.situacion || data?.estado || "Sin datos",
      fechaConsulta: new Date().toISOString().split("T")[0],
      observaciones: data?.observaciones || data?.detalle || undefined,
    }
  } catch (error) {
    console.error(`Error en CUIT ${cuit}:`, error)
    throw error
  }
}
