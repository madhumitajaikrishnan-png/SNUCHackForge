import { useState, useEffect, useRef } from "react";
import { listenToPodFeed, vouchForPost, listenToLeaderboard, toggleGhostMode, addProofPost } from "./firebase/social";

// ── shared helpers ─────────────────────────────────────────────────────────────
function R(s) { return `var(--radius-${s})`; }
function nowTime() { return new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}); }

function Tag({ children, color="muted" }) {
  const C = {
    fire:  { bg:"rgba(255,77,0,0.1)",   border:"rgba(255,77,0,0.25)",   text:"#FF7733" },
    blue:  { bg:"rgba(91,156,246,0.1)", border:"rgba(91,156,246,0.25)", text:"#5B9CF6" },
    green: { bg:"rgba(52,211,153,0.1)", border:"rgba(52,211,153,0.25)", text:"#34D399" },
    gold:  { bg:"rgba(255,179,71,0.1)", border:"rgba(255,179,71,0.25)", text:"#FFB347" },
    red:   { bg:"rgba(248,113,113,0.1)",border:"rgba(248,113,113,0.25)",text:"#F87171" },
    muted: { bg:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.10)", text:"var(--text2)" },
  }[color] || { bg:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.10)", text:"var(--text2)" };
  return (
    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:1.5, padding:"3px 8px",
      borderRadius:20, background:C.bg, border:`1px solid ${C.border}`, color:C.text,
      display:"inline-block", whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

function BackHeader({ title, sub, onBack }) {
  return (
    <div style={{ padding:"16px 20px 14px", borderBottom:"1px solid var(--border)",
      background:"var(--surface)", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10 }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"var(--text2)",
        fontSize:18, cursor:"pointer", padding:4 }}>←</button>
      <div>
        <div style={{ fontSize:14, fontWeight:600 }}>{title}</div>
        {sub && <div style={{ fontSize:9, color:"var(--text3)", fontFamily:"'Space Mono',monospace", letterSpacing:1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Wrap({ children }) {
  return <div style={{ maxWidth:520, width:"100%", margin:"0 auto", padding:"24px 20px 90px" }}>{children}</div>;
}

// ── TOAST SYSTEM ──────────────────────────────────────────────────────────────
export function ToastContainer({ toasts }) {
  return (
    <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:9999,
      display:"flex", flexDirection:"column", gap:8, width:"90%", maxWidth:400, pointerEvents:"none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background:"var(--card2)", border:"1px solid var(--border2)",
          borderRadius:R("md"), padding:"12px 16px", fontSize:13, lineHeight:1.55,
          animation:"fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
          boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
          <span style={{ marginRight:8 }}>{t.icon}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  function show(msg, icon="🔔") {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, icon }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  }
  return { toasts, show };
}

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
export function BottomNav({ active, onGo }) {
  const tabs = [
    { id:"dashboard", icon:"🏠", label:"Home" },
    { id:"pod",       icon:"👥", label:"Pod" },
    { id:"stack",     icon:"📚", label:"Stack" },
    { id:"insights",  icon:"✨", label:"Insights" },
    { id:"leaderboard", icon:"🏆", label:"Board" },
  ];
  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"var(--surface)",
      borderTop:"1px solid var(--border)", display:"flex", zIndex:100,
      paddingBottom:"env(safe-area-inset-bottom)" }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onGo(t.id)} style={{ flex:1, display:"flex",
            flexDirection:"column", alignItems:"center", gap:3, padding:"10px 4px",
            background:"none", border:"none", cursor:"pointer",
            color: isActive ? "var(--fire)" : "var(--text3)",
            transition:"color 0.15s" }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ fontSize:9, fontFamily:"'Space Mono',monospace", letterSpacing:1,
              fontWeight: isActive ? 700 : 400 }}>{t.label.toUpperCase()}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── POD FEED SCREEN ───────────────────────────────────────────────────────────
const FEED_POSTS = [
  { user:"Arjun S.", initials:"AS", time:"8:14 AM", habit:"💪 Fitness", msg:"Morning run done! 5km in 28 min. Week 4 target crushed.", img:null, type:"full", cred:890, streak:14, vouched:false },
  { user:"Priya R.", initials:"PR", time:"9:02 AM", habit:"📖 Reading", msg:"Finished 15 pages of Atomic Habits. Notes taken. Streak alive!", img:null, type:"full", cred:720, streak:7, vouched:false },
  { user:"Karthik M.", initials:"KM", time:"—", habit:"💻 Coding", msg:null, img:null, type:"ghost", cred:310, streak:0, vouched:false },
];

export function PodFeedScreen({ forgeState, onBack, showToast }) {
  const [posts, setPosts] = useState(FEED_POSTS);
  const [lapseUser, setLapseUser] = useState(null);
  const [newPost, setNewPost] = useState(false);

  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = listenToPodFeed("pod_abc", (data) => {
        if (data && data.length > 0) {
          setPosts(data);
        }
      });
    } catch(e) { console.error("Firebase feed listen error", e); }

    // simulate a "live" post arriving after 3s to guarantee WOW moment if Firebase is empty/unconfigured
    const t = setTimeout(() => {
      setPosts(p => {
        if(p.some(x => x.msg?.includes("Just checked in!"))) return p; // prevent duplicate
        return [{
          user: "You", initials: "ME", time: nowTime(),
          habit: `${forgeState?.habit?.icon ?? "💪"} ${forgeState?.habit?.label ?? "Fitness"}`,
          msg: "Just checked in! Starting to feel this habit stick 🔥",
          img:null, type:"full", cred:540, streak:1, vouched:false, isYou:true,
        }, ...p];
      });
      setNewPost(true);
      showToast?.("Arjun S. reacted to your proof post 🔥", "🔥");
    }, 3000);
    return () => { clearTimeout(t); if(unsubscribe) unsubscribe(); };
  }, []);

  function vouch(i) {
    const post = posts[i];
    if (post.id) vouchForPost(post.id, forgeState?.uid || "my_uid");
    setPosts(p => p.map((x,j) => j===i ? {...x, vouched:true, vouchedBy: [...(x.vouchedBy||[]), "my_uid"]} : x));
    showToast?.("You vouched for " + posts[i].user + ". If they fail, your cred drops too.", "🤝");
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--dark)" }} className="screen-enter">
      <BackHeader title="Pod Feed" sub="SIGMA SQUAD · 4 MEMBERS · LIVE" onBack={onBack} />
      <Wrap>
        {/* Pod streak banner */}
        <div style={{ background:"linear-gradient(135deg,rgba(255,77,0,0.1),rgba(255,179,71,0.05))",
          border:"1px solid rgba(255,77,0,0.2)", borderRadius:R("lg"), padding:"14px 16px",
          marginBottom:20, display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:28 }}>🔥</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>Pod Streak: 5 days</div>
            <div style={{ fontSize:11, color:"var(--text2)" }}>Everyone checks in = pod streak grows. One miss breaks it.</div>
          </div>
          <Tag color="gold">5🔥</Tag>
        </div>

        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5,
          color:"var(--text3)", textTransform:"uppercase", marginBottom:14 }}>
          Live Feed {newPost && <Tag color="green">NEW POST</Tag>}
        </p>

        {posts.map((post, i) => (
          <div key={i} className="fade-up" style={{ background:"var(--card)",
            border:`1px solid ${post.type==="ghost" ? "rgba(248,113,113,0.2)" : post.isYou ? "rgba(255,77,0,0.25)" : "var(--border2)"}`,
            borderRadius:R("lg"), padding:"16px", marginBottom:12,
            opacity: post.type==="ghost" ? 0.6 : 1,
            filter: post.type==="ghost" ? "grayscale(0.5)" : "none",
            animationDelay:`${i*0.05}s` }}>

            {/* Post header */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:post.msg ? 12 : 0 }}>
              <div style={{ width:36, height:36, borderRadius:"50%",
                background: post.type==="ghost" ? "var(--surface2)" : post.isYou ? "linear-gradient(135deg,var(--fire),var(--gold))" : "linear-gradient(135deg,#5B9CF6,#a78bfa)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700, color:"white", flexShrink:0 }}>
                {post.initials}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                  {post.user}
                  {post.isYou && <Tag color="fire">You</Tag>}
                  {post.type==="ghost" && <Tag color="red">👻 Ghost Mode</Tag>}
                </div>
                <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"'Space Mono',monospace" }}>
                  {post.habit} · {post.time}
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12, fontWeight:600, color:"var(--ember)" }}>{post.streak}🔥</div>
                <div style={{ fontSize:9, color:"var(--text3)", fontFamily:"'Space Mono',monospace" }}>{post.cred} cred</div>
              </div>
            </div>

            {/* Ghost mode detail */}
            {post.type === "ghost" && (
              <div style={{ background:"rgba(248,113,113,0.05)", border:"1px solid rgba(248,113,113,0.15)",
                borderRadius:R("sm"), padding:"10px 12px", marginTop:10 }}>
                <div style={{ fontSize:12, color:"var(--red)", marginBottom:4, fontWeight:500 }}>3 consecutive misses</div>
                <div style={{ fontSize:11, color:"var(--text3)", lineHeight:1.6 }}>Profile is greyed out to the pod. Credibility dropped to {post.cred}.</div>
                <button onClick={() => setLapseUser(post)} style={{ marginTop:8, background:"rgba(248,113,113,0.1)",
                  border:"1px solid rgba(248,113,113,0.25)", color:"var(--red)", padding:"6px 12px",
                  borderRadius:R("sm"), fontSize:11, cursor:"pointer", fontWeight:500 }}>
                  Submit Lapse Reason →
                </button>
              </div>
            )}

            {/* Post message */}
            {post.msg && (
              <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.65, marginBottom:12 }}>{post.msg}</div>
            )}

            {/* Reactions row */}
            {post.type !== "ghost" && (
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <button onClick={() => vouch(i)} disabled={post.vouched || post.isYou}
                  style={{ background: post.vouched ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
                    border:`1px solid ${post.vouched ? "rgba(52,211,153,0.25)" : "var(--border2)"}`,
                    color: post.vouched ? "var(--green)" : "var(--text2)",
                    padding:"5px 10px", borderRadius:20, fontSize:11, cursor: post.vouched || post.isYou ? "default" : "pointer" }}>
                  {post.vouched ? "✓ Vouched" : "🤝 Vouch"}
                </button>
                <button style={{ background:"rgba(255,255,255,0.04)", border:"1px solid var(--border2)",
                  color:"var(--text2)", padding:"5px 10px", borderRadius:20, fontSize:11, cursor:"pointer" }}>
                  🔥 Fire
                </button>
                {!post.isYou && <Tag color="muted">+5 cred if they complete</Tag>}
              </div>
            )}
          </div>
        ))}
      </Wrap>
    </div>
  );
}

