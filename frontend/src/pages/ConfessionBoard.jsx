import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, Search, Sparkles, Moon, Sun, X } from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
const ANON_NAMES = [
  "Silent Sparrow","Wandering Cloud","Quiet Storm","Hidden Flame",
  "Lone Petal","Fading Echo","Gentle Ghost","Midnight Ink",
  "Nameless Star","Broken Compass","Soft Thunder","Paper Crane",
  "Hollow Moon","Dim Lantern","Pale Comet","Forgotten Song",
];
const TAGS = ["school","friends","family","feelings","secret","advice","rant","love","stress","other"];
const TAG_COLORS = {
  school:"bg-green-500/10 text-green-500 border-green-500/20",
  friends:"bg-blue-500/10 text-blue-500 border-blue-500/20",
  family:"bg-pink-500/10 text-pink-500 border-pink-500/20",
  feelings:"bg-purple-500/10 text-purple-500 border-purple-500/20",
  secret:"bg-orange-500/10 text-orange-500 border-orange-500/20",
  advice:"bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rant:"bg-red-500/10 text-red-500 border-red-500/20",
  love:"bg-rose-500/10 text-rose-500 border-rose-500/20",
  stress:"bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  other:"bg-slate-500/10 text-slate-500 border-slate-500/20",
};

function randomAnon() { return ANON_NAMES[Math.floor(Math.random() * ANON_NAMES.length)]; }
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

// ── Components ────────────────────────────────────────────────────────────────

function TagPill({ tag }) {
  const cn = TAG_COLORS[tag] || TAG_COLORS.other;
  return (
    <Badge variant="outline" className={`lowercase font-semibold rounded-full px-3 py-0.5 ${cn} uppercase tracking-wider text-[10px]`}>
      {tag}
    </Badge>
  );
}

function CommentSection({ comments, onAdd }) {
  const [text, setText] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({ author: randomAnon(), body: text.trim() });
    setText("");
  }
  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <ScrollArea className="max-h-52 pr-4">
        <div className="flex flex-col gap-3">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-3 text-sm border-l-2 border-primary/20 pl-3">
              <Avatar className="w-6 h-6 border bg-muted">
                <AvatarFallback className="text-[10px]">{c.author[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{c.author}</span>
                  <span className="text-[10px] text-muted-foreground/60">{timeAgo(c.ts)}</span>
                </div>
                <p className="text-secondary-foreground mt-1 leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={submit} className="flex gap-2 mt-4">
        <Input 
          className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 text-xs" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Reply anonymously..." 
        />
        <Button size="sm" variant="secondary" type="submit" className="text-xs">Reply</Button>
      </form>
    </div>
  );
}

