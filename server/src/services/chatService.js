import { getVectorStore } from "./vectorStoreService.js";
import { genarteAnser } from "./llmService.js";
export const retrieveRelevantChunks = async (question, k = 4) => {
    try {
        console.log("Question:", question);

        const vectorStore = await getVectorStore();

        console.log("Searching similar documents...");

        const documents = await vectorStore.similaritySearch(question, k);

        console.log(`Found ${documents.length} relevant documents.`);

        const answer= await genarteAnser(question,documents);

        
        return {
            answer,
            documents
        }
    } catch (error) {
        console.error(error);

        throw new Error(`Failed to retrieve documents: ${error.message}`);
    }
};