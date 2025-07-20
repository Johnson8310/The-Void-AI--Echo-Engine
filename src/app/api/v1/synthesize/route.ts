// /src/app/api/v1/synthesize/route.ts
import { synthesizePodcastAudio, SynthesizePodcastAudioInput } from "@/ai/flows/synthesize-podcast-audio";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SynthesizeRequestSchema = z.object({
  script: z.string().min(1, { message: "Script cannot be empty." }),
  voiceConfig: z.record(z.string(), z.object({
    voiceName: z.string(),
  })).min(1, { message: "At least one voice must be configured." }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = SynthesizeRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: "Invalid request body",
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const input: SynthesizePodcastAudioInput = validation.data;
    
    // We can call the existing flow directly
    const { podcastAudioUri } = await synthesizePodcastAudio(input);

    return NextResponse.json({ audioUrl: podcastAudioUri });

  } catch (error: any) {
    console.error("API Error in /api/v1/synthesize:", error);
    
    // Provide a more specific error message if available from the caught error
    const errorMessage = error.message || "An unexpected error occurred during audio synthesis.";
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
