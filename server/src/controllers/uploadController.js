import { splitTextintochunks } from "../services/chunkService.js";
import { extractTextFromPDF } from "../services/pdfService.js";
import { storeDocuments } from "../services/vectorStoreService.js";

export const uploadPDF = async (req, res) => {
    try {
        // Validate uploaded file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF file.",
                data: null,
            });
        }

        // Step 1: Extract text from the uploaded PDF
        const extractedText = await extractTextFromPDF(req.file.path);

        // Step 2: Split the extracted text into chunks
        const chunks = await splitTextintochunks(extractedText);

        // Step 3: Store chunks in ChromaDB
        await storeDocuments(chunks);

        // Step 4: Return success response
        return res.status(200).json({
            success: true,
            message: "PDF uploaded and stored successfully.",
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                totalChunks: chunks.length,
            },
        });

    } catch (error) {
        console.error("Upload PDF Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};