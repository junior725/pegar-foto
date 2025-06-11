"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const searchSchema = z.object({
  url: z
    .string()
    .min(1, "Por favor, insira uma URL")
    .url("Por favor, insira uma URL válida")
    .refine(
      (url) => url.includes("mercadolivre.com") || url.includes("mercadolibre.com"),
      "A URL deve ser do Mercado Livre",
    ),
})

interface SearchFormProps {
  onSearch: (url: string) => void
  isLoading: boolean
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const validatedData = searchSchema.parse({ url })
      onSearch(validatedData.url)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || "URL inválida")
      }
    }
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="url"
                  placeholder="Cole aqui o link do produto do Mercado Livre..."
                  className="h-14 text-lg pl-6 pr-6 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Extraindo imagens...
                  </>
                ) : (
                  "Extrair Imagens"
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
