import { Outlet } from "react-router-dom"
import Logo from "@/components/Logo"
import NavMenu from "@/components/NavMenu"

export default function AppLayout() {
  return (
    <>
      <header className="bg-[#012e4a] py-3 sm:py-4 md:py-5 px-4 sm:px-6">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0">
          <div className="w-48 sm:w-56 md:w-64">
            <Logo />
          </div>

          <NavMenu />
        </div>
      </header>

      <section className="max-w-screen-2xl mx-auto mt-6 sm:mt-8 md:mt-10 p-4 sm:p-5 md:p-6">
        <Outlet />
      </section>

      <footer className="py-4 sm:py-5 px-4 sm:px-0">
        <p className="text-center text-sm sm:text-base text-gray-500">
          Todos los derechos reservados &copy; <strong>Gonzalo Alcaide Barbero</strong> {new Date().getFullYear()}
        </p>
      </footer>
    </>
  )
}
