import { apiRequest } from "./client";

export const knowledgeService = {
  /**
   * Uploads a business PDF to the knowledge base.
   * @param {File} file
   * @returns {Promise<object>} upload result data
   */
  async uploadPDF(file) {
    const formData = new FormData();
    formData.append("pdf", file);

    return apiRequest("/upload", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Lists documents stored in the knowledge base.
   * @returns {Promise<object>} list of documents
   */
  async listDocuments() {
    return apiRequest("/upload");
  },
};
