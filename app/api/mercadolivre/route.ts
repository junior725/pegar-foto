import { NextRequest, NextResponse } from "next/server";
import axios, { all } from "axios";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const url = data?.url;

    if (!url || !url.includes("mercadolivre")) {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    const response = await axios.get(url);
    const html = response.data;

    // Extrair todas as imagens com base no padrão
    const allMatches =
      html.match(/https:\/\/http2\.mlstatic\.com\/[^"]+?\.(jpg|jpeg)/g) || [];
    const images: string[] = Array.from(
      new Set(allMatches.map((img: string) => img.replace("-R.webp", "-O.jpg")))
    );
    // Fallback: tenta pegar imagem principal se nenhuma for encontrada
    if (images.length === 0) {
      const fallbackMatch = html.match(
        /<meta property="og:image" content="([^"]+)"/
      );
      if (fallbackMatch?.[1]) {
        images.push(fallbackMatch[1]);
      }
    }

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || "Sem título";

    if (images.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma imagem encontrada" },
        { status: 404 }
      );
    }
    let finalImages;
    finalImages = images.filter((img) => img.includes("-O."));
    if (finalImages.length === 0) {
      finalImages = images
        .filter((img) => img.includes("D_Q_NP_"))
        .filter((img) => !img.includes("2X"))
        .map((img) => img.replace("-R-", "-F-"));
    }
    return NextResponse.json({
      data: {
        title,
        images: finalImages,
        originalUrl: url,
      },
      status: 200,
    });
  } catch (err) {
    console.error("Erro:", err);
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
      { status: 500 }
    );
  }
}
