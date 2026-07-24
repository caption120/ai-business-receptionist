import * as voiceEngine from "../services/voiceEngine.js";

export const startSession = async (req, res, next) => {
    try {
        const result = await voiceEngine.startSession();

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const transcribeAudio = async (req, res, next) => {
    try {
        const result = await voiceEngine.transcribe(req);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const generateResponse = async (req, res, next) => {
    try {
        const result = await voiceEngine.generateResponse(req.body);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const textToSpeech = async (req, res, next) => {
    try {
        const result = await voiceEngine.speak(req.body);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const endSession = async (req, res, next) => {
    try {
        const result = await voiceEngine.endSession(req.body);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
