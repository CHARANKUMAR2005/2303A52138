# Stage 1

## Priority Inbox — Approach & Implementation

### Problem Statement

Students lose track of important notifications due to high volume. A Priority Inbox is required that always displays the top `n` most important unread notifications first. Priority is determined by a combination of **type weight** and **recency**.

---

### Priority Algorithm

| Notification Type | Weight |
|---|---|
| Placement | 3 (highest) |
| Result    | 2 |
| Event     | 1 (lowest) |

**Sort logic:**
1. **Primary:** Sort by weight descending (Placement → Result → Event)
2. **Secondary (tie-break):** Sort by timestamp descending (most recent first within same type)

**Implementation** (`src/utils/prioritySort.js`):

```javascript
const PRIORITY_SCORES = { Placement: 3, Result: 2, Event: 1 };

export function getPriorityScore(type) {
  return PRIORITY_SCORES[type] ?? 0;
}

export function sortNotifications(notifications) {
  return [...notifications].sort((a, b) => {
    const scoreDiff = getPriorityScore(b.type) - getPriorityScore(a.type);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
}
```

---

### Maintaining Top N Efficiently as New Notifications Arrive

Since notifications are fetched from a live API and new ones arrive continuously, the system uses the following strategy:

1. **Fetch all** notifications from the API (with type filter if selected) using `limit=100`.
2. **Sort** the full dataset using the priority algorithm above.
3. **Slice** the top `n` items (user selects n = 10, 15, or 20 via dropdown).
4. **Re-fetch** automatically when the user changes `topN` or `filter` (React `useEffect` dependency).

This approach guarantees the top `n` are always globally correct — not just the best of the current page.

For a real-time production system, the backend would push new notifications via **WebSocket** or **Server-Sent Events (SSE)**. On receiving a push event, the client would merge the new notification into the sorted list and re-slice the top N — an O(1) merge into a sorted structure (min-heap or sorted array).

---

### Top 10 Output Screenshot

See `screenshots/` folder in this repository for output displaying the priority notifications page with real data from the AffordMed evaluation server.

---

### Files Involved

| File | Role |
|---|---|
| `src/utils/prioritySort.js` | Pure priority sort function |
| `src/pages/PriorityPage.jsx` | Priority Inbox UI — fetches, sorts, displays top N |
| `src/api/notifications.js` | Fetches from `GET /evaluation-service/notifications` |
| `src/hooks/useNotifications.js` | Hook that applies sort + pagination for the All Notifications page |