// ── PACE ENGINE SCREEN ────────────────────────────────────────────────────────
export function PaceEngineScreen({ forgeState, onBack }) {
  const [week, setWeek] = useState(1);
  const habitLabel = forgeState?.habit?.label ?? "Fitness";
  const habitIcon  = forgeState?.habit?.icon  ?? "💪";

  const weeks = [
    { w:1,  target:"1 pushup",  duration:"1 min",  rate:72 },
    { w:2,  target:"3 pushups", duration:"2 min",  rate:81 },
    { w:3,  target:"6 pushups", duration:"4 min",  rate:85 },
    { w:4,  target:"12 pushups",duration:"6 min",  rate:88 },
    { w:6,  target:"20 pushups",duration:"10 min", rate:91 },
    { w:8,  target:"30 pushups",duration:"15 min", rate:86 },
  ];
  const current = weeks.find(w2 => w2.w === week) ?? weeks[0];

  return (
    <div style={{ minHeight:"100vh", background:"var(--dark)" }} className="screen-enter">
      <BackHeader title="Pace Engine" sub="ADAPTIVE DIFFICULTY · RUNS EVERY SUNDAY" onBack={onBack} />
      <Wrap>

        {/* How it works */}
        <div style={{ background:"var(--card)", border:"1px solid var(--border2)",
          borderRadius:R("lg"), padding:"16px", marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>How the Pace Engine works</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              { pct:">80%", label:"7 days", action:"Difficulty nudged up", color:"var(--green)" },
              { pct:"<80%", label:"7 days", action:"Stays flat, no punishment", color:"var(--soft-blue)" },
              { pct:">80%", label:"14 days", action:"Second habit suggested", color:"var(--gold)" },
              { pct:"2+ habits", label:"14 days", action:"Routine Stack unlocked", color:"var(--fire)" },
            ].map((r,i) => (
              <div key={i} style={{ background:"var(--surface2)", borderRadius:R("sm"),
                padding:"10px 12px", border:"1px solid var(--border)" }}>
                <div style={{ fontSize:14, fontWeight:700, color:r.color, marginBottom:2 }}>{r.pct}</div>
                <div style={{ fontSize:9, color:"var(--text3)", fontFamily:"'Space Mono',monospace", marginBottom:4 }}>for {r.label}</div>
                <div style={{ fontSize:11, color:"var(--text2)", lineHeight:1.5 }}>{r.action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Week selector */}
        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5,
          color:"var(--text3)", textTransform:"uppercase", marginBottom:12 }}>
          Your Progression — {habitIcon} {habitLabel}
        </p>
        <div style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
          {weeks.map(w2 => (
            <button key={w2.w} onClick={() => setWeek(w2.w)} style={{
              background: week===w2.w ? "var(--fire)" : "var(--card)",
              border:`1px solid ${week===w2.w ? "var(--fire)" : "var(--border2)"}`,
              color: week===w2.w ? "white" : "var(--text2)",
              padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600,
              cursor:"pointer", flexShrink:0, transition:"all 0.15s" }}>
              W{w2.w}
            </button>
          ))}
        </div>

        {/* Week detail card */}
        <div className="fade-in" style={{ background:"var(--card)", border:"1px solid rgba(255,77,0,0.2)",
          borderRadius:R("lg"), padding:"24px", marginBottom:20, textAlign:"center" }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--fire)",
            letterSpacing:2, marginBottom:16 }}>WEEK {current.w} TARGET</div>
          <div style={{ fontSize:48, fontWeight:700, letterSpacing:"-2px", marginBottom:8,
            background:"linear-gradient(135deg,var(--fire),var(--gold))",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            {current.target}
          </div>
          <div style={{ fontSize:14, color:"var(--text2)", marginBottom:20 }}>{current.duration} / session</div>
          {/* Completion rate bar */}
          <div style={{ textAlign:"left" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:11, color:"var(--text2)" }}>7-day completion rate</span>
              <span style={{ fontSize:11, fontWeight:600, color: current.rate >= 80 ? "var(--green)" : "var(--soft-blue)" }}>
                {current.rate}%
              </span>
            </div>
            <div style={{ height:8, background:"var(--border2)", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:4, width:`${current.rate}%`,
                background: current.rate >= 80 ? "linear-gradient(90deg,var(--green),#6EE7B7)" : "linear-gradient(90deg,var(--soft-blue),#93c5fd)",
                transition:"width 0.7s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
            <div style={{ fontSize:11, color:"var(--text3)", marginTop:6 }}>
              {current.rate >= 80 ? "✓ Pace Engine will nudge next week's target up" : "Stay consistent — no change next week"}
            </div>
          </div>
        </div>

        {/* W1 vs W4 comparison */}
        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5,
          color:"var(--text3)", textTransform:"uppercase", marginBottom:12 }}>Week 1 vs Week 4</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          {[
            { label:"WEEK 1", target:"1 pushup", duration:"1 min", tag:"Tiny Start", tagColor:"blue" },
            { label:"WEEK 4", target:"12 pushups", duration:"6 min", tag:"Natural Growth", tagColor:"fire" },
          ].map(c => (
            <div key={c.label} style={{ background:"var(--card)", border:"1px solid var(--border2)",
              borderRadius:R("md"), padding:"16px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)",
                letterSpacing:2, marginBottom:10 }}>{c.label}</div>
              <div style={{ fontSize:24, fontWeight:700, color:"var(--text)", marginBottom:4 }}>{c.target}</div>
              <div style={{ fontSize:11, color:"var(--text2)", marginBottom:10 }}>{c.duration}</div>
              <Tag color={c.tagColor}>{c.tag}</Tag>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(255,179,71,0.05)", border:"1px solid rgba(255,179,71,0.15)",
          borderRadius:R("md"), padding:"12px 14px", fontSize:12, color:"#FFB347", lineHeight:1.65 }}>
          🧠 The Pace Engine ran last Sunday. Next run: this Sunday 11 PM.
          You went from impossible-to-fail to genuinely challenging — without ever feeling overwhelmed.
        </div>
      </Wrap>
    </div>
  );
}

// ── ROUTINE STACK SCREEN ──────────────────────────────────────────────────────
export function RoutineStackScreen({ forgeState, onBack, showToast }) {
  const [stacked, setStacked] = useState(false);
  const [stackName, setStackName] = useState("Morning Stack");
  const [stackTime, setStackTime] = useState("08:00");
  const habitIcon  = forgeState?.habit?.icon  ?? "💪";
  const habitLabel = forgeState?.habit?.label ?? "Fitness";

  const habits = [
    { icon:habitIcon, label:`${habitLabel} — Week 4`, duration:"6 min", locked:false },
    { icon:"🧠", label:"Daily Reflection", duration:"5 min", locked:false },
    { icon:"🧘", label:"Mindfulness", duration:"5 min", locked:true, note:"Unlock after Day 14" },
  ];

  function handleStack() {
    setStacked(true);
    showToast?.("Morning Stack created! Stack streak starts today 🔥", "📚");
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--dark)" }} className="screen-enter">
      <BackHeader title="Routine Stack" sub="GROUP HABITS · STACK STREAK" onBack={onBack} />
      <Wrap>

        {stacked && (
          <div className="fade-in" style={{ background:"linear-gradient(135deg,rgba(255,77,0,0.1),rgba(255,179,71,0.05))",
            border:"1px solid rgba(255,77,0,0.25)", borderRadius:R("lg"), padding:"16px",
            marginBottom:20, textAlign:"center" }}>
            <div style={{ fontSize:28, marginBottom:8 }}>📚</div>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{stackName} Active!</div>
            <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.6 }}>
              Complete all habits back-to-back for bonus credibility. Stack streak: 1 day 🔥
            </div>
          </div>
        )}

        {/* What is a Stack */}
        <div style={{ background:"var(--card)", border:"1px solid var(--border2)",
          borderRadius:R("lg"), padding:"16px", marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>What is a Routine Stack?</div>
          <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.7 }}>
            Group 2+ habits back-to-back at a fixed time. The stack gets its own streak counter.
            Complete the full stack = bonus credibility boost in your pod.
          </div>
        </div>

        {/* Stack name + time */}
        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5,
          color:"var(--text3)", textTransform:"uppercase", marginBottom:12 }}>Configure Stack</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:10, marginBottom:20 }}>
          <input value={stackName} onChange={e => setStackName(e.target.value)}
            style={{ background:"var(--card)", border:"1px solid var(--border2)",
              borderRadius:R("sm"), padding:"10px 14px", color:"var(--text)",
              fontFamily:"'Inter',sans-serif", fontSize:14, outline:"none" }}
            onFocus={e => e.target.style.borderColor="rgba(255,77,0,0.4)"}
            onBlur={e => e.target.style.borderColor="var(--border2)"} />
          <input type="time" value={stackTime} onChange={e => setStackTime(e.target.value)}
            style={{ background:"var(--card)", border:"1px solid var(--border2)",
              borderRadius:R("sm"), padding:"10px 14px", color:"var(--text)",
              fontFamily:"'Space Mono',monospace", fontSize:13, outline:"none" }} />
        </div>

        {/* Habit list */}
        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5,
          color:"var(--text3)", textTransform:"uppercase", marginBottom:12 }}>Habits in Stack</p>
        {habits.map((h, i) => (
          <div key={i} style={{ background: h.locked ? "var(--surface2)" : "var(--card)",
            border:"1px solid var(--border2)", borderRadius:R("md"), padding:"14px 16px",
            marginBottom:8, display:"flex", alignItems:"center", gap:12,
            opacity: h.locked ? 0.5 : 1 }}>
            <div style={{ width:40, height:40, borderRadius:R("sm"), background:"var(--surface2)",
              border:"1px solid var(--border)", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:18, flexShrink:0 }}>{h.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{h.label}</div>
              <div style={{ fontSize:11, color:"var(--text3)", fontFamily:"'Space Mono',monospace" }}>
                {h.locked ? h.note : h.duration}
              </div>
            </div>
            {!h.locked && <div style={{ fontSize:12, color:"var(--text3)" }}>⠿</div>}
            {h.locked && <Tag color="muted">LOCKED</Tag>}
          </div>
        ))}

        {/* Stack timeline */}
        <div style={{ background:"rgba(255,179,71,0.04)", border:"1px solid rgba(255,179,71,0.12)",
          borderRadius:R("md"), padding:"14px 16px", marginBottom:24, marginTop:8 }}>
          <div style={{ fontSize:12, fontWeight:600, marginBottom:10, color:"#FFB347" }}>⏱ Stack Timeline at {stackTime}</div>
          {habits.filter(h => !h.locked).map((h, i, arr) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom: i < arr.length-1 ? 8 : 0 }}>
              <span style={{ fontSize:14 }}>{h.icon}</span>
              <span style={{ fontSize:12, flex:1 }}>{h.label}</span>
              <span style={{ fontSize:11, color:"var(--text3)", fontFamily:"'Space Mono',monospace" }}>{h.duration}</span>
            </div>
          ))}
          <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid var(--border)",
            fontSize:12, color:"var(--text2)" }}>
            Total: 11 min · Stack Streak bonus: +20 cred
          </div>
        </div>

        {!stacked ? (
          <button onClick={handleStack} style={{ width:"100%", padding:"15px",
            background:"linear-gradient(135deg,var(--fire),#FF6520)",
            color:"white", border:"1px solid rgba(255,77,0,0.3)", borderRadius:R("lg"),
            fontSize:14, fontWeight:600, cursor:"pointer",
            boxShadow:"0 4px 24px rgba(255,77,0,0.25)" }}>
            Create {stackName} 🔥
          </button>
        ) : (
          <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)",
            borderRadius:R("lg"), padding:"14px 16px", textAlign:"center" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--green)", marginBottom:2 }}>✓ Stack Active</div>
            <div style={{ fontSize:11, color:"var(--text2)" }}>Check your pod — they can see your full stack.</div>
          </div>
        )}
      </Wrap>
    </div>
  );
}

