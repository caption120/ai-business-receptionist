# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

AI Business Receptionist ("Coco") — a full-stack conversational agent that acts as a business's front desk: answers questions from an uploaded PDF knowledge base (RAG), and checks/books/cancels/reschedules Google Calendar appointments via LLM tool calling. React SPA frontend, Express REST API backend, ChromaDB for vectors, MongoDB Atlas as the primary DB (connection only — most app state currently lives in server memory, see below).

Two independent npm projects, no workspace/monorepo tooling: `client/` (Vite/React) and `server/` (Express). There are no automated tests in either project.

## Project structure

```
ai-business-receptionist/
├── client/                          # React 19 + Vite SPA
│   ├── .env.example / .env          # VITE_API_URL
│   ├── vite.config.js, jsconfig.json, vercel.json
│   └── src/
│       ├── main.jsx, App.jsx        # entry + route table
│       ├── api/                     # fetch layer, one file per resource
│       │   ├── client.js            #   apiRequest() + API_BASE_URL
│       │   ├── chat.js, booking.js, knowledge.js, dashboard.js, health.js, session.js, voice.js
│       │   └── index.js
│       ├── pages/                   # one component per route
│       │   ├── Landing.jsx          #   "/"
│       │   ├── Chat.jsx             #   "/chat"
│       │   ├── Booking.jsx          #   "/booking"
│       │   ├── KnowledgeBase.jsx    #   "/knowledge"
│       │   ├── Dashboard.jsx        #   "/dashboard"
│       │   ├── Analytics.jsx        #   "/analytics"
│       │   └── Settings.jsx         #   "/settings"
│       ├── components/
│       │   ├── layout/              # Layout.jsx (sidebar/nav shell), Sidebar.jsx
│       │   └── ui/                  # shadcn/ui-style primitives (button, card, input, badge, ThemeToggle, FalconIcon, VoiceWaveform)
│       ├── lib/                     # utils.js (cn helper), theme.jsx (light/dark context), audioEncoder.js (webm→wav re-encode for STT)
│       ├── assets/
│       └── index.css
│
├── server/                          # Express 5 REST API
│   ├── .env.example / .env, .npmrc, Procfile, railway.json, mcp.yaml
│   └── src/
│       ├── server.js                # app bootstrap, CORS, route mounting, DB connect
│       ├── app.js                   # unused placeholder
│       ├── config/
│       │   ├── db.js                # Mongoose connection (MONGODB_URI) — connected but unused, see below
│       │   └── googleCalendar.js    # service-account auth → calendar client
│       ├── credentials/
│       │   └── service-account.json # Google service-account key (gitignored)
│       ├── routes/                  # thin express.Router() per resource
│       │   ├── HelthRoutes.js       #   /api/v1/health  (filename typo, intentional-ish — see below)
│       │   ├── chatRoutes.js        #   /api/v1/chat
│       │   ├── uploadRoutes.js      #   /api/v1/upload
│       │   ├── bookingRoutes.js     #   /api/v1/booking
│       │   ├── dashboardRoutes.js   #   /api/v1/dashboard
│       │   └── voiceRoutes.js       #   /api/v1/voice
│       ├── controllers/             # req/res handling, one per route file
│       │   ├── healthController.js, chatController.js, uploadController.js
│       │   ├── bookingController.js, dashboardController.js, voiceController.js
│       ├── services/                # business logic, no express types here
│       │   ├── aiService.js         # ⭐ LangChain agent + tool-calling loop
│       │   ├── chatService.js       # RAG similarity search + answer synthesis
│       │   ├── bookingService.js    # Google Calendar CRUD + slot-finding
│       │   ├── vectorStoreService.js# Chroma client (Cloud or local) + storeDocuments
│       │   ├── embeddingService.js  # Google text embeddings
│       │   ├── chunkService.js      # RecursiveCharacterTextSplitter
│       │   ├── pdfService.js        # pdf-parse text extraction
│       │   ├── llmService.js        # standalone single-turn QA model
│       │   ├── voiceEngine.js       # speech-to-text via Gemini audio understanding
│       │   └── sessionService.js    # in-memory voice-call session store (Map)
│       ├── tools/                   # LangChain tool() wrappers exposed to the agent
│       │   ├── bookingTools.js      # getCurrentTime/checkAvailability/createBooking/cancelBooking/rescheduleBooking/findNextAvailableSlots
│       │   └── ragTool.js           # searchKnowledgeBase
│       ├── memory/                  # ⚠️ in-process state, not MongoDB — see below
│       │   ├── conversationMemory.js# per-session chat history (Map)
│       │   ├── activityMemory.js    # dashboard activity feed + counters
│       │   └── knowledgeMemory.js   # uploaded-document metadata
│       └── middleware/
│           ├── uploadMiddleware.js       # Multer config, .pdf-only filter, disk storage
│           └── audioUploadMiddleware.js  # Multer config, audio/* filter, memory storage
│
├── docker-compose.yml               # local ChromaDB (only needed without CHROMA_API_KEY)
├── README.md                        # original design doc — see caveat below
├── PROJECT_ARCH_AND_STATUS.md       # original design doc — see caveat below
└── docs/, chroma/, chroma_data/     # local Chroma persistence dirs (gitignored)
```

