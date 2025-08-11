import type React from "react"
import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react"

export default function ResetPasswordView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Obtener token y email de los parámetros de la URL
  const emailFromUrl = searchParams.get("email")

  const [email, setEmail] = useState(emailFromUrl || "")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones del frontend
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden")
      return
    }

    

    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResetSuccess(true)
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/auth/login")
        }, 3000)
      } else {
        setError(data.message || "Error al restablecer la contraseña. El enlace puede haber expirado.")
      }
    } catch (error) {
      console.error("Error al restablecer contraseña:", error)
      setError("Error de conexión. Por favor, verifica que el servidor esté funcionando.")
    } finally {
      setIsLoading(false)
    }
  }

  // Pantalla de éxito
  if (resetSuccess) {
    return (
      <div className="space-y-6 text-center border-2 border-gray-300 rounded-lg p-8 max-w-md mx-auto bg-white shadow-md">
        <div className="flex justify-center">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña Restablecida!</h2>
          <p className="text-gray-600 text-sm">Tu contraseña ha sido restablecida exitosamente.</p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded text-left">
          <div className="ml-3">
            <p className="text-sm text-green-700">Serás redirigido al inicio de sesión en unos segundos...</p>
          </div>
        </div>

        <Link
          to="/auth/login"
          className="inline-flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Ir al inicio de sesión
        </Link>
      </div>
    )
  }

  // Pantalla de error si no hay token válido
  if (!emailFromUrl) {
    return (
      <div className="space-y-6 text-center border-2 border-gray-300 rounded-lg p-8 max-w-md mx-auto bg-white shadow-md">
        <div className="flex justify-center">
          <div className="bg-red-100 rounded-full p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace Inválido</h2>
          <p className="text-gray-600 text-sm">El enlace de restablecimiento no es válido o ha expirado.</p>
        </div>

        <div className="space-y-3">
          <Link
            to="/auth/forgot-password"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors inline-block text-center"
          >
            Solicitar nuevo enlace
          </Link>

          <Link
            to="/auth/login"
            className="block w-full text-blue-600 hover:text-blue-800 font-medium transition-colors py-2"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 border-2 border-gray-300 rounded-lg p-8 max-w-md mx-auto bg-white shadow-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Restablecer Contraseña</h2>
        <p className="text-gray-600 text-sm">
          Ingresa tu nueva contraseña para <strong>{email}</strong>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo Email (solo lectura) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            readOnly
          />
        </div>

        {/* Campo Nueva Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Nueva Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Campo Confirmar Contraseña */}
        <div>
          <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type={showPasswordConfirmation ? "text" : "password"}
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Confirma tu nueva contraseña"
              minLength={6}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
            >
              {showPasswordConfirmation ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white py-3 px-4 rounded-lg font-medium bg-[#075b8f] hover:bg-[#012e4a] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Restableciendo...
            </div>
          ) : (
            "Restablecer Contraseña"
          )}
        </button>
      </form>

      <div className="text-center pt-4 border-t border-gray-200">
        <Link to="/auth/login" className="text-[#075b8f] hover:text-[#012e4a] font-medium transition-colors">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
