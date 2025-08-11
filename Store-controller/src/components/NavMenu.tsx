import { Fragment, useEffect, useState } from "react"
import { Popover, Transition } from "@headlessui/react"
import { Bars3Icon } from "@heroicons/react/20/solid"
import LogoutButton from "@/components/LogoutButton"

export default function NavMenu() {
  const [nickname, setNickname] = useState("Cargando...")

  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const userEmail = localStorage.getItem("dataUser") || ""
        const { email } = JSON.parse(userEmail)
        const encodedEmail = encodeURIComponent(email || "")
        const response = await fetch(`http://localhost:8000/api/users/${encodedEmail}`)
        const data = await response.json()

        if (response.ok) {
          setNickname(data.user?.nickname || data.user?.email || "Usuario sin nombre")
        } else {
          console.error("Error:", data.message)
          setNickname("Error al obtener usuario")
        }
      } catch (error) {
        console.error("Error en la petición:", error)
        setNickname("Error de conexión")
      }
    }

    fetchNickname()
  }, [])

  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 rounded-lg p-2">
        <Bars3Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute left-1/2 z-10 mt-2 flex w-screen max-w-xs sm:max-w-sm md:max-w-md lg:max-w-min -translate-x-1/2 lg:-translate-x-48">
          <div className="w-full lg:w-56 shrink rounded-xl bg-white p-3 sm:p-4 md:p-5 text-sm font-semibold leading-6 text-gray-900 shadow-lg ring-1 ring-gray-900/5">
            <p className="text-center capitalize truncate px-1 sm:px-2" title={nickname}>
              <span className="font-bold">Usuario: </span> {nickname}
            </p>
            <LogoutButton className="w-full mt-3 sm:mt-4" />
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}