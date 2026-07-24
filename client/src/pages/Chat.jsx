import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Send, User, Paperclip, Mic, Square, Calendar, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { chatService, voiceService } from "@/api"
import { encodeToWav } from "@/lib/audioEncoder"
import { FalconIcon } from "@/components/ui/FalconIcon"
import { VoiceWaveform } from "@/components/ui/VoiceWaveform"

const SUGGESTED_PROMPTS = [
  { label: "Book a consultation", icon: Calendar },
  { label: "What are your business hours?", icon: Sparkles },
  { label: "Where are you located?", icon: Sparkles },
  { label: "Cancel my appointment", icon: Calendar },
]

const messageVariants = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
}

function TypingIndicator() {
  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
      className="flex gap-3 items-end"
    >
      <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 shadow-sm">
        <FalconIcon size={15} />
      </div>
      <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-card border border-border/50 flex items-center gap-1.5 shadow-sm">
        {[0, 0.18, 0.36].map((delay, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.7, repeat: Infinity, delay, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user"
  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      className={cn("flex gap-3", isUser ? "flex-row-reverse items-end" : "items-end")}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
        isUser ? "bg-muted border border-border/60" : "bg-foreground text-background"
      )}>
        {isUser ? <User size={15} className="text-muted-foreground" /> : <FalconIcon size={15} />}
      </div>
      <div className={cn(
        "px-4 py-3 rounded-2xl text-[14px] leading-relaxed max-w-[80%] shadow-sm",
        isUser
          ? "bg-foreground text-background rounded-br-sm"
          : "bg-card border border-border/50 text-foreground rounded-bl-sm"
      )}>
        {msg.content}
      </div>
    </motion.div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [activeStream, setActiveStream] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 128) + "px"
  }, [input])

  const handleSend = useCallback(async (text) => {
    const content = typeof text === "string" ? text : input
    if (!content.trim()) return

    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: content.trim() }])
    setInput("")
    setIsTyping(true)

    try {
      const response = await chatService.sendMessage(content.trim())
      const replyContent = response.data?.kwargs?.content || response.data?.content || "No response received."
      
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: replyContent
      }])
    } catch (error) {
      console.error("Chat Error:", error)
      setMessages((prev) => [...prev, {
        id: Date.now() + 2,
        role: "assistant",
        content: `Error: ${error.message || "Failed to communicate with AI Business Receptionist."}`
      }])
    } finally {
      setIsTyping(false)
    }
  }, [input])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    setActiveStream(null)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())

        const rawBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" })
        audioChunksRef.current = []
        setIsTranscribing(true)

        try {
          const wavBlob = await encodeToWav(rawBlob)
          const result = await voiceService.transcribe(wavBlob)
          const transcript = result.transcript?.trim()

          if (transcript) {
            handleSend(transcript)
          }
        } catch (error) {
          console.error("Transcription error:", error)
          setMessages((prev) => [...prev, {
            id: Date.now(),
            role: "assistant",
            content: `Error: ${error.message || "Failed to transcribe audio."}`
          }])
        } finally {
          setIsTranscribing(false)
        }
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setActiveStream(stream)
    } catch (error) {
      console.error("Microphone access error:", error)
      setMessages((prev) => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: "Error: Microphone access is required for voice input."
      }])
    }
  }, [handleSend])

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, stopRecording, startRecording])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="flex h-full w-full bg-background">
      <div className="flex-1 flex flex-col relative min-w-0 h-full">

        {/* Header */}
        <header className="h-14 flex items-center justify-between px-5 border-b border-border/40 shrink-0 bg-background/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
              <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-40" />
            </div>
            <h2 className="text-[13px] font-semibold text-foreground">AI Receptionist</h2>
            <span className="text-[11px] text-muted-foreground hidden sm:block">· Online</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
              <Calendar size={16} strokeWidth={1.75} />
            </Button>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-36">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto gap-6 py-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-foreground/8 border border-border/60 flex items-center justify-center">
                <FalconIcon size={28} className="text-foreground/60" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight mb-2">How can I help?</h1>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  I'm your AI business assistant. I can schedule appointments, answer FAQs, and handle inquiries.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                    onClick={() => handleSend(p.label)}
                    className="flex items-center gap-2.5 p-3.5 rounded-xl border border-border/50 bg-card hover:bg-muted/40 transition-colors text-left text-[13px] group"
                  >
                    <p.icon size={14} className="text-muted-foreground shrink-0" strokeWidth={1.75} />
                    <span className="text-foreground/80 group-hover:text-foreground transition-colors">{p.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {isTyping && <TypingIndicator key="typing" />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 md:px-6 pb-4 pt-8 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex items-end gap-2 bg-card border border-border/60 rounded-2xl px-3 py-2 shadow-sm focus-within:border-border focus-within:shadow-md transition-all duration-200"
            >
              {/* Left actions */}
              <div className="flex items-end gap-0.5 pb-0.5">
                <Button
                  type="button" variant="ghost" size="icon"
                  aria-label="Attach file"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg shrink-0"
                >
                  <Paperclip size={16} strokeWidth={1.75} />
                </Button>
              </div>

              {/* Textarea / recording waveform / transcribing indicator */}
              {isRecording ? (
                <div className="flex-1 flex items-center gap-2.5 py-1.5 px-3 min-h-[36px] rounded-xl bg-neutral-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse shrink-0" />
                  <VoiceWaveform stream={activeStream} className="flex-1 h-8 w-full" />
                </div>
              ) : isTranscribing ? (
                <div className="flex-1 flex items-center gap-1.5 py-1.5 min-h-[36px] text-[13px] text-muted-foreground">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
                      animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay, ease: "easeInOut" }}
                    />
                  ))}
                  <span className="ml-1">Transcribing…</span>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message AI Receptionist…"
                  rows={1}
                  aria-label="Message input"
                  className="flex-1 bg-transparent border-0 outline-none resize-none py-1.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 max-h-32 min-h-[36px]"
                />
              )}

              {/* Right actions */}
              <div className="flex items-end gap-0.5 pb-0.5">
                <Button
                  type="button" variant="ghost" size="icon"
                  onClick={handleMicClick}
                  disabled={isTranscribing}
                  aria-label={isRecording ? "Stop recording" : "Voice input"}
                  className={cn(
                    "h-8 w-8 rounded-lg shrink-0 flex relative",
                    isRecording
                      ? "bg-neutral-900 text-white hover:bg-neutral-900 hover:text-white"
                      : "text-muted-foreground hover:text-foreground",
                    isTranscribing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isRecording && (
                    <span className="absolute inset-0 rounded-lg bg-white/10 animate-pulse" />
                  )}
                  {isRecording
                    ? <Square size={14} strokeWidth={2} className="relative fill-current" />
                    : <Mic size={16} strokeWidth={1.75} className="relative" />}
                </Button>
                <Button
                  type="submit"
                  aria-label="Send message"
                  disabled={!input.trim()}
                  className={cn(
                    "h-8 w-8 rounded-lg shrink-0 p-0 transition-all",
                    input.trim()
                      ? "bg-foreground text-background hover:bg-foreground/85 shadow-sm"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  )}
                >
                  <Send size={14} strokeWidth={2} />
                </Button>
              </div>
            </form>
            <p className="text-center mt-2 text-[11px] text-muted-foreground/60">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
