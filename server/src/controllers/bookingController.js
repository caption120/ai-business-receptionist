import { testCalendarConnection ,checkAvailability ,createBooking, cancelBooking,    findNextAvailableSlots } from "../services/bookingService.js";

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

export const testAvailability = async (req,res)=>{
    try{

        const result= await checkAvailability(
            "2026-07-22T15:00:00+05:30",
            "2026-07-22T15:30:00+05:30"
        );
        
        return res.status(200).json(result);

    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const testCreateBooking = async (req, res) => {
    try {
        const result = await createBooking(
            "Test Appointment",
            "Booking created from Express API",
            "2026-08-22T15:00:00+05:30",
            "2026-08-22T15:30:00+05:30"
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const testCancelBooking = async(req,res)=>{
    try{
        const {eventId}=req.params;
        const result = await cancelBooking(eventId);
        res.status(200).json(result);

    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }   
}

export const testRescheduleBooking = async (req, res) => {
    try {

        const { eventId } = req.params;

        const result = await rescheduleBooking(
            eventId,
            "2026-08-22T17:00:00+05:30",
            "2026-08-22T17:30:00+05:30"
        );

        res.status(200).json(result);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const testFindNextAvailableSlots = async (req, res) => {
    try {

        const result = await findNextAvailableSlots(
            "2026-08-22T15:00:00+05:30"
        );

        res.status(200).json(result);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};