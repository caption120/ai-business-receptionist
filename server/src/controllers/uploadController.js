import { splitTextintochunks } from "../services/chunkService.js";
import { extractTextFromPDF } from "../services/pdfService.js";
import { storeDocuments } from "../services/vectorStoreService.js";
import { addDocument, setDocumentStatus, getDocuments } from "../memory/knowledgeMemory.js";
import { logActivity, incrementCounter } from "../memory/activityMemory.js";

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

        const doc = addDocument({
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            uploadedAt: new Date().toISOString(),
            chunks: 0,
        });

        // Step 1: Extract text from the uploaded PDF
        const extractedText = await extractTextFromPDF(req.file.path);

        // Step 2: Split the extracted text into chunks
        const chunks = await splitTextintochunks(extractedText);

        // Step 3: Store chunks in ChromaDB
        await storeDocuments(chunks);

        setDocumentStatus(doc.id, "Active", { chunks: chunks.length });
        incrementCounter("documents");
        logActivity("knowledge", "Learned document", req.file.originalname);

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

        if (req.file) {
            const failedDoc = getDocuments().find((d) => d.filename === req.file.filename);
            if (failedDoc) {
                setDocumentStatus(failedDoc.id, "Failed");
            }
        }

        return res.status(500).json({
            success: false,
            message: error.message,
            data: null,
        });
    }
};

export const listDocuments = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: getDocuments(),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
