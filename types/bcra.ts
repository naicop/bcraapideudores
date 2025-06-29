export interface ConsultaResult {
  cuit: string
  denominacion?: string
  situacion?: string
  fechaConsulta: string
  observaciones?: string
  error?: string
}

export interface BCRAApiResponse {
  results?: {
    identificacion: string
    denominacion: string
    situacion: string
    fechaActualizacion: string
    observaciones?: string
  }[]
  entidades?: {
    cuit: string
    denominacion: string
    situacion: string
    estado: string
  }[]
  deudas?: {
    entidad: string
    monto: number
    situacion: string
    fechaActualizacion: string
  }[]
}
