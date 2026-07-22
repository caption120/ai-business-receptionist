const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const chatService = {
  /**
   * Sends a message to the AI receptionist.
   * @param {string} message 
   * @returns {Promise<object>} response data
   */
  async sendMessage(message) {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to send message to AI.");
    }

    return response.json();
  },
};

export const knowledgeService = {
  /**
   * Uploads a business PDF to the knowledge base.
   * @param {File} file 
   * @returns {Promise<object>} upload result data
   */
  async uploadPDF(file) {
    const formData = new FormData();
    formData.append("pdf", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to upload knowledge PDF.");
    }

    return response.json();
  },
};
