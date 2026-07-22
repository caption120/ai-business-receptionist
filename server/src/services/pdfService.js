import fs from "fs";
import pdfParse from "pdf-parse";

export const extractTextFromPDF = async (filePath) => {
    try {
        const buffer = fs.readFileSync(filePath);

        const pdfData = await pdfParse(buffer);

        return pdfData.text;
    } catch (error) {
        throw new Error(`Failed to extract text: ${error.message}`);
    }
};