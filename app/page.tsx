"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchForm from "@/components/search-form";
import ImageGallery from "@/components/image-gallery";
import type { ProductData } from "@/lib/types";
import { toast } from "sonner";

export default function Home() {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (url: string) => {
    setIsLoading(true);
    const request = await fetch("/api/mercadolivre", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const response = await request.json();
    if (response.status != 200) {
      toast.error(response.error, {
        description: "Tente novamente mais tarde",
      });
      setIsLoading(false);
      return;
    }

    setProductData(response.data);
    setIsLoading(false);
  };

  const handleNewSearch = () => {
    setProductData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!productData ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center min-h-[80vh]"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center mb-12"
              >
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Pega Foto
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Extraia todas as imagens de produtos do Mercado Livre de forma
                  rápida e organizada
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="w-full max-w-2xl"
              >
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ImageGallery
                productData={productData}
                onNewSearch={handleNewSearch}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
