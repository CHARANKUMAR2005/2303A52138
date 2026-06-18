const STORAGE_KEY = 'affordmed_read_ids';

function getReadSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return new Set();
  }
}

export function isRead(id) {
  return getReadSet().has(id);
}

export function markAsRead(ids) {
  try {
    const current = getReadSet();
    ids.forEach((id) => current.add(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current]));
  } catch {
    // localStorage unavailable — not critical
  }
}
