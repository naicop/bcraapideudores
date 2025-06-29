# Sistema de Consultas BCRA

Sistema para consultar la situación de deudores en la Central de Deudores del BCRA.

## Instalación en Replit

1. Ve a [replit.com](https://replit.com)
2. Crea un nuevo Repl con template "Next.js"
3. Sube todos estos archivos manteniendo la estructura de carpetas
4. Haz clic en "Run"

## Funcionalidades

- ✅ Carga de CUITs via texto o CSV
- ✅ Validación de CUIT con algoritmo oficial
- ✅ Consulta a la API oficial del BCRA
- ✅ Tabla de resultados con búsqueda
- ✅ Exportación a CSV
- ✅ Interfaz responsive

## Uso

1. Pega los CUITs uno por línea o sube un archivo CSV
2. Haz clic en "Consultar CUITs"
3. Revisa los resultados en la tabla
4. Exporta los resultados si es necesario

## API del BCRA

Endpoint: `https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/{cuit}`
