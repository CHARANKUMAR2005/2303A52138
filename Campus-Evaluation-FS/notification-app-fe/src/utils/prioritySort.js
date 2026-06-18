const PRIORITY_SCORES = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function getPriorityScore(type) {
  return PRIORITY_SCORES[type] ?? 0;
}

// Primary sort: priority descending (Placement → Result → Event)
// Secondary sort: timestamp descending (newest first within the same tier)
export function sortNotifications(notifications) {
  return [...notifications].sort((a, b) => {
    const scoreDiff = getPriorityScore(b.type) - getPriorityScore(a.type);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
}
