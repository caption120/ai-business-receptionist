import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const embeddingModel = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    apiKey: process.env.GOOGLE_API_KEY,
});

export const generateEmbeddings = async (chunks) => {
    const texts = chunks.map((chunk) => chunk.pageContent);

    const embeddings = await embeddingModel.embedDocuments(texts);

    return chunks.map((chunk, index) => ({
        ...chunk,
        embedding: embeddings[index],
    }));
};