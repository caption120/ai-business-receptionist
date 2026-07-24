import {
    testCalendarConnection,
    checkAvailability,
    createBooking,
    cancelBooking,
    rescheduleBooking,
    findNextAvailableSlots,
    listUpcomingEvents,
} from "../services/bookingService.js";
import { logActivity } from "../memory/activityMemory.js";

export const testConnection = async (req, res) => {
    try {
        const result = await testCalendarConnection();

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAvailability = async (req, res) => {
    try {
        const { startTime, endTime } = req.query;

        if (!startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "startTime and endTime query params are required.",
            });
        }

        const result = await checkAvailability(startTime, endTime);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const createBookingHandler = async (req, res) => {
    try {
        const { summary, description, startTime, endTime } = req.body || {};

        if (!summary || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "summary, startTime and endTime are required.",
            });
        }

        const result = await createBooking(summary, description || "", startTime, endTime);

        logActivity("booking", "Booked appointment", summary);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const cancelBookingHandler = async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await cancelBooking(eventId);

        logActivity("booking", "Cancelled appointment", eventId);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const rescheduleBookingHandler = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { startTime, endTime } = req.body || {};

        if (!startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "startTime and endTime are required.",
            });
        }

        const result = await rescheduleBooking(eventId, startTime, endTime);

        logActivity("booking", "Rescheduled appointment", eventId);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const findNextAvailableSlotsHandler = async (req, res) => {
    try {
        const { startTime, duration, count } = req.query;

        if (!startTime) {
            return res.status(400).json({
                success: false,
                message: "startTime query param is required.",
            });
        }

        const result = await findNextAvailableSlots(
            startTime,
            duration ? Number(duration) : undefined,
            count ? Number(count) : undefined
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getUpcomingBookings = async (req, res) => {
    try {
        const events = await listUpcomingEvents(
            req.query.maxResults ? Number(req.query.maxResults) : undefined
        );

        return res.status(200).json({
            success: true,
            data: events,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
