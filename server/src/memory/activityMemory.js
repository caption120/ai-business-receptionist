const MAX_ACTIVITY = 100;

const activityLog = [];

let counters = {
  conversations: 0,
  documents: 0,
};

export const logActivity = (type, action, target) => {
  activityLog.unshift({
    id: Date.now() + Math.random(),
    type,
    action,
    target,
    timestamp: new Date().toISOString(),
  });

  if (activityLog.length > MAX_ACTIVITY) {
    activityLog.length = MAX_ACTIVITY;
  }
};

export const getRecentActivity = (limit = 10) => {
  return activityLog.slice(0, limit);
};

export const getActivitySince = (sinceDate) => {
  return activityLog.filter((entry) => new Date(entry.timestamp) >= sinceDate);
};

export const incrementCounter = (key) => {
  if (Object.prototype.hasOwnProperty.call(counters, key)) {
    counters[key] += 1;
  }
};

export const getCounters = () => ({ ...counters });
