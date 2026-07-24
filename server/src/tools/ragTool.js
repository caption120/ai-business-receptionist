import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { retrieveRelevantChunks } from "../services/chatService.js";

export const ragTool = tool(
    async ({ question }) => {
        const result = await retrieveRelevantChunks(question);

        return JSON.stringify({
            answer: result.answer,
            documents: result.documents,
        });
    },
    {
        name: "searchKnowledgeBase",
        description: `
Search the company's knowledge base.

Use this tool whenever the user asks about:

- company information
- services
- products
- documentation
- policies
- FAQs
- uploaded PDF documents
- manuals
- guides
- pricing
- business information

Do NOT use this tool for calendar operations.
`,
        schema: z.object({
            question: z.string().describe(
                "The question to search for in the knowledge base"
            ),
        }),
    }
);