const conversations = new Map();

const MAX_MESSAGES = 20;

export const createSession = (sessionId, systemMessage) => {
    if (!conversations.has(sessionId)) {
        conversations.set(sessionId, [systemMessage]);
    }
};

export const getHistory = (sessionId) => {
    return conversations.get(sessionId) || [];
};

export const addMessage = (sessionId, message) => {
    const history = conversations.get(sessionId);

    if (!history) {
        throw new Error(`Session '${sessionId}' not found.`);
    }

    history.push(message);

    // Keep SystemMessage + latest messages
    if (history.length > MAX_MESSAGES + 1) {
        conversations.set(sessionId, [
            history[0],
            ...history.slice(-MAX_MESSAGES),
        ]);
    }
};

export const clearSession = (sessionId) => {
    conversations.delete(sessionId);
};

export const hasSession = (sessionId) => {
    return conversations.has(sessionId);
};

export const getSessionCount = () => {
    return conversations.size;
};