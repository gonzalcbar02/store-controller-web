import type React from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"

export default function CreateProjectView() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isUserId, setUserID] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const initialValues = {
    name: "Nombre de la casa",
    description: "Calle Falsa 123",
    imagen: "https://res.cloudinary.com/duqjf1fuh/image/upload/v1686761853/imagen_default_byg0nb.jpg"
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ defaultValues: initialValues })

  // Obtener el email del usuario desde localStorage al cargar el componente
  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const userEmail = localStorage.getItem("dataUser") || ""
        const { email } = JSON.parse(userEmail)
        const encodedEmail = encodeURIComponent(email || "")
        const response = await fetch(`http://localhost:8000/api/users/${encodedEmail}`)
        const data = await response.json()

        if (response.ok) {
          setUserEmail(data.user?.email || "Usuario sin nombre")
          setUserID(data.user?.id || 0)
        } else {
          console.error("Error:", data.message)
          setUserEmail("Error al obtener usuario")
        }
      } catch (error) {
        console.error("Error en la petición:", error)
        setUserEmail("Error de conexión")
      }
    }

    fetchNickname()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setSubmitMessage(null)

    try {
      // Verificar si tenemos el email del usuario
      if (!userEmail) {
        throw new Error("No se encontró el email del usuario. Por favor, inicie sesión nuevamente.")
      }

      // Extraer solo el ID del usuario
      const userId = isUserId

      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario")
      }

      console.log("ID de usuario obtenido:", userId)

      // Generar nombre único para la imagen
      
      let imageUrl = null
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


      // Mapear los datos al formato esperado por la API
      const payload = {
        name: data.name,
        imagen: imageUrl,
        descripcion: data.description || null,
        id_usuario: userId,
      }

      console.log("Enviando datos:", payload)

      const response = await fetch("http://localhost:8000/api/almacenes", {
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
      console.log("Casa creada exitosamente:", result)

      setSubmitMessage({
        type: "success",
        text: "Casa creada exitosamente",
      })

      // Opcional: resetear el formulario después del éxito
      // reset(initialValues)
    } catch (error: any) {
      console.error("Error al crear la casa:", error)
      setSubmitMessage({
        type: "error",
        text: error.message || "Error al crear la casa. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black">Crear Casa</h1>
          <p className="text-2xl font-light text-gray-500 mt-5">Llena el siguiente formulario para crear una casa</p>
        </div>

        <nav className="my-5 ">
          <Link
            className="bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-10 text-lg cursor-pointer transition-colors rounded"
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
            className={`mb-6 p-4 rounded-md ${submitMessage.type === "success"
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
            Creando casa para el usuario: {userEmail}
          </div>
        )}

        {/* Mostrar advertencia si no hay email */}
        {!userEmail && (
          <div className="mb-6 p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
            No se ha detectado un usuario con sesión iniciada. Por favor, inicie sesión antes de crear una casa.
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
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
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
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Subir imagen desde dispositivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de la propiedad</label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#075b8f]"
              disabled={isLoading}
              required
            />
            {!selectedFile && <p className="text-red-500 text-sm mt-1">Por favor selecciona una imagen</p>}
          </div>

          {/* Vista previa de la tarjeta */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Vista previa de la tarjeta</h3>
            <div className="max-w-sm rounded-lg overflow-hidden shadow-lg border border-gray-200">
              <div className="bg-gray-100 h-48">
                <img
                  src={selectedFile ? URL.createObjectURL(selectedFile) : "https://res.cloudinary.com/duqjf1fuh/image/upload/v1686761853/imagen_default_byg0nb.jpg"}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-3">
                <div className="font-bold text-lg mb-1">{watch("name") || "Casa Moderna"}</div>
                <p className="text-gray-500 text-sm">{watch("description") || "En Peñarroya"}</p>
              </div>
              <div className="px-4 pb-4">
                <Link
                  to={"/projects/createHome"}
                  className="w-full block text-center bg-[#075b8f] hover:bg-[#012e4a] text-white font-medium py-2 px-4 rounded"
                >
                  Ver Casa
                </Link>
              </div>
            </div>
          </div>

          {/* Botón de envío */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !userEmail || !selectedFile}
              className={`font-bold py-3 px-10 text-xl cursor-pointer transition-colors rounded ${isLoading || !userEmail || !selectedFile
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#075b8f] hover:bg-[#012e4a] text-white"
                }`}
            >
              {isLoading ? "Guardando..." : "Guardar Casa"}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
