import { NavLink } from "react-router-dom"
import { LayoutDashboard, MessageSquare, Calendar, FileText, Settings, Bot } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Booking", href: "/booking", icon: Calendar },
  { name: "Knowledge Base", href: "/knowledge", icon: FileText },
]

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-border/50 bg-card/20 backdrop-blur-3xl z-10 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border/40 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center text-background shrink-0">
          <Bot size={15} strokeWidth={2} />
        </div>
        <span className="font-semibold text-[13px] tracking-tight text-foreground leading-none flex-1">
          Receptionist AI
        </span>
        <ThemeToggle />
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase px-3 mb-3">Menu</p>
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Bottom Nav */}
      <div className="px-2 py-4 border-t border-border/40 space-y-0.5">
        {bottomNavigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
        {/* User chip */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 mt-2 rounded-lg bg-muted/40 border border-border/40">
          <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0 uppercase">
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate leading-none mb-0.5">Acme Corp</p>
            <p className="text-[10px] text-muted-foreground truncate leading-none">hello@acmecorp.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ item }) {
  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer",
          isActive
            ? "bg-foreground/10 text-foreground"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-foreground rounded-full"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <item.icon size={16} className="shrink-0 stroke-[1.75]" />
          <span className="leading-none">{item.name}</span>
        </>
      )}
    </NavLink>
  )
}
