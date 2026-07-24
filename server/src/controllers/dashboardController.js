import { listUpcomingEvents } from "../services/bookingService.js";
import { getDocuments } from "../memory/knowledgeMemory.js";
import { getCounters, getRecentActivity } from "../memory/activityMemory.js";
import { getSessionCount } from "../memory/conversationMemory.js";

export const getStats = async (req, res) => {
    try {
        const counters = getCounters();
        const documents = getDocuments();

        let upcomingCount = 0;
        try {
            const events = await listUpcomingEvents(50);
            upcomingCount = events.length;
        } catch (error) {
            console.error("Dashboard: failed to load calendar events:", error.message);
        }

        return res.status(200).json({
            success: true,
            data: {
                conversations: counters.conversations,
                activeSessions: getSessionCount(),
                appointments: upcomingCount,
                documents: documents.filter((d) => d.status === "Active").length,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getActivity = async (req, res) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 10;

        return res.status(200).json({
            success: true,
            data: getRecentActivity(limit),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
