import calendar from "../config/googleCalendar.js";

const ensureRFC3339 = (dateStr) => {
    if (!dateStr) return dateStr;
    
    // Replace space with T if present to normalize to ISO format
    let formatted = dateStr.replace(' ', 'T');
    
    // Check if it ends with Z or a timezone offset like +05:30 or -08:00
    const hasTimezone = /(Z|[+-]\d{2}:?\d{2})$/i.test(formatted);
    if (!hasTimezone) {
        // If it doesn't have a timezone, assume Asia/Kolkata offset (+05:30)
        if (formatted.includes('T')) {
            formatted = `${formatted}+05:30`;
        } else {
            formatted = `${formatted}T00:00:00+05:30`;
        }
    }
    
    // Ensure seconds are present in the time part (e.g. YYYY-MM-DDTHH:mm:ss+HH:MM)
    const tzMatch = formatted.match(/(Z|[+-]\d{2}:?\d{2})$/i);
    const tzSuffix = tzMatch ? tzMatch[0] : '';
    const dateTimePart = tzSuffix ? formatted.slice(0, -tzSuffix.length) : formatted;
    
    const timePart = dateTimePart.split('T')[1];
    if (timePart) {
        const timeSegments = timePart.split(':');
        if (timeSegments.length === 2) {
            // It only has HH:mm, so append :00
            formatted = `${dateTimePart}:00${tzSuffix}`;
        }
    }
    return formatted;
};

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
        const formattedStart = ensureRFC3339(startTime);
        const formattedEnd = ensureRFC3339(endTime);
        console.log("Start Time:", formattedStart);
        console.log("End Time:", formattedEnd); 
        const response= await calendar.events.list({
            calendarId:process.env.GOOGLE_CALENDAR_ID,
            timeMin: formattedStart,
            timeMax:formattedEnd,
            singleEvents:true,
            orderBy:'startTime',
        });
       
        
        console.log("Events:", response.data.items);

        const event=response.data.items;

        return{
            available:event.length === 0,
            events:event
        }

    }catch(error){
        console.error(error.response?.data || error);
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
        const formattedStart = ensureRFC3339(startTime);
        const formattedEnd = ensureRFC3339(endTime);

        // Check if the slot is available
        const availability = await checkAvailability(formattedStart, formattedEnd);

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
                    dateTime: formattedStart,
                    timeZone: "Asia/Kolkata",
                },

                end: {
                    dateTime: formattedEnd,
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
        const formattedStart = ensureRFC3339(newStartTime);
        const formattedEnd = ensureRFC3339(newEndTime);

        // Check if new slot is available
        const availability = await checkAvailability(
            formattedStart,
            formattedEnd
        );

        if (!availability.available) {
            throw new Error("The new time slot is already booked.");
        }

        const response = await calendar.events.patch({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            eventId,

            requestBody: {
                start: {
                    dateTime: formattedStart,
                    timeZone: "Asia/Kolkata",
                },
                end: {
                    dateTime: formattedEnd,
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


export const listUpcomingEvents = async (maxResults = 20) => {
    try {
        const response = await calendar.events.list({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            timeMin: new Date().toISOString(),
            singleEvents: true,
            orderBy: "startTime",
            maxResults,
        });

        return response.data.items || [];
    } catch (error) {
        console.error("List Upcoming Events Error:", error.message);
        throw new Error("Failed to list upcoming events.");
    }
};

export const findNextAvailableSlots = async (
    requestedStartTime,
    duration = 30,
    numberOfSlots = 3
) => {
    try {

        const availableSlots = [];

        let currentStart = new Date(ensureRFC3339(requestedStartTime));

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