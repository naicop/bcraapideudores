import { NextResponse } from "next/server"

export async function GET() {
  const testResults = []

  // URLs posibles para probar
  const possibleUrls = [
    "https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/20340232071",
    "https://api.bcra.gob.ar/central-deudores/v1.0/Deudas/20340232071",
    "https://api.bcra.gob.ar/centraldedeudores/v1/Deudas/20340232071",
    "https://api.bcra.gob.ar/centraldedeudores/Deudas/20340232071",
    "https://www.bcra.gob.ar/centraldedeudores/v1.0/Deudas/20340232071",
  ]

  for (const url of possibleUrls) {
    try {
      console.log(`Probando URL: ${url}`)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; BCRA-Consulta/1.0)",
        },
        signal: AbortSignal.timeout(10000),
      })

      testResults.push({
        url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        success: response.ok,
      })

      if (response.ok) {
        try {
          const data = await response.json()
          testResults[testResults.length - 1].data = data
        } catch (e) {
          testResults[testResults.length - 1].parseError = "No es JSON válido"
        }
      }
    } catch (error) {
      testResults.push({
        url,
        error: error instanceof Error ? error.message : String(error),
        success: false,
      })
    }
  }

  return NextResponse.json({ testResults })
}
