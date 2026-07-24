import { apiRequest } from "./client";

export const healthService = {
  check() {
    return apiRequest("/health");
  },
};
