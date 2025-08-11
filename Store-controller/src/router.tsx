import { HashRouter , Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"

import AppLayout from "@/layouts/AppLayout"
import AuthLayout from "@/layouts/AuthLayout"
import ProtectedRoute from "@/components/ProtectedRoute"

import QRView from "@/views/projects/QRView"

import DashboardView from "@/views/DashboardView"
import DashboardHouses from "@/views/DashboardHouses"
import DashboardProductos  from "@/views/DashboardProductos"

import CreateProjectView from "@/views/projects/CreateProjectView"
import CreateArmario from "@/views/projects/CreateArmario"
import CreateProduct from "@/views/projects/CreateProduct"

import EditProjectView from "@/views/projects/EditProjectView"
import EditArmario from "@/views/projects/EditArmario"
import EditProducto from "@/views/projects/EditProducto"

import LoginView from "@/views/auth/LoginView"
import RegisterView from "@/views/auth/RegisterView"
import ForgotPasswordView from "@/views/auth/ForgotPasswordView"
import ResetPasswordView from "@/views/auth/ResetPasswordView"


function AppRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <Routes>

      {/* QR para ver productos */}
       <Route path="/qr/:id" element={ <QRView />} />

      {/* Rutas de autenticación */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={user ? <Navigate to="/" replace /> : <LoginView />} />
        <Route path="/auth/register" element={user ? <Navigate to="/" replace /> : <RegisterView />} />
        <Route path="/auth/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPasswordView />} />
        <Route path="/auth/reset-password" element={user ? <Navigate to="/" replace /> : < ResetPasswordView/>} />
      </Route>

      {/* Rutas protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardView />} />
        <Route path="/houses/:id" element={<DashboardHouses />} />
        <Route path="/armarios/:id" element={< DashboardProductos/>} />
        <Route path="/projects/createHome" element={<CreateProjectView />} />
        <Route path="/projects/createArmario/:id" element={<CreateArmario />} />
        <Route path="/projects/createProducto/:id" element={< CreateProduct/>} />
        <Route path="/projects/editHome/:id" element={<EditProjectView />} />
        <Route path="/projects/editArmario/:id" element={< EditArmario />} />
        <Route path="/projects/editProducto/:id" element={< EditProducto />} />


      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to={user ? "/" : "/auth/login"} replace />} />

    </Routes>
  )
}

export default function Router() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  )
}
