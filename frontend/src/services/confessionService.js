// frontend/src/services/confessionService.js

const BASE = "http://127.0.0.1:8000/api/confessions";

// ── Session ID — persists in localStorage so likes survive page refresh ───────
export function getSessionId() {
  let id = localStorage.getItem("cb_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cb_session_id", id);
  }
  return id;
}

// ── Posts ─────────────────────────────────────────────────────────────────────
export async function fetchPosts({ tag, search, sort } = {}) {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  params.set("session_id", getSessionId());

  const res = await fetch(`${BASE}/?${params}`);
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}

export async function createPost({ author, title, body, tag }) {
  const res = await fetch(`${BASE}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, title, body, tag }),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}

// ── Likes ─────────────────────────────────────────────────────────────────────
export async function toggleLike(postId) {
  const res = await fetch(`${BASE}/${postId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: getSessionId() }),
  });
  if (!res.ok) throw new Error("Failed to toggle like");
  return res.json(); // { liked: bool, likes: number }
}

// ── Comments ──────────────────────────────────────────────────────────────────
export async function addComment(postId, { author, text }) {
  const res = await fetch(`${BASE}/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, text }),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export async function fetchStats() {
  const res = await fetch(`${BASE}/stats/summary`);
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}
