import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon, Clock, ArrowRight, MoreHorizontal, ChevronLeft, ChevronRight, Plus, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { bookingService } from "@/api"

const timeSlots = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:00 PM"]

const DAYS_HEADER = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function parseTimeTo24h(time) {
  const [, hh, mm, period] = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
  let hour = parseInt(hh, 10)
  if (period.toUpperCase() === "PM" && hour !== 12) hour += 12
  if (period.toUpperCase() === "AM" && hour === 12) hour = 0
  return { hour, minute: parseInt(mm, 10) }
}

function buildISOTime(year, month, day, time) {
  const { hour, minute } = parseTimeTo24h(time)
  const pad = (n) => String(n).padStart(2, "0")
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+05:30`
}

function addMinutesToISO(isoTime, minutes) {
  const date = new Date(isoTime)
  date.setMinutes(date.getMinutes() + minutes)
  const pad = (n) => String(n).padStart(2, "0")
  const offsetDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000)
  return `${offsetDate.getUTCFullYear()}-${pad(offsetDate.getUTCMonth() + 1)}-${pad(offsetDate.getUTCDate())}T${pad(offsetDate.getUTCHours())}:${pad(offsetDate.getUTCMinutes())}:00+05:30`
}

function formatEventDate(dateTimeStr) {
  const date = new Date(dateTimeStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatEventTime(dateTimeStr) {
  const date = new Date(dateTimeStr)
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export default function Booking() {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(today.getDate())
  const [selectedTime, setSelectedTime] = useState(timeSlots[0])
  const [clientName, setClientName] = useState("")
  const [purpose, setPurpose] = useState("")

  const [appointments, setAppointments] = useState([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState("")
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)

  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay()

  const loadAppointments = useCallback(async () => {
    setIsLoadingAppointments(true)
    try {
      const response = await bookingService.getUpcomingBookings()
      setAppointments(response.data || [])
    } catch (error) {
      console.error("Failed to load appointments:", error)
    } finally {
      setIsLoadingAppointments(false)
    }
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleConfirmBooking = async () => {
    setBookingError("")
    setBookingSuccess(false)

    if (!clientName.trim()) {
      setBookingError("Please enter a client name.")
      return
    }

    const startTime = buildISOTime(viewYear, viewMonth, selectedDate, selectedTime)
    const endTime = addMinutesToISO(startTime, 30)

    setIsBooking(true)
    try {
      await bookingService.createBooking({
        summary: clientName.trim(),
        description: purpose.trim() || "Manually scheduled appointment",
        startTime,
        endTime,
      })
      setBookingSuccess(true)
      setClientName("")
      setPurpose("")
      await loadAppointments()
      setTimeout(() => setBookingSuccess(false), 3000)
    } catch (error) {
      setBookingError(error.message || "Failed to create booking. The slot may already be taken.")
    } finally {
      setIsBooking(false)
    }
  }

  const handleCancel = async (eventId) => {
    setCancellingId(eventId)
    try {
      await bookingService.cancelBooking(eventId)
      await loadAppointments()
    } catch (error) {
      console.error("Failed to cancel booking:", error)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="text-[14px] text-muted-foreground mt-1">Manage your schedule and bookings.</p>
        </div>
        <Button size="sm" onClick={loadAppointments} className="w-fit h-9 gap-1.5 rounded-lg text-[13px]">
          <Plus size={15} /> Refresh
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Upcoming</h2>

          {isLoadingAppointments ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-[13px] text-muted-foreground py-10 text-center border border-dashed border-border/50 rounded-xl">
              No upcoming appointments.
            </div>
          ) : (
            <AnimatePresence>
              {appointments.map((apt, i) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card className="bg-card border-border/50 hover:border-border hover:shadow-sm transition-all duration-200">
                    <CardContent className="p-5 flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-muted border border-border/60 flex items-center justify-center shrink-0">
                        <span className="text-[13px] font-semibold text-muted-foreground">
                          {(apt.summary || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-semibold leading-none mb-1.5 truncate">{apt.summary || "Untitled"}</h3>
                        <p className="text-[12px] text-muted-foreground truncate">{apt.description || "—"}</p>
                      </div>

                      {/* Date/Time */}
                      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5 text-[13px] font-medium">
                          <CalendarIcon size={12} className="text-muted-foreground" />
                          {apt.start?.dateTime ? formatEventDate(apt.start.dateTime) : "—"}
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                          <Clock size={12} />
                          {apt.start?.dateTime ? formatEventTime(apt.start.dateTime) : "—"}
                        </div>
                      </div>

                      {/* Status + Menu */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium px-2 py-0.5 border-foreground/20 bg-foreground/5 text-foreground"
                        >
                          Confirmed
                        </Badge>
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => handleCancel(apt.id)}
                          disabled={cancellingId === apt.id}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg"
                        >
                          {cancellingId === apt.id ? <Loader2 size={14} className="animate-spin" /> : <MoreHorizontal size={15} />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Calendar Widget */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2"
        >
          <Card className="bg-card border-border/50 sticky top-6">
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle className="text-[15px] font-semibold">Schedule Manually</CardTitle>
              <CardDescription className="text-[13px]">Book an appointment on behalf of a client.</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-5">
              {/* Client details */}
              <div className="space-y-2.5">
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client name"
                  className="h-9 text-[13px] rounded-lg"
                />
                <Input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Purpose / notes (optional)"
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>

              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground">
                      <ChevronLeft size={15} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground">
                      <ChevronRight size={15} />
                    </Button>
                  </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAYS_HEADER.map(d => (
                    <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">{d}</div>
                  ))}
                </div>

                {/* Date grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`pad-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const date = i + 1
                    const isSelected = date === selectedDate && isCurrentMonth
                    const isPast = isCurrentMonth && date < today.getDate()
                    const isToday = isCurrentMonth && date === today.getDate()
                    return (
                      <button
                        key={i}
                        onClick={() => !isPast && setSelectedDate(date)}
                        disabled={isPast}
                        className={cn(
                          "aspect-square flex items-center justify-center text-[13px] rounded-lg transition-all duration-150 font-medium",
                          isSelected && "bg-foreground text-background shadow-sm",
                          !isSelected && !isPast && "hover:bg-muted text-foreground",
                          isPast && "text-muted-foreground/30 cursor-not-allowed",
                          isToday && !isSelected && "border border-border text-foreground"
                        )}
                      >
                        {date}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <p className="text-[13px] font-semibold mb-3">Available Times</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "py-2.5 text-[12px] font-medium rounded-lg border transition-all duration-150",
                        selectedTime === time
                          ? "border-foreground bg-foreground text-background shadow-sm"
                          : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Summary */}
              <div className="rounded-xl bg-muted/40 border border-border/40 px-4 py-3 text-[13px]">
                <p className="font-medium text-foreground mb-1">Booking Summary</p>
                <p className="text-muted-foreground">
                  {MONTH_NAMES[viewMonth]} {selectedDate}, {viewYear} at {selectedTime}
                </p>
              </div>

              {bookingError && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-[12px] text-destructive">
                  <X size={13} className="mt-0.5 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              <Button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className={cn(
                  "w-full h-10 rounded-lg text-[13px] font-medium transition-all",
                  bookingSuccess && "bg-emerald-600 hover:bg-emerald-600 text-white"
                )}
              >
                {isBooking ? (
                  <>Booking… <Loader2 size={15} className="ml-2 animate-spin" /></>
                ) : bookingSuccess ? (
                  "Booking Confirmed"
                ) : (
                  <>Confirm Booking <ArrowRight size={15} className="ml-2" /></>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
