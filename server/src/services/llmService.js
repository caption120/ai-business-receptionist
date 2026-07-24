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
            You are a helpful assistant. Answer the question based on the provided context.
            If the answer is not in the context, say "I don't know".
            
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