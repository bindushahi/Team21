import { useState, useEffect } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────
const ANON_NAMES = [
  "Silent Sparrow","Wandering Cloud","Quiet Storm","Hidden Flame",
  "Lone Petal","Fading Echo","Gentle Ghost","Midnight Ink",
  "Nameless Star","Broken Compass","Soft Thunder","Paper Crane",
  "Hollow Moon","Dim Lantern","Pale Comet","Forgotten Song",
];
const TAGS = ["school","friends","family","feelings","secret","advice","rant","love","stress","other"];
const TAG_COLORS = {
  school:"#16a34a",friends:"#2563eb",family:"#db2777",feelings:"#9333ea",
  secret:"#ea580c",advice:"#059669",rant:"#dc2626",love:"#ec4899",
  stress:"#ca8a04",other:"#64748b",
};

function randomAnon() { return ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)]; }
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
function genId() { return Math.random().toString(36).slice(2,10); }

// responsive hook
function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

const SEED_POSTS = [
  { id: genId(), author: "Hollow Moon",     tag: "feelings", title: "I cry in the bathroom between classes",       body: "Nobody knows. I just needed to say it somewhere. Some days the weight of pretending to be okay is heavier than anything.", likes: 42, comments: [], ts: Date.now() - 3600000*2 },
  { id: genId(), author: "Silent Sparrow",  tag: "school",   title: "I haven't done homework in 3 weeks",          body: "And somehow I'm still passing. I don't know how I feel about that. Guilty? Relieved? Both?", likes: 87, comments: [], ts: Date.now() - 3600000*5 },
  { id: genId(), author: "Wandering Cloud", tag: "secret",   title: "I lied about where I was last night",         body: "I just needed a few hours alone. Is that so bad? I love everyone around me but sometimes the silence is the only thing that feels real.", likes: 31, comments: [], ts: Date.now() - 86400000 },
  { id: genId(), author: "Broken Compass",  tag: "friends",  title: "My best friend doesn't know I'm struggling",  body: "We talk every day and I still haven't told them. I don't know why. Maybe I don't want to change how they see me.", likes: 54, comments: [], ts: Date.now() - 86400000*2 },
  { id: genId(), author: "Gentle Ghost",    tag: "love",     title: "I still think about them every single day",   body: "It's been eight months. I thought it would fade. It hasn't. Every song, every smell. I'm so tired of it.", likes: 119, comments: [], ts: Date.now() - 86400000*3 },
  { id: genId(), author: "Paper Crane",     tag: "rant",     title: "Why does nobody talk about how exhausting school actually is", body: "Not the work. The performance. Smiling, being ON, making people comfortable. I go home and I have nothing left.", likes: 76, comments: [], ts: Date.now() - 86400000*4 },
];

