import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquare, Calendar, FileText, Activity, Loader2 } from "lucide-react"
import { dashboardService, healthService } from "@/api"

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

const ACTIVITY_ICONS = {
  booking: Calendar,
  chat: MessageSquare,
  knowledge: FileText,
}

function timeAgo(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [systemHealthy, setSystemHealthy] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const [statsRes, activityRes, healthRes] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getActivity(6),
        healthService.check(),
      ])

      if (statsRes.status === "fulfilled") setStats(statsRes.value.data)
      if (activityRes.status === "fulfilled") setActivity(activityRes.value.data || [])
      setSystemHealthy(healthRes.status === "fulfilled")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
    const interval = setInterval(loadDashboard, 30000)
    return () => clearInterval(interval)
  }, [loadDashboard])

  const statCards = [
    { title: "AI Conversations", value: stats?.conversations ?? "—", change: "Messages handled by the AI", icon: MessageSquare },
    { title: "Appointments Booked", value: stats?.appointments ?? "—", change: "Upcoming on the calendar", icon: Calendar },
    { title: "Documents Learned", value: stats?.documents ?? "—", change: "Active in the knowledge base", icon: FileText },
    { title: "System Status", value: systemHealthy === null ? "—" : systemHealthy ? "Healthy" : "Offline", change: systemHealthy ? "Backend reachable" : "Backend unreachable", icon: Activity },
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Overview of your AI Receptionist's performance.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={cardVariants}>
            <Card className="bg-card border-border/50 hover:border-border transition-colors duration-300">
              <CardHeader className="flex flex-row items-start justify-between pb-3 pt-5 px-5">
                <CardTitle className="text-[12px] font-medium text-muted-foreground leading-none">{stat.title}</CardTitle>
                <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 -mt-0.5">
                  <stat.icon size={14} className="text-muted-foreground" strokeWidth={1.75} />
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="text-2xl font-semibold tracking-tight leading-none mb-2">{stat.value}</div>
                <p className="text-[11px] text-muted-foreground leading-none">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1"
      >
        <motion.div variants={cardVariants}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-[15px] font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-[13px] mt-0.5">Latest actions by your AI Receptionist</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              ) : activity.length === 0 ? (
                <p className="text-[13px] text-muted-foreground text-center py-10">No activity yet.</p>
              ) : (
                <div className="space-y-4">
                  {activity.map((item, i) => {
                    const Icon = ACTIVITY_ICONS[item.type] || Activity
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                          <Icon size={13} className="text-muted-foreground" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium leading-none mb-1 truncate">{item.action}</p>
                          <p className="text-[11px] text-muted-foreground leading-none truncate">{item.target}</p>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(item.timestamp)}</span>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
