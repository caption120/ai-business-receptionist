import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const textsplitter= new RecursiveCharacterTextSplitter({chunkSize:1000,chunkOverlap:200});

export const splitTextintochunks=async(text)=>{
    try {
        const chunks=await textsplitter.createDocuments([text]);
        return chunks;
    } catch (error) {
        throw new Error(`Failed to split text into chunks: ${error.message}`);
    }
}