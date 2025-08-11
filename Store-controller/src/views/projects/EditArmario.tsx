import type React from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"

interface ArmarioData {
  id: number
  name: string
  descripcion: string
  id_almacen: number
}

// Componente ArmarioCard para la vista previa
const ArmarioCard: React.FC<{ name: string; descripcion: string }> = ({ name, descripcion }) => {
  return (
    <div className="w-full max-w-xs rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-blue-600">{descripcion}</p>
      </div>
      <div className="px-4 pb-4">
        <div className="w-full block py-2 px-4 bg-[#075b8f] hover:bg-[#012e4a] text-white text-center font-medium rounded-md transition-colors">
          Ver Armario
        </div>
      </div>
    </div>
  )
}

export default function EditArmario() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [armarioData, setArmarioData] = useState<ArmarioData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm()

  // Cargar datos del armario al montar el componente
  useEffect(() => {
    const loadArmarioData = async () => {
      if (!id) return

      try {
        setIsLoadingData(true)
        const response = await fetch(`http://localhost:8000/api/armarios/${id}`)

        if (!response.ok) {
          throw new Error("Error al cargar los datos del armario")
        }

        const responseData = await response.json()
        const data = responseData.armario
        setArmarioData(data)

        // Establecer valores en el formulario
        setValue("name", data.name)
        setValue("descripcion", data.descripcion)
      } catch (error) {
        console.error("Error al cargar el armario:", error)
        setSubmitMessage({
          type: "error",
          text: "Error al cargar los datos del armario",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadArmarioData()
  }, [id, setValue])

  const onSubmit = async (data: any) => {
    if (!armarioData) return

    setIsLoading(true)
    setSubmitMessage(null)

    try {
      // Preparar datos para actualizar
      const payload = {
        name: data.name,
        descripcion: data.descripcion,
        id_almacen: armarioData.id_almacen,
      }

      console.log("Actualizando datos:", payload)

      const response = await fetch(`http://localhost:8000/api/armarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Armario actualizado exitosamente:", result)

      setSubmitMessage({
        type: "success",
        text: "Armario actualizado exitosamente",
      })

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/houses/${armarioData.id_almacen}`)
      }, 2000)
    } catch (error: any) {
      console.error("Error al actualizar el armario:", error)
      setSubmitMessage({
        type: "error",
        text: error.message || "Error al actualizar el armario. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#075b8f]"></div>
      </div>
    )
  }

  if (!armarioData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Armario no encontrado</h1>
        <Link
          to="/"
          className="bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-10 text-lg cursor-pointer transition-colors rounded"
        >
          Volver al Menú
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black">Editar Armario</h1>
          <p className="text-2xl font-light text-gray-500 mt-5">Modifica los datos de "{armarioData.name}"</p>
        </div>

        <nav className="my-5">
          <Link
            className="bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-10 text-xl cursor-pointer transition-colors rounded"
            to={`/houses/${armarioData.id_almacen}`}
          >
            Volver Menú
          </Link>
        </nav>
      </div>

      <form className="mt-10 bg-white shadow-lg rounded-lg p-10" onSubmit={handleSubmit(onSubmit)}>
        {/* Mensaje de estado */}
        {submitMessage && (
          <div
            className={`mb-6 p-4 rounded-md ${
              submitMessage.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Nombre del armario */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Armario
            </label>
            <input
              type="text"
              id="name"
              {...register("name", {
                required: "El nombre es obligatorio",
                minLength: {
                  value: 2,
                  message: "El nombre debe tener al menos 2 caracteres",
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075b8f]"
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              {...register("descripcion", {
                required: "La descripción es obligatoria",
                minLength: {
                  value: 5,
                  message: "La descripción debe tener al menos 5 caracteres",
                },
              })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075b8f]"
              disabled={isLoading}
            />
            {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion.message as string}</p>}
          </div>

          {/* Vista previa de la tarjeta */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Vista previa del armario</h3>
            <div className="flex justify-center">
              <ArmarioCard
                name={watch("name") || armarioData.name}
                descripcion={watch("descripcion") || armarioData.descripcion}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Link
              to={`/houses/${armarioData.id_almacen}`}
              className="font-bold py-3 px-10 text-lg cursor-pointer transition-colors rounded border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className={`font-bold py-3 px-10 text-lg cursor-pointer transition-colors rounded ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#075b8f] hover:bg-[#012e4a] text-white"
              }`}
            >
              {isLoading ? "Actualizando..." : "Actualizar Armario"}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
