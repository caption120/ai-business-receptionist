import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-embedding-2",
});

let vectorStore = null;

const chromaConfig = {
    collectionName: "pdf_documents",
    url: process.env.CHROMA_URL || "http://localhost:8000",
};

if (process.env.CHROMA_API_KEY) {
    chromaConfig.chromaCloudAPIKey = process.env.CHROMA_API_KEY;
    chromaConfig.clientParams = {
        tenant: process.env.CHROMA_TENANT,
        database: process.env.CHROMA_DATABASE,
    };
}

export const getVectorStore = async () => {
    try {
        if (!vectorStore) {
            console.log("Creating Chroma Vector Store...");

            vectorStore = new Chroma(embeddings, chromaConfig);

            console.log("Chroma Vector Store created successfully.");
        } else {
            console.log("Using existing Chroma Vector Store.");
        }

        return vectorStore;
    } catch (error) {
        console.error("Error while creating Vector Store:", error);
        throw error;
    }
};

export const storeDocuments = async (documents) => {
    try {
        console.log("========== STORE DOCUMENTS START ==========");

        // Filter empty documents
        const validDocuments = documents.filter(
            (doc) => doc.pageContent && doc.pageContent.trim().length > 0
        );

        console.log(
            `Received ${documents.length} documents. ${validDocuments.length} valid documents after filtering.`
        );

        if (validDocuments.length === 0) {
            console.log("No valid documents found.");
            console.log("========== STORE DOCUMENTS END ==========");
            return false;
        }

        console.log("Getting Vector Store...");
        const vectorStore = await getVectorStore();
        console.log("Vector Store Ready.");

        console.log("Adding documents to Chroma...");
        await vectorStore.addDocuments(validDocuments);
        console.log("Documents added successfully.");

        console.log("========== STORE DOCUMENTS END ==========");

        return true;
    } catch (error) {
        console.error("========== STORE DOCUMENTS ERROR ==========");
        console.error(error);
        console.error("===========================================");

        throw new Error(`Failed to store documents: ${error.message}`);
    }
};