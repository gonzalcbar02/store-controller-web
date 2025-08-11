"use client"

import { type FormEvent, useState, useMemo, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import ArmarioCard from "@/components/ArmarioCard"

interface Armario {
  id: number
  name: string
  descripcion: string
  image: string
  casa_id: number
}

export default function DashboardHouses() {
  const [allArmarios, setAllArmarios] = useState<Armario[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [, setUserEmail] = useState("")
  const [armariosLoading, setArmariosLoading] = useState(true)
  const [casaName, setCasaName] = useState("")

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const { id } = useParams<{ id: string }>()

  // Obtener ID del usuario
  useEffect(() => {
    const fetchNameHouse = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/almacenes/${id}`)

        if (!response.ok) {
          throw new Error("Error al cargar los datos de la propiedad")
        }

        const responseData = await response.json()
        const almacenData = responseData.almacen
        setCasaName(almacenData.name)
      } catch (error) {
        console.error("Error en la petición:", error)
        setUserEmail("Error de conexión")
      }
    }

    fetchNameHouse()
  }, [])

  // Obtener armarios de la casa específica
  useEffect(() => {
    const fetchArmarios = async () => {
      if (!id) return

      setArmariosLoading(true)
      try {
        const response = await fetch(`http://localhost:8000/api/armarios/almacen/${id}`)
        const data = await response.json()

        if (response.ok) {
          const armariosArray = Array.isArray(data) ? data : data.armarios || []
          setAllArmarios(armariosArray)
        } else {
          console.error("Error al obtener armarios:", data.message)
          setAllArmarios([])
        }
      } catch (error) {
        console.error("Error en la petición de armarios:", error)
        setAllArmarios([])
      } finally {
        setArmariosLoading(false)
      }
    }

    fetchArmarios()
  }, [id])

  // Función para manejar la eliminación desde el componente hijo
  const handleDeleteArmario = (deletedId: number) => {
    setAllArmarios((prevArmarios) => prevArmarios.filter((armario) => armario.id !== deletedId))
  }

  const filteredArmarios = useMemo(() => {
    if (!Array.isArray(allArmarios)) {
      return []
    }

    return allArmarios.filter((armario) => {
      const matchesSearch =
        armario.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        armario.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [searchTerm, allArmarios])

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredArmarios.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentArmarios = filteredArmarios.slice(startIndex, endIndex)

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
          className="px-3 py-2 mx-1 text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50"
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
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold rounded-3xl text-[#075b8f] text-center flex flex-column align-content-center justify-content-end">
            Casa: <span className="truncate max-w-2xl ms-3" title={casaName}> {casaName} </span>
          </h1>
          <h2 className="text-4xl font-black mt-3">Mis Armarios</h2>
          <p className="text-2xl font-light text-gray-500 mt-">Administra tus armarios desde un solo lugar</p>
        </div>

        <nav className="my-5 flex gap-3 justify-content-between">
          <Link
            className="bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-10 text-lg cursor-pointer transition-colors flex gap-5 items-center rounded"
            to={`/projects/createArmario/${id}`}
          >
            <span> + </span>
            Añadir Nuevo Armario
          </Link>

          <Link
            className="bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-10 text-lg cursor-pointer transition-colors flex gap-5 items-center rounded"
            to={"/"}
          >
            Volver
          </Link>
        </nav>
      </div>

      <div className="bg-white rounded-lg mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
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

        {!armariosLoading && filteredArmarios.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredArmarios.length)} de {filteredArmarios.length}{" "}
            armarios
          </div>
        )}
      </div>

      {armariosLoading || isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="overflow-hidden border rounded-lg shadow bg-gray-100">
              <div className="h-[200px] bg-gray-300 animate-pulse" />
              <div className="p-4">
                <div className="h-6 bg-gray-300 animate-pulse rounded mb-2" />
                <div className="h-4 bg-gray-300 animate-pulse rounded w-3/4 mb-4" />
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-300 animate-pulse rounded w-1/3" />
                  <div className="h-5 bg-gray-300 animate-pulse rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : allArmarios.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 text-4xl">🏠</div>
          <h3 className="mt-4 text-lg font-semibold">No tienes armarios registrados</h3>
          <p className="text-gray-500 mb-6">Comienza añadiendo tu primer armario para administrarlo desde aquí.</p>
          <Link
            to={`/projects/createArmario/${id}`}
            className="inline-block bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-6 rounded transition-colors"
          >
            Añadir Primer Armario
          </Link>
        </div>
      ) : currentArmarios.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentArmarios.map((armario) => (
              <ArmarioCard
                key={armario.id}
                idArmario={armario.id}
                name={armario.name}
                descripcion={armario.descripcion}
                onDelete={handleDeleteArmario}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8">
              <div className="flex items-center">{renderPagination()}</div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 text-4xl">🔍</div>
          <h3 className="mt-4 text-lg font-semibold">No se encontraron armarios</h3>
          <p className="text-gray-500">Intenta con otros términos de búsqueda o añade un nuevo armario.</p>
          <button className="mt-4 px-4 py-2 border rounded hover:bg-gray-100" onClick={() => setSearchTerm("")}>
            Ver todos los armarios
          </button>
        </div>
      )}
    </>
  )
}
