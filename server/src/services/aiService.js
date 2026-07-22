import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import { getCurrentTimeTool } from "../tools/bookingTools.js";

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    temperature: 0,
});

// Register all tools
const tools = [
    getCurrentTimeTool,
];

// Bind tools to the model
const llmWithTools = llm.bindTools(tools);

// Tool lookup map
const toolMap = {
    getCurrentTime: getCurrentTimeTool,
};

export const askAI = async (message) => {
    // 1. Initialize message history starting with user prompt
    const history = [new HumanMessage(message)];

    // 2. Invoke Gemini for the first turn
    let response = await llmWithTools.invoke(history);

    // 3. Keep executing tools and querying LLM as long as tool calls are requested
    while (response.tool_calls && response.tool_calls.length > 0) {
        // Push the assistant message proposing the tool calls to history
        history.push(response);

        // Execute all tool calls in the current turn in parallel
        const toolMessages = await Promise.all(
            response.tool_calls.map(async (toolCall) => {
                const tool = toolMap[toolCall.name];
                if (!tool) {
                    throw new Error(`Tool '${toolCall.name}' not found.`);
                }

                try {
                    console.log(`Executing tool: ${toolCall.name} with args:`, toolCall.args);
                    const result = await tool.invoke(toolCall.args);
                    console.log(`Tool ${toolCall.name} result:`, result);

                    return new ToolMessage({
                        content: typeof result === "string" ? result : JSON.stringify(result),
                        tool_call_id: toolCall.id,
                        name: toolCall.name,
                    });
                } catch (error) {
                    console.error(`Error executing tool ${toolCall.name}:`, error);
                    // Return tool error message so the model is aware of the failure
                    return new ToolMessage({
                        content: `Error executing tool: ${error.message}`,
                        tool_call_id: toolCall.id,
                        name: toolCall.name,
                    });
                }
            })
        );

        history.push(...toolMessages);

        // Re-invoke the LLM with the complete message list containing the results
        response = await llmWithTools.invoke(history);
    }

    // 4. Return final response
    return response;
};