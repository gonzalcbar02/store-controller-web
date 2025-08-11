import type React from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"

interface PropertyData {
  id: number
  name: string
  descripcion: string
  imagen: string
  id_usuario: number
}

export default function EditProjectView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("")
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm()

  // Cargar datos de la propiedad al montar el componente
  useEffect(() => {
    const loadPropertyData = async () => {
      if (!id) return

      try {
        setIsLoadingData(true)
        const response = await fetch(`http://localhost:8000/api/almacenes/${id}`)

        if (!response.ok) {
          throw new Error("Error al cargar los datos de la propiedad")
        }

        const responseData = await response.json()
        const almacenData = responseData.almacen
        setPropertyData(almacenData)
        setCurrentImageUrl(almacenData.image || "")

        // Establecer valores en el formulario
        setValue("name", almacenData.name)
        setValue("description", almacenData.descripcion)
        
      } catch (error) {
        console.error("Error al cargar la propiedad:", error)
        setSubmitMessage({
          type: "error",
          text: "Error al cargar los datos de la propiedad",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadPropertyData()
  }, [id, setValue])

  // Obtener el email del usuario desde localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = localStorage.getItem("dataUser") || ""
        const { email } = JSON.parse(userEmail)
        const encodedEmail = encodeURIComponent(email || "")
        const response = await fetch(`http://localhost:8000/api/users/${encodedEmail}`)
        const data = await response.json()

        if (response.ok) {
          setUserEmail(data.user?.email || "Usuario sin nombre")
        } else {
          console.error("Error:", data.message)
          setUserEmail("Error al obtener usuario")
        }
      } catch (error) {
        console.error("Error en la petición:", error)
        setUserEmail("Error de conexión")
      }
    }

    fetchUserData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const onSubmit = async (data: any) => {
    if (!propertyData) return

    setIsLoading(true)
    setSubmitMessage(null)

    try {
      let imageUrl = currentImageUrl

      // Si se seleccionó una nueva imagen, subirla a Cloudinary
      if (selectedFile) {
        const formData = new FormData()
        formData.append("file", selectedFile)
        formData.append("upload_preset", "ml_default")
        formData.append("cloud_name", "duqjf1fuh")

        const cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/duqjf1fuh/image/upload", {
          method: "POST",
          body: formData,
        })

        const result = await cloudinaryRes.json()

        if (!cloudinaryRes.ok) {
          throw new Error(result.error?.message || "Error al subir la imagen a Cloudinary")
        }

        imageUrl = result.secure_url
      }

      // Preparar datos para actualizar
      const payload = {
        name: data.name,
        imagen: imageUrl,
        descripcion: data.description || null,
        id_usuario: propertyData.id_usuario,
      }

      console.log("Actualizando datos:", payload)

      const response = await fetch(`http://localhost:8000/api/almacenes/${id}`, {
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
      console.log("Casa actualizada exitosamente:", result)

      setSubmitMessage({
        type: "success",
        text: "Casa actualizada exitosamente",
      })

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (error: any) {
      console.error("Error al actualizar la casa:", error)
      setSubmitMessage({
        type: "error",
        text: error.message || "Error al actualizar la casa. Por favor, intenta de nuevo.",
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

  if (!propertyData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Propiedad no encontrada</h1>
        <Link
          to="/"
          className="bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-10 text-xl cursor-pointer transition-colors"
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
          <h1 className="text-4xl font-black">Editar Casa</h1>
          <p className="text-2xl font-light text-gray-500 mt-5">Modifica los datos de "{propertyData.name}"</p>
        </div>

        <nav className="my-5">
          <Link
            className="bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-10 text-xl cursor-pointer transition-colors"
            to={"/"}
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

        {/* Mostrar el email del usuario si está disponible */}
        {userEmail && (
          <div className="mb-6 p-4 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
            Editando casa del usuario: {userEmail}
          </div>
        )}

        <div className="space-y-6">
          {/* Nombre de la casa */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Casa
            </label>
            <input
              type="text"
              id="name"
              {...register("name", { required: "El nombre es obligatorio" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075b8f]"
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              {...register("description", { required: "La descripción es obligatoria" })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075b8f]"
              disabled={isLoading}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
          </div>

          {/* Imagen actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen actual</label>
            <div className="mb-3">
              <img
                src={currentImageUrl || "/placeholder.svg"}
                alt="Imagen actual"
                className="w-32 h-32 object-cover rounded-md border border-gray-300"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://res.cloudinary.com/duqjf1fuh/image/upload/v1686761853/imagen_default_byg0nb.jpg"
                }}
              />
            </div>
          </div>

          {/* Subir nueva imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar imagen (opcional)</label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075b8f]"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">Deja vacío si no quieres cambiar la imagen actual</p>
          </div>

          {/* Vista previa de la tarjeta */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Vista previa de la tarjeta</h3>
            <div className="max-w-sm rounded-lg overflow-hidden shadow-lg border border-gray-200">
              <div className="bg-gray-100 h-48">
                <img
                  src={
                    selectedFile
                      ? URL.createObjectURL(selectedFile)
                      : currentImageUrl ||
                        "https://res.cloudinary.com/duqjf1fuh/image/upload/v1686761853/imagen_default_byg0nb.jpg"
                  }
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-3">
                <div className="font-bold text-lg mb-1">{watch("name") || propertyData.name}</div>
                <p className="text-gray-500 text-sm">{watch("description") || propertyData.descripcion}</p>
              </div>
              <div className="px-4 pb-4">
                <div className="w-full block text-center bg-[#075b8f] hover:bg-[#012e4a] text-white font-medium py-2 px-4 rounded">
                  Ver Casa
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/"
              className="font-bold py-3 px-10 text-xl cursor-pointer transition-colors rounded border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className={`font-bold py-3 px-10 text-xl cursor-pointer transition-colors rounded ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#075b8f] hover:bg-[#012e4a] text-white"
              }`}
            >
              {isLoading ? "Actualizando..." : "Actualizar Casa"}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
