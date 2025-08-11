import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext" // Asumiendo que tienes este contexto

export default function LoginView() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { login, user } = useAuth() // Usar el contexto de autenticación

  // Obtener la URL de redirección (si viene de una página protegida)
  const from = location.state?.from?.pathname || "/"

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  // Cargar credenciales guardadas al montar el componente
  useEffect(() => {
    const savedCredentials = localStorage.getItem("rememberedCredentials")
    if (savedCredentials) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials)
        setEmail(savedEmail || "")
        setPassword(savedPassword || "")
        setRememberMe(true)
      } catch (error) {
        console.error("Error parsing saved credentials:", error)
        localStorage.removeItem("rememberedCredentials")
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {

        // Guardar o limpiar credenciales según la opción "Recordarme"
        if (rememberMe) {
          localStorage.setItem(
            "rememberedCredentials",
            JSON.stringify({
              email: email,
              password: password,
            }),
          )
        } else {
          localStorage.removeItem("rememberedCredentials")
        }

        // Usar el contexto de autenticación para hacer login
        if (login) {
          await login(data.token, data.user)
        } else {
          // Fallback si no hay contexto de autenticación
          if (data.token) {
            localStorage.setItem("authToken", data.token)
          }
          if (data.user) {
            localStorage.setItem("userData", JSON.stringify(data.user))
          }
        }

        // Redirigir al DashboardView (ruta "/")
        localStorage.setItem("dataUser",
          JSON.stringify({
            email: email,
          }),
        )
        navigate(from, { replace: true })
      } else {
        setError(data.message || "Credenciales inválidas. Por favor, verifica tu email y contraseña.")
      }
    } catch (error) {
      console.error("Error en la petición:", error)
      setError("Error al conectar con el servidor. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para limpiar credenciales recordadas
  const clearRememberedCredentials = () => {
    localStorage.removeItem("rememberedCredentials")
    setEmail("")
    setPassword("")
    setRememberMe(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6 border-2 border-gray-300 rounded-lg p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg xl:max-w-xl bg-white shadow-md">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Iniciar Sesión</h2>
        <p className="text-gray-600 text-xs sm:text-sm md:text-base">Accede a tu cuenta para continuar</p>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded">
          <div className="flex">
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Campo Email */}
        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        {/* Campo Contraseña */}
        <div>
          <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Checkbox Recordarme */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-gray-700">
              Recordarme
            </label>
          </div>

          <Link
            to="/auth/forgot-password"
            className="text-xs sm:text-sm text-[#075b8f] hover:text-[#012e4a] font-medium transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full  text-white py-2 sm:py-3 md:py-3 px-4 rounded-lg font-medium bg-[#075b8f] hover:bg-[#012e4a] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
              <span className="text-xs sm:text-sm md:text-base">Iniciando sesión...</span>
            </div>
          ) : (
            "Iniciar Sesión"
          )}
        </button>
      </form>

      {/* Enlace a registro */}
      <div className="text-center pt-3 sm:pt-4 border-t border-gray-200">
        <p className="text-xs sm:text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <Link to="/auth/register" className="text-[#075b8f] hover:text-[#012e4a] font-medium transition-colors">
            Regístrate aquí
          </Link>
        </p>
      </div>

      {/* Botón para limpiar credenciales (útil para testing) */}
      {rememberMe && (
        <div className="text-center">
          <button
            type="button"
            onClick={clearRememberedCredentials}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar credenciales guardadas
          </button>
        </div>
      )}
    </div>
  )
}
