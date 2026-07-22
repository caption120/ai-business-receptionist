import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0.2,
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