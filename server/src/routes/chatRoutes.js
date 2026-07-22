import express from "express";
import { chatWithPDF } from "../controllers/chatController.js";
import { chat } from "../controllers/chatController.js";
const router = express.Router();

router.post("/", chatWithPDF);
router.post("/", chat);

export default router;