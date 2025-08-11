import { type FormEvent, useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import PropertyCard from "@/components/PropertyCard"

interface House {
  id: number
  name: string
  descripcion: string
  image: string
}

export default function DashboardView() {
  const [allHouses, setAllHouses] = useState<House[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [, setUserEmail] = useState("")
  const [userID, setUserID] = useState(0)
  const [housesLoading, setHousesLoading] = useState(true)

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)

  // Obtener ID del usuario
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

  // Obtener casas del usuario
  useEffect(() => {
    const fetchHouses = async () => {
      if (userID === 0) return

      setHousesLoading(true)
      try {
        const response = await fetch(`http://localhost:8000/api/almacenes/user/${userID}`)
        const data = await response.json()

        if (response.ok) {
          const housesArray = Array.isArray(data) ? data : data.houses || data.almacenes || []
          setAllHouses(housesArray)
        } else {
          console.error("Error al obtener casas:", data.message)
          setAllHouses([])
        }
      } catch (error) {
        console.error("Error en la petición de casas:", error)
        setAllHouses([])
      } finally {
        setHousesLoading(false)
      }
    }

    fetchHouses()
  }, [userID])

  // Función para manejar la eliminación desde el componente hijo
  const handleDeleteHouse = (deletedId: number) => {
    setAllHouses((prevHouses) => prevHouses.filter((house) => house.id !== deletedId))
  }

  const filteredHouses = useMemo(() => {
    if (!Array.isArray(allHouses)) {
      return []
    }

    return allHouses.filter((house) => {
      const matchesSearch =
        house.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        house.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [searchTerm, allHouses])

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredHouses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentHouses = filteredHouses.slice(startIndex, endIndex)

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Botón anterior
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-2 md:px-3 py-1 md:py-2 mx-1 text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          ←
        </button>,
      )
    }

    // Primera página
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 mx-1 text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          1
        </button>,
      )
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-2 mx-1 text-gray-500">
            ...
          </span>,
        )
      }
    }

    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 border rounded ${
            currentPage === i
              ? "bg-[#075b8f] text-white border-[#075b8f]"
              : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>,
      )
    }

    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-2 mx-1 text-gray-500">
            ...
          </span>,
        )
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 mx-1 text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          {totalPages}
        </button>,
      )
    }

    // Botón siguiente
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 mx-1 text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          →
        </button>,
      )
    }

    return pages
  }

  return (
    <div className="px-3 md:px-6 py-4 md:py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-8 px-2 md:px-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black">Mis Casas</h1>
          <p className="text-xl md:text-2xl font-light text-gray-500 mt-1">
            Administra tus propiedades desde un solo lugar
          </p>
        </div>

        <nav className="my-4 md:my-5">
          <Link
            className="bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-2 md:py-3 px-6 md:px-10 text-base md:text-lg cursor-pointer transition-colors flex gap-3 md:gap-5 items-center rounded w-full md:w-auto justify-center"
            to={"/projects/createHome"}
          >
            <span> + </span>
            Añadir Nueva Propiedad
          </Link>
        </nav>
      </div>

      <div className="bg-white rounded-lg mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 p-4">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2.5 text-gray-400"></span>
            <input
              type="search"
              placeholder="Buscar por nombre o descripción"
              className="pl-8 pr-4 py-2 border rounded w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        {!housesLoading && filteredHouses.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredHouses.length)} de {filteredHouses.length}{" "}
            propiedades
          </div>
        )}
      </div>

      {housesLoading || isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="overflow-hidden border rounded-lg shadow bg-gray-100">
              <div className="h-[150px] md:h-[200px] bg-gray-300 animate-pulse" />
              <div className="p-3 md:p-4">
                <div className="h-5 md:h-6 bg-gray-300 animate-pulse rounded mb-2" />
                <div className="h-3 md:h-4 bg-gray-300 animate-pulse rounded w-3/4 mb-3 md:mb-4" />
                <div className="flex justify-between">
                  <div className="h-4 md:h-5 bg-gray-300 animate-pulse rounded w-1/3" />
                  <div className="h-4 md:h-5 bg-gray-300 animate-pulse rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : allHouses.length === 0 ? (
        <div className="text-center py-8 md:py-12 px-4">
          <div className="mx-auto h-12 w-12 text-gray-400 text-4xl">🏠</div>
          <h3 className="mt-4 text-lg font-semibold">No tienes propiedades registradas</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Comienza añadiendo tu primera propiedad para administrarla desde aquí.
          </p>
          <Link
            to={"/projects/createHome"}
            className="inline-block bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded transition-colors"
          >
            Añadir Primera Propiedad
          </Link>
        </div>
      ) : currentHouses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
            {currentHouses.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                name={property.name}
                descripcion={property.descripcion}
                imageUrl={
                  property.image ||
                  "https://res.cloudinary.com/duqjf1fuh/image/upload/v1686761853/imagen_default_byg0nb.jpg"
                }
                onDelete={handleDeleteHouse}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 md:mt-8 overflow-x-auto py-2 w-full">
              <div className="flex items-center">{renderPagination()}</div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 md:py-12 px-4">
          <div className="mx-auto h-12 w-12 text-gray-400 text-4xl">🔍</div>
          <h3 className="mt-4 text-lg font-semibold">No se encontraron propiedades</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Intenta con otros términos de búsqueda o añade una nueva propiedad.
          </p>
          <button className="mt-4 px-4 py-2 border rounded hover:bg-gray-100" onClick={() => setSearchTerm("")}>
            Ver todas las propiedades
          </button>
        </div>
      )}
    </div>
  )
}
