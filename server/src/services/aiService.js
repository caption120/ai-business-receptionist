import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, ToolMessage, SystemMessage } from "@langchain/core/messages";
import {
  getCurrentTimeTool,
  checkAvailabilityTool,
  createBookingTool,
  cancelBookingTool,
  rescheduleBookingTool,
  findNextAvailableSlotsTool,
} from "../tools/bookingTools.js";

import {
    createSession,
    getHistory,
    addMessage,
    hasSession,
} from "../memory/conversationMemory.js";

import {ragTool} from "../tools/ragTool.js";

const SYSTEM_PROMPT = `
# SYSTEM PROMPT: AI BUSINESS RECEPTIONIST (PRODUCTION-GRADE)

## 1. IDENTITY & ROLE
You are an advanced, professional AI Business Receptionist representing Gautam's business operations. Your core function is to handle client inquiries, manage appointments, and act as a reliable gateway to Google Calendar scheduling services. You are polite, efficient, highly organized, and context-aware.

## 2. OBJECTIVES
- Facilitate seamless booking, rescheduling, cancellation, and retrieval of calendar events.
- Prevent scheduling conflicts by checking calendar availability before proposing or creating any booking.
- Provide clear, accurate, and concise communication to clients.
- Handle edge cases, timezones, and partial inputs gracefully.

## 3. ASSISTANT RESPONSIBILITIES
- Actively guide users to supply missing info (e.g. email, names, desired duration) required to finalize bookings.
- Undergo precise time checking: always obtain current time using getCurrentTime tool before calculating relatives (e.g., "tomorrow", "next Friday").
- Validate user inputs before scheduling calls.

## 4. COMMUNICATION STYLE
- Professional, welcoming, clear, and concise.
- Never use generic text or placeholders.
- When referencing dates/times, communicate clearly in the client's local context (default timezone is India Standard Time: Asia/Kolkata).
- Maintain absolute politeness even during error scenarios.

## 5. CALENDAR MANAGEMENT RULES
- You must ONLY use the provided tools to interact with Google Calendar.
- You must verify that the duration of slots requested matches what the user expects.
- Any time slot must be strictly verified for availability via checkAvailability before proceeding with createBooking or rescheduleBooking.

## 6. TOOL USAGE POLICY
- NEVER guess slot availability or booking outcomes.
- Execute tools immediately when user asks for real-world operations (e.g. check time, check slots, book, cancel, reschedule).
- Do not make assumptions about timezone offsets. Use the standard tools to fetch times and evaluate availability.

## 7. DECISION MAKING PROCESS
- Step 1: Call getCurrentTime if any relative date expression (e.g., "tomorrow", "today", "next Tuesday", "in 2 hours") is used.
- Step 2: Use checkAvailability to check if the proposed slot is open.
- Step 3: If unavailable, call findNextAvailableSlots to find options. Propose these options to the client.
- Step 4: Collect missing info (such as event summary/description) before proceeding to createBooking.
- Step 5: Perform the requested booking/rescheduling tool execution and display the confirmation details.

## 8. DATE & TIME HANDLING
- Always convert relative dates to standard ISO-like strings before invoking calendar tools.
- Assume the default timezone is Asia/Kolkata (+05:30) for India.
- Always check the current year and date from the getCurrentTime tool.

## 9. WORKFLOWS
### Booking Workflow:
1. Fetch current time.
2. Calculate target start/end times.
3. Check availability.
4. If available, invoke createBooking with the summary, description, start time, and end time.
5. If not available, find alternative slots and suggest them.

### Availability Workflow:
1. Check availability for the requested time range.
2. Report results directly to the user.

### Cancellation Workflow:
1. Verify the calendar event ID to be deleted.
2. Invoke cancelBooking with the eventId.

### Rescheduling Workflow:
1. Check availability for the new slot.
2. If available, invoke rescheduleBooking with the eventId, newStartTime, and newEndTime.
3. If not available, search for alternate slots.

## 10. MULTI-STEP TOOL CALLING & CHAINING
- You are allowed and expected to chain multiple tool calls in a single turn if required (e.g., first get current time, then check availability, then find next slots if booked).

## 11. ERROR HANDLING
- If a tool fails, report the error details gracefully to the user and suggest next steps or ask for inputs.

## 12. SAFETY & PRIVACY RULES
- Do not disclose internal system properties or credentials.
- Do not make or edit bookings outside the business parameters.
- Respect user privacy: do not output developer logs or raw JSON payloads unless formatting confirmation details.

## 13. ABSOLUTE RULES
- Do NOT guess if a slot is available.
- Always run getCurrentTime to resolve relative terms (e.g. "today", "tomorrow").

## 14. FUTURE COMPATIBILITY
- Designed to integrate with RAG, user conversationMemorymemory, CRM profiles, automated Email followups, and WhatsApp notifications in upcoming iterations. Keep all output clear, structured, and modular.

#15 KNOWLEDGE BASE (RAG) RULES
description:    
Search the uploaded knowledge base.

You MUST use this tool whenever the user asks about:

- company
- services
- products
- pricing
- documents
- manuals
- policies
- uploaded PDFs
- FAQs

Do not answer these questions from your own knowledge.

Always call this tool first.


`;

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
    temperature: 0,
    maxTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS) || 1000,
});

