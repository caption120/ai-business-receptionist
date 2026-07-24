import { retrieveRelevantChunks } from "../services/chatService.js";

import { askAI } from "../services/aiService.js";
import { logActivity, incrementCounter } from "../memory/activityMemory.js";

export const chatWithPDF = async (req, res, next) => {
    try {
        const { question } = req.body || {};

        // Validate request
        if (!question) {
            // Fall back to general chat if next middleware exists, otherwise return bad request
            if (typeof next === "function") {
                return next();
            }
            return res.status(400).json({
                success: false,
                message: "Question is required.",
                data: null,
            });
        }


        // Retrieve relevant chunks from ChromaDB
        const result = await retrieveRelevantChunks(question);

        // Return retrieved chunks
        return res.status(200).json({
            success: true,
            message: "Relevant documents retrieved successfully.",
            data: {
                question,
                answer: result.answer,
                totalDocuments: result.documents ? result.documents.length : 0,
                documents: result.documents,
            },
        });

    } catch (error) {
        console.error("Chat Error:", error.message);

        return res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};


export const chat = async (req, res) => {
    try {
        const { sessionId, message } = req.body || {};

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required.",
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required.",
            });
        }

        const response = await askAI(sessionId, message);

        incrementCounter("conversations");
        logActivity("chat", "Answered query", message.length > 60 ? `${message.slice(0, 60)}…` : message);

        return res.status(200).json({
            success: true,
            data: response,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};