// ── LAPSE SCREEN ──────────────────────────────────────────────────────────────
export function LapseScreen({ forgeState, lapseUser, onBack, showToast }) {
  const [reason, setReason] = useState("");
  const [phase, setPhase] = useState("write"); // write | evaluating | approved | denied
  const apiKey = typeof localStorage !== "undefined" ? localStorage.getItem("forge_api_key") : null;

  async function submit() {
    if (reason.trim().length < 10) return;
    setPhase("evaluating");

    if (apiKey) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 120,
            system: `You are Forge's lapse evaluator. Evaluate if the user's reason for missing their habit is genuine. 
              Reply ONLY with JSON: {"approved":true/false,"message":"1-2 sentence response to user"}.
              Approve if the reason shows genuine life circumstances. Deny if it's an excuse or vague.`,
            messages: [{ role: "user", content: `Habit: ${forgeState?.habit?.label ?? "Fitness"}. Reason for missing: "${reason}"` }],
          }),
        });
        const data = await res.json();
        try {
          const parsed = JSON.parse(data.content?.[0]?.text ?? "{}");
          setTimeout(() => {
            setPhase(parsed.approved ? "approved" : "denied");
            showToast?.(parsed.message ?? (parsed.approved ? "Lapse approved!" : "Not approved this time."),
              parsed.approved ? "✅" : "⚠️");
          }, 600);
        } catch { setTimeout(() => setPhase("approved"), 600); }
      } catch { setTimeout(() => setPhase("approved"), 1200); }
    } else {
      // Mock evaluation
      const genuine = reason.length > 30;
      setTimeout(() => setPhase(genuine ? "approved" : "denied"), 2000);
    }
  }

  if (phase === "evaluating") return (
    <div style={{ minHeight:"100vh", background:"var(--dark)", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
      <div style={{ position:"relative", width:72, height:72, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ position:"absolute", inset:0, borderRadius:"50%",
            border:"2px solid var(--fire)", animation:`ripple 1.5s ${i*0.4}s ease-out infinite`, opacity:0 }} />
        ))}
        <span style={{ fontSize:28, display:"block" }}>🤖</span>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>AI is evaluating your lapse...</div>
        <div style={{ fontSize:11, color:"var(--text3)", fontFamily:"'Space Mono',monospace" }}>CLAUDE · LAPSE EVALUATOR</div>
      </div>
    </div>
  );

  if (phase === "approved") return (
    <div style={{ minHeight:"100vh", background:"var(--dark)", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
      <div style={{ animation:"successPop 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
        <div style={{ width:96, height:96, borderRadius:"50%", background:"rgba(52,211,153,0.1)",
          border:"2px solid var(--green)", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:40, margin:"0 auto 24px", boxShadow:"0 0 40px rgba(52,211,153,0.2)" }}>✓</div>
        <h2 style={{ fontSize:24, fontWeight:700, marginBottom:8, letterSpacing:"-0.5px" }}>Lapse Approved</h2>
        <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7, maxWidth:280, margin:"0 auto 12px" }}>
          The AI reviewed your reason and found it genuine. Your streak is partially restored.
        </p>
        <div style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)",
          borderRadius:R("md"), padding:"12px 16px", marginBottom:28, maxWidth:320, margin:"0 auto 28px" }}>
          <div style={{ fontSize:12, color:"var(--green)", fontStyle:"italic", lineHeight:1.6 }}>
            "Life happens. What matters is that you're here now. Check in today — ghost mode will lift."
          </div>
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:28 }}>
          {[{ label:"Streak", value:"Restored ½" }, { label:"Ghost Mode", value:"Lifted 👻" }, { label:"Credibility", value:"+10" }].map(s => (
            <div key={s.label} style={{ background:"var(--card)", border:"1px solid var(--border2)",
              borderRadius:R("md"), padding:"12px 14px", minWidth:90 }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{s.value}</div>
              <div style={{ fontSize:9, color:"var(--text3)", fontFamily:"'Space Mono',monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={onBack} style={{ background:"linear-gradient(135deg,var(--fire),#FF6520)",
          color:"white", border:"none", padding:"14px 40px", borderRadius:R("lg"),
          fontSize:14, fontWeight:600, cursor:"pointer" }}>
          Back to Dashboard →
        </button>
      </div>
    </div>
  );

  if (phase === "denied") return (
    <div style={{ minHeight:"100vh", background:"var(--dark)", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
      <div style={{ animation:"successPop 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
        <div style={{ width:96, height:96, borderRadius:"50%", background:"rgba(248,113,113,0.1)",
          border:"2px solid var(--red)", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:40, margin:"0 auto 24px" }}>⚠️</div>
        <h2 style={{ fontSize:24, fontWeight:700, marginBottom:8 }}>Not Approved</h2>
        <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7, maxWidth:280, margin:"0 auto 24px" }}>
          The AI didn't find enough detail in your reason. Your streak stays broken — but recovery is still possible.
          Check in today to start lifting Ghost Mode.
        </p>
        <button onClick={() => setPhase("write")} style={{ background:"var(--card)", border:"1px solid var(--border2)",
          color:"var(--text)", padding:"12px 24px", borderRadius:R("md"), fontSize:13, cursor:"pointer", marginRight:10 }}>
          Try Again
        </button>
        <button onClick={onBack} style={{ background:"linear-gradient(135deg,var(--fire),#FF6520)",
          color:"white", border:"none", padding:"12px 24px", borderRadius:R("md"),
          fontSize:13, fontWeight:600, cursor:"pointer" }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--dark)" }} className="screen-enter">
      <BackHeader title="Approved Lapse" sub="AI EVALUATION · AUTHENTIC CHECK" onBack={onBack} />
      <Wrap>
        <div style={{ background:"rgba(255,179,71,0.05)", border:"1px solid rgba(255,179,71,0.15)",
          borderRadius:R("lg"), padding:"16px", marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:6, color:"#FFB347" }}>What is an Approved Lapse?</div>
          <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.7 }}>
            Not all misses are equal. Give a genuine reason — the AI evaluates it and decides if your streak
            should be partially restored. Vague excuses won't pass.
          </div>
        </div>

        {lapseUser && (
          <div style={{ background:"var(--card)", border:"1px solid var(--border2)",
            borderRadius:R("md"), padding:"14px 16px", marginBottom:20,
            display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"var(--surface2)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:12,
              fontWeight:700, color:"var(--text2)", flexShrink:0 }}>{lapseUser.initials}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:1 }}>{lapseUser.user}</div>
              <div style={{ display:"flex", gap:6 }}>
                <Tag color="red">👻 Ghost Mode</Tag>
                <Tag color="muted">{lapseUser.streak} streak</Tag>
              </div>
            </div>
          </div>
        )}

        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5,
          color:"var(--text3)", textTransform:"uppercase", marginBottom:12 }}>
          Why did you miss your habit?
        </p>
        <textarea value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Be specific. Vague reasons like 'I was tired' won't pass. Tell us what actually happened in your life."
          rows={6}
          style={{ width:"100%", background:"var(--card)", border:"1px solid var(--border2)",
            borderRadius:R("md"), padding:"14px 16px", color:"var(--text)",
            fontFamily:"'Inter',sans-serif", fontSize:14, lineHeight:1.65, outline:"none",
            resize:"none", marginBottom:8 }}
          onFocus={e => e.target.style.borderColor="rgba(255,77,0,0.4)"}
          onBlur={e => e.target.style.borderColor="var(--border2)"} />
        <div style={{ fontSize:11, color:"var(--text3)", textAlign:"right",
          fontFamily:"'Space Mono',monospace", marginBottom:24 }}>{reason.length} chars · min 10</div>

        <button onClick={submit} disabled={reason.trim().length < 10}
          style={{ width:"100%", padding:"15px",
            background: reason.trim().length < 10 ? "var(--card2)" : "linear-gradient(135deg,var(--fire),#FF6520)",
            color: reason.trim().length < 10 ? "var(--text3)" : "white",
            border:`1px solid ${reason.trim().length < 10 ? "var(--border)" : "rgba(255,77,0,0.3)"}`,
            borderRadius:R("lg"), fontSize:14, fontWeight:600,
            cursor: reason.trim().length < 10 ? "not-allowed" : "pointer" }}>
          Submit for AI Evaluation →
        </button>
      </Wrap>
    </div>
  );
}

