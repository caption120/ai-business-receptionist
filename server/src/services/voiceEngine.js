import { GoogleGenAI } from "@google/genai";
import { askAI } from "./aiService.js";
import * as sessionService from "./sessionService.js";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const TRANSCRIBE_MODEL = process.env.GOOGLE_TRANSCRIBE_MODEL || "gemini-2.5-flash";

const TRANSCRIBE_PROMPT =
    "Transcribe the spoken words in this audio exactly as spoken. " +
    "Return only the transcript text, with no labels, quotation marks, or extra commentary. " +
    "If the audio contains no speech, return an empty string.";

export const startSession = async () => {
    const session = sessionService.createSession();

    return {
        success: true,
        message: "Voice session started",
        data: { sessionId: session.sessionId },
    };
};

export const transcribe = async (req) => {
    const { sessionId } = req.body || {};
    const file = req.file;

    if (!file) {
        return {
            success: false,
            message: "No audio file provided.",
        };
    }

    if (sessionId && !sessionService.getSession(sessionId)) {
        return {
            success: false,
            message: "Invalid or expired voice session.",
        };
    }

    const response = await genAI.models.generateContent({
        model: TRANSCRIBE_MODEL,
        contents: [
            {
                role: "user",
                parts: [
                    { text: TRANSCRIBE_PROMPT },
                    {
                        inlineData: {
                            mimeType: file.mimetype,
                            data: file.buffer.toString("base64"),
                        },
                    },
                ],
            },
        ],
    });

    const transcript = (response.text || "").trim();

    if (sessionId) {
        sessionService.updateSession(sessionId, { lastTranscript: transcript });
    }

    return {
        success: true,
        transcript,
    };
};

export const generateResponse = async (data) => {
    const { sessionId, transcript, message } = data || {};
    const text = transcript || message;

    if (!sessionId) {
        return {
            success: false,
            message: "Session ID is required.",
        };
    }

    if (!text) {
        return {
            success: false,
            message: "No transcript or message provided.",
        };
    }

    const response = await askAI(sessionId, text);

    return {
        success: true,
        response: response.content,
    };
};

export const speak = async (data) => {
    return {
        success: false,
        message: "Text-to-speech is not implemented yet.",
    };
};

export const endSession = async (data) => {
    const { sessionId } = data || {};

    if (sessionId) {
        sessionService.deleteSession(sessionId);
    }

    return {
        success: true,
        message: "Voice session ended",
    };
};
