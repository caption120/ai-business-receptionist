import { Outlet, useLocation, NavLink } from "react-router-dom"
import Sidebar from "./Sidebar"
import { AnimatePresence, motion } from "framer-motion"
import { LayoutDashboard, MessageSquare, Calendar, FileText, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

const mobileNavigation = [
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Booking", href: "/booking", icon: Calendar },
  { name: "Docs", href: "/knowledge", icon: FileText },
  { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
]

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: "blur(6px)" },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
  }
}

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 relative flex flex-col h-full overflow-y-auto pb-16 md:pb-0 min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border/40 bg-background/90 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center text-background shrink-0">
              <Bot size={14} strokeWidth={2} />
            </div>
            <span className="font-semibold text-[13px] tracking-tight">AI Receptionist</span>
          </div>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 w-full flex flex-col min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/90 backdrop-blur-xl z-20"
      >
        <div className="flex items-center justify-around px-2 py-1">
          {mobileNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-lg text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-active"
                      className="absolute inset-0 rounded-lg bg-foreground/8"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon size={19} className="stroke-[1.75] relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
