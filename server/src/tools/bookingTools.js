import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createBooking ,checkAvailability,cancelBooking ,rescheduleBooking, findNextAvailableSlots,} from "../services/bookingService.js";
import { logActivity } from "../memory/activityMemory.js";

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

export const checkAvailabilityTool = tool(
  async ({ startTime, endTime }) => {
    const result = await checkAvailability(startTime, endTime);

    return JSON.stringify(result);
  },
  {
    name: "checkAvailability",
    description:
      "Check if a time slot is available in the Google Calendar.",
    schema: z.object({
      startTime: z
        .string()
        .describe("Start date and time in ISO format"),

      endTime: z
        .string()
        .describe("End date and time in ISO format"),
    }),
  }
);

export const createBookingTool= tool(
async({ summary, description, startTime, endTime })=>{
  const result= await createBooking(summary, description, startTime, endTime);
  logActivity("booking", "Booked appointment", summary);
  return JSON.stringify(result);
},{
  name:"createBooking",
  description:"Create a new booking in google calendar",
  schema:z.object({
    summary:z.string().describe("Title of the event"),
    description:z.string().describe("Description of the event"),
    startTime:z.string().describe("Start date and time in ISO format"),
    endTime:z.string().describe("End date and time in ISO format"),
  })
}
);

export const cancelBookingTool = tool(
  async ({ eventId }) => {
    const result = await cancelBooking(eventId);
    logActivity("booking", "Cancelled appointment", eventId);
    return JSON.stringify(result);
  },
  {
    name: "cancelBooking",
    description: "Cancel an existing appointment in Google Calendar.",
    schema: z.object({
      eventId: z
        .string()
        .describe("The Google Calendar event ID to cancel"),
    }),
  }
);

export const rescheduleBookingTool = tool(
  async ({ eventId, newStartTime, newEndTime }) => {
    const result = await rescheduleBooking(
      eventId,
      newStartTime,
      newEndTime
    );
    logActivity("booking", "Rescheduled appointment", eventId);
    return JSON.stringify(result);
  },
  {
    name: "rescheduleBooking",
    description: "Reschedule an existing Google Calendar appointment.",
    schema: z.object({
      eventId: z
        .string()
        .describe("The Google Calendar event ID to reschedule"),

      newStartTime: z
        .string()
        .describe("New appointment start time in ISO format"),

      newEndTime: z
        .string()
        .describe("New appointment end time in ISO format"),
    }),
  }
);

export const findNextAvailableSlotsTool = tool(
  async ({ requestedStartTime, duration }) => {
    const result = await findNextAvailableSlots(
      requestedStartTime,
      duration
    );

    return JSON.stringify(result);
  },
  {
    name: "findNextAvailableSlots",
    description:
      "Find the next available meeting slots in Google Calendar.",
    schema: z.object({
      requestedStartTime: z
        .string()
        .describe("Preferred meeting start time in ISO format"),

      duration: z
        .number()
        .describe("Meeting duration in minutes"),
    }),
  }
);