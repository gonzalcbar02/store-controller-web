import { Outlet } from "react-router-dom"

export default function AuthLayout() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-xl shadow-md py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8">
        <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase text-[#075b8f] text-center">
            Store Controller
          </h1>
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}