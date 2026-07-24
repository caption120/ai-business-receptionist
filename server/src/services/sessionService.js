// server/src/services/sessionService.js

import crypto from "crypto";

const sessions = new Map();

export const createSession = () => {
    const sessionId = `voice_${crypto.randomUUID()}`;

    const session = {
        sessionId,
        status: "ACTIVE",
        createdAt: new Date(),
    };

    sessions.set(sessionId, session);

    return session;
};

export const getSession = (sessionId) => {
    return sessions.get(sessionId);
};

export const updateSession = (sessionId, updates) => {
    const session = sessions.get(sessionId);

    if (!session) {
        return null;
    }

    const updatedSession = {
        ...session,
        ...updates,
    };

    sessions.set(sessionId, updatedSession);

    return updatedSession;
};

export const deleteSession = (sessionId) => {
    return sessions.delete(sessionId);
};
