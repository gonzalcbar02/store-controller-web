import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Package, AlertCircle, Loader2 } from "lucide-react"

interface Producto {
  id: number
  name: string
  descripcion: string
  image: string
}

interface ArmarioData {
  idArmario: number
  name: string
  descripcion: string
  productos: Producto[]
}

const QRView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [armarioData, setArmarioData] = useState<ArmarioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArmarioData = async () => {
      if (!id) {
        setError("ID de armario no válido")
        setLoading(false)
        return
      }

      try {
        // Obtener datos del armario
        const armarioResponse = await fetch(`http://localhost:8000/api/armarios/${id}`)
        if (!armarioResponse.ok) {
          throw new Error("Armario no encontrado")
        }
        const armarioResponseData = await armarioResponse.json()

        // Adaptado a la estructura de respuesta del dashboard
        const armario = armarioResponseData.armario || armarioResponseData

        // Obtener productos del armario usando la misma lógica del dashboard
        const productosResponse = await fetch(`http://localhost:8000/api/productos/armario/${id}`)
        let productos: Producto[] = []

        if (productosResponse.ok) {
          const data = await productosResponse.json()
          // Usar la misma lógica del dashboard para manejar la respuesta
          const productosArray = Array.isArray(data) ? data : data.productos || []
          productos = productosArray
        } else {
          console.error("Error al obtener productos:", await productosResponse.text())
        }

        setArmarioData({
          idArmario: armario.idArmario || armario.id,
          name: armario.name,
          descripcion: armario.descripcion,
          productos: productos,
        })
      } catch (err) {
        console.error("Error en la petición:", err)
        setError(err instanceof Error ? err.message : "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchArmarioData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Cargando información del armario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (!armarioData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm sm:text-base">No se encontraron datos del armario</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                  {armarioData.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Acceso via QR</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Información del armario */}
        <div className="bg-white rounded-lg shadow-sm border mb-4 sm:mb-6">
          <div className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Información del Armario</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start sm:items-center space-x-3">
                <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Nombre</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{armarioData.name}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs sm:text-sm text-gray-500 mb-2">Descripción</p>
              <p className="text-gray-900 text-sm sm:text-base leading-relaxed break-words">
                {armarioData.descripcion}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Productos ({armarioData.productos.length})
              </h2>
            </div>

            {armarioData.productos.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No hay productos en este armario</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {armarioData.productos.map((producto) => (
                  <div
                    key={producto.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50 transition-colors hover:shadow-md"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-gray-100">
                      <img
                        src={producto.image || "/placeholder.svg"}
                        alt={producto.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://res.cloudinary.com/duqjf1fuh/image/upload/v1686761853/imagen_default_byg0nb.jpg"
                        }}
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base break-words line-clamp-2">
                            {producto.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 break-words line-clamp-3 leading-relaxed">
                            {producto.descripcion}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
          <p>Información actualizada en tiempo real</p>
        </div>
      </div>
    </div>
  )
}

export default QRView