// ── AI INSIGHTS SCREEN ────────────────────────────────────────────────────────
const INSIGHT_CARDS = [
  {
    icon:"✨", color:"var(--gold)", bg:"rgba(255,179,71,0.06)",
    title:"Ready for a second habit?",
    body:`You've hit >80% completion for 14 days straight. The Pace Engine says you're ready. 
      Adding a Mindfulness habit won't overwhelm you — it'll stack naturally on what you've built.`,
    cta:"Add Mindfulness →", ctaColor:"var(--gold)", tag:"Day 14 Milestone",
  },
  {
    icon:"📊", color:"var(--soft-blue)", bg:"rgba(91,156,246,0.06)",
    title:"Your strongest day is Wednesday",
    body:`Over the past 3 weeks, Wednesday has your highest completion rate (94%). 
      Consider scheduling your hardest habit on Wednesdays.`,
    cta:"See full analysis →", ctaColor:"var(--soft-blue)", tag:"Pattern Detected",
  },
  {
    icon:"🧠", color:"var(--green)", bg:"rgba(52,211,153,0.06)",
    title:"You're in the habit loop now",
    body:`At Day 14, neurologically, your habit is starting to feel automatic. 
      The cue → routine → reward loop is forming. Don't break the chain.`,
    cta:"Learn more →", ctaColor:"var(--green)", tag:"Behavioral Science",
  },
  {
    icon:"🏆", color:"var(--fire)", bg:"rgba(255,77,0,0.06)",
    title:"Top 12% of your pod this week",
    body:`Your consistency puts you in the top 12% of all Forge users in your habit category. 
      Arjun is close behind — keep pushing.`,
    cta:"View leaderboard →", ctaColor:"var(--fire)", tag:"Performance",
  },
];

