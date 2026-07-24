import express from "express";
import {
    testConnection,
    getAvailability,
    createBookingHandler,
    cancelBookingHandler,
    rescheduleBookingHandler,
    findNextAvailableSlotsHandler,
    getUpcomingBookings,
} from "../controllers/bookingController.js";
const router = express.Router();

router.get("/test", testConnection);
router.get("/availability", getAvailability);
router.get("/upcoming", getUpcomingBookings);
router.get("/next-slots", findNextAvailableSlotsHandler);
router.post("/", createBookingHandler);
router.delete("/:eventId", cancelBookingHandler);
router.patch("/:eventId", rescheduleBookingHandler);

export default router;
