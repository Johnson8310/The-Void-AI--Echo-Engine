import { POST } from "@/app/api/v1/synthesize/route";
import { NextRequest } from "next/server";
import { synthesizePodcastAudio } from "@/ai/flows/synthesize-podcast-audio";

// Mock the synthesizePodcastAudio function
jest.mock("@/ai/flows/synthesize-podcast-audio", () => ({
  synthesizePodcastAudio: jest.fn(),
}));

const mockSynthesizePodcastAudio =
  synthesizePodcastAudio as jest.Mock;

describe("Synthesize API Route", () => {
  it("should return audio data and status 200 on successful synthesis", async () => {
    const mockRequest = {
      json: async () => ({
        text: "This is a test.",
        voiceId: "test-voice",
      }),
    } as NextRequest;

    const mockAudioData = Buffer.from("fake audio data");
    mockSynthesizePodcastAudio.mockResolvedValueOnce(mockAudioData);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ audio: mockAudioData.toString("base64") });
    expect(mockSynthesizePodcastAudio).toHaveBeenCalledWith(
      { text: "This is a test.", voiceId: "test-voice" },
      {} // Assuming context is optional or default
    );
  });

  it("should return error message and status 500 on synthesis failure", async () => {
    const mockRequest = {
      json: async () => ({
        text: "This is a test.",
        voiceId: "test-voice",
      }),
    } as NextRequest;

    const errorMessage = "Synthesis failed";
    mockSynthesizePodcastAudio.mockRejectedValueOnce(new Error(errorMessage));

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: `Synthesis failed: ${errorMessage}` });
    expect(mockSynthesizePodcastAudio).toHaveBeenCalledWith(
      { text: "This is a test.", voiceId: "test-voice" },
      {} // Assuming context is optional or default
    );
  });

  it("should return error message and status 400 if text is missing", async () => {
    const mockRequest = {
      json: async () => ({ voiceId: "test-voice" }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Text and voiceId are required." });
    expect(mockSynthesizePodcastAudio).not.toHaveBeenCalled();
  });

  it("should return error message and status 400 if voiceId is missing", async () => {
    const mockRequest = {
      json: async () => ({ text: "This is a test." }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Text and voiceId are required." });
    expect(mockSynthesizePodcastAudio).not.toHaveBeenCalled();
  });
});