## Commands

Backend (`server/`):
```bash
cd server
npm install
npm run dev      # nodemon src/server.js — local dev
npm start        # node src/server.js — production entry (Procfile/Railway use this)
```

Frontend (`client/`):
```bash
cd client
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # production build
npm run lint      # eslint .
npm run preview   # preview a production build
```

Vector store (local dev only — not needed if `CHROMA_API_KEY` is set, see below):
```bash
docker-compose up -d   # ChromaDB on :8000
```

There is no test runner configured in either `package.json`.

## Architecture

### Request flow
`client/src/api/client.js` (`apiRequest`, base URL from `VITE_API_URL`) → Express routes in `server/src/routes/*` → controllers in `server/src/controllers/*` → services in `server/src/services/*`.

Mounted route prefixes (`server/src/server.js`): `/api/v1/health`, `/api/v1/upload`, `/api/v1/chat`, `/api/v1/booking`, `/api/v1/dashboard`, `/api/v1/voice`.

### AI agent loop (`server/src/services/aiService.js`)
This is the core of the app. `askAI(sessionId, message)` runs a LangChain tool-calling loop:
1. Load/create per-session history (system prompt + messages) from `server/src/memory/conversationMemory.js`.
2. Invoke the LLM with the full tool set bound.
3. While the model returns `tool_calls`, execute each tool (from the `toolMap` in `aiService.js`), append `ToolMessage` results to history, and re-invoke.
4. Return the final assistant message.
o
The system prompt (giving the assistant its persona "Coco", tone rules, and step-by-step tool-usage workflow for boking/rescheduling/RAG) lives inline in `aiService.js` — read it before changing agent behavior, it's the actual spec for how tools should be sequenced.

**Note the LLM is wired through OpenRouter** (`ChatOpenAI` from `@langchain/openai`, `baseURL: https://openrouter.ai/api/v1`, model from `OPENROUTER_MODEL` env, defaulting to `google/gemini-2.5-flash`), not a direct `@langchain/google-genai` chat model — despite what the README/architecture doc say. Embeddings still go straight to Google (`embedding-004`/`gemini-embedding-2` via `@langchain/google-genai`), so `GOOGLE_API_KEY` is still required. There are two separate Google SDKs in play — don't confuse them: `@langchain/google-genai` (embeddings only) and `@google/genai` (the direct Gemini SDK, used only by `voiceEngine.js` for speech-to-text, see below).

Tools live in `server/src/tools/` (`bookingTools.js` for calendar ops, `ragTool.js` for knowledge-base search) and wrap services in `server/src/services/`. To add a tool: define it with `tool()` from `@langchain/core/tools`, add it to both the `tools` array and the `toolMap` in `aiService.js`.

### RAG / knowledge base
Upload flow: `uploadController.js` → `pdfService.js` (pdf-parse text extraction) → `chunkService.js` (`RecursiveCharacterTextSplitter`, 1000 chars / 200 overlap) → `embeddingService.js` → `vectorStoreService.js` (Chroma). Query flow: `chatService.js` does similarity search + answer synthesis for the `/chat` question-based path (`chatWithPDF`); the agent's own `searchKnowledgeBase` tool (`ragTool.js`) lets the LLM query the same store mid-conversation.

`vectorStoreService.js` picks its Chroma backend at runtime: if `CHROMA_API_KEY` is set it uses Chroma Cloud (`CloudClient`, needs `CHROMA_TENANT`/`CHROMA_DATABASE` too); otherwise it falls back to a local `ChromaClient` at `CHROMA_URL` (default `http://localhost:8000`, i.e. the docker-compose service). Production (Railway) uses Chroma Cloud.

