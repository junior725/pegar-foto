"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import JSZip from "jszip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, ChevronLeft, ChevronRight, ExternalLink, ImageIcon } from "lucide-react"
import type { ProductData } from "@/lib/types"

interface ImageGalleryProps {
  productData: ProductData
  onNewSearch: () => void
}

export default function ImageGallery({ productData, onNewSearch }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === productData.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? productData.images.length - 1 : prev - 1))
  }

  const handleDownloadAll = async () => {
    setIsDownloading(true)

    try {
      const zip = new JSZip()

      // Nome da pasta (título do produto limpo)
      const folderName = productData.title.replace(/[^a-zA-Z0-9\s]/g, "").trim()
      const folder = zip.folder(folderName)

      if (!folder) {
        throw new Error("Erro ao criar pasta no ZIP")
      }

      // Baixar todas as imagens reais e adicionar ao ZIP
      const imagePromises = productData.images.map(async (imageUrl, index) => {
        try {
          const response = await fetch(imageUrl)
          if (!response.ok) {
            throw new Error(`Erro ao baixar imagem ${index + 1}`)
          }

          const blob = await response.blob()
          const fileName = `${index + 1}.jpg`

          // Adicionar imagem ao ZIP
          folder.file(fileName, blob)

          return { success: true, index: index + 1 }
        } catch (error) {
          console.error(`Erro ao processar imagem ${index + 1}:`, error)
          return { success: false, index: index + 1 }
        }
      })

      // Aguardar todas as imagens serem processadas
      const results = await Promise.all(imagePromises)
      const successCount = results.filter((r) => r.success).length

      if (successCount === 0) {
        throw new Error("Nenhuma imagem pôde ser baixada")
      }

      // Gerar o arquivo ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" })

      // Criar link para download
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${folderName}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpar URL temporária
      URL.revokeObjectURL(url)

      console.log(`Download concluído! ${successCount} de ${productData.images.length} imagens baixadas.`)
    } catch (error) {
      console.error("Erro no download:", error)
      alert("Erro ao criar o arquivo ZIP. Tente novamente.")
    }

    setIsDownloading(false)
  }

  const handleDownloadSingle = async (imageUrl: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation() // Evita que clique na imagem para navegar
    setDownloadingIndex(index)

    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Erro ao baixar imagem ${index + 1}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${productData.title.replace(/[^a-zA-Z0-9\s]/g, "").trim()}_${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpar URL temporária
      URL.revokeObjectURL(url)

      console.log(`Imagem ${index + 1} baixada com sucesso!`)
    } catch (error) {
      console.error(`Erro ao baixar imagem ${index + 1}:`, error)
      alert(`Erro ao baixar a imagem ${index + 1}. Tente novamente.`)
    }

    setDownloadingIndex(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{productData.title}</h1>
        <div className="flex justify-center items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            <ImageIcon className="w-4 h-4 mr-1" />
            {productData.images.length} imagens encontradas
          </Badge>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onNewSearch} className="flex items-center gap-2">
              Nova Pesquisa
            </Button>

            <Button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Criando ZIP..." : "Baixar ZIP"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Image Display */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <Card className="overflow-hidden shadow-xl">
          <CardContent className="p-0 relative">
            <div className="relative w-full h-[500px] bg-gray-100 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={productData.images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${productData.title} - Imagem ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    crossOrigin="anonymous"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              {productData.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 z-10"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 z-10"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                <Badge variant="secondary" className="bg-black/70 text-white">
                  {currentImageIndex + 1} / {productData.images.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Thumbnail Grid */}
      {productData.images.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 justify-items-center">
                {productData.images.map((imageUrl, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-colors w-20 h-20 ${
                      index === currentImageIndex
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={imageUrl || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />

                    {/* Download Individual Button */}
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-1 right-1 w-6 h-6 bg-white/90 hover:bg-white shadow-sm"
                      onClick={(e) => handleDownloadSingle(imageUrl, index, e)}
                      disabled={downloadingIndex === index}
                    >
                      {downloadingIndex === index ? (
                        <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Product Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">Informações do Download</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nome da pasta:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {productData.title.replace(/[^a-zA-Z0-9\s]/g, "").trim()}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Arquivos no ZIP:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                1.jpg, 2.jpg, ..., {productData.images.length}.jpg
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de imagens:</span>
              <Badge variant="outline">{productData.images.length}</Badge>
            </div>
            <div className="pt-2 border-t">
              <a
                href={productData.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Ver produto original no Mercado Livre
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
