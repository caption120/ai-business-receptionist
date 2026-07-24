import { ChatOpenAI } from "@langchain/openai";

const openRouterKey = process.env.OPEN_rOUTER || process.env.OPENROUTER_API_KEY;

const llm = new ChatOpenAI({
    modelName: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
    apiKey: openRouterKey,
    openAIApiKey: openRouterKey,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "AI Business Receptionist",
        }
    },
    temperature: 0.2,
    maxTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS) || 1000,
});

export const genarteAnser =async (question,document) =>{
    try{
            const context=document.map((doc)=>doc.pageContent).join("\n\n");

            const prompt = `
            You are Coco, an AI business receptionist answering questions from the company's knowledge base.

            Rules:
            - Answer using ONLY the information in the context below. Do not use outside knowledge.
            - Be straightforward and to the point. Lead with the direct answer, then only the supporting detail that's actually needed. No filler, no restating the question, no "Based on the context provided" style openers.
            - Keep it short: 1-3 sentences unless the question genuinely requires a list or step-by-step detail.
            - If the context does not contain the answer, say plainly: "I don't have that information right now." Do not guess or make anything up.

            Context:
            ${context}

            Question: ${question}

            Answer:
            `;
            
            const response = await llm.invoke(prompt);
            return response.content;
    }catch(error){
        console.error("Error generating answer:", error);
    }
}