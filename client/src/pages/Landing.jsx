import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Bot, Sparkles, Zap, Shield, Clock, ArrowRight, MessageSquare, Calendar, FileText, Check, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"

/* ---- Animation helpers ---- */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

function RevealSection({ children, className = "" }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ---- Feature data ---- */
const features = [
  { icon: MessageSquare, title: "Intelligent Chat", desc: "Natural conversations that feel human, powered by advanced language models trained on your business." },
  { icon: Calendar, title: "Smart Booking", desc: "Seamless calendar integration to schedule, reschedule, or cancel appointments without friction." },
  { icon: Zap, title: "Instant Responses", desc: "Zero wait time. Instant, accurate answers from your custom knowledge base, 24/7." },
  { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption and data isolation for every customer interaction." },
  { icon: Clock, title: "Always Available", desc: "Never miss a lead again. Your AI front desk is open around the clock, every day of the year." },
  { icon: FileText, title: "Knowledge RAG", desc: "Upload PDFs and docs. The AI instantly learns and retrieves exact information from them." },
]

/* ---- Testimonials ---- */
const testimonials = [
  { name: "Sarah K.", role: "Founder, Bloom Clinic", quote: "Our front desk inquiries dropped by 70%. The AI handles everything from booking to FAQs flawlessly.", stars: 5 },
  { name: "Marcus L.", role: "Head of Ops, TechFlow", quote: "Implementation was surprisingly painless. We uploaded our docs and it was live in minutes.", stars: 5 },
  { name: "Priya M.", role: "CEO, Crescent Advisory", quote: "It sounds indistinguishable from our own staff. Clients are genuinely impressed.", stars: 5 },
]

/* ---- Steps data ---- */
const steps = [
  { step: "01", title: "Upload your knowledge", desc: "Add any PDFs, FAQs, or documents about your business." },
  { step: "02", title: "Customize your AI", desc: "Set your AI's greeting, tone, and booking preferences." },
  { step: "03", title: "Go live instantly", desc: "Embed the widget or share the link — your AI receptionist is ready." },
]

/* ---- Main Component ---- */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      
      {/* ---- Navbar ---- */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 md:px-12 backdrop-blur-2xl bg-background/75 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center text-background shrink-0">
            <Bot size={15} strokeWidth={2} />
          </div>
          <span className="font-semibold text-[13px] tracking-tight">Receptionist AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How it Works</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors duration-200">Testimonials</a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden md:flex text-muted-foreground hover:text-foreground h-9 px-4 text-[13px]">
            Sign In
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/chat')}
            className="h-9 px-4 rounded-full text-[13px] font-medium shadow-sm"
          >
            Get Started <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="relative pt-32 pb-20 md:pt-52 md:pb-36 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,120,120,0.08),transparent)]" />
        
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-border/60 text-[12px] font-medium text-muted-foreground mb-8 tracking-wide"
          >
            <Sparkles size={12} />
            Introducing the future of business operations
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={0.08}
            variants={fadeUp}
            className="text-[clamp(2.75rem,7vw,6rem)] font-semibold tracking-[-0.03em] leading-[1.05] mb-6 text-balance"
          >
            Your business,{" "}
            <span className="text-muted-foreground font-medium">always open.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            custom={0.16}
            variants={fadeUp}
            className="text-base md:text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed text-balance"
          >
            An intelligent AI receptionist that handles scheduling, answers inquiries, and manages your front desk — 24/7.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={0.24}
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center"
          >
            <Button
              size="lg"
              className="rounded-full w-full sm:w-auto px-8 h-12 text-[15px] font-medium shadow-lg"
              onClick={() => navigate('/chat')}
            >
              Try AI Chat <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-full sm:w-auto px-8 h-12 text-[15px] font-medium bg-transparent"
              onClick={() => navigate('/dashboard')}
            >
              View Dashboard
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero mockup */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 w-full max-w-4xl mx-auto"
        >
          <div className="relative rounded-[20px] border border-border/60 bg-card shadow-2xl overflow-hidden">
            {/* Window chrome */}
            <div className="h-10 border-b border-border/60 flex items-center px-4 gap-1.5 bg-muted/30 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-border/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-border/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-border/80" />
              <div className="ml-4 flex-1 max-w-[200px] h-5 rounded-md bg-border/40 text-[11px] flex items-center justify-center text-muted-foreground/60 font-mono">
                app.receptionist.ai
              </div>
            </div>
            {/* Chat mockup */}
            <div className="px-6 md:px-16 py-10 flex flex-col gap-5 bg-gradient-to-b from-background to-muted/10">
              <div className="flex justify-end">
                <div className="bg-foreground text-background rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[75%] leading-relaxed shadow-sm">
                  Hi, I'd like to book a consultation for next Tuesday.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-foreground flex-shrink-0 flex items-center justify-center text-background mt-0.5 shadow-sm">
                  <Bot size={15} />
                </div>
                <div className="bg-muted/60 border border-border/40 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-foreground max-w-[75%] leading-relaxed">
                  Hello! I'd be happy to help you book a consultation. We have availability on Tuesday at{" "}
                  <span className="font-medium">10:00 AM</span> or{" "}
                  <span className="font-medium">2:00 PM</span>. Which works better for you?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-foreground text-background rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[75%] leading-relaxed shadow-sm">
                  2:00 PM works perfectly.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-foreground flex-shrink-0 flex items-center justify-center text-background mt-0.5 shadow-sm">
                  <Bot size={15} />
                </div>
                <div className="bg-muted/60 border border-border/40 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[75%] leading-relaxed flex gap-2 items-center">
                  <Check size={14} className="text-muted-foreground shrink-0" />
                  Confirmed! Your consultation is booked for Tuesday at 2:00 PM. A confirmation email is on its way.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---- Features ---- */}
      <section id="features" className="py-28 px-6 md:px-12 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">Features</p>
            <h2 className="text-[clamp(1.875rem,4vw,3.5rem)] font-semibold tracking-tight mb-4 text-balance">Everything you need.</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto text-balance">
              Powerful features wrapped in an elegant, minimal interface.
            </p>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40">
            {features.map((feature, i) => (
              <RevealSection key={i}>
                <motion.div
                  whileHover={{ backgroundColor: "rgba(var(--foreground-rgb, 250 250 250) / 0.025)" }}
                  className="bg-background p-8 md:p-10 flex flex-col gap-4 h-full transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-xl border border-border/60 bg-muted/40 flex items-center justify-center">
                    <feature.icon size={18} className="text-foreground/70" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section id="how-it-works" className="py-28 px-6 md:px-12 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <RevealSection className="text-center mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">How it Works</p>
            <h2 className="text-[clamp(1.875rem,4vw,3.5rem)] font-semibold tracking-tight text-balance">Up and running in minutes.</h2>
          </RevealSection>

          <div className="relative space-y-12">
            {/* Vertical line */}
            <div className="absolute left-8 top-8 bottom-8 w-px bg-border/50 hidden md:block" />

            {steps.map((s, i) => (
              <RevealSection key={i}>
                <div className="flex gap-8 items-start">
                  <div className="w-16 h-16 rounded-2xl border border-border/60 bg-muted/30 flex items-center justify-center text-xl font-bold text-foreground/20 shrink-0 z-10 relative bg-background">
                    {s.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-[15px] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Testimonials ---- */}
      <section id="testimonials" className="py-28 px-6 md:px-12 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">Testimonials</p>
            <h2 className="text-[clamp(1.875rem,4vw,3.5rem)] font-semibold tracking-tight text-balance">Loved by teams worldwide.</h2>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <RevealSection key={i}>
                <div className="flex flex-col gap-4 p-8 rounded-2xl bg-card border border-border/60 h-full">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={14} className="fill-foreground text-foreground" />
                    ))}
                  </div>
                  <p className="text-[14px] text-foreground leading-relaxed flex-1">"{t.quote}"</p>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{t.name}</p>
                    <p className="text-[12px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="py-28 px-6 md:px-12 border-t border-border/40">
        <RevealSection>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-[clamp(1.875rem,4vw,3.5rem)] font-semibold tracking-tight mb-6 text-balance">
              Ready to upgrade your front desk?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-10 max-w-xl mx-auto text-balance">
              Join thousands of modern businesses using Receptionist AI to handle customers with care and precision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="rounded-full h-12 px-8 text-[15px] font-medium shadow-lg"
                onClick={() => navigate('/chat')}
              >
                Start for free <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-12 px-8 text-[15px] font-medium bg-transparent"
                onClick={() => navigate('/dashboard')}
              >
                See Dashboard
              </Button>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ---- Footer ---- */}
      <footer className="py-10 px-6 md:px-12 border-t border-border/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center text-background">
              <Bot size={13} />
            </div>
            <span className="font-semibold text-[13px] tracking-tight">Receptionist AI</span>
          </div>
          <p className="text-[12px] text-muted-foreground order-last md:order-none">
            © 2026 Receptionist AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-[13px] text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
