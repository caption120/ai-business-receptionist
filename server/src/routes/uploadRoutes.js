import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadPDF } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/", (req, res, next) => {
    console.log("Upload route hit.");
    next();
}, upload.single("pdf"), uploadPDF);
export default router;