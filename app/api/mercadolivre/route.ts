import { NextRequest, NextResponse } from "next/server";
import { chromium } from "@playwright/test";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const data = await req.json();
    const url = data?.url;
    if (!url) {
      return NextResponse.json({ error: "URL não informada" }, { status: 400 });
    }
    if (!url.includes("mercadolivre")) {
      return NextResponse.json(
        { error: "URL não é do Mercado Livre" },
        { status: 400 }
      );
    }
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load" });
    await page.waitForTimeout(5000);
    const title = await page.title();
    const imagesProduct = await page
      .locator(".ui-pdp-thumbnail__picture .ui-pdp-image")
      .all();
    const images = [];
    for (const imageSrc of imagesProduct) {
      const src = await imageSrc.getAttribute("src");
      images.push(src?.replace("-R.webp", "-O.jpeg"));
    }
    await page.close();
    return NextResponse.json(
      { data: { title, images, originalUrl: url }, status: 200 },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar o produto" },
      { status: 500 }
    );
  }
}
