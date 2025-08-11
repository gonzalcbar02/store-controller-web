"use client"

import { type FormEvent, useState, useMemo, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import ProductosCard from "@/components/ProductosCard"

interface Producto {
  id: number
  name: string
  descripcion: string
  image: string
  casa_id: number
}

export default function DashboardHouses() {
  const [allProductos, setAllProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [armariosLoading, setArmariosLoading] = useState(true)
  const [armarioName, setArmarioName] = useState("")
  const [idHouse, setIdHouse] = useState(0)

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const { id } = useParams<{ id: string }>()

  // Obtener ID del usuario
  useEffect(() => {
  const fetchNameHouse = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/armarios/${id}`)

      if (!response.ok) {
        throw new Error("Error al cargar los datos del armario")
      }

      const responseData = await response.json()
      
      // Adaptado a la nueva estructura de respuesta
      const armarioData = responseData.armario
      setArmarioName(armarioData.name)
      setIdHouse(armarioData.id_almacen)
      
    } catch (error) {
      console.error("Error en la petición:", error)
      setArmarioName("Error de conexión") // Corregido para usar setArmarioName
    }
  }

  fetchNameHouse()
}, [id]) // Agregado 'id' como dependencia
  // Obtener armarios de la casa específica
  useEffect(() => {
    const fetchArmarios = async () => {
      if (!id) return

      setArmariosLoading(true)
      try {
        const response = await fetch(`http://localhost:8000/api/productos/armario/${id}`)
        const data = await response.json()

        if (response.ok) {
          const productosArray = Array.isArray(data) ? data : data.productos || []
          setAllProductos(productosArray)
        } else {
          console.error("Error al obtener armarios:", data.message)
          setAllProductos([])
        }
      } catch (error) {
        console.error("Error en la petición de armarios:", error)
        setAllProductos([])
      } finally {
        setArmariosLoading(false)
      }
    }

    fetchArmarios()
  }, [id])

  // Función para manejar la eliminación desde el componente hijo
  const handleDeleteArmario = (deletedId: number) => {
    setAllProductos((prevProductos) => prevProductos.filter((productos) => productos.id !== deletedId))
  }

  const fillteredProductos = useMemo(() => {
    if (!Array.isArray(allProductos)) {
      return []
    }

    return allProductos.filter((armario) => {
      const matchesSearch =
        armario.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        armario.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [searchTerm, allProductos])

  // Cálculos de paginación
  const totalPages = Math.ceil(fillteredProductos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProductos = fillteredProductos.slice(startIndex, endIndex)

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
          <h1 className="text-5xl font-black rounded-3xl text-[#075b8f] text-center flex flex-column align-content-center justify-content-end">
            Armario: <span className="truncate max-w-2xl ms-3" title={armarioName}> {armarioName} </span>
          </h1>
          <h2 className="text-3xl font-black mt-3">Mis Productos</h2>
          <p className="text-2xl font-light text-gray-500 mt-">Administra tus productos desde un solo lugar</p>
        </div>

        <nav className="my-5 flex gap-3 justify-content-between">
          <Link
            className="bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-10 text-lg cursor-pointer transition-colors flex gap-5 items-center rounded"
            to={`/projects/createProducto/${id}`}
            
          >
            <span> + </span>
            Añadir Nuevo Producto
          </Link>

          <Link
            className="bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-10 text-lg cursor-pointer transition-colors flex gap-5 items-center rounded"
            to={`/houses/${idHouse}`}
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

        {!armariosLoading && fillteredProductos.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, fillteredProductos.length)} de {fillteredProductos.length}{" "}
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
      ) : allProductos.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 text-4xl">🏠</div>
          <h3 className="mt-4 text-lg font-semibold">No tienes productos registrados</h3>
          <p className="text-gray-500 mb-6">Comienza añadiendo tu primer producto para administrarlo desde aquí.</p>
          <Link
            to={`/projects/createProducto/${id}`}
            className="inline-block bg-[#075b8f] hover:bg-[#012e4a] text-white font-bold py-3 px-6 rounded transition-colors"
          >
            Añadir Primer Producto
          </Link>
        </div>
      ) : currentProductos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentProductos.map((productos) => (
              <ProductosCard
                id={productos.id}
                key={productos.id}
                name={productos.name}
                descripcion={productos.descripcion}
                imageUrl={
                  productos.image ||
                  "https://res.cloudinary.com/duqjf1fuh/image/upload/v1686761853/imagen_default_byg0nb.jpg"
                }
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