function PostCard({ post, onLike, onComment }) {
  const [open, setOpen] = useState(false);
  const liked = post.liked || false;

  return (
    <Card className="rounded-2xl border-border/40 bg-card/60 backdrop-blur-xl shadow-none hover:shadow-xl hover:border-border/80 transition-all duration-300 overflow-hidden flex flex-col group">
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border bg-gradient-to-br from-primary/10 to-primary/5 ring-2 ring-background">
              <AvatarFallback className="font-bold text-primary">{post.author[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-tight text-muted-foreground">{post.author}</span>
              <span className="text-xs text-muted-foreground/60 font-medium">{timeAgo(post.ts)}</span>
            </div>
          </div>
          <TagPill tag={post.tag} />
        </div>
        <CardTitle className="text-xl font-bold font-serif leading-snug mt-4 text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 pb-4">
        <p className={`text-muted-foreground text-sm leading-relaxed ${!open && "line-clamp-3"}`}>
          {post.body}
        </p>
        {post.body.length > 120 && (
          <button onClick={() => setOpen(o => !o)} className="text-primary hover:text-primary/80 text-xs font-semibold mt-2 focus:outline-none flex items-center gap-1 transition-colors">
            {open ? "Read less" : "Read more"}
          </button>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex-col items-stretch gap-4 pb-5">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onLike(post.id)}
            className={`rounded-full shadow-none border-border/50 text-xs gap-2 transition-colors ${liked ? "bg-red-500/15 border-red-500/30 text-red-600 hover:bg-red-500/25 hover:text-red-700" : "hover:bg-primary/5"}`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500" : ""}`} />
            {post.likes}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setOpen(o => !o)}
            className="rounded-full shadow-none border-border/50 text-xs gap-2 hover:bg-primary/5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {post.comments.length}
          </Button>
        </div>
        {open && <CommentSection comments={post.comments} onAdd={(c) => onComment(post.id, c)} />}
      </CardFooter>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ConfessionBoard({ onClose }) {
  const [posts, setPosts] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [activeTag, setActiveTag] = useState("all");
  const [sort, setSort] = useState("new");
  const [search, setSearch] = useState("");
  
  // New post modal state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("feelings");

  // Sync dark mode class on document element so shadcn colors shift correctly
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const [sessionId] = useState(() => {
    let sid = localStorage.getItem("confession_sid");
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("confession_sid", sid);
    }
    return sid;
  });

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/confessions/?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(p => ({
            ...p,
            ts: new Date(p.created_at).getTime(),
            comments: p.comments.map(c => ({
                 ...c,
                 body: c.text,
                 ts: new Date(c.created_at).getTime()
            }))
        }));
        setPosts(mapped);
      })
      .catch(e => console.error(e));
  }, [sessionId]);

  async function handleNewPost(e) {
    if (e) e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      const res = await fetch("http://127.0.0.1:8000/api/confessions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: randomAnon(), title, body, tag })
      });
      if (res.ok) {
        const newPost = await res.json();
        const mappedPost = {
            ...newPost,
            ts: new Date(newPost.created_at).getTime(),
            liked: false,
            comments: []
        };
        setPosts(prev => [mappedPost, ...prev]);
        setShowNew(false);
        setTitle(""); setBody(""); setTag("feelings");
      }
    } catch(e) { console.error(e); }
  }

  async function handleLike(id) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/confessions/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: data.likes, liked: data.liked } : p));
      }
    } catch(e) { console.error(e); }
  }

  async function handleComment(id, commentData) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/confessions/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentData)
      });
      if (res.ok) {
        const c = await res.json();
        const mappedComment = {
            id: c.id,
            author: c.author,
            body: c.text,
            ts: new Date(c.created_at).getTime()
        };
        setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, mappedComment] } : p));
      }
    } catch(e) { console.error(e); }
  }

  const filtered = posts
    .filter(p => activeTag === "all" || p.tag === activeTag)
    .filter(p => !search.trim() || p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "top" ? b.likes - a.likes : b.ts - a.ts);

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 font-sans selection:bg-primary/20">
      
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-pink-500/10 dark:bg-pink-500/15 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <aside className="w-full lg:w-72 lg:shrink-0 flex flex-col gap-6 lg:sticky lg:top-8 h-fit">
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-lg shadow-indigo-500/5">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" /> Whispers
                  </h1>
                  <p className="text-xs text-muted-foreground font-mono mt-1 uppercase tracking-wider">anonymous space</p>
                </div>
                {onClose && (
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mr-2">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl p-3 text-center border border-border/50">
                  <div className="text-2xl font-black text-foreground">{posts.length}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Posts</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center border border-border/50">
                  <div className="text-2xl font-black text-foreground">{posts.reduce((a, p) => a + p.likes, 0)}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Hearts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dialog for New Post */}
          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xl shadow-indigo-600/20 font-semibold tracking-wide transition-all active:scale-95">
                Drop a Confession
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-3xl border-border/50 rounded-3xl p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-serif">Leave your mark.</DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  No trace. No login. True anonymity.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewPost} className="space-y-6 mt-2">
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tg => (
                    <button 
                      key={tg} 
                      type="button" 
                      onClick={() => setTag(tg)} 
                      className={`px-3 py-1 text-xs rounded-full border transition-all uppercase tracking-wider font-semibold ${
                        tag === tg 
                          ? TAG_COLORS[tg] + " ring-2 ring-primary/20 ring-offset-2 ring-offset-background" 
                          : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                      }`}
                    >
                      {tg}
                    </button>
                  ))}
                </div>
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Give it a title..." 
                  maxLength={100}
                  className="text-base font-semibold border-border/50 focus-visible:ring-indigo-500/50 rounded-xl h-12 bg-muted/20"
                />
                <Textarea 
                  value={body} 
                  onChange={e => setBody(e.target.value)} 
                  placeholder="What's heavily weighing on your mind?" 
                  rows={5}
                  className="resize-none text-sm leading-relaxed border-border/50 focus-visible:ring-indigo-500/50 rounded-xl bg-muted/20"
                />
                <Button 
                  type="submit" 
                  disabled={!title.trim() || !body.trim()}
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-base shadow-lg shadow-indigo-600/25 transition-all text-white"
                >
                  Post Confession
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-lg shadow-indigo-500/5 hidden lg:block">
            <CardHeader className="pb-3 pt-5">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 pb-5">
              <Button 
                variant="ghost" 
                onClick={() => setActiveTag("all")} 
                className={`justify-between rounded-lg h-9 px-3 ${activeTag === "all" ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted"}`}
              >
                All feeds 
                <span className="opacity-50 text-xs font-mono">{posts.length}</span>
              </Button>
              {TAGS.map(tg => {
                const count = posts.filter(p => p.tag === tg).length;
                if (count === 0) return null;
                return (
                  <Button 
                    key={tg}
                    variant="ghost" 
                    onClick={() => setActiveTag(tg)} 
                    className={`justify-between rounded-lg h-9 px-3 ${activeTag === tg ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <span className="capitalize">{tg}</span>
                    <span className="opacity-50 text-xs font-mono">{count}</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
          
          <Button variant="outline" onClick={() => setIsDark(!isDark)} className="rounded-xl border-border/50 shadow-none hidden lg:flex items-center gap-2 text-muted-foreground">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            Toggle Theme
          </Button>

        </aside>

        {/* Main Feed Content */}
        <main className="flex-1 max-w-3xl lg:max-w-none ml-auto mr-auto w-full">
          
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search confessions..." 
                className="pl-10 h-12 bg-card/60 backdrop-blur-md border-border/40 rounded-xl shadow-sm focus-visible:ring-indigo-500/30"
              />
            </div>
            <div className="flex bg-card/60 backdrop-blur-md border border-border/40 rounded-xl p-1 shrink-0 h-12">
              <Button onClick={() => setSort("new")} variant="ghost" size="sm" className={`rounded-lg flex-1 ${sort === "new" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>New</Button>
              <Button onClick={() => setSort("top")} variant="ghost" size="sm" className={`rounded-lg flex-1 ${sort === "top" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Top</Button>
            </div>
          </div>

          <div className="lg:hidden">
            <ScrollArea className="w-full whitespace-nowrap mb-6 pb-2">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setActiveTag("all")} className={`rounded-full shadow-none ${activeTag === "all" ? "bg-primary/10 border-primary/20 text-primary" : ""}`}>All feeds</Button>
                {TAGS.map(tg => {
                  const count = posts.filter(p => p.tag === tg).length;
                  if (count === 0) return null;
                  return (
                    <Button key={tg} size="sm" variant="outline" onClick={() => setActiveTag(tg)} className={`rounded-full shadow-none capitalize ${activeTag === tg ? "bg-primary/10 border-primary/20 text-primary" : ""}`}>{tg}</Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="flex flex-col gap-5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Moon className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-bold">Nothing here yet</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-[200px]">Be the first to leave a whisper in this empty space.</p>
              </div>
            ) : filtered.map(post => (
              <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
            ))}
          </div>
          
          <div className="text-center mt-12 mb-8">
            <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground/50">End of records</p>
          </div>
        </main>
      </div>
    </div>
  );
}