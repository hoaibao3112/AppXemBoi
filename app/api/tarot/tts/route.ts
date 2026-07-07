import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  // Google Translate TTS endpoint for high-quality, free Vietnamese text-to-speech
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(text)}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    });

    if (!res.ok) {
      throw new Error(`Google Translate TTS returned status ${res.status}`);
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache the audio responses
      },
    });
  } catch (error: any) {
    console.error("TTS generation failed:", error.message);
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
  }
}