export function AIInsightsScreen({ forgeState, onBack, showToast, onGo }) {
  const [loading, setLoading] = useState(true);
  const [aiCard, setAiCard] = useState(null);
  const apiKey = typeof localStorage !== "undefined" ? localStorage.getItem("forge_api_key") : null;

  useEffect(() => {
    // Simulate loading delay then show cards
    const t = setTimeout(() => {
      setLoading(false);
      if (apiKey) fetchAIInsight();
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  async function fetchAIInsight() {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "x-api-key":apiKey,
          "anthropic-version":"2023-06-01", "anthropic-dangerous-direct-browser-access":"true" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:150,
          system:`You are Forge's AI insight engine. Give a short, specific, genuinely helpful insight about habit formation for this user.
            Format: {"title":"short title","insight":"2-3 sentences, specific, personalized"}`,
          messages:[{ role:"user", content:`User habit: ${forgeState?.habit?.label ?? "Fitness"}. Mode: ${forgeState?.mode ?? "soft"}. Day 14. Completion rate: 84%.` }],
        }),
      });
      const data = await res.json();
      const parsed = JSON.parse(data?.content?.[0]?.text ?? "{}");
      if (parsed.title) setAiCard(parsed);
    } catch { /* fallback to static cards */ }
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"var(--dark)", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
      <div style={{ position:"relative", width:72, height:72, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ position:"absolute", inset:0, borderRadius:"50%",
            border:"2px solid var(--fire)", animation:`ripple 1.5s ${i*0.4}s ease-out infinite`, opacity:0 }} />
        ))}
        <span style={{ fontSize:28 }}>✨</span>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Generating your insights...</div>
        <div style={{ fontSize:11, color:"var(--text3)", fontFamily:"'Space Mono',monospace" }}>CLAUDE · DAY 14 ANALYSIS</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--dark)" }} className="screen-enter">
      <BackHeader title="AI Insights" sub={`DAY 14 · ${forgeState?.habit?.label?.toUpperCase() ?? "FITNESS"}`} onBack={onBack} />
      <Wrap>
        {/* Live AI card */}
        {aiCard && (
          <div className="fade-up" style={{ background:"linear-gradient(135deg,rgba(255,77,0,0.1),rgba(255,179,71,0.05))",
            border:"1px solid rgba(255,179,71,0.3)", borderRadius:R("lg"), padding:"20px", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <Tag color="gold">✨ Live AI · Claude</Tag>
            </div>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{aiCard.title}</div>
            <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.7 }}>{aiCard.insight}</div>
          </div>
        )}

        {INSIGHT_CARDS.map((card, i) => (
          <div key={i} className="fade-up" style={{ background:card.bg,
            border:`1px solid rgba(255,255,255,0.06)`, borderRadius:R("lg"),
            padding:"18px", marginBottom:12, animationDelay:`${i*0.08}s` }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:20 }}>{card.icon}</span>
                <Tag color="muted">{card.tag}</Tag>
              </div>
            </div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:8, letterSpacing:"-0.2px" }}>{card.title}</div>
            <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.7, marginBottom:12 }}>{card.body}</div>
            <button onClick={() => { if(card.cta.includes("Mindfulness")) onGo?.("stack"); showToast?.(card.title, card.icon); }}
              style={{ background:"none", border:`1px solid ${card.ctaColor}33`, color:card.ctaColor,
                padding:"6px 14px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:600 }}>
              {card.cta}
            </button>
          </div>
        ))}
      </Wrap>
    </div>
  );
}

