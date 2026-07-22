import calendar from "../config/googleCalendar.js";

export const testCalendarConnection = async () => {
    try {
        const response = await calendar.calendars.get({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
        });

        return {
            success: true,
            message: "Google Calendar connected successfully.",
            data: response.data,
        };
    } catch (error) {
        console.error("Google Calendar Error:", error.message);

        throw new Error(
            `Failed to connect Google Calendar: ${error.message}`
        );
    }
};

export const checkAvailability = async(startTime,endTime)=>{
    try{

        const response= await calendar.events.list({
            calendarId:process.env.GOOGLE_CALENDAR_ID,
            timeMin: startTime,
            timeMax:endTime,
            singleEvents:true,
            orderBy:'startTime',
        });

        const event=response.data.items;

        return{
            available:event.length === 0,
            events:event
        }

    }catch(error){
         console.error("Availability Check Error:", error.message);
        throw new Error("Failed to check availability.");
    }
}

export const createBooking = async (
    summary,
    description,
    startTime,
    endTime
) => {
    try {
        // Check if the slot is available
        const availability = await checkAvailability(startTime, endTime);

        if (!availability.available) {
            throw new Error("This time slot is already booked.");
        }

        // Create the booking
        const response = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID,

            requestBody: {
                summary,
                description,

                start: {
                    dateTime: startTime,
                    timeZone: "Asia/Kolkata",
                },

                end: {
                    dateTime: endTime,
                    timeZone: "Asia/Kolkata",
                },
            },
        });

        return {
            success: true,
            message: "Booking created successfully.",
            event: response.data,
        };
    } catch (error) {
        console.error("Booking Creation Error:", error.message);
        throw error;
    }
};

export const cancelBooking = async(eventId)=>{
    try{
        await calendar.events.delete({
            calendarId:process.env.GOOGLE_CALENDAR_ID,
            eventId: eventId,
        });
        
        return{
            success:true,
            message:"Booking cancelled successfully."
        }
    }catch(error){
          console.error("Cancel Booking Error:", error.message);
        throw error;
    }
}

export const rescheduleBooking = async (
    eventId,
    newStartTime,
    newEndTime
) => {
    try {

        // Check if new slot is available
        const availability = await checkAvailability(
            newStartTime,
            newEndTime
        );

        if (!availability.available) {
            throw new Error("The new time slot is already booked.");
        }

        const response = await calendar.events.patch({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            eventId,

            requestBody: {
                start: {
                    dateTime: newStartTime,
                    timeZone: "Asia/Kolkata",
                },
                end: {
                    dateTime: newEndTime,
                    timeZone: "Asia/Kolkata",
                },
            },
        });

        return {
            success: true,
            message: "Booking rescheduled successfully.",
            event: response.data,
        };

    } catch (error) {
        console.error("Reschedule Error:", error.message);
        throw error;
    }
};


export const findNextAvailableSlots = async (
    requestedStartTime,
    duration = 30,
    numberOfSlots = 3
) => {
    try {

        const availableSlots = [];

        let currentStart = new Date(requestedStartTime);

        while (availableSlots.length < numberOfSlots) {

            const currentEnd = new Date(currentStart);
            currentEnd.setMinutes(currentEnd.getMinutes() + duration);

            const availability = await checkAvailability(
                currentStart.toISOString(),
                currentEnd.toISOString()
            );

            if (availability.available) {
                availableSlots.push({
                    start: currentStart.toISOString(),
                    end: currentEnd.toISOString(),
                });
            }

            currentStart.setMinutes(currentStart.getMinutes() + 30);
        }

        return {
            success: true,
            availableSlots,
        };

    } catch (error) {
        console.error("Find Slots Error:", error.message);
        throw error;
    }
};