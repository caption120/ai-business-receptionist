import express from "express";
import {
    testConnection,
    testAvailability,
    testCreateBooking,
    testCancelBooking,
    testRescheduleBooking,
    testFindNextAvailableSlots
} from "../controllers/bookingController.js";
const router = express.Router();

router.get("/test", testConnection);
router.get("/availability",testAvailability);
router.get("/create", testCreateBooking);
router.get("/cancel/:eventId", testCancelBooking);
router.patch("/reschedule/:eventId", testRescheduleBooking);
router.get("/next-slots", testFindNextAvailableSlots);
export default router;