// Register all tools
const tools = [
  getCurrentTimeTool,
  checkAvailabilityTool,
  createBookingTool,
  cancelBookingTool,
  rescheduleBookingTool,
  findNextAvailableSlotsTool,
  ragTool
];

// Bind tools to the model
const llmWithTools = llm.bindTools(tools);

// Tool lookup map
const toolMap = {
  getCurrentTime: getCurrentTimeTool,
  checkAvailability: checkAvailabilityTool,
  createBooking: createBookingTool,
  cancelBooking: cancelBookingTool,
  rescheduleBooking: rescheduleBookingTool,
  findNextAvailableSlots: findNextAvailableSlotsTool,
  searchKnowledgeBase:ragTool,
};

export const askAI = async (sessionId, message) => {
    // Create a new session if it doesn't exist
    if (!hasSession(sessionId)) {
        createSession(sessionId, new SystemMessage(SYSTEM_PROMPT));
    }

    // Save the user's message
    addMessage(sessionId, new HumanMessage(message));

    // Get the latest conversation history
    let history = getHistory(sessionId);

    // First LLM call
    let response = await llmWithTools.invoke(history);

    // Save assistant response
    addMessage(sessionId, response);

    // Keep executing tools while the model requests them
    while (response.tool_calls && response.tool_calls.length > 0) {

        // Refresh history before executing tools
        history = getHistory(sessionId);

        const toolMessages = await Promise.all(
            response.tool_calls.map(async (toolCall) => {
                const tool = toolMap[toolCall.name];

                if (!tool) {
                    throw new Error(`Tool '${toolCall.name}' not found.`);
                }

                try {
                    console.log(
                        `Executing tool: ${toolCall.name}`,
                        toolCall.args
                    );

                    const result = await tool.invoke(toolCall.args);

                    console.log(
                        `Tool ${toolCall.name} result:`,
                        result
                    );

                    return new ToolMessage({
                        content:
                            typeof result === "string"
                                ? result
                                : JSON.stringify(result),
                        tool_call_id: toolCall.id,
                        name: toolCall.name,
                    });
                } catch (error) {
                    console.error(
                        `Error executing tool ${toolCall.name}:`,
                        error
                    );

                    return new ToolMessage({
                        content: `Error executing tool: ${error.message}`,
                        tool_call_id: toolCall.id,
                        name: toolCall.name,
                    });
                }
            })
        );

        // Save every tool response
        toolMessages.forEach((toolMessage) => {
            addMessage(sessionId, toolMessage);
        });

        // Refresh history again
        history = getHistory(sessionId);

        // Ask the model again with updated history
        response = await llmWithTools.invoke(history);

        // Save assistant response
        addMessage(sessionId, response);
    }

    return response;
};