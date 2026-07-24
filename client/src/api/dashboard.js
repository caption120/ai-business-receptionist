import { apiRequest } from "./client";

export const dashboardService = {
  getStats() {
    return apiRequest("/dashboard/stats");
  },
  getActivity(limit) {
    const params = limit ? `?limit=${limit}` : "";
    return apiRequest(`/dashboard/activity${params}`);
  },
};
