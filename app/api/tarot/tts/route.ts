import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const voiceParam = searchParams.get("voice") || "female";

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  try {
    const tts = new MsEdgeTTS();
    
    // Choose high-quality Microsoft Edge Neural Voice
    // vi-VN-HoaiMyNeural is a beautiful, natural female voice.
    // vi-VN-NamMinhNeural is a beautiful, natural male voice.
    const voice = voiceParam === "male" ? "vi-VN-NamMinhNeural" : "vi-VN-HoaiMyNeural";
    
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Convert text to stream
    const { audioStream } = tts.toStream(text);

    // Accumulate the stream chunks into a buffer
    const chunks: Buffer[] = [];
    
    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      audioStream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      audioStream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      
      audioStream.on("error", (err: any) => {
        reject(err);
      });
    });

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable", // Cache the audio heavily
      },
    });
  } catch (error: any) {
    console.error("Edge TTS generation failed:", error.message);
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
  }
}