// ── theme ─────────────────────────────────────────────────────────────────────
function getTheme(dark) {
  return dark ? {
    pageBg:           "linear-gradient(135deg,#020617 0%,#0c1322 50%,#120a1e 100%)",
    sidebarBg:        "rgba(10,17,33,0.7)",
    sidebarBorder:    "rgba(255,255,255,0.06)",
    cardBg:           "rgba(15,23,42,0.8)",
    cardBorder:       "rgba(255,255,255,0.07)",
    cardHover:        "rgba(255,255,255,0.13)",
    inputBg:          "rgba(255,255,255,0.05)",
    inputBorder:      "rgba(255,255,255,0.1)",
    modalBg:          "linear-gradient(160deg,#0f172a,#1a2540)",
    modalBorder:      "rgba(255,255,255,0.1)",
    heading:          "#f1f5f9",
    body:             "#94a3b8",
    sub:              "#475569",
    muted:            "#1e293b",
    tagActiveBg:      (c) => c+"25",
    tagActiveColor:   (c) => c,
    tagInactiveBg:    "rgba(255,255,255,0.04)",
    tagInactiveColor: "#475569",
    tagInactiveBorder:"rgba(255,255,255,0.08)",
    btnBg:            "linear-gradient(135deg,#1e293b,#2d3f5a)",
    btnBorder:        "rgba(255,255,255,0.12)",
    btnColor:         "#f1f5f9",
    accentBtnBg:      "linear-gradient(135deg,#4f46e5,#7c3aed)",
    accentBtnColor:   "#fff",
    closeBg:          "rgba(255,255,255,0.05)",
    closeBorder:      "rgba(255,255,255,0.08)",
    closeColor:       "#64748b",
    sortActiveBg:     "rgba(255,255,255,0.1)",
    sortColor:        "#f1f5f9",
    scrollThumb:      "rgba(255,255,255,0.1)",
    commentBorder:    "rgba(255,255,255,0.07)",
    likedBg:          "rgba(248,113,113,0.15)",
    likedBorder:      "rgba(248,113,113,0.35)",
    blob1: "rgba(99,102,241,0.15)", blob2: "rgba(236,72,153,0.1)", blob3: "rgba(6,182,212,0.07)",
  } : {
    pageBg:           "linear-gradient(135deg,#f0f9ff 0%,#fafafa 50%,#fdf4ff 100%)",
    sidebarBg:        "rgba(255,255,255,0.7)",
    sidebarBorder:    "rgba(0,0,0,0.06)",
    cardBg:           "rgba(255,255,255,0.9)",
    cardBorder:       "rgba(0,0,0,0.07)",
    cardHover:        "rgba(0,0,0,0.12)",
    inputBg:          "rgba(0,0,0,0.03)",
    inputBorder:      "rgba(0,0,0,0.1)",
    modalBg:          "linear-gradient(160deg,#ffffff,#f8fafc)",
    modalBorder:      "rgba(0,0,0,0.09)",
    heading:          "#0f172a",
    body:             "#475569",
    sub:              "#94a3b8",
    muted:            "#e2e8f0",
    tagActiveBg:      (c) => c+"18",
    tagActiveColor:   (c) => c,
    tagInactiveBg:    "rgba(0,0,0,0.04)",
    tagInactiveColor: "#94a3b8",
    tagInactiveBorder:"rgba(0,0,0,0.07)",
    btnBg:            "linear-gradient(135deg,#1e293b,#334155)",
    btnBorder:        "rgba(0,0,0,0.1)",
    btnColor:         "#f8fafc",
    accentBtnBg:      "linear-gradient(135deg,#4f46e5,#7c3aed)",
    accentBtnColor:   "#fff",
    closeBg:          "rgba(0,0,0,0.05)",
    closeBorder:      "rgba(0,0,0,0.07)",
    closeColor:       "#94a3b8",
    sortActiveBg:     "rgba(0,0,0,0.08)",
    sortColor:        "#0f172a",
    scrollThumb:      "rgba(0,0,0,0.1)",
    commentBorder:    "rgba(0,0,0,0.07)",
    likedBg:          "rgba(220,38,38,0.08)",
    likedBorder:      "rgba(220,38,38,0.25)",
    blob1: "rgba(99,102,241,0.07)", blob2: "rgba(236,72,153,0.05)", blob3: "rgba(6,182,212,0.04)",
  };
}

// ── TagPill ───────────────────────────────────────────────────────────────────
function TagPill({ tag, small }) {
  return (
    <span style={{
      background: TAG_COLORS[tag]+"18", color: TAG_COLORS[tag],
      border: `1px solid ${TAG_COLORS[tag]}40`, borderRadius: 99,
      padding: small ? "1px 8px" : "3px 11px",
      fontSize: small ? 10 : 11, fontWeight: 600,
      letterSpacing: "0.04em", textTransform: "uppercase",
    }}>{tag}</span>
  );
}

