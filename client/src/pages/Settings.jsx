import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Bell, Palette, Bot, Link2, AlertTriangle, ChevronRight, Globe, MessageSquare, Zap, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai", label: "AI Preferences", icon: Bot },
  { id: "integrations", label: "Integrations", icon: Link2 },
]

const contentVariants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.15 } }
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-border/40 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-foreground">{label}</p>
        {description && <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      role="switch"
      aria-checked={enabled}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        enabled ? "bg-foreground" : "bg-muted border border-border"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-background shadow-sm transition-transform duration-200",
          enabled ? "translate-x-4.5" : "translate-x-0.5"
        )}
      />
    </button>
  )
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile")
  const [notifications, setNotifications] = useState({ email: true, sms: false, weekly: true, new_booking: true })
  const [tone, setTone] = useState("Professional")

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-[14px] text-muted-foreground mt-1">Manage your account and AI preferences.</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab Sidebar */}
        <nav
          aria-label="Settings navigation"
          className="w-full md:w-52 shrink-0 flex flex-row md:flex-col gap-0.5 overflow-x-auto pb-2 md:pb-0"
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all shrink-0 text-left",
                activeTab === tab.id
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <tab.icon size={15} strokeWidth={1.75} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4"
            >
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <Card className="bg-card border-border/50">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-[15px] font-semibold">Profile Information</CardTitle>
                    <CardDescription className="text-[13px]">Update your account and business details.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-4">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 pb-4 border-b border-border/40">
                      <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-2xl font-semibold text-muted-foreground">
                        A
                      </div>
                      <div>
                        <Button size="sm" variant="outline" className="h-8 text-[12px] rounded-lg">Change avatar</Button>
                        <p className="text-[11px] text-muted-foreground mt-1.5">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-foreground">Business Name</label>
                      <Input defaultValue="Acme Corp LLC" className="h-10 text-[14px] rounded-lg" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[13px] font-medium text-foreground">Email Address</label>
                        <Input defaultValue="hello@acmecorp.com" type="email" className="h-10 text-[14px] rounded-lg" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-medium text-foreground">Phone Number</label>
                        <Input defaultValue="+1 (555) 000-1234" className="h-10 text-[14px] rounded-lg" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button size="sm" className="h-9 px-4 text-[13px] rounded-lg">Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <Card className="bg-card border-border/50">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-[15px] font-semibold">Theme Preferences</CardTitle>
                    <CardDescription className="text-[13px]">Customize the look and feel of your dashboard.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <p className="text-[13px] font-medium mb-4">Color Theme</p>
                    <div className="grid grid-cols-3 gap-3 max-w-sm">
                      {["Light", "Dark", "System"].map((theme) => (
                        <button
                          key={theme}
                          className={cn(
                            "flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all text-[12px] font-medium",
                            theme === "Dark"
                              ? "border-foreground bg-foreground/5 text-foreground"
                              : "border-border/50 text-muted-foreground hover:border-border"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-7 rounded-lg shadow-sm border border-border/40",
                            theme === "Light" ? "bg-zinc-100" : theme === "Dark" ? "bg-zinc-900" : "bg-gradient-to-br from-zinc-100 to-zinc-900"
                          )} />
                          {theme}
                          {theme === "Dark" && <Check size={12} className="absolute" />}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <Card className="bg-card border-border/50">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-[15px] font-semibold">Notification Preferences</CardTitle>
                    <CardDescription className="text-[13px]">Choose how and when you receive updates.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <SettingRow label="Email Notifications" description="Get booking confirmations and alerts by email.">
                      <Toggle enabled={notifications.email} onChange={v => setNotifications(p => ({ ...p, email: v }))} />
                    </SettingRow>
                    <SettingRow label="SMS Alerts" description="Receive text message alerts for new bookings.">
                      <Toggle enabled={notifications.sms} onChange={v => setNotifications(p => ({ ...p, sms: v }))} />
                    </SettingRow>
                    <SettingRow label="New Booking Alert" description="Notify when the AI books a new appointment.">
                      <Toggle enabled={notifications.new_booking} onChange={v => setNotifications(p => ({ ...p, new_booking: v }))} />
                    </SettingRow>
                    <SettingRow label="Weekly Summary" description="A weekly digest of AI performance and activity.">
                      <Toggle enabled={notifications.weekly} onChange={v => setNotifications(p => ({ ...p, weekly: v }))} />
                    </SettingRow>
                  </CardContent>
                </Card>
              )}

              {/* AI Preferences Tab */}
              {activeTab === "ai" && (
                <Card className="bg-card border-border/50">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-[15px] font-semibold">AI Behavior</CardTitle>
                    <CardDescription className="text-[13px]">Configure how your AI receptionist interacts with clients.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-5">
                    <div className="space-y-2">
                      <label className="text-[13px] font-medium text-foreground">Greeting Message</label>
                      <textarea
                        className="flex w-full rounded-lg border border-input bg-background px-3 py-2.5 text-[14px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[96px] resize-none leading-relaxed"
                        defaultValue="Hello! I'm the Acme Corp AI assistant. How can I help you today?"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[13px] font-medium text-foreground">Tone of Voice</label>
                      <div className="flex flex-wrap gap-2">
                        {["Professional", "Friendly", "Concise", "Empathetic"].map((t) => (
                          <button
                            key={t}
                            onClick={() => setTone(t)}
                            className={cn(
                              "px-4 py-2 rounded-lg text-[13px] font-medium border transition-all",
                              tone === t
                                ? "bg-foreground text-background border-transparent shadow-sm"
                                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button size="sm" className="h-9 px-4 text-[13px] rounded-lg">Save AI Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Integrations Tab */}
              {activeTab === "integrations" && (
                <Card className="bg-card border-border/50">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-[15px] font-semibold">Integrations</CardTitle>
                    <CardDescription className="text-[13px]">Connect your tools to extend AI capabilities.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    {[
                      { name: "Google Calendar", desc: "Sync appointments automatically", icon: Globe, connected: true },
                      { name: "Slack", desc: "Get real-time notifications in your workspace", icon: MessageSquare, connected: false },
                      { name: "Zapier", desc: "Connect to 5,000+ apps", icon: Zap, connected: false },
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between py-4 border-b border-border/40 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-muted/60 border border-border/40 flex items-center justify-center">
                            <integration.icon size={17} className="text-muted-foreground" strokeWidth={1.75} />
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-foreground">{integration.name}</p>
                            <p className="text-[12px] text-muted-foreground">{integration.desc}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={integration.connected ? "outline" : "default"}
                          className={cn("h-8 text-[12px] rounded-lg gap-1.5", integration.connected && "text-muted-foreground")}
                        >
                          {integration.connected ? <><Check size={12} /> Connected</> : "Connect"}
                          {!integration.connected && <ChevronRight size={12} />}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Danger Zone — always visible */}
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" strokeWidth={1.75} />
                <CardTitle className="text-[15px] font-semibold text-red-500">Danger Zone</CardTitle>
              </div>
              <CardDescription className="text-[13px]">These actions are permanent and cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium text-foreground">Delete Account</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5 max-w-sm">
                    Permanently remove your account, all AI brain data, and associated settings.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-[13px] rounded-lg border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 shrink-0"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
