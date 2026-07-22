import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, Upload, Filter, MoreVertical, CheckCircle2, Loader2, Database, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { knowledgeService } from "@/services/api"

const docs = [
  { name: "Company_Policies_2026.pdf", size: "2.4 MB", date: "Today", status: "Active", chunks: 142 },
  { name: "Service_Pricing_Guide.pdf", size: "1.1 MB", date: "Yesterday", status: "Active", chunks: 56 },
  { name: "FAQ_Responses_Template.pdf", size: "845 KB", date: "Oct 12", status: "Active", chunks: 28 },
  { name: "Product_Catalog_V3.pdf", size: "5.2 MB", date: "Oct 05", status: "Processing", chunks: 0 },
  { name: "Onboarding_Manual.pdf", size: "3.8 MB", date: "Sep 28", status: "Active", chunks: 215 },
]

export default function KnowledgeBase() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const response = await knowledgeService.uploadPDF(file)
      console.log("PDF Upload Response:", response)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3500)
    } catch (error) {
      console.error("Upload failed:", error)
      alert(error.message || "Failed to upload knowledge base document.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // clear input
      }
    }
  }

  const filtered = docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        style={{ display: "none" }}
      />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
          <p className="text-[14px] text-muted-foreground mt-1">Upload documents to teach your AI Receptionist.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[13px] rounded-lg hidden sm:flex">
            <Filter size={14} strokeWidth={1.75} /> Filter
          </Button>
          <Button
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading || uploadSuccess}
            className={cn(
              "h-9 gap-1.5 text-[13px] rounded-lg transition-all",
              uploadSuccess && "bg-emerald-600 hover:bg-emerald-600 text-white"
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isUploading && (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin" /> Processing…
                </motion.span>
              )}
              {uploadSuccess && (
                <motion.span key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Added to Brain
                </motion.span>
              )}
              {!isUploading && !uploadSuccess && (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                  <Upload size={14} strokeWidth={1.75} /> Upload PDF
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search documents…"
          className="pl-10 h-10 bg-card border-border/60 text-[14px] rounded-xl"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((doc, i) => (
            <motion.div
              key={doc.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="bg-card border-border/50 group hover:border-border hover:shadow-sm transition-all duration-200 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border/40 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium px-2 py-0.5 gap-1",
                          doc.status === "Active"
                            ? "border-foreground/15 bg-foreground/5 text-foreground"
                            : "border-amber-500/30 bg-amber-500/8 text-amber-500"
                        )}
                      >
                        {doc.status === "Processing" && <Loader2 size={9} className="animate-spin" />}
                        {doc.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <MoreVertical size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* File name */}
                  <p className="text-[13px] font-semibold text-foreground truncate mb-1" title={doc.name}>
                    {doc.name.replace(".pdf", "")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-4">.pdf</p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/40">
                    <span>{doc.size} · {doc.date}</span>
                    <span className="flex items-center gap-1">
                      <Database size={11} strokeWidth={1.75} /> {doc.chunks} vectors
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Upload Drop Zone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: filtered.length * 0.07, duration: 0.45 }}
          onClick={handleUploadClick}
          className="rounded-xl border-2 border-dashed border-border/50 hover:border-border flex flex-col items-center justify-center p-8 text-center hover:bg-muted/20 transition-all duration-200 cursor-pointer min-h-[180px] group"
        >
          <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border/40 flex items-center justify-center mb-3 group-hover:bg-muted transition-colors">
            <Upload size={18} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] font-semibold text-foreground mb-1">Drop PDF here</p>
          <p className="text-[11px] text-muted-foreground max-w-[160px] leading-relaxed">
            AI will instantly learn and index the contents.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
