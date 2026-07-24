import { apiRequest } from "./client";

export const voiceService = {
  /**
   * Sends a recorded audio clip to the backend for speech-to-text transcription.
   * @param {Blob} audioBlob
   * @returns {Promise<{success: boolean, transcript?: string, message?: string}>}
   */
  async transcribe(audioBlob) {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    return apiRequest("/voice/transcribe", {
      method: "POST",
      body: formData,
    });
  },
};
