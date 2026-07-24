import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquare, Calendar, FileText, TrendingUp, Loader2, Activity as ActivityIcon } from "lucide-react"
import { dashboardService } from "@/api"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

const TYPE_META = {
  chat: { label: "Chat", icon: MessageSquare },
  booking: { label: "Booking", icon: Calendar },
  knowledge: { label: "Knowledge Base", icon: FileText },
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function bucketByDay(activity) {
  const now = new Date()
  const buckets = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return { date: d, count: 0 }
  })

  activity.forEach((item) => {
    const t = new Date(item.timestamp)
    buckets.forEach((b) => {
      if (t.toDateString() === b.date.toDateString()) b.count += 1
    })
  })

  return buckets
}

function bucketByType(activity) {
  const counts = { chat: 0, booking: 0, knowledge: 0 }
  activity.forEach((item) => {
    if (counts[item.type] !== undefined) counts[item.type] += 1
  })
  return counts
}

function BarChart({ data, maxValue }) {
  return (
    <div className="h-40 flex items-end gap-2">
      {data.map((d, i) => {
        const pct = maxValue > 0 ? (d.count / maxValue) * 100 : 0
        return (
          <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-2 group">
            <div className="relative w-full flex-1 flex items-end">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-foreground text-background text-[10px] px-2 py-1 rounded-md whitespace-nowrap font-medium shadow-sm">
                  {d.count} {d.count === 1 ? "event" : "events"}
                </div>
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(pct, d.count > 0 ? 4 : 0)}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-t-md bg-foreground/20 group-hover:bg-foreground/35 transition-colors duration-200 min-h-[2px]"
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function TypeBreakdown({ counts, total }) {
  const rows = Object.entries(counts)
    .map(([key, count]) => ({ key, count, ...TYPE_META[key] }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const pct = total > 0 ? (row.count / total) * 100 : 0
        return (
          <div key={row.key} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
              <row.icon size={13} className="text-muted-foreground" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-foreground">{row.label}</span>
                <span className="text-[12px] text-muted-foreground font-medium">{row.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-foreground/40"
                />
              </div>
            </div>
          </div>
        )
      })}
      {total === 0 && (
        <p className="text-[12px] text-muted-foreground text-center py-6">No activity recorded yet.</p>
      )}
    </div>
  )
}

export default function Analytics() {
  const [activity, setActivity] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const [activityRes, statsRes] = await Promise.allSettled([
        dashboardService.getActivity(100),
        dashboardService.getStats(),
      ])
      if (activityRes.status === "fulfilled") setActivity(activityRes.value.data || [])
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const dayBuckets = bucketByDay(activity).map((b) => ({
    label: DAY_LABELS[b.date.getDay()],
    count: b.count,
  }))
  const maxDayCount = Math.max(...dayBuckets.map((b) => b.count), 1)
  const typeCounts = bucketByType(activity)
  const busiestType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Activity trends across chat, booking, and the knowledge base.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat tiles */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {[
              { title: "Total Events Logged", value: activity.length, icon: ActivityIcon },
              { title: "Conversations", value: stats?.conversations ?? "—", icon: MessageSquare },
              { title: "Appointments", value: stats?.appointments ?? "—", icon: Calendar },
              { title: "Busiest Category", value: busiestType && busiestType[1] > 0 ? TYPE_META[busiestType[0]]?.label : "—", icon: TrendingUp },
            ].map((stat) => (
              <motion.div key={stat.title} variants={cardVariants}>
                <Card className="bg-card border-border/50 hover:border-border transition-colors duration-300">
                  <CardHeader className="flex flex-row items-start justify-between pb-3 pt-5 px-5">
                    <CardTitle className="text-[12px] font-medium text-muted-foreground leading-none">{stat.title}</CardTitle>
                    <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 -mt-0.5">
                      <stat.icon size={14} className="text-muted-foreground" strokeWidth={1.75} />
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className={cn("font-semibold tracking-tight leading-none", typeof stat.value === "string" ? "text-lg" : "text-2xl")}>
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            <motion.div variants={cardVariants} className="lg:col-span-2">
              <Card className="bg-card border-border/50 h-full">
                <CardHeader className="px-6 pt-6 pb-4">
                  <CardTitle className="text-[15px] font-semibold">Activity, Last 7 Days</CardTitle>
                  <CardDescription className="text-[13px] mt-0.5">
                    Chat messages, bookings, and uploads handled per day
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <BarChart data={dayBuckets} maxValue={maxDayCount} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="bg-card border-border/50 h-full">
                <CardHeader className="px-6 pt-6 pb-4">
                  <CardTitle className="text-[15px] font-semibold">By Category</CardTitle>
                  <CardDescription className="text-[13px] mt-0.5">Share of activity by type</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <TypeBreakdown counts={typeCounts} total={activity.length} />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[11px] text-muted-foreground mt-6 text-center"
          >
            Based on the last {activity.length} logged events. History resets on server restart.
          </motion.p>
        </>
      )}
    </div>
  )
}
