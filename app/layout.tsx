import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Pega foto",
  description: "Obttenha a foto do produto do Mercado Livre",
  generator: "Marcelo Eduardo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
