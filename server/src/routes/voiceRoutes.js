import express from "express";
import audioUpload from "../middleware/audioUploadMiddleware.js";
import {
    startSession,
    transcribeAudio,
    generateResponse,
    textToSpeech,
    endSession,
} from "../controllers/voiceController.js";

const router = express.Router();

router.post("/session/start", startSession);
router.post("/transcribe", audioUpload.single("audio"), transcribeAudio);
router.post("/respond", generateResponse);
router.post("/speak", textToSpeech);
router.post("/session/end", endSession);

export default router;
