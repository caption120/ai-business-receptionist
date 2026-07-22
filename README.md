<div align="center">

<img src="client/src/assets/hero.png" alt="AI Business Receptionist" width="120" style="border-radius: 16px;" />

# 🤖 AI Business Receptionist

**A production-ready AI-powered business receptionist built with LangChain, Gemini, and React.**  
Handles appointments, answers questions, and manages your calendar — 24/7, autonomously.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://client-seven-steel-79.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-blueviolet?style=for-the-badge&logo=railway)](https://legal-rag-chatbot-production.up.railway.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

</div>

---

## ✨ What It Does

AI Business Receptionist is an intelligent, full-stack conversational agent that acts as the front desk of your business. It can:

- 💬 **Answer questions** from your business knowledge base (uploaded as PDFs)
- 📅 **Check availability** and book appointments on Google Calendar
- ❌ **Cancel & reschedule** existing bookings
- 🕐 **Handle real-time queries** like "What time is it?" using live tool calling
- 🧠 **Learn from your documents** — upload any PDF and the AI instantly gains that knowledge

---

## 🖥️ Live Demo

| Surface | URL |
|---------|-----|
| 🌐 Frontend | [https://client-seven-steel-79.vercel.app](https://client-seven-steel-79.vercel.app) |
| ⚙️ Backend API | [https://legal-rag-chatbot-production.up.railway.app](https://legal-rag-chatbot-production.up.railway.app) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vercel)               │
│  Chat UI · Knowledge Base · Booking · Dashboard          │
└─────────────────────┬───────────────────────────────────┘
                      │  REST API (fetch)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Express.js Backend (Railway)            │
│                                                         │
│  ┌──────────────┐   ┌───────────────┐   ┌───────────┐  │
│  │ Chat Routes  │   │ Upload Routes │   │ Booking   │  │
│  └──────┬───────┘   └───────┬───────┘   └─────┬─────┘  │
│         │                   │                 │        │
│         ▼                   ▼                 ▼        │
│  ┌──────────────┐   ┌───────────────┐   ┌───────────┐  │
│  │  AI Service  │   │  RAG Service  │   │ Booking   │  │
│  │  (LangChain) │   │  (ChromaDB)   │   │ Service   │  │
│  └──────┬───────┘   └───────┬───────┘   └─────┬─────┘  │
│         │                   │                 │        │
│         ▼                   ▼                 ▼        │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Google Gemini 2.5 Flash (LangChain)     │  │
│  │           Tool Calling Execution Loop            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
    MongoDB Atlas  ChromaDB  Google Calendar
```

---

## 🔧 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express.js** | REST API server |
| **LangChain** | AI orchestration & tool calling |
| **Google Gemini 2.5 Flash** | Large language model |
| **ChromaDB** | Vector store for RAG |
| **MongoDB** | Database |
| **Google Calendar API** | Appointment management |
| **Multer + pdf-parse** | PDF upload and text extraction |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19 + Vite** | SPA framework |
| **Tailwind CSS v4** | Styling |
| **Framer Motion** | Animations |
| **shadcn/ui** | UI components |
| **React Router v7** | Client-side routing |

### Infrastructure
| Service | Hosts |
|---------|-------|
| **Vercel** | React frontend |
| **Railway** | Express backend |
| **MongoDB Atlas** | Database |
| **ChromaDB (Docker)** | Vector embeddings |

---

## 🤖 AI Agent Architecture

The core AI uses a **LangChain Tool Calling Execution Loop** with Google Gemini:

```
User Message
     ↓
HumanMessage → LLM (Gemini 2.5 Flash)
     ↓
tool_calls? ──YES──→ Execute Tool(s) in parallel
     │                       ↓
     │              ToolMessage (with tool_call_id)
     │                       ↓
     │              Re-invoke LLM with full history
     │                       ↓
     └──NO──→ Final AIMessage → User
```

**Tool Registry** — Easily extensible. Adding a new tool requires only:
1. Define with `tool()` from `@langchain/core/tools`
2. Add to `tools[]` array
3. Register in `toolMap{}`

**Current Tools:**
- `getCurrentTime` — Returns live date/time in IST

**Planned Tools:**
- `checkAvailability` — Google Calendar availability check
- `createBooking` — Schedule appointments
- `cancelBooking` — Cancel existing events
- `rescheduleBooking` — Move appointments
- `ragSearch` — Search knowledge base documents

---

## 📁 Project Structure

```
ai-business-receptionist/
│
├── client/                          # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Chat.jsx             # AI chat interface
│   │   │   ├── Booking.jsx          # Booking management
│   │   │   ├── KnowledgeBase.jsx    # PDF upload + docs
│   │   │   ├── Dashboard.jsx        # Analytics overview
│   │   │   ├── Settings.jsx         # Configuration
│   │   │   └── Landing.jsx          # Marketing landing page
│   │   ├── services/
│   │   │   └── api.js               # Backend API service layer
│   │   ├── components/
│   │   │   ├── layout/              # Layout, Sidebar
│   │   │   └── ui/                  # shadcn/ui components
│   │   └── lib/
│   │       └── utils.js             # Utility helpers
│   ├── vercel.json                  # Vercel SPA routing config
│   └── .env.example                 # Frontend env template
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── chatController.js    # Chat endpoint handler
│   │   │   ├── uploadController.js  # PDF upload handler
│   │   │   └── bookingController.js # Calendar operations
│   │   ├── services/
│   │   │   ├── aiService.js         # LangChain agent + tool loop ⭐
│   │   │   ├── ragService.js        # RAG retrieval
│   │   │   ├── bookingService.js    # Google Calendar service
│   │   │   ├── vectorStoreService.js# ChromaDB operations
│   │   │   └── embeddingService.js  # Text embeddings
│   │   ├── tools/
│   │   │   └── bookingTools.js      # LangChain tool definitions
│   │   ├── routes/                  # Express route definitions
│   │   ├── middleware/              # Multer file upload middleware
│   │   └── config/
│   │       ├── db.js                # MongoDB connection
│   │       └── googleCalendar.js    # Google Calendar auth
│   ├── railway.json                 # Railway deployment config
│   ├── Procfile                     # Process definition
│   └── .env.example                 # Backend env template
│
├── docker-compose.yml               # ChromaDB local setup
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker (for ChromaDB)
- Google Cloud account (for Gemini API + Calendar)
- MongoDB Atlas account

### 1. Clone the repository
```bash
git clone https://github.com/caption120/ai-business-receptionist.git
cd ai-business-receptionist
```

### 2. Start ChromaDB (Vector Store)
```bash
docker-compose up -d
```

### 3. Set up the Backend
```bash
cd server
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 4. Set up the Frontend
```bash
cd client
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api/v1
npm install
npm run dev
```

### 5. Open the app
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

## 🌍 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
GOOGLE_API_KEY=your_gemini_api_key
GOOGOLE_CLANDER_API=your_google_calendar_api_key
GOOGLE_CALENDAR_ID=your_calendar_email@gmail.com
GOOGLE_APPLICATION_CREDENTIALS=./src/credentials/service-account.json
FRONTEND_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 📡 API Reference

### Chat
```http
POST /api/v1/chat
Content-Type: application/json

{ "message": "What time is it in India?" }
```

### Upload PDF to Knowledge Base
```http
POST /api/v1/upload
Content-Type: multipart/form-data

pdf: <file.pdf>
```

### Google Calendar Endpoints
```http
GET  /api/v1/booking/test           # Test calendar connection
GET  /api/v1/booking/availability   # Check available slots
GET  /api/v1/booking/create         # Create a booking
GET  /api/v1/booking/next-slots     # Find next available times
```

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd client
vercel --prod
```
Set environment variable `VITE_API_URL` to your backend URL in the Vercel dashboard.

### Backend → Railway
```bash
cd server
railway login
railway link
railway variables --set "GOOGLE_API_KEY=..." --set "MONGODB_URI=..."
railway up --detach
```

---

## 🗺️ Roadmap

- [x] LangChain tool calling execution loop
- [x] RAG pipeline (PDF → ChromaDB → Semantic Search)
- [x] Google Calendar integration
- [x] React frontend with chat UI
- [x] Vercel + Railway deployment
- [ ] Booking tools integrated into AI agent
- [ ] RAG tool integrated into AI agent
- [ ] LangGraph multi-step reasoning
- [ ] Conversation memory (per-session)
- [ ] Voice input support
- [ ] Multi-language support

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Built with ❤️ by **Gautam Bhayani**

[GitHub](https://github.com/caption120) · [Live Demo](https://client-seven-steel-79.vercel.app)

</div>
