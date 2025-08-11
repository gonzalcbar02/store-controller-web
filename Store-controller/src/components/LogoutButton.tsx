"use client"

import { useAuth } from "@/contexts/AuthContext"
import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface LogoutButtonProps {
  variant?: "button" | "menu-item"
  className?: string
}

export default function LogoutButton({ variant = "button", className = "" }: LogoutButtonProps) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/auth/login")
  }

  if (!user) return null

  if (variant === "menu-item") {
    return (
      <button
        onClick={handleLogout}
        className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${className}`}
      >
        <LogOut className="h-4 w-4 mr-3" />
        Cerrar Sesión
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center  justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${className}`}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Cerrar Sesión
    </button>
  )
}
