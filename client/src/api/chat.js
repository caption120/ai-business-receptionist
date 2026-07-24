import { apiRequest } from "./client";
import { getSessionId } from "./session";

export const chatService = {
  /**
   * Sends a message to the AI receptionist.
   * @param {string} message
   * @returns {Promise<object>} response data
   */
  async sendMessage(message) {
    return apiRequest("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: getSessionId(), message }),
    });
  },
};
