import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, User, ArrowRight, MoreHorizontal, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const appointments = [
  { name: "Sarah Jenkins", type: "Initial Consultation", date: "Today", time: "2:00 PM", status: "Confirmed" },
  { name: "Michael Chen", type: "Follow-up", date: "Tomorrow", time: "10:30 AM", status: "Pending" },
  { name: "Emma Watson", type: "Service Booking", date: "Oct 18", time: "4:00 PM", status: "Confirmed" },
]

const timeSlots = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:00 PM"]

const DAYS_HEADER = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState(20)
  const [selectedTime, setSelectedTime] = useState("02:00 PM")

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
        <Button size="sm" className="w-fit h-9 gap-1.5 rounded-lg text-[13px]">
          <Plus size={15} /> New Booking
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Upcoming</h2>

          <AnimatePresence>
            {appointments.map((apt, i) => (
              <motion.div
                key={apt.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="bg-card border-border/50 hover:border-border hover:shadow-sm transition-all duration-200">
                  <CardContent className="p-5 flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-muted border border-border/60 flex items-center justify-center shrink-0">
                      <span className="text-[13px] font-semibold text-muted-foreground">
                        {apt.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold leading-none mb-1.5 truncate">{apt.name}</h3>
                      <p className="text-[12px] text-muted-foreground truncate">{apt.type}</p>
                    </div>

                    {/* Date/Time */}
                    <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1.5 text-[13px] font-medium">
                        <CalendarIcon size={12} className="text-muted-foreground" />
                        {apt.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                        <Clock size={12} />
                        {apt.time}
                      </div>
                    </div>

                    {/* Status + Menu */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px] font-medium px-2 py-0.5",
                          apt.status === "Confirmed"
                            ? "border-foreground/20 bg-foreground/5 text-foreground"
                            : "border-muted-foreground/20 bg-muted/50 text-muted-foreground"
                        )}
                      >
                        {apt.status}
                      </Badge>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                      >
                        <MoreHorizontal size={15} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
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
              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] font-semibold">July 2026</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground">
                      <ChevronLeft size={15} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground">
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
                  {Array.from({ length: 31 }).map((_, i) => {
                    const date = i + 1
                    const isSelected = date === selectedDate
                    const isPast = date < 20
                    const isToday = date === 20
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
                  July {selectedDate}, 2026 at {selectedTime}
                </p>
              </div>

              <Button className="w-full h-10 rounded-lg text-[13px] font-medium">
                Confirm Booking <ArrowRight size={15} className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