// ── LEADERBOARD SCREEN ────────────────────────────────────────────────────────
const BOARD_MEMBERS = [
  { rank:1, user:"Arjun S.",   initials:"AS", cred:890, streak:14, shields:3, status:"done",  badge:"🏆" },
  { rank:2, user:"You",        initials:"ME", cred:540, streak:1,  shields:0, status:"done",  badge:"🔥", isYou:true },
  { rank:3, user:"Priya R.",   initials:"PR", cred:720, streak:7,  shields:1, status:"pending",badge:"⏳" },
  { rank:4, user:"Karthik M.", initials:"KM", cred:310, streak:0,  shields:0, status:"ghost", badge:"👻" },
];

export function LeaderboardScreen({ forgeState, onBack, showToast, onGo }) {
  const [members, setMembers] = useState(BOARD_MEMBERS);
  const [recovering, setRecovering] = useState(false);
  const [karthikCred, setKarthikCred] = useState(310);
  const [karthikGhost, setKarthikGhost] = useState(true);

  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = listenToLeaderboard("pod_abc", (data) => {
        if (data && data.length > 0) {
          const ranked = data.map((d, i) => ({ ...d, rank: i + 1 }));
          setMembers(ranked);
        }
      });
    } catch(e) { console.error("Firebase leaderboard listen error", e); }
    return () => { if(unsubscribe) unsubscribe(); };
  }, []);

  function triggerRecovery() {
    setRecovering(true);
    // Write Ghost Mode off to Firebase if we have real data
    const karthikId = members.find(m => m.user === "Karthik M.")?.id || "karthik_123";
    try { toggleGhostMode(karthikId, false); } catch(e){}

    let c = 310;
    const iv = setInterval(() => {
      c += 12;
      setKarthikCred(c);
      if (c >= 430) { clearInterval(iv); setKarthikGhost(false); showToast?.("Karthik M. recovered! Ghost Mode lifted 🎉", "🎉"); }
    }, 80);
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--dark)" }} className="screen-enter">
      <BackHeader title="Leaderboard" sub="CREDIBILITY · SHIELDS · STREAKS" onBack={onBack} />
      <Wrap>
        {/* Credibility explainer */}
        <div style={{ background:"var(--card)", border:"1px solid var(--border2)",
          borderRadius:R("lg"), padding:"16px", marginBottom:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[
              { icon:"⭐", label:"Credibility", desc:"Public score. Drops on failure." },
              { icon:"🛡️", label:"Streak Shield", desc:"Absorbs one missed day." },
              { icon:"👻", label:"Ghost Mode", desc:"3 misses = greyed out to pod." },
            ].map(s => (
              <div key={s.label} style={{ textAlign:"center", padding:"10px 6px" }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontSize:11, fontWeight:600, marginBottom:2 }}>{s.label}</div>
                <div style={{ fontSize:10, color:"var(--text3)", lineHeight:1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5,
          color:"var(--text3)", textTransform:"uppercase", marginBottom:14 }}>This Week · Sigma Squad</p>

        {members.map((m, i) => {
          const isKarthik = m.user === "Karthik M.";
          const cred = isKarthik ? karthikCred : m.cred;
          const ghost = isKarthik ? karthikGhost : (m.status === "ghost");
          return (
            <div key={i} className="fade-up" style={{ background:"var(--card)",
              border:`1px solid ${m.isYou ? "rgba(255,77,0,0.3)" : ghost ? "rgba(248,113,113,0.15)" : "var(--border2)"}`,
              borderRadius:R("lg"), padding:"14px 16px", marginBottom:10,
              opacity: ghost ? 0.65 : 1,
              filter: ghost ? "grayscale(0.4)" : "none",
              animationDelay:`${i*0.07}s` }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                {/* Rank */}
                <div style={{ width:28, textAlign:"center", fontSize:16,
                  fontFamily:"'Bebas Neue',sans-serif", color:"var(--text3)", flexShrink:0 }}>
                  {m.rank}
                </div>
                {/* Avatar */}
                <div style={{ width:38, height:38, borderRadius:"50%",
                  background: ghost ? "var(--surface2)" : m.isYou ? "linear-gradient(135deg,var(--fire),var(--gold))" : "linear-gradient(135deg,#5B9CF6,#a78bfa)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:700, color:"white", flexShrink:0 }}>
                  {m.initials}
                </div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                    {m.user}
                    {m.isYou && <Tag color="fire">You</Tag>}
                    {ghost && !recovering && <Tag color="red">👻 Ghost</Tag>}
                    {isKarthik && !ghost && recovering && <Tag color="green">👋 Back!</Tag>}
                  </div>
                  {/* Cred bar */}
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ flex:1, height:4, background:"var(--border2)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:2,
                        width:`${Math.min(100,(cred/1000)*100)}%`,
                        background: ghost && !recovering ? "var(--surface2)" : "linear-gradient(90deg,var(--fire),var(--gold))",
                        transition:"width 0.1s linear" }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:"var(--ember)", flexShrink:0,
                      transition:"color 0.3s" }}>{cred}</span>
                  </div>
                </div>
                {/* Right cluster */}
                <div style={{ flexShrink:0, textAlign:"right" }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--ember)" }}>{m.streak}🔥</div>
                  <div style={{ fontSize:11, color:"var(--text3)" }}>
                    {"🛡️".repeat(Math.min(m.shields, 3))} {m.shields > 0 && `×${m.shields}`}
                  </div>
                </div>
                <div style={{ fontSize:20, flexShrink:0 }}>{m.badge}</div>
              </div>

              {/* Recovery button for Karthik */}
              {isKarthik && karthikGhost && !recovering && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid var(--border)" }}>
                  <button onClick={triggerRecovery} style={{ width:"100%",
                    background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)",
                    color:"var(--green)", padding:"8px 0", borderRadius:R("sm"),
                    fontSize:12, cursor:"pointer", fontWeight:500 }}>
                    ▶ Simulate Recovery — watch cred tick up
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Streak Shield explainer */}
        <div style={{ background:"rgba(255,179,71,0.04)", border:"1px solid rgba(255,179,71,0.12)",
          borderRadius:R("md"), padding:"14px 16px", marginTop:8 }}>
          <div style={{ fontSize:12, fontWeight:600, marginBottom:6, color:"#FFB347" }}>🛡️ How to earn Streak Shields</div>
          <div style={{ fontSize:11, color:"var(--text2)", lineHeight:1.7 }}>
            Complete 7 consecutive days → earn 1 Shield. Shields absorb one missed day before your streak breaks.
            Arjun has 3 shields from 3 back-to-back weeks.
          </div>
        </div>
      </Wrap>
    </div>
  );
}
