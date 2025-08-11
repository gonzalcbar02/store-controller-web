"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { MoreVertical, Edit, Trash2, AlertTriangle, QrCode, X } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface ArmarioProps {
  idArmario: number
  name: string
  descripcion: string
  onDelete?: (id: number) => void
  onUpdate?: (id: number) => void
}

const ArmarioCard: React.FC<ArmarioProps> = ({ idArmario, name, descripcion, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleDelete = () => {
    setShowMenu(false)
    setShowDeleteModal(true)
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
  }

  const handleShowQR = () => {
    setShowMenu(false)
    setShowQRModal(true)
  }

  const handleCloseQR = () => {
    setShowQRModal(false)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`http://localhost:8000/api/armarios/${idArmario}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Llamar a la función onDelete del componente padre para actualizar la lista
        if (onDelete) {
          onDelete(idArmario)
        }
        setShowDeleteModal(false)
      } else {
        const errorData = await response.json()
        console.error("Error al eliminar el armario:", errorData.message)
        alert("Error al eliminar el armario. Inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error en la petición de eliminación:", error)
      alert("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setIsDeleting(false)
    }
  }

  // ========================================
  // FUNCIÓN CORREGIDA PARA EL CONTENIDO DEL QR
  // ========================================

  const getQRContent = () => {
    
    return `${window.location.origin}/qr/${idArmario}`
    
  }

  // Función para manejar el clic en el QR (opcional)
  const handleQRClick = () => {
    navigate(`/qr/${idArmario}`)
  }

  return (
    <>
      <div className="w-full max-w-xs rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white relative p-3">
        {/* Botón de menú */}
        <div className="absolute top-2 right-2" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Opciones"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {/* Menú desplegable */}
          {showMenu && (
            <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-1">
                <Link
                  to={`/projects/editArmario/${idArmario}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowMenu(false)}
                >
                  <Edit className="w-4 h-4" />
                  Actualizar
                </Link>
                <button
                  onClick={handleShowQR}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  QR
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-1 pr-8">{name}</h3>
          <p className="text-sm text-gray-600">{descripcion}</p>
        </div>
        <div className="px-4 pb-4">
          <Link
            to={`/armarios/${idArmario}`}
            className="w-full block py-2 px-4 bg-[#075b8f] hover:bg-[#012e4a] text-white text-center font-medium rounded-md transition-colors"
          >
            Ver Armario
          </Link>
        </div>
      </div>

      {/* Modal QR */}
      {showQRModal && (
        <div className="fixed inset-0 bg-[rgba(31,41,55,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            {/* Botón cerrar */}
            <button
              onClick={handleCloseQR}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">Código QR</h3>
              <p className="text-sm text-gray-600 mb-6">Armario: {name}</p>

              {/* Código QR */}
              <div className="flex justify-center mb-6">
                <div
                  className="p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={handleQRClick}
                  title="Clic para ir al armario"
                >
                  <QRCodeSVG value={getQRContent()} size={200} level="M" includeMargin={true} />
                </div>
              </div>

              {/* Información adicional */}
              <p className="text-xs text-gray-500 mb-4">Escanea este código para acceder al armario</p>
              <p className="text-xs text-gray-400">ID: {idArmario}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[rgba(31,41,55,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar el armario <strong>"{name}"</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar menú al hacer click fuera */}
      {showMenu && <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />}
    </>
  )
}

export default ArmarioCard
