import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquare, Calendar, FileText, Activity } from "lucide-react"

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

const chartBars = [40, 25, 45, 60, 30, 70, 85, 55, 45, 90, 65, 80, 50, 75]

const stats = [
  { title: "AI Conversations", value: "1,248", change: "+12% from last month", icon: MessageSquare, trend: "up" },
  { title: "Appointments Booked", value: "142", change: "+4% from last month", icon: Calendar, trend: "up" },
  { title: "Documents Learned", value: "24", change: "+2 added this month", icon: FileText, trend: "up" },
  { title: "System Status", value: "Healthy", change: "99.9% uptime", icon: Activity, status: "ok" },
]

const recentActivity = [
  { action: "Booked consultation", target: "Sarah Jenkins", time: "10m ago", icon: Calendar },
  { action: "Answered query", target: "Pricing details", time: "45m ago", icon: MessageSquare },
  { action: "Learned document", target: "Q3_Services.pdf", time: "2h ago", icon: FileText },
  { action: "Booked meeting", target: "Michael Chen", time: "3h ago", icon: Calendar },
  { action: "Rescheduled apt.", target: "Emma Watson", time: "5h ago", icon: Calendar },
]

export default function Dashboard() {
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
        {stats.map((stat) => (
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

      {/* Main Charts + Activity */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Chart */}
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-[15px] font-semibold">Conversation Activity</CardTitle>
                  <CardDescription className="text-[13px] mt-0.5">Daily interactions handled by your AI</CardDescription>
                </div>
                <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-medium">Last 14 days</span>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {/* Labels */}
              <div className="flex justify-between text-[10px] text-muted-foreground mb-3 font-medium">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
              {/* Bar chart */}
              <div className="h-48 flex items-end gap-1.5">
                {chartBars.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 relative group cursor-pointer"
                    style={{ height: "100%" }}
                  >
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-foreground/15 rounded-t-sm group-hover:bg-foreground/30 transition-colors duration-200"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-foreground text-background text-[10px] px-2 py-1 rounded-md whitespace-nowrap font-medium">{h}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-3 font-medium">
                <span>Jul 7</span>
                <span>Jul 14</span>
                <span>Jul 20</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity */}
        <motion.div variants={cardVariants}>
          <Card className="bg-card border-border/50 h-full">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-[15px] font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-[13px] mt-0.5">Latest actions by AI</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                      <item.icon size={13} className="text-muted-foreground" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-none mb-1 truncate">{item.action}</p>
                      <p className="text-[11px] text-muted-foreground leading-none truncate">{item.target}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
