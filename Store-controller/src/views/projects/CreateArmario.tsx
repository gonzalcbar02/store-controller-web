import type React from "react"
import { Link, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useState } from "react"

// Componente ArmarioCard para la vista previa
const ArmarioCard: React.FC<{ id: number; name: string; descripcion: string }> = ({ name, descripcion }) => {
  return (
    <div className="w-full max-w-xs rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-blue-600">{descripcion}</p>
      </div>
      <div className="px-4 pb-4">
        <Link
          to={``}
          className="w-full block py-2 px-4 bg-[#075b8f] hover:bg-[#012e4a] text-white text-center font-medium rounded-md transition-colors"
        >
          Ver Armario
        </Link>
      </div>
    </div>
  )
}

export default function CreateArmario() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  
  const { id } = useParams<{ id: string }>()

  const initialValues = {
    name: "Nombre del Armario",
    descripcion: "Descripción del armario",
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({ defaultValues: initialValues })

  

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setSubmitMessage(null)

    try {
      
      // Mapear los datos al formato esperado por la API
      const payload = {
        name: data.name,
        descripcion: data.descripcion,
        id_almacen: id,
      }

      const response = await fetch("http://localhost:8000/api/armarios", {
        method: "POST",
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
      console.log("Armario creado exitosamente:", result)

      setSubmitMessage({
        type: "success",
        text: "Armario creado exitosamente",
      })

      // Resetear el formulario después del éxito
      reset(initialValues)
    } catch (error: any) {
      console.error("Error al crear el armario:", error)
      setSubmitMessage({
        type: "error",
        text: error.message || "Error al crear el armario. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black">Crear Armario</h1>
          <p className="text-2xl font-light text-gray-500 mt-5">Llena el siguiente formulario para crear un armario</p>
        </div>

        <nav className="my-5">
          <Link
            className="bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-10 text-lg cursor-pointer transition-colors rounded"
            to={`/houses/${id}`}
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
              placeholder="Ej: Armario Principal, Armario Cocina..."
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
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
              placeholder="Describe el armario, su ubicación o propósito..."
              disabled={isLoading}
            />
            {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>}
          </div>

          {/* Vista previa de la tarjeta */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Vista previa del armario</h3>
            <div className="flex justify-center">
              <ArmarioCard
                id={0}
                name={watch("name") || "Nombre del Armario"}
                descripcion={watch("descripcion") || "Descripción del armario"}
              />
            </div>
          </div>

          {/* Botón de envío */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => reset(initialValues)}
              disabled={isLoading}
              className="font-bold py-3 px-10 text-lg cursor-pointer transition-colors rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={isLoading }
              className={`font-bold py-3 px-10 text-lg cursor-pointer transition-colors rounded ${
                isLoading 
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#075b8f] hover:bg-[#012e4a] text-white"
              }`}
            >
              {isLoading ? "Guardando..." : "Crear Armario"}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
