import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

// Función para verificar si el usuario existe
async function checkUserExists(email: string): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:8000/api/users/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return false // Usuario no encontrado
      } else if (response.status === 429) {
        throw new Error("Has realizado demasiadas solicitudes. Por favor, inténtalo más tarde.")
      } else {
        throw new Error("Error al verificar el usuario. Por favor, inténtalo más tarde.")
      }
    }

    const data = await response.json()
    return data.user?.email  === email
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.")
  }
}

export default function ForgotPasswordView() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userStatus, setUserStatus] = useState<"exists" | "not-exists" | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Primero verificamos si el usuario existe
      console.log("Verificando si el usuario existe...")
      const userExists = await checkUserExists(email)

      if (!userExists) {
        setUserStatus("not-exists")
        setError("No existe ninguna cuenta con este correo electrónico. Por favor, verifica e intenta de nuevo.")
        setIsLoading(false)
        return
      }

      console.log("Usuario existe, procediendo con el envío del email...")
      setUserStatus("exists")

      
      navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`)

    } catch (checkError) {
      console.error("Error al verificar usuario:", checkError)
      if (checkError instanceof Error) {
        setError(checkError.message)
      } else {
        setError("Error al verificar el usuario. Por favor, inténtalo más tarde.")
      }
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="space-y-6 border-2 border-gray-300 rounded-lg p-8 max-w-md mx-auto bg-white shadow-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase">Recuperar Contraseña</h2>
        <p className="text-gray-600 text-sm">
          Ingresa tu email y te enviaremos a un enlace para restablecer tu contraseña
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {userStatus === "exists" && !error && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Usuario verificado correctamente</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full text-white py-3 px-4 rounded-lg font-medium bg-[#075b8f] hover:bg-[#012e4a] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {userStatus === "exists" ? "Enviando..." : "Verificando..."}
            </div>
          ) : (
            "Confirmar Email"
          )}
        </button>
      </form>

      <div className="text-center pt-4 border-t border-gray-200">
        <Link
          to="/auth/login"
          className="flex items-center justify-center text-[#075b8f] hover:text-[#012e4a] font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}