import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const getCurrentTimeTool = tool(
  async () => {
    return new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
  },
  {
    name: "getCurrentTime",
    description: "Returns the current date and time in India.",
    schema: z.object({}),
  }
);