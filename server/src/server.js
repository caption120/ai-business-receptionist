import "dotenv/config";
import express from "express";
import cors from "cors";
import dns from "dns";
import connectDB from "./config/db.js";
import healthRoutes from "./routes/HelthRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
// import geminiRoutes from "./routes/geminiRoutes.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/booking", bookingRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// app.use("/api/v1/gemini", geminiRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error(" Global Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();