// ── CommentSection ────────────────────────────────────────────────────────────
function CommentSection({ comments, onAdd, t }) {
  const [text, setText] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({ id: genId(), author: randomAnon(), body: text.trim(), ts: Date.now() });
    setText("");
  }
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.commentBorder}` }}>
      {comments.map(c => (
        <div key={c.id} style={{ borderLeft: `2px solid ${t.commentBorder}`, paddingLeft: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: t.sub, fontFamily: "'DM Mono',monospace" }}>{c.author} · {timeAgo(c.ts)}</span>
          <p style={{ fontSize: 13, color: t.body, margin: "3px 0 0", lineHeight: 1.55 }}>{c.body}</p>
        </div>
      ))}
      <form onSubmit={submit} style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Reply anonymously…"
          style={{ flex: 1, background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: "7px 12px", color: t.heading, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
        <button type="submit" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: "7px 14px", color: t.sub, fontSize: 13, cursor: "pointer" }}>↩</button>
      </form>
    </div>
  );
}

// ── PostCard ──────────────────────────────────────────────────────────────────
function PostCard({ post, onLike, onComment, t }) {
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div
      style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 18, padding: "20px 24px", backdropFilter: "blur(20px)", transition: "border-color 0.2s,box-shadow 0.2s", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = t.cardHover; e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${TAG_COLORS[post.tag]}55,${TAG_COLORS[post.tag]}18)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: TAG_COLORS[post.tag], fontWeight: 700, border: `1px solid ${TAG_COLORS[post.tag]}40`, flexShrink: 0 }}>
            {post.author[0]}
          </div>
          <div>
            <span style={{ fontSize: 12, color: t.sub, fontFamily: "'DM Mono',monospace" }}>{post.author}</span>
            <span style={{ fontSize: 11, color: t.muted, margin: "0 6px" }}>·</span>
            <span style={{ fontSize: 11, color: t.muted, fontFamily: "'DM Mono',monospace" }}>{timeAgo(post.ts)}</span>
          </div>
        </div>
        <TagPill tag={post.tag} small />
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, color: t.heading, margin: "0 0 8px", lineHeight: 1.4, fontFamily: "'Lora',serif" }}>{post.title}</h3>
      <p style={{ fontSize: 14, color: t.body, lineHeight: 1.65, margin: 0, display: "-webkit-box", WebkitLineClamp: open ? "unset" : 3, WebkitBoxOrient: "vertical", overflow: open ? "visible" : "hidden" }}>{post.body}</p>
      {post.body.length > 100 && (
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", color: t.sub, fontSize: 11, cursor: "pointer", padding: "4px 0 0", fontFamily: "'DM Mono',monospace" }}>{open ? "show less ↑" : "read more ↓"}</button>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center" }}>
        <button onClick={() => { if (!liked) { setLiked(true); onLike(post.id); } }} style={{ background: liked ? t.likedBg : t.inputBg, border: `1px solid ${liked ? t.likedBorder : t.inputBorder}`, borderRadius: 99, padding: "5px 14px", color: liked ? "#dc2626" : t.sub, fontSize: 12, cursor: liked ? "default" : "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s", fontFamily: "'DM Mono',monospace" }}>
          {liked ? "♥" : "♡"} {post.likes}
        </button>
        <button onClick={() => setOpen(o => !o)} style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 99, padding: "5px 14px", color: t.sub, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Mono',monospace" }}>
          💬 {post.comments.length}
        </button>
      </div>

      {open && <CommentSection comments={post.comments} onAdd={(c) => onComment(post.id, c)} t={t} />}
    </div>
  );
}

// ── NewPostModal ──────────────────────────────────────────────────────────────
function NewPostModal({ onClose, onSubmit, t }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("feelings");

  function submit(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSubmit({ title: title.trim(), body: body.trim(), tag });
    onClose();
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520, background: t.modalBg, border: `1px solid ${t.modalBorder}`, borderRadius: 22, padding: "32px 32px 28px", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: t.closeBg, border: `1px solid ${t.closeBorder}`, borderRadius: 8, width: 30, height: 30, color: t.closeColor, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: t.heading, fontFamily: "'Lora',serif" }}>Confess Anonymously</h2>
        <p style={{ fontSize: 12, color: t.sub, margin: "0 0 22px", fontFamily: "'DM Mono',monospace" }}>No name. No judgment. Just honesty.</p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {TAGS.map(tg => (
              <button key={tg} type="button" onClick={() => setTag(tg)} style={{ background: tag === tg ? t.tagActiveBg(TAG_COLORS[tg]) : t.tagInactiveBg, border: `1px solid ${tag === tg ? TAG_COLORS[tg]+"55" : t.tagInactiveBorder}`, borderRadius: 99, padding: "5px 13px", color: tag === tg ? t.tagActiveColor(TAG_COLORS[tg]) : t.tagInactiveColor, fontSize: 11, cursor: "pointer", fontWeight: tag === tg ? 700 : 400, transition: "all 0.15s", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'DM Mono',monospace" }}>{tg}</button>
            ))}
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Give it a title…" maxLength={120}
            style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 11, padding: "11px 15px", color: t.heading, fontSize: 15, outline: "none", fontFamily: "'Lora',serif", fontWeight: 600 }} />
          <textarea value={body} onChange={e => setBody(e.target.value)} required rows={6} placeholder="What's on your mind? No one will know it's you…"
            style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 11, padding: "11px 15px", color: t.body, fontSize: 14, outline: "none", resize: "vertical", lineHeight: 1.65, fontFamily: "inherit" }} />
          <button type="submit" disabled={!title.trim() || !body.trim()} style={{ background: t.accentBtnBg, border: "none", borderRadius: 11, padding: 13, color: t.accentBtnColor, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: (!title.trim() || !body.trim()) ? 0.4 : 1, fontFamily: "'Lora',serif", transition: "opacity 0.2s,box-shadow 0.2s", boxShadow: "0 4px 20px rgba(79,70,229,0.35)" }}>
            Post Confession →
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ posts, activeTag, setActiveTag, dark, setDark, onClose, setShowNew, t }) {
  const totalPosts = posts.length;
  const topTags = [...TAGS].sort((a, b) => posts.filter(p => p.tag === b).length - posts.filter(p => p.tag === a).length).slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Branding */}
      <div style={{ background: t.sidebarBg, border: `1px solid ${t.sidebarBorder}`, borderRadius: 18, padding: "22px 20px", backdropFilter: "blur(20px)" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: t.heading, fontFamily: "'Lora',serif", letterSpacing: "-0.02em" }}>🕯️ Whisper Board</h1>
        <p style={{ margin: "0 0 16px", fontSize: 11, color: t.sub, fontFamily: "'DM Mono',monospace" }}>anonymous · no login · no trace</p>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, textAlign: "center", background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 10, padding: "10px 8px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: t.heading, fontFamily: "'Lora',serif" }}>{totalPosts}</div>
            <div style={{ fontSize: 10, color: t.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>confessions</div>
          </div>
          <div style={{ flex: 1, textAlign: "center", background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 10, padding: "10px 8px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: t.heading, fontFamily: "'Lora',serif" }}>{posts.reduce((a, p) => a + p.likes, 0)}</div>
            <div style={{ fontSize: 10, color: t.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>hearts</div>
          </div>
        </div>
      </div>

      {/* Post button */}
      <button onClick={() => setShowNew(true)} style={{ background: t.accentBtnBg, border: "none", borderRadius: 14, padding: "13px 20px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Lora',serif", boxShadow: "0 4px 20px rgba(79,70,229,0.3)", letterSpacing: "0.01em" }}>
        ✦ Post a Confession
      </button>

      {/* Categories */}
      <div style={{ background: t.sidebarBg, border: `1px solid ${t.sidebarBorder}`, borderRadius: 18, padding: "18px 20px", backdropFilter: "blur(20px)" }}>
        <p style={{ margin: "0 0 12px", fontSize: 10, color: t.sub, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Categories</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button onClick={() => setActiveTag("all")} style={{ background: activeTag === "all" ? t.sortActiveBg : "transparent", border: "none", borderRadius: 8, padding: "8px 10px", color: activeTag === "all" ? t.sortColor : t.sub, fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: activeTag === "all" ? 700 : 400, display: "flex", justifyContent: "space-between", transition: "all 0.15s" }}>
            <span>All posts</span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>{totalPosts}</span>
          </button>
          {TAGS.map(tg => {
            const count = posts.filter(p => p.tag === tg).length;
            if (count === 0) return null;
            return (
              <button key={tg} onClick={() => setActiveTag(tg === activeTag ? "all" : tg)} style={{ background: activeTag === tg ? t.tagActiveBg(TAG_COLORS[tg]) : "transparent", border: "none", borderRadius: 8, padding: "8px 10px", color: activeTag === tg ? t.tagActiveColor(TAG_COLORS[tg]) : t.sub, fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: activeTag === tg ? 700 : 400, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.15s" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: TAG_COLORS[tg], display: "inline-block" }} />
                  {tg}
                </span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme + close */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setDark(d => !d)} style={{ flex: 1, background: t.closeBg, border: `1px solid ${t.closeBorder}`, borderRadius: 11, padding: "9px 14px", color: t.heading, fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace", fontWeight: 500, transition: "all 0.2s" }}>
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
        {onClose && (
          <button onClick={onClose} style={{ background: t.closeBg, border: `1px solid ${t.closeBorder}`, borderRadius: 11, padding: "9px 16px", color: t.closeColor, fontSize: 12, cursor: "pointer" }}>✕ Close</button>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ConfessionBoard({ onClose }) {
  const [dark, setDark] = useState(true);
  const [posts, setPosts] = useState(SEED_POSTS);
  const [showNew, setShowNew] = useState(false);
  const [activeTag, setActiveTag] = useState("all");
  const [sort, setSort] = useState("new");
  const [search, setSearch] = useState("");
  const width = useWindowWidth();

  const t = getTheme(dark);
  const isDesktop = width >= 1024;
  const isTablet  = width >= 640 && width < 1024;

  function handleNewPost({ title, body, tag }) {
    setPosts(prev => [{ id: genId(), author: randomAnon(), tag, title, body, likes: 0, comments: [], ts: Date.now() }, ...prev]);
  }
  function handleLike(id) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  }
  function handleComment(id, comment) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, comment] } : p));
  }

  const filtered = posts
    .filter(p => activeTag === "all" || p.tag === activeTag)
    .filter(p => !search.trim() || p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "top" ? b.likes - a.likes : b.ts - a.ts);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .wb-root { transition: background 0.3s; }
        .wb-root::-webkit-scrollbar { width: 5px; }
        .wb-root::-webkit-scrollbar-track { background: transparent; }
        .wb-root::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 5px; }
        textarea, input { font-family: inherit; }
      `}</style>

      {/* Root */}
      <div className="wb-root" style={{ position: "fixed", inset: 0, zIndex: 50, background: t.pageBg, overflowY: "auto" }}>

        {/* Ambient blobs */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "-10%", left: "-5%",  width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle,${t.blob1},transparent 65%)`, filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,${t.blob2},transparent 65%)`, filter: "blur(60px)" }} />
          <div style={{ position: "absolute", top: "40%",  left: "50%",  width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${t.blob3},transparent 65%)`, filter: "blur(60px)" }} />
        </div>

        {/* Layout */}
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: isDesktop ? 1280 : isTablet ? 900 : 600,
          margin: "0 auto",
          padding: isDesktop ? "32px 40px" : isTablet ? "24px 28px" : "16px 16px",
          display: isDesktop ? "grid" : "block",
          gridTemplateColumns: isDesktop ? "260px 1fr" : undefined,
          gap: isDesktop ? 28 : undefined,
          alignItems: "start",
        }}>

          {/* ── Sidebar (desktop) / Top bar (mobile+tablet) ── */}
          {isDesktop ? (
            <div style={{ position: "sticky", top: 32 }}>
              <Sidebar posts={posts} activeTag={activeTag} setActiveTag={setActiveTag} dark={dark} setDark={setDark} onClose={onClose} setShowNew={setShowNew} t={t} />
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              {/* Mobile header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: t.heading, fontFamily: "'Lora',serif" }}>🕯️ Whisper Board</h1>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: t.sub, fontFamily: "'DM Mono',monospace" }}>anonymous · no login · no trace</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setDark(d => !d)} style={{ background: t.closeBg, border: `1px solid ${t.closeBorder}`, borderRadius: 9, padding: "7px 12px", color: t.heading, fontSize: 12, cursor: "pointer" }}>{dark ? "☀️" : "🌙"}</button>
                  {onClose && <button onClick={onClose} style={{ background: t.closeBg, border: `1px solid ${t.closeBorder}`, borderRadius: 9, padding: "7px 12px", color: t.closeColor, fontSize: 12, cursor: "pointer" }}>✕</button>}
                  <button onClick={() => setShowNew(true)} style={{ background: t.accentBtnBg, border: "none", borderRadius: 9, padding: "7px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Confess</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Main feed ── */}
          <div>
            {/* Search + sort */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search confessions…"
                style={{ flex: 1, background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 11, padding: "10px 16px", color: t.heading, fontSize: 13, outline: "none" }} />
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {["new","top"].map(s => (
                  <button key={s} onClick={() => setSort(s)} style={{ background: sort === s ? t.sortActiveBg : t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 9, padding: "9px 14px", color: sort === s ? t.sortColor : t.sub, fontSize: 12, cursor: "pointer", fontWeight: sort === s ? 700 : 400, fontFamily: "'DM Mono',monospace" }}>
                    {s === "new" ? "🕐 New" : "🔥 Top"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag filter pills (mobile/tablet only — desktop uses sidebar) */}
            {!isDesktop && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                <button onClick={() => setActiveTag("all")} style={{ background: activeTag === "all" ? t.sortActiveBg : t.tagInactiveBg, border: `1px solid ${t.tagInactiveBorder}`, borderRadius: 99, padding: "4px 12px", color: activeTag === "all" ? t.sortColor : t.tagInactiveColor, fontSize: 11, cursor: "pointer", fontWeight: activeTag === "all" ? 700 : 400 }}>all</button>
                {TAGS.map(tg => (
                  <button key={tg} onClick={() => setActiveTag(tg === activeTag ? "all" : tg)} style={{ background: activeTag === tg ? t.tagActiveBg(TAG_COLORS[tg]) : t.tagInactiveBg, border: `1px solid ${activeTag === tg ? TAG_COLORS[tg]+"55" : t.tagInactiveBorder}`, borderRadius: 99, padding: "4px 10px", color: activeTag === tg ? t.tagActiveColor(TAG_COLORS[tg]) : t.tagInactiveColor, fontSize: 11, cursor: "pointer", fontWeight: activeTag === tg ? 700 : 400, textTransform: "uppercase", letterSpacing: "0.04em" }}>{tg}</button>
                ))}
              </div>
            )}

            {/* Active filter label */}
            {activeTag !== "all" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <TagPill tag={activeTag} />
                <span style={{ fontSize: 12, color: t.sub }}>{filtered.length} post{filtered.length !== 1 ? "s" : ""}</span>
                <button onClick={() => setActiveTag("all")} style={{ background: "none", border: "none", color: t.sub, fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>clear ✕</button>
              </div>
            )}

            {/* Posts grid — 2 cols on large desktop */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isDesktop && width >= 1200 ? "1fr 1fr" : "1fr",
              gap: 14,
            }}>
              {filtered.length === 0 ? (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "64px 0", color: t.sub }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🌑</div>
                  <p style={{ fontSize: 14 }}>No confessions here yet. Be the first.</p>
                </div>
              ) : filtered.map(post => (
                <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} t={t} />
              ))}
            </div>

            <p style={{ textAlign: "center", marginTop: 40, fontSize: 10, color: t.sub, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              no data stored · no accounts · just whispers
            </p>
          </div>
        </div>
      </div>

      {showNew && <NewPostModal onClose={() => setShowNew(false)} onSubmit={handleNewPost} t={t} />}
    </>
  );
}