### In-memory state — not persistent, not multi-instance safe
`server/src/memory/` (`conversationMemory.js`, `activityMemory.js`, `knowledgeMemory.js`) hold conversation history, the dashboard activity feed/counters, and uploaded-document metadata **in plain JS `Map`/arrays**, not MongoDB. This resets on every server restart/deploy and won't work correctly if the server is ever scaled beyond one instance. MongoDB (`config/db.js`) is connected at startup but nothing currently reads/writes to it — treat `MONGODB_URI` as required-but-currently-idle plumbing, not a source of truth, unless you're the one wiring persistence up.

### Voice input (speech-to-text)
`server/src/services/voiceEngine.js` handles transcription: it sends the uploaded audio as base64 inline data straight to Gemini (`@google/genai`, `GoogleGenAI.models.generateContent`, model from `GOOGLE_TRANSCRIBE_MODEL` env, defaulting to `gemini-2.5-flash`) with a transcription prompt, and returns `response.text`. This is a one-shot batch call, not streaming — there is no live/partial-transcript support.

Flow: `POST /api/v1/voice/transcribe` (multipart, field `audio`) → `audioUploadMiddleware.js` (Multer memory storage, `audio/*` filter, 25MB cap) → `voiceController.transcribeAudio` → `voiceEngine.transcribe`. `server/src/services/sessionService.js` is a separate in-memory Map for voice-call session state (`startSession`/`endSession`); it's independent of `memory/conversationMemory.js` and not required for `/transcribe` — a `sessionId` in the request body is only validated if present.

On the frontend, `pages/Chat.jsx`'s mic button records via `MediaRecorder` (`getUserMedia`), and on stop re-encodes the clip to WAV client-side (`lib/audioEncoder.js`, via `AudioContext.decodeAudioData` + manual PCM WAV writer) before uploading through `api/voice.js`. This exists because Gemini's documented audio support is wav/mp3/aiff/aac/ogg/flac — not the `audio/webm;codecs=opus` that Chrome/Firefox's `MediaRecorder` produces by default — so the client normalizes the format rather than gambling on webm being accepted. The resulting transcript is fed into the same `handleSend` used for typed messages (same `chatService.sendMessage` call, same session id, same chat history), so a voice turn and a typed turn are indistinguishable to the backend. `components/ui/VoiceWaveform.jsx` draws a live canvas equalizer from the mic stream's `AnalyserNode` while recording (not tied to React state, redrawn via its own `requestAnimationFrame` loop).

`voiceEngine.speak` (text-to-speech, `/api/v1/voice/speak`) is a stub that returns `success: false` — no TTS provider is wired up yet.

### Google Calendar
`config/googleCalendar.js` authenticates via a service-account JSON (path from `GOOGLE_APPLICATION_CREDENTIALS`). `services/bookingService.js` wraps list/insert/patch/delete calendar operations and slot-finding, all in the `Asia/Kolkata` timezone. Both the REST routes (`bookingRoutes.js`, for the frontend's manual booking UI) and the agent tools (`bookingTools.js`, for the LLM) call into this same service.

### Frontend structure
`client/src/App.jsx` defines routes: `/` (Landing, no layout) and `/chat`, `/booking`, `/knowledge`, `/dashboard`, `/analytics`, `/settings` (wrapped in `components/layout/Layout.jsx`, which renders the desktop sidebar / mobile bottom nav). All API calls go through `apiRequest` in `client/src/api/client.js`. UI primitives under `components/ui/` are shadcn/ui-style components; styling is Tailwind CSS v4 with light/dark theme state in `lib/theme.jsx`.

`pages/Chat.jsx` owns the mic-based voice input UI: recording/transcribing state swaps the message textarea for either a live `VoiceWaveform` (dark pill, white bars) or a "Transcribing…" indicator — see the Voice input section above for the full record → encode → transcribe → send flow.

## Known naming/typo quirks (intentional, don't "fix" without reason)
- `server/src/routes/HelthRoutes.js` — filename typo, but it's the real health-check route file, imported as `healthRoutes` in `server.js`.
- Some env vars have inconsistent naming across `.env.example`/README (e.g. `GOOGOLE_CLANDER_API`) — check `server/src/config/` for what's actually read before trusting docs.

## Docs in this repo
`README.md` and `PROJECT_ARCH_AND_STATUS.md` at the repo root are useful for the original design intent, screenshots, and env var lists, but both describe an earlier implementation state (e.g. they say calendar/RAG tools and session memory are "not yet integrated" — they now are; they also describe a direct Gemini chat model rather than the current OpenRouter setup). Prefer reading the actual source over trusting those documents for current behavior.
