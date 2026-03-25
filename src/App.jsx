import { useState, useEffect, useRef, useCallback } from "react";
import Auth from "./Auth";
import {
  BottomNav, ToastContainer, useToast,
  PodFeedScreen, PaceEngineScreen, RoutineStackScreen,
  LapseScreen, AIInsightsScreen, LeaderboardScreen,
} from "./screens.jsx";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --fire: #FF4D00; --ember: #FF7733; --gold: #FFB347;
    --dark: #080808; --dark2: #0D0D0D; --surface: #111111; --surface2: #161616;
    --card: #1A1A1A; --card2: #1F1F1F;
    --border: rgba(255,255,255,0.06); --border2: rgba(255,255,255,0.10); --border3: rgba(255,255,255,0.16);
    --text: #EDEDED; --text2: #999; --text3: #555;
    --soft-blue: #5B9CF6; --green: #34D399; --red: #F87171;
    --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 24px;
  }
  html, body, #root { height: 100%; background: var(--dark); color: var(--text); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 0px; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideRight { from { opacity:0; transform:translateX(28px); } to { opacity:1; transform:translateX(0); } }
  @keyframes flamePulse { 0%,100% { transform:scaleY(1) scaleX(1); } 40% { transform:scaleY(1.08) scaleX(0.96); } 70% { transform:scaleY(0.96) scaleX(1.04); } }
  @keyframes orb { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(30px,-20px) scale(1.05); } 66% { transform:translate(-20px,15px) scale(0.97); } }
  @keyframes orb2 { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(-25px,20px) scale(1.04); } 66% { transform:translate(20px,-15px) scale(0.98); } }
  @keyframes livePulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.3; transform:scale(0.65); } }
  @keyframes typingBounce { 0%,60%,100% { transform:translateY(0); opacity:0.3; } 30% { transform:translateY(-5px); opacity:1; } }
  @keyframes confettiFall { from { opacity:1; transform:translateY(-10px) rotate(0deg); } to { opacity:0; transform:translateY(100vh) rotate(540deg); } }
  @keyframes checkPop { 0% { transform:scale(0.7); } 60% { transform:scale(1.15); } 100% { transform:scale(1); } }
  @keyframes shimmerMove { from { background-position:-200% center; } to { background-position:200% center; } }
  @keyframes ripple { 0% { transform:scale(0.8); opacity:1; } 100% { transform:scale(2.2); opacity:0; } }
  @keyframes successPop { 0% { transform:scale(0.5); opacity:0; } 65% { transform:scale(1.12); opacity:1; } 100% { transform:scale(1); opacity:1; } }
  @keyframes floatUp { 0% { opacity:1; transform:translateY(0); } 100% { opacity:0; transform:translateY(-60px); } }
  @keyframes scanLine { 0% { transform:translateY(-100%); opacity:0.6; } 100% { transform:translateY(400%); opacity:0; } }
  @keyframes borderPulse { 0%,100% { border-color:rgba(255,77,0,0.3); } 50% { border-color:rgba(255,77,0,0.7); } }

  .screen-enter { animation: slideRight 0.32s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-up { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-in { animation: fadeIn 0.4s ease both; }

  .sel-card {
    cursor: pointer;
    transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
    border: 1px solid var(--border);
    background: var(--card);
    border-radius: var(--radius-md);
    position: relative;
    overflow: hidden;
  }
  .sel-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,77,0,0.04), transparent);
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }
  .sel-card:hover { border-color: var(--border3); transform: translateY(-1px); }
  .sel-card:hover::before { opacity: 1; }
  .sel-card.selected {
    border-color: rgba(255,77,0,0.5);
    background: rgba(255,77,0,0.06);
    box-shadow: 0 0 0 1px rgba(255,77,0,0.12), 0 4px 16px rgba(255,77,0,0.08);
  }
  .sel-card.selected::before { opacity: 1; }
`;

function spawnConfetti(count = 32) {
  const colors = ["#FF4D00","#FF7733","#FFB347","#34D399","#5B9CF6","#fff"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;width:${5+Math.random()*7}px;height:${5+Math.random()*7}px;border-radius:${Math.random()>.5?"50%":"2px"};left:${Math.random()*100}vw;top:-10px;background:${colors[Math.floor(Math.random()*colors.length)]};animation:confettiFall ${.7+Math.random()*.9}s ${Math.random()*.5}s ease-in forwards;`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),1700);
  }
}

function nowTime() { return new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}); }
function R(size) { return `var(--radius-${size})`; }

const PERSONAS = [
  { id:"rock",     name:"The Rock",      emoji:"🪨", tagline:"High energy. No excuses.",  color:"#FF4D00",
    systemPrompt:`You are The Rock (Dwayne Johnson) as an AI habit coach inside Forge. High energy, zero tolerance for excuses, grind mentality, occasional dry humour. Never break character. Max 70 words.`,
    greeting:"Listen. Every rep matters. Every single day. You opened this app — that's already a W. Now tell me: what are we crushing today? The only failure is not showing up." },
  { id:"monk",     name:"The Monk",      emoji:"🧘", tagline:"Calm. Stoic. Philosophical.", color:"#5B9CF6",
    systemPrompt:`You are a stoic monk AI habit coach in Forge, inspired by Marcus Aurelius and Thich Nhat Hanh. Speak calmly, philosophically. Reference impermanence, discipline as freedom. Never break character. Max 70 words.`,
    greeting:"The path is not about perfection. It is about returning — again and again — with patience. You are here. That is enough to begin. What shall we tend to today?" },
  { id:"hustler",  name:"The Hustler",   emoji:"⚡", tagline:"Direct. Brutal. No fluff.",  color:"#FFB347",
    systemPrompt:`You are a Gary Vaynerchuk-inspired AI habit coach in Forge. Brutally direct, entrepreneurial, no-nonsense. Reference opportunity cost, time as most valuable asset. Never break character. Max 70 words.`,
    greeting:"Time is the only thing you can't buy back. You're here — good. Most people aren't. So what habit are we locking in today? Stop planning. Start building." },
  { id:"champion", name:"The Champion",  emoji:"🏆", tagline:"Mamba mentality. Mastery.",  color:"#A78BFA",
    systemPrompt:`You are a Kobe/Jordan-inspired AI habit coach in Forge. Mamba mentality, obsession with craft, winning small battles every day. Intense and focused. Never break character. Max 70 words.`,
    greeting:"Champions don't wait for motivation. They build systems. Every small win compounds into mastery. You showed up today — that's the mentality. What are we working on?" },
  { id:"friend",   name:"The Friend",    emoji:"😊", tagline:"Casual. Funny. No lectures.", color:"#34D399",
    systemPrompt:`You are a warm, casual, funny AI habit coach in Forge. Talk like texting a close friend. Light humour, celebrate wins, gently tease misses. Never break character. Max 70 words.`,
    greeting:"HEYYY you actually opened the app 👀 okay I'm lowkey proud of you. Now let's actually do something — what's the move today? Also I believe in you or whatever lol" },
];

const HABITS = [
  { icon:"💪", label:"Fitness",     desc:"Workouts, runs, movement" },
  { icon:"📚", label:"Learning",    desc:"Courses, skills, knowledge" },
  { icon:"🧘", label:"Mindfulness", desc:"Meditation, breathing, calm" },
  { icon:"💻", label:"Coding",      desc:"Build, practice, ship" },
  { icon:"📖", label:"Reading",     desc:"Books, articles, depth" },
  { icon:"✏️", label:"Custom",      desc:"Define your own habit" },
];

const TIMES = [
  { icon:"🌅", label:"Morning",    sub:"6 AM – 10 AM",  desc:"Start the day strong" },
  { icon:"☀️", label:"Afternoon",  sub:"12 PM – 4 PM",  desc:"Midday momentum" },
  { icon:"🌆", label:"Evening",    sub:"6 PM – 9 PM",   desc:"Wind down with purpose" },
  { icon:"🌙", label:"Late Night", sub:"9 PM – 12 AM",  desc:"Night owl energy" },
];

const POD_MEMBERS = [
  { name:"Arjun S.",   initials:"AS", streak:14, status:"done",    credibility:890, habit:"Fitness" },
  { name:"Priya R.",   initials:"PR", streak:7,  status:"pending", credibility:720, habit:"Reading" },
  { name:"Karthik M.", initials:"KM", streak:0,  status:"ghost",   credibility:310, habit:"Coding"  },
];

// ── ATOMS ─────────────────────────────────────────────────────────────────────
function Tag({ children, color="muted" }) {
  const C = {
    fire:  { bg:"rgba(255,77,0,0.1)",   border:"rgba(255,77,0,0.25)",   text:"#FF7733" },
    blue:  { bg:"rgba(91,156,246,0.1)", border:"rgba(91,156,246,0.25)", text:"#5B9CF6" },
    green: { bg:"rgba(52,211,153,0.1)", border:"rgba(52,211,153,0.25)", text:"#34D399" },
    gold:  { bg:"rgba(255,179,71,0.1)", border:"rgba(255,179,71,0.25)", text:"#FFB347" },
    muted: { bg:"rgba(255,255,255,0.04)", border:"var(--border2)", text:"var(--text2)" },
  }[color] || { bg:"rgba(255,255,255,0.04)", border:"var(--border2)", text:"var(--text2)" };
  return (
    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:1.5, padding:"3px 8px", borderRadius:20, background:C.bg, border:`1px solid ${C.border}`, color:C.text, display:"inline-block", whiteSpace:"nowrap" }}>
      {children}
    </span>
  );
}

function PrimaryBtn({ children, onClick, disabled, style={} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", padding:"15px",
      background: disabled ? "var(--card2)" : "linear-gradient(135deg,var(--fire) 0%,#FF6520 100%)",
      color: disabled ? "var(--text3)" : "white",
      border: disabled ? "1px solid var(--border)" : "1px solid rgba(255,77,0,0.3)",
      borderRadius: R("lg"), cursor: disabled ? "not-allowed" : "pointer",
      fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:600, letterSpacing:"0.3px",
      transition:"all 0.2s",
      boxShadow: disabled ? "none" : "0 4px 24px rgba(255,77,0,0.25),inset 0 1px 0 rgba(255,255,255,0.1)",
      ...style,
    }}
      onMouseEnter={e=>{ if(!disabled){e.target.style.transform="translateY(-1px)"; e.target.style.boxShadow="0 8px 32px rgba(255,77,0,0.35),inset 0 1px 0 rgba(255,255,255,0.1)";} }}
      onMouseLeave={e=>{ e.target.style.transform=""; e.target.style.boxShadow=disabled?"none":"0 4px 24px rgba(255,77,0,0.25),inset 0 1px 0 rgba(255,255,255,0.1)"; }}
    >{children}</button>
  );
}

function StepBar({ step, total=4 }) {
  return (
    <div style={{ display:"flex", gap:4, marginBottom:40 }}>
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{ flex:1, height:2, borderRadius:2, overflow:"hidden", background:"var(--border2)" }}>
          <div style={{ height:"100%", borderRadius:2, width: i<=step?"100%":"0%", transition:"width 0.5s cubic-bezier(0.16,1,0.3,1)", background: i<step?"linear-gradient(90deg,var(--fire),var(--ember))":i===step?"linear-gradient(90deg,var(--ember),var(--gold))":"transparent" }} />
        </div>
      ))}
    </div>
  );
}

function ObHeader({ step, label, title, sub }) {
  return (
    <>
      <StepBar step={step} />
      <Tag color="fire">{label}</Tag>
      <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:26, fontWeight:600, lineHeight:1.2, marginTop:14, marginBottom:8, letterSpacing:"-0.5px" }}>{title}</h2>
      <p style={{ fontSize:14, color:"var(--text2)", marginBottom:32, lineHeight:1.7 }}>{sub}</p>
    </>
  );
}

function Screen({ children }) {
  return <div className="screen-enter" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"var(--dark)" }}>{children}</div>;
}

function Container({ children }) {
  return <div style={{ maxWidth:520, width:"100%", margin:"0 auto", padding:"40px 24px 80px", flex:1, display:"flex", flexDirection:"column" }}>{children}</div>;
}

// ── SPLASH ────────────────────────────────────────────────────────────────────
function SplashScreen({ onNext }) {
  const [m, setM] = useState(false);
  useEffect(()=>{ setTimeout(()=>setM(true),80); },[]);

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--dark)", position:"relative", overflow:"hidden", padding:24, textAlign:"center" }}>
      {/* Ambient orbs */}
      <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", top:"0%", left:"50%", transform:"translateX(-50%)", background:"radial-gradient(circle,rgba(255,77,0,0.08) 0%,transparent 65%)", animation:"orb 14s ease-in-out infinite", pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", bottom:"5%", right:"5%", background:"radial-gradient(circle,rgba(255,179,71,0.05) 0%,transparent 65%)", animation:"orb2 18s ease-in-out infinite", pointerEvents:"none" }} />
      {/* Grid */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize:"60px 60px", maskImage:"radial-gradient(ellipse at center,black 30%,transparent 75%)", WebkitMaskImage:"radial-gradient(ellipse at center,black 30%,transparent 75%)" }} />

      <div style={{ position:"relative", zIndex:1 }}>
        {/* Fade-in block 1 */}
        <div style={{ opacity:m?1:0, transform:m?"translateY(0)":"translateY(24px)", transition:"all 0.7s cubic-bezier(0.16,1,0.3,1)" }}>
          <div style={{ width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,rgba(255,77,0,0.14),rgba(255,179,71,0.07))", border:"1px solid rgba(255,77,0,0.18)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", boxShadow:"0 0 50px rgba(255,77,0,0.1)" }}>
            <span style={{ fontSize:32, animation:"flamePulse 2.5s ease-in-out infinite", display:"block" }}>🔥</span>
          </div>
          <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(80px,16vw,120px)", letterSpacing:12, lineHeight:0.95, background:"linear-gradient(160deg,#fff 0%,rgba(255,255,255,0.55) 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>FORGE</h1>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:4, color:"var(--text3)", marginTop:14, textTransform:"uppercase" }}>Forge Your Habits. Forge Your Life.</p>
        </div>

        {/* Fade-in block 2 */}
        <div style={{ marginTop:52, opacity:m?1:0, transform:m?"translateY(0)":"translateY(16px)", transition:"all 0.7s 0.22s cubic-bezier(0.16,1,0.3,1)" }}>
          <button onClick={onNext} style={{ background:"linear-gradient(135deg,var(--fire),#FF6520)", color:"white", border:"1px solid rgba(255,77,0,0.35)", padding:"14px 40px", borderRadius:R("lg"), fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:600, letterSpacing:"0.3px", cursor:"pointer", boxShadow:"0 4px 32px rgba(255,77,0,0.28),inset 0 1px 0 rgba(255,255,255,0.1)", transition:"all 0.2s" }}
            onMouseEnter={e=>{ e.target.style.transform="translateY(-2px)"; e.target.style.boxShadow="0 10px 40px rgba(255,77,0,0.4),inset 0 1px 0 rgba(255,255,255,0.1)"; }}
            onMouseLeave={e=>{ e.target.style.transform=""; e.target.style.boxShadow="0 4px 32px rgba(255,77,0,0.28),inset 0 1px 0 rgba(255,255,255,0.1)"; }}
          >Begin Your Forge →</button>
          <p style={{ marginTop:14, fontSize:12, color:"var(--text3)" }}>Science-backed · Socially accountable · Adaptive</p>
        </div>

        {/* Pills */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:44, opacity:m?1:0, transition:"opacity 0.7s 0.44s" }}>
          {["Pace Engine","Soft & Hard Mode","AI Coach","Pod Accountability"].map(f=>(
            <span key={f} style={{ background:"var(--card)", border:"1px solid var(--border2)", borderRadius:20, padding:"5px 12px", fontSize:11, color:"var(--text2)", fontWeight:500 }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── OB SCREENS ────────────────────────────────────────────────────────────────
function ObHabit({ state, setState, onNext }) {
  return (
    <Screen><Container>
      <ObHeader step={0} label="Step 1 of 4 · Habit" title="What do you want to build?" sub="Pick one area. Forge starts you with a single tiny habit — small enough that failure is almost impossible." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:32 }}>
        {HABITS.map(h=>(
          <div key={h.label} className={`sel-card ${state.habit?.label===h.label?"selected":""}`} onClick={()=>setState(s=>({...s,habit:h}))} style={{ padding:"16px 14px" }}>
            <span style={{ fontSize:22, display:"block", marginBottom:8 }}>{h.icon}</span>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>{h.label}</div>
            <div style={{ fontSize:11, color:"var(--text2)", lineHeight:1.5 }}>{h.desc}</div>
            {state.habit?.label===h.label && <div style={{ position:"absolute", top:10, right:10, width:18, height:18, borderRadius:"50%", background:"var(--fire)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"white" }}>✓</div>}
          </div>
        ))}
      </div>
      <PrimaryBtn onClick={onNext} disabled={!state.habit}>Continue →</PrimaryBtn>
    </Container></Screen>
  );
}

function ObMode({ state, setState, onNext }) {
  const modes = [
    { id:"soft",  icon:"🌊", label:"Soft Mode",  tagline:"A kind mentor. Never punishes.",  accent:"var(--soft-blue)", desc:"Halfway counts. Streaks survive tough days. Recovery is celebrated as much as success. Built for real life.", tags:["Forgiving Streaks","Partial Progress","Gentle Nudges"] },
    { id:"hard",  icon:"🔥", label:"Hard Mode",  tagline:"A strict coach. No excuses.",      accent:"var(--fire)",      desc:"Only full completions count. Miss a day and your pod knows. High stakes — for people who want to be pushed hard.", tags:["Full Completions Only","High Stakes","No Mercy"] },
  ];
  return (
    <Screen><Container>
      <ObHeader step={1} label="Step 2 of 4 · Mode" title="How do you want to be coached?" sub="This shapes your coach's personality, notification style, and streak rules. Switch anytime." />
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
        {modes.map(m=>(
          <div key={m.id} className={`sel-card ${state.mode===m.id?"selected":""}`} onClick={()=>setState(s=>({...s,mode:m.id}))} style={{ padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize:15, fontWeight:600 }}>{m.label}</div>
                  <div style={{ fontSize:12, color:m.accent, marginTop:1 }}>{m.tagline}</div>
                </div>
              </div>
              {state.mode===m.id && <div style={{ width:20, height:20, borderRadius:"50%", background:m.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"white", flexShrink:0 }}>✓</div>}
            </div>
            <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.65, marginBottom:12 }}>{m.desc}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{m.tags.map(t=><Tag key={t} color="muted">{t}</Tag>)}</div>
          </div>
        ))}
      </div>
      <PrimaryBtn onClick={onNext} disabled={!state.mode}>Continue →</PrimaryBtn>
    </Container></Screen>
  );
}

function ObPersona({ state, setState, onNext }) {
  return (
    <Screen><Container>
      <ObHeader step={2} label="Step 3 of 4 · Coach" title="Who will push you?" sub="Your AI coach speaks in their voice, never breaks character, and adapts to your habit and mode." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom: state.persona ? 16 : 32 }}>
        {PERSONAS.map(p=>(
          <div key={p.id} className={`sel-card ${state.persona?.id===p.id?"selected":""}`} onClick={()=>setState(s=>({...s,persona:p}))} style={{ padding:"16px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:24 }}>{p.emoji}</span>
              {state.persona?.id===p.id && <div style={{ width:18, height:18, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"white" }}>✓</div>}
            </div>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>{p.name}</div>
            <div style={{ fontSize:11, color:"var(--text2)", lineHeight:1.55 }}>{p.tagline}</div>
          </div>
        ))}
      </div>
      {state.persona && (
        <div className="fade-in" style={{ background:"var(--card)", border:"1px solid var(--border2)", borderRadius:R("lg"), borderTopLeftRadius:4, padding:"16px", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ fontSize:18 }}>{state.persona.emoji}</span>
            <div>
              <div style={{ fontSize:12, fontWeight:600 }}>{state.persona.name}</div>
              <div style={{ fontSize:9, color:"var(--text3)", fontFamily:"'Space Mono',monospace", letterSpacing:1 }}>PREVIEW</div>
            </div>
          </div>
          <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.7, fontStyle:"italic" }}>"{state.persona.greeting}"</p>
        </div>
      )}
      <PrimaryBtn onClick={onNext} disabled={!state.persona}>Continue →</PrimaryBtn>
    </Container></Screen>
  );
}

function ObTime({ state, setState, onFinish }) {
  return (
    <Screen><Container>
      <ObHeader step={3} label="Step 4 of 4 · Schedule" title="When are you most free?" sub="Forge fits your habit into your actual life — not a rigid schedule you'll abandon by Day 3." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:32 }}>
        {TIMES.map(t=>(
          <div key={t.label} className={`sel-card ${state.time?.label===t.label?"selected":""}`} onClick={()=>setState(s=>({...s,time:t}))} style={{ padding:"18px 14px" }}>
            <span style={{ fontSize:26, display:"block", marginBottom:10 }}>{t.icon}</span>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>{t.label}</div>
            <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"'Space Mono',monospace", marginBottom:4 }}>{t.sub}</div>
            <div style={{ fontSize:11, color:"var(--text2)" }}>{t.desc}</div>
            {state.time?.label===t.label && <div style={{ position:"absolute", top:10, right:10, width:18, height:18, borderRadius:"50%", background:"var(--fire)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"white" }}>✓</div>}
          </div>
        ))}
      </div>
      <PrimaryBtn onClick={onFinish} disabled={!state.time}>Forge My Routine 🔥</PrimaryBtn>
    </Container></Screen>
  );
}

// ── HABIT CARD ────────────────────────────────────────────────────────────────
function HabitCard({ icon, name, timeLabel, streak, status, mode, onFull, onPartial, delay=0 }) {
  const done = !!status;
  const partial = status==="partial";
  return (
    <div className="fade-up" style={{ background:"var(--card)", borderRadius:R("lg"), border:`1px solid ${done?(partial?"rgba(91,156,246,0.3)":"rgba(52,211,153,0.3)"):"var(--border2)"}`, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:14, transition:"border-color 0.3s", animationDelay:`${delay}s` }}>
      <div style={{ fontSize:22, background:"var(--surface2)", width:46, height:46, borderRadius:R("sm"), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:"1px solid var(--border)" }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:500, marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name}</div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--text3)" }}>{timeLabel}</span>
          {partial && <Tag color="blue">½ counted</Tag>}
          {!partial && done && <Tag color="green">Done</Tag>}
        </div>
      </div>
      <div style={{ fontSize:13, fontWeight:600, color:"var(--ember)", flexShrink:0 }}>{streak}🔥</div>
      {!done ? (
        <div style={{ display:"flex", flexDirection:"column", gap:4, flexShrink:0 }}>
          <button onClick={onFull} style={{ background:"var(--fire)", color:"white", border:"none", width:36, height:36, borderRadius:R("sm"), fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(255,77,0,0.3)", transition:"all 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform=""}>✓</button>
          {mode==="soft" && <button onClick={onPartial} style={{ background:"rgba(91,156,246,0.12)", color:"var(--soft-blue)", border:"1px solid rgba(91,156,246,0.2)", width:36, height:16, borderRadius:4, fontSize:9, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Mono',monospace" }}>½</button>}
        </div>
      ) : (
        <div style={{ background:partial?"rgba(91,156,246,0.12)":"rgba(52,211,153,0.12)", color:partial?"var(--soft-blue)":"var(--green)", width:36, height:36, borderRadius:R("sm"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, animation:"checkPop 0.3s ease", flexShrink:0 }}>
          {partial?"½":"✓"}
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ state, checkedHabits: externalChecked, onOpenChat, onOpenProof, onGo }) {
  const [localChecked, setLocalChecked] = useState({});
  const checked = Object.keys(externalChecked||{}).length ? externalChecked : localChecked;
  const [streak, setStreak] = useState(1);
  const [ghostMode, setGhostMode] = useState(false);
  const persona = state.persona ?? PERSONAS[0];

  const handleCheck = (key, partial=false) => {
    if (checked[key]) return;
    setLocalChecked(s=>({...s,[key]:partial?"partial":"full"}));
    spawnConfetti(partial?10:24);
    if(!partial) setStreak(s=>s+1);
  };

  const hour = new Date().getHours();
  const greeting = hour<5?"Still up? 🌙":hour<12?"Good morning ☀️":hour<17?"Good afternoon ⚡":hour<21?"Good evening 🌆":"Good night 🌙";
  const total = 2;
  const done = Object.keys(checked).length;
  const pct = Math.round((done/total)*100);
  const modeIsHard = state.mode === "hard";

  // SVG ring
  const R_ring = 44, circ = 2*Math.PI*R_ring;
  const dash = circ * (1 - pct/100);


  return (
    <div className="screen-enter" style={{ minHeight:"100vh", background:"var(--dark)", paddingBottom:80 }}>

      {/* ── HERO HEADER ── */}
      <div style={{ position:"relative", overflow:"hidden",
        background: modeIsHard
          ? "linear-gradient(160deg,rgba(255,77,0,0.18) 0%,rgba(255,77,0,0.04) 55%,transparent 100%)"
          : "linear-gradient(160deg,rgba(91,156,246,0.14) 0%,rgba(91,156,246,0.03) 55%,transparent 100%)",
        borderBottom:"1px solid var(--border)", paddingBottom:20 }}>

        {/* ambient glow */}
        <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", top:-120, right:-60,
          background: modeIsHard ? "radial-gradient(circle,rgba(255,77,0,0.12) 0%,transparent 70%)"
            : "radial-gradient(circle,rgba(91,156,246,0.1) 0%,transparent 70%)", pointerEvents:"none" }} />

        <div style={{ maxWidth:540, margin:"0 auto", padding:"20px 24px 0" }}>
          {/* Top row */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <p style={{ fontSize:12, color:"var(--text3)", marginBottom:3 }}>{greeting}</p>
              <h1 style={{ fontSize:24, fontWeight:700, letterSpacing:"-0.5px", lineHeight:1.1 }}>Today's Forge</h1>
              <div style={{ marginTop:6 }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:1.5, padding:"3px 8px",
                  borderRadius:20, background: modeIsHard?"rgba(255,77,0,0.1)":"rgba(91,156,246,0.1)",
                  border: modeIsHard?"1px solid rgba(255,77,0,0.25)":"1px solid rgba(91,156,246,0.25)",
                  color: modeIsHard?"#FF7733":"#5B9CF6" }}>
                  {modeIsHard?"🔥 Hard Mode":"🌊 Soft Mode"}
                </span>
              </div>
            </div>

            {/* Ring progress */}
            <div style={{ position:"relative", width:100, height:100, flexShrink:0 }} onClick={() => onGo?.("pace")}
              title="View Pace Engine">
              <svg width={100} height={100} style={{ transform:"rotate(-90deg)", cursor:"pointer" }}>
                <circle cx={50} cy={50} r={R_ring} fill="none" stroke="var(--border2)" strokeWidth={6} />
                <circle cx={50} cy={50} r={R_ring} fill="none"
                  stroke={pct===100?"var(--green)": modeIsHard?"var(--fire)":"var(--soft-blue)"}
                  strokeWidth={6} strokeLinecap="round"
                  strokeDasharray={circ} strokeDashoffset={dash}
                  style={{ transition:"stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)" }} />
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:1 }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:"white", lineHeight:1 }}>{pct}%</span>
                <span style={{ fontSize:8, color:"var(--text3)", fontFamily:"'Space Mono',monospace", letterSpacing:1 }}>TODAY</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {[
              { label:"Streak", value:`${streak}🔥`, sub:"days" },
              { label:"Credibility", value:"540", sub:"pts" },
              { label:"Pod Rank", value:"#2", sub:"this week" },
            ].map(s => (
              <div key={s.label} style={{ background:"var(--card)", border:"1px solid var(--border)",
                borderRadius:R("md"), padding:"10px 12px" }}>
                <div style={{ fontSize:16, fontWeight:700, color:"var(--text)", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:9, color:"var(--text3)", fontFamily:"'Space Mono',monospace",
                  letterSpacing:1, marginTop:3 }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Dev 2: Ghost Mode Activation Toggle */}
          <div className="fade-up" style={{ marginTop: 20, background: ghostMode ? "rgba(248,113,113,0.05)" : "rgba(255,255,255,0.03)", border: ghostMode ? "1px solid rgba(248,113,113,0.2)" : "1px solid var(--border)", borderRadius: R("md"), padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.3s" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, color: ghostMode ? "var(--red)" : "var(--text)" }}>
                👻 Ghost Mode
                {!ghostMode && <Tag color="muted">1 Shield Available</Tag>}
                {ghostMode && <Tag color="red">ACTIVE</Tag>}
              </div>
              <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 4 }}>
                {ghostMode ? "Your streak is safely paused. Grayed out to pod." : "Pause your streak safely without dropping rank."}
              </div>
            </div>
            <button 
              onClick={() => {
                setGhostMode(!ghostMode);
              }}
              style={{ background: ghostMode ? "rgba(248,113,113,0.15)" : "var(--card2)", border: ghostMode ? "1px solid rgba(248,113,113,0.3)" : "1px solid var(--border2)", color: ghostMode ? "var(--red)" : "var(--text)", padding: "7px 16px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }} 
              onMouseEnter={e => { if(!ghostMode) e.currentTarget.style.borderColor="rgba(248,113,113,0.4)" }} 
              onMouseLeave={e => { if(!ghostMode) e.currentTarget.style.borderColor="var(--border2)" }}>
              {ghostMode ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:540, margin:"0 auto", padding:"20px 24px 0" }}>

        {/* Completion banner */}
        {pct === 100 && (
          <div className="fade-in" style={{ background:"linear-gradient(135deg,rgba(52,211,153,0.12),rgba(52,211,153,0.04))",
            border:"1px solid rgba(52,211,153,0.25)", borderRadius:R("lg"), padding:"12px 16px",
            marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>🎉</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--green)" }}>Full stack complete!</div>
              <div style={{ fontSize:11, color:"var(--text2)" }}>Credibility +20 · Pod notified</div>
            </div>
          </div>
        )}

        {/* Soft mode tip */}
        {state.mode === "soft" && done === 0 && (
          <div style={{ background:"rgba(91,156,246,0.05)", border:"1px solid rgba(91,156,246,0.12)",
            borderRadius:R("md"), padding:"10px 14px", marginBottom:16, fontSize:12,
            color:"var(--soft-blue)", lineHeight:1.6 }}>
            🌊 Soft Mode: even a halfway attempt (½) keeps your streak alive.
          </div>
        )}

        {/* Habits */}
        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5,
          color:"var(--text3)", textTransform:"uppercase", marginBottom:12 }}>Today's Habits</p>
        <HabitCard icon={state.habit?.icon??"💪"} name={`${state.habit?.label??"Fitness"} — Week 1`}
          timeLabel={`${(state.time?.label??"Morning").toUpperCase()} · 1 MIN`}
          streak={streak} status={checked["h1"]} mode={state.mode}
          onFull={()=>onOpenProof({key:"h1", label:state.habit?.label??"Fitness", icon:state.habit?.icon??"💪"})}
          onPartial={()=>handleCheck("h1",true)} delay={0} />
        <HabitCard icon="🧠" name="Daily Reflection" timeLabel="EVENING · 5 MIN"
          streak={3} status={checked["h2"]} mode={state.mode}
          onFull={()=>onOpenProof({key:"h2", label:"Daily Reflection", icon:"🧠"})}
          onPartial={()=>handleCheck("h2",true)} delay={0.06} />

        {/* Pace Engine mini */}
        <div className="fade-up" onClick={() => onGo?.("pace")}
          style={{ background:"var(--card)", border:"1px solid var(--border2)", borderRadius:R("md"),
            padding:"12px 16px", marginBottom:16, cursor:"pointer", animationDelay:"0.1s",
            display:"flex", alignItems:"center", gap:14 }}
          onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,179,71,0.3)"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border2)"}>
          <div style={{ width:38, height:38, borderRadius:R("sm"), background:"rgba(255,179,71,0.08)",
            border:"1px solid rgba(255,179,71,0.2)", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:18, flexShrink:0 }}>⚙️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>Pace Engine</div>
            <div style={{ fontSize:11, color:"var(--text2)" }}>Week 1 · 1 min → on track for 3 min Week 2</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:3, flexShrink:0 }}>
            <div style={{ height:16, width:4, background:"var(--fire)", borderRadius:2 }} />
            <div style={{ height:11, width:4, background:"var(--border2)", borderRadius:2 }} />
            <div style={{ height:8, width:4, background:"var(--border2)", borderRadius:2 }} />
          </div>
          <div style={{ fontSize:12, color:"var(--text3)", flexShrink:0 }}>→</div>
        </div>

        {/* AI Coach */}
        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5,
          color:"var(--text3)", textTransform:"uppercase", marginBottom:12 }}>AI Coach</p>
        <div className="fade-up" onClick={onOpenChat}
          style={{ background:`linear-gradient(135deg,${persona.color}10,${persona.color}04)`,
            border:`1px solid ${persona.color}22`, borderRadius:R("lg"),
            padding:"16px", cursor:"pointer", marginBottom:16, animationDelay:"0.14s", transition:"all 0.2s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=`${persona.color}44`; e.currentTarget.style.transform="translateY(-1px)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=`${persona.color}22`; e.currentTarget.style.transform="";}}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
            <div style={{ width:44, height:44, borderRadius:R("md"), background:`${persona.color}18`,
              border:`1px solid ${persona.color}30`, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:22, flexShrink:0 }}>{persona.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600 }}>{persona.name}</div>
              <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"'Space Mono',monospace", letterSpacing:1 }}>AI COACH · TAP TO CHAT</div>
            </div>
            <div style={{ background:"var(--fire)", color:"white", fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20 }}>CHAT →</div>
          </div>
          <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.7, fontStyle:"italic",
            borderLeft:`2px solid ${persona.color}44`, paddingLeft:12 }}>
            "{persona.greeting.substring(0,100)}..."
          </p>
        </div>

        {/* Pod strip */}
        <div className="fade-up" style={{ animationDelay:"0.18s", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5, color:"var(--text3)", textTransform:"uppercase" }}>Your Pod</p>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:"var(--green)", fontFamily:"'Space Mono',monospace" }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--green)", display:"inline-block", animation:"livePulse 1.5s infinite" }} />LIVE
              </div>
              <button onClick={() => onGo?.("pod")} style={{ background:"none", border:"1px solid var(--border2)", color:"var(--text3)", padding:"3px 10px", borderRadius:20, fontSize:11, cursor:"pointer" }}>
                See feed →
              </button>
            </div>
          </div>
          <div style={{ background:"var(--card)", border:"1px solid var(--border2)", borderRadius:R("lg"), padding:"14px 16px" }}>
            <div style={{ display:"flex", gap:12 }}>
              {POD_MEMBERS.map((m,i) => (
                <div key={m.name} style={{ flex:1, textAlign:"center" }}>
                  <div style={{ position:"relative", display:"inline-block", marginBottom:6 }}>
                    <div style={{ width:44, height:44, borderRadius:"50%",
                      background: m.status==="ghost" ? "var(--surface2)" : i===0 ? "linear-gradient(135deg,var(--fire),var(--gold))" : i===1 ? "linear-gradient(135deg,#5B9CF6,#a78bfa)" : "linear-gradient(135deg,#34D399,#6EE7B7)",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"white", margin:"0 auto",
                      filter: m.status==="ghost" ? "grayscale(1)" : "none", opacity: m.status==="ghost" ? 0.5 : 1,
                      border: m.status==="done" ? "2px solid var(--green)" : m.status==="ghost" ? "2px solid rgba(248,113,113,0.4)" : "2px solid var(--border2)" }}>
                      {m.initials}
                    </div>
                    <div style={{ position:"absolute", bottom:-2, right:-2, width:14, height:14, borderRadius:"50%", fontSize:8, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--dark)", border:"1px solid var(--border)" }}>
                      {m.status==="done"?"✅":m.status==="ghost"?"👻":"⏳"}
                    </div>
                  </div>
                  <div style={{ fontSize:11, fontWeight:500, marginBottom:1, color: m.status==="ghost" ? "var(--text3)" : "var(--text)" }}>{m.name.split(" ")[0]}</div>
                  <div style={{ fontSize:11, color:"var(--ember)", fontWeight:600 }}>{m.streak}🔥</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:12, color:"var(--text2)" }}>Pod streak: <strong style={{ color:"var(--ember)" }}>5 days 🔥</strong></div>
              <div style={{ fontSize:11, color:"var(--text3)" }}>Karthik: <span style={{ color:"#F87171" }}>👻 ghost</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CHAT ──────────────────────────────────────────────────────────────────────
function ChatScreen({ state, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem("forge_api_key")||"");
  const [keyInput, setKeyInput] = useState("");
  const [keySaved, setKeySaved] = useState(!!localStorage.getItem("forge_api_key"));
  const historyRef = useRef([]);
  const endRef = useRef(null);
  const persona = state.persona ?? PERSONAS[0];

  useEffect(()=>{ setMessages([{role:"coach",text:persona.greeting,ts:nowTime()}]); },[]);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);

  function saveKey() {
    const k=keyInput.trim();
    if(k.startsWith("sk-ant")){ localStorage.setItem("forge_api_key",k); setApiKey(k); setKeySaved(true); }
  }

  async function send() {
    if(!input.trim()||loading) return;
    const text=input.trim(); setInput("");
    setMessages(m=>[...m,{role:"user",text,ts:nowTime()}]);
    historyRef.current.push({role:"user",content:text});
    setLoading(true);
    if(!apiKey){
      const fb={rock:"Get that API key in and I'll be live.",monk:"Add the API key and the words will flow.",hustler:"No API key = Ferrari with no fuel.",champion:"Prepare properly. Get that key in.",friend:"lol i'm offline 😅 add the API key above!"};
      setTimeout(()=>{ setLoading(false); setMessages(m=>[...m,{role:"coach",text:fb[persona.id]??fb.rock,ts:nowTime()}]); },900);
      return;
    }
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:200, system:`${persona.systemPrompt} User habit:${state.habit?.label??"general"}. Mode:${state.mode??"soft"}. Schedule:${state.time?.label??"morning"}.`, messages:historyRef.current }),
      });
      const data=await res.json();
      const reply=data?.content?.[0]?.text??(data?.error?.message?`⚠️ ${data.error.message}`:"Something went wrong.");
      historyRef.current.push({role:"assistant",content:reply});
      setMessages(m=>[...m,{role:"coach",text:reply,ts:nowTime()}]);
    } catch { setMessages(m=>[...m,{role:"coach",text:"⚠️ Could not reach the API.",ts:nowTime()}]); }
    finally { setLoading(false); }
  }

  return (
    <div className="screen-enter" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"var(--dark)" }}>
      <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", background:"var(--surface)", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"var(--text2)", fontSize:18, cursor:"pointer", padding:4 }}>←</button>
        <div style={{ width:36, height:36, borderRadius:R("sm"), background:`linear-gradient(135deg,${persona.color}22,${persona.color}11)`, border:`1px solid ${persona.color}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{persona.emoji}</div>
        <div>
          <div style={{ fontSize:14, fontWeight:600 }}>{persona.name}</div>
          <div style={{ fontSize:9, color:"var(--text3)", fontFamily:"'Space Mono',monospace", letterSpacing:1 }}>AI COACH · IN CHARACTER</div>
        </div>
      </div>

      {!keySaved && (
        <div style={{ padding:"12px 20px", background:"rgba(255,77,0,0.05)", borderBottom:"1px solid rgba(255,77,0,0.1)", maxWidth:540, width:"100%", margin:"0 auto" }}>
          <p style={{ fontSize:12, color:"var(--ember)", marginBottom:8 }}>⚠️ Paste your Claude API key to enable live coaching</p>
          <div style={{ display:"flex", gap:8 }}>
            <input value={keyInput} onChange={e=>setKeyInput(e.target.value)} type="password" placeholder="sk-ant-api03-..." style={{ flex:1, background:"var(--card)", border:"1px solid var(--border2)", borderRadius:R("sm"), padding:"9px 12px", color:"var(--text)", fontFamily:"'Space Mono',monospace", fontSize:11, outline:"none" }} />
            <button onClick={saveKey} style={{ background:"var(--fire)", color:"white", border:"none", padding:"9px 16px", borderRadius:R("sm"), fontSize:13, fontWeight:600, cursor:"pointer" }}>Save</button>
          </div>
        </div>
      )}

      <div style={{ flex:1, overflowY:"auto", padding:"20px", display:"flex", flexDirection:"column", gap:14, maxWidth:540, width:"100%", margin:"0 auto" }}>
        {messages.map((msg,i)=>(
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:msg.role==="user"?"flex-end":"flex-start", alignSelf:msg.role==="user"?"flex-end":"flex-start", maxWidth:"82%", animation:"fadeUp 0.25s ease" }}>
            <div style={{ padding:"11px 15px", borderRadius:R("lg"), borderBottomRightRadius:msg.role==="user"?3:undefined, borderBottomLeftRadius:msg.role==="coach"?3:undefined, background:msg.role==="user"?"var(--fire)":"var(--card)", border:msg.role==="coach"?"1px solid var(--border2)":"none", fontSize:14, lineHeight:1.65 }}>{msg.text}</div>
            <div style={{ fontSize:10, color:"var(--text3)", marginTop:4, fontFamily:"'Space Mono',monospace" }}>{msg.role==="coach"?`${persona.emoji} `:""}{msg.ts}</div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf:"flex-start", maxWidth:"82%" }}>
            <div style={{ padding:"12px 16px", borderRadius:R("lg"), borderBottomLeftRadius:3, background:"var(--card)", border:"1px solid var(--border2)", display:"flex", gap:5, alignItems:"center" }}>
              {[0,1,2].map(i=><span key={i} style={{ width:6, height:6, borderRadius:"50%", background:"var(--text3)", display:"inline-block", animation:`typingBounce 1.1s ${i*0.18}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding:"12px 20px 24px", borderTop:"1px solid var(--border)", display:"flex", gap:10, maxWidth:540, width:"100%", margin:"0 auto", background:"var(--dark)" }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Talk to your coach..."
          style={{ flex:1, background:"var(--card)", border:"1px solid var(--border2)", borderRadius:R("md"), padding:"11px 14px", color:"var(--text)", fontFamily:"'Inter',sans-serif", fontSize:14, outline:"none", transition:"border-color 0.2s" }}
          onFocus={e=>e.target.style.borderColor="rgba(255,77,0,0.4)"} onBlur={e=>e.target.style.borderColor="var(--border2)"} />
        <button onClick={send} disabled={loading} style={{ background:"var(--fire)", color:"white", border:"none", width:44, height:44, borderRadius:R("sm"), fontSize:16, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:loading?0.6:1, boxShadow:"0 2px 12px rgba(255,77,0,0.25)", transition:"all 0.15s" }}>→</button>
      </div>
    </div>
  );
}

// ── PROOF CHECK-IN SCREEN ────────────────────────────────────────────────────
function ProofCheckIn({ state, habit, onBack, onComplete }) {
  const [phase, setPhase] = useState("choose"); // choose | capture | submitting | done
  const [proofType, setProofType] = useState(null); // "photo" | "halfway" | "text"
  const [previewUrl, setPreviewUrl] = useState(null);
  const [note, setNote] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const mode = state.mode ?? "soft";

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setProofType("photo");
    setPhase("capture");
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleSubmit() {
    setPhase("submitting");
    setTimeout(() => { setPhase("done"); spawnConfetti(proofType === "halfway" ? 14 : 36); }, 1400);
  }

  function handleDone() { onComplete(proofType === "halfway" ? "partial" : "full"); }

  const habitLabel = habit?.label ?? state.habit?.label ?? "Habit";
  const habitIcon  = habit?.icon  ?? state.habit?.icon  ?? "💪";

  // ── PHASE: CHOOSE ──
  if (phase === "choose") return (
    <div className="screen-enter" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"var(--dark)" }}>
      {/* Header */}
      <div style={{ padding:"18px 20px 14px", borderBottom:"1px solid var(--border)", background:"var(--surface)", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"var(--text2)", fontSize:18, cursor:"pointer", padding:4 }}>←</button>
        <div>
          <div style={{ fontSize:14, fontWeight:600 }}>Proof Check-In</div>
          <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"'Space Mono',monospace", letterSpacing:1 }}>{habitIcon} {habitLabel.toUpperCase()}</div>
        </div>
        <Tag color={mode==="hard"?"fire":"blue"} style={{ marginLeft:"auto" }}>{mode==="hard"?"🔥 Hard":"🌊 Soft"}</Tag>
      </div>

      <div style={{ maxWidth:520, width:"100%", margin:"0 auto", padding:"32px 24px 60px", flex:1, display:"flex", flexDirection:"column" }}>

        {/* Habit context card */}
        <div className="fade-up" style={{ background:"var(--card)", border:"1px solid var(--border2)", borderRadius:R("lg"), padding:"16px", marginBottom:28, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:R("sm"), background:"var(--surface2)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{habitIcon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{habitLabel} — Week 1</div>
            <div style={{ fontSize:12, color:"var(--text2)" }}>Prove you showed up today</div>
          </div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--ember)" }}>TODAY</div>
        </div>

        {/* Section label */}
        <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5, color:"var(--text3)", textTransform:"uppercase", marginBottom:16 }}>How do you want to prove it?</p>

        {/* Proof options */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>

          {/* Photo proof */}
          <div
            className="sel-card"
            onDragOver={e=>{e.preventDefault();setDragOver(true);}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={handleDrop}
            onClick={()=>fileRef.current.click()}
            style={{ padding:"20px", borderColor: dragOver?"var(--fire)":"", background: dragOver?"rgba(255,77,0,0.05)":"" }}
          >
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])} />
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:R("sm"), background:"rgba(255,77,0,0.08)", border:"1px solid rgba(255,77,0,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>📸</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>Upload Photo Proof</div>
                <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.6 }}>Screenshot or photo of your session. Shared with your pod.</div>
              </div>
              <Tag color="fire">+15 cred</Tag>
            </div>
            <div style={{ marginTop:14, border:"1.5px dashed rgba(255,77,0,0.2)", borderRadius:R("sm"), padding:"12px", textAlign:"center" }}>
              <div style={{ fontSize:12, color:"var(--text3)" }}>Drop image here or tap to browse</div>
            </div>
          </div>

          {/* Text note */}
          <div className="sel-card" onClick={()=>{ setProofType("text"); setPhase("capture"); }} style={{ padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:R("sm"), background:"rgba(91,156,246,0.08)", border:"1px solid rgba(91,156,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>✍️</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>Write a Note</div>
                <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.6 }}>Describe what you did. Shared with your pod as a text post.</div>
              </div>
              <Tag color="blue">+10 cred</Tag>
            </div>
          </div>

          {/* Halfway — only in soft mode */}
          {mode === "soft" && (
            <div className="sel-card" onClick={()=>{ setProofType("halfway"); setPhase("capture"); }} style={{ padding:"20px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:R("sm"), background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>½</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>Halfway Check-In</div>
                  <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.6 }}>Started but couldn't finish. Streak stays alive in Soft Mode.</div>
                </div>
                <Tag color="green">Streak safe</Tag>
              </div>
              <div style={{ marginTop:10, background:"rgba(52,211,153,0.05)", border:"1px solid rgba(52,211,153,0.12)", borderRadius:R("sm"), padding:"8px 12px", fontSize:11, color:"var(--green)", lineHeight:1.6 }}>
                Starting is half the battle — Forge counts it.
              </div>
            </div>
          )}
        </div>

        {/* Hard mode info */}
        {mode === "hard" && (
          <div style={{ background:"rgba(255,77,0,0.05)", border:"1px solid rgba(255,77,0,0.15)", borderRadius:R("md"), padding:"12px 16px", fontSize:12, color:"var(--ember)", lineHeight:1.7 }}>
            🔥 Hard Mode: only full completions with proof count toward your streak. No halfway option.
          </div>
        )}
      </div>
    </div>
  );

  // ── PHASE: CAPTURE (photo preview / text note / halfway) ──
  if (phase === "capture") return (
    <div className="screen-enter" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"var(--dark)" }}>
      <div style={{ padding:"18px 20px 14px", borderBottom:"1px solid var(--border)", background:"var(--surface)", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={()=>{setPhase("choose");setPreviewUrl(null);setProofType(null);}} style={{ background:"none", border:"none", color:"var(--text2)", fontSize:18, cursor:"pointer", padding:4 }}>←</button>
        <div style={{ fontSize:14, fontWeight:600 }}>
          {proofType==="photo" ? "Review Your Proof" : proofType==="halfway" ? "Halfway Check-In" : "Write Your Note"}
        </div>
      </div>

      <div style={{ maxWidth:520, width:"100%", margin:"0 auto", padding:"28px 24px 60px", flex:1, display:"flex", flexDirection:"column" }}>

        {/* Photo preview */}
        {proofType === "photo" && previewUrl && (
          <div className="fade-up" style={{ position:"relative", marginBottom:20, borderRadius:R("lg"), overflow:"hidden", border:"1px solid var(--border2)" }}>
            <img src={previewUrl} alt="proof" style={{ width:"100%", maxHeight:280, objectFit:"cover", display:"block" }} />
            {/* Scan line animation */}
            <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
              <div style={{ position:"absolute", left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,rgba(255,77,0,0.6),transparent)", animation:"scanLine 1.4s ease-in-out 1 forwards" }} />
            </div>
            <div style={{ position:"absolute", top:10, right:10 }}>
              <Tag color="green">✓ Verified</Tag>
            </div>
            <button onClick={()=>fileRef.current?.click()} style={{ position:"absolute", bottom:10, right:10, background:"rgba(0,0,0,0.6)", color:"white", border:"1px solid var(--border2)", borderRadius:R("sm"), padding:"6px 12px", fontSize:11, cursor:"pointer" }}>Change</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])} />
          </div>
        )}

        {/* Halfway visual */}
        {proofType === "halfway" && (
          <div className="fade-up" style={{ marginBottom:20, borderRadius:R("lg"), border:"1px solid rgba(52,211,153,0.25)", background:"rgba(52,211,153,0.04)", padding:"28px 20px", textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>½</div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:6, color:"var(--green)" }}>Halfway Counts</div>
            <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.7 }}>You started. That's more than most people do. Your streak is safe.</div>
            {/* Mini progress bar */}
            <div style={{ marginTop:20, height:6, background:"var(--border2)", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:"50%", borderRadius:4, background:"linear-gradient(90deg,var(--green),#6EE7B7)", transition:"width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
            <div style={{ fontSize:11, color:"var(--text3)", marginTop:8, fontFamily:"'Space Mono',monospace" }}>50% complete</div>
          </div>
        )}

        {/* Note input — shown for text and optionally for photo/halfway */}
        <div className="fade-up" style={{ marginBottom:20, animationDelay:"0.05s" }}>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2.5, color:"var(--text3)", textTransform:"uppercase", marginBottom:10 }}>
            {proofType === "text" ? "Your note" : "Add a caption (optional)"}
          </p>
          <textarea
            value={note} onChange={e=>setNote(e.target.value)}
            placeholder={
              proofType === "halfway" ? "What did you manage to do? (optional)"
              : proofType === "text"  ? "What did you do today? Be specific — your pod will see this."
              : "Add context for your pod... (optional)"
            }
            rows={proofType === "text" ? 5 : 3}
            style={{ width:"100%", background:"var(--card)", border:"1px solid var(--border2)", borderRadius:R("md"), padding:"12px 14px", color:"var(--text)", fontFamily:"'Inter',sans-serif", fontSize:14, lineHeight:1.65, outline:"none", resize:"none", transition:"border-color 0.2s" }}
            onFocus={e=>e.target.style.borderColor="rgba(255,77,0,0.4)"}
            onBlur={e=>e.target.style.borderColor="var(--border2)"}
          />
          <div style={{ fontSize:11, color:"var(--text3)", marginTop:6, textAlign:"right", fontFamily:"'Space Mono',monospace" }}>{note.length} / 280</div>
        </div>

        {/* Pod visibility notice */}
        <div className="fade-up" style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:R("md"), padding:"12px 14px", marginBottom:24, display:"flex", alignItems:"center", gap:10, animationDelay:"0.1s" }}>
          <span style={{ fontSize:16 }}>👁</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:500, marginBottom:1 }}>Visible to your pod</div>
            <div style={{ fontSize:11, color:"var(--text3)" }}>Arjun S., Priya R., Karthik M. will see this</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"var(--green)", fontFamily:"'Space Mono',monospace" }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--green)", display:"inline-block", animation:"livePulse 1.5s infinite" }} />
            LIVE
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop:"auto" }}>
          <PrimaryBtn
            onClick={handleSubmit}
            disabled={proofType === "text" && note.trim().length < 3}
          >
            {proofType === "photo" ? "Post Proof to Pod →" : proofType === "halfway" ? "Submit Halfway Check-In →" : "Post Note to Pod →"}
          </PrimaryBtn>
          {proofType === "text" && note.trim().length < 3 && (
            <p style={{ fontSize:11, color:"var(--text3)", textAlign:"center", marginTop:8 }}>Write at least a few words</p>
          )}
        </div>
      </div>
    </div>
  );

  // ── PHASE: SUBMITTING ──
  if (phase === "submitting") return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--dark)", gap:20 }}>
      {/* Ripple loader */}
      <div style={{ position:"relative", width:80, height:80, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid var(--fire)", animation:`ripple 1.5s ${i*0.4}s ease-out infinite`, opacity:0 }} />
        ))}
        <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,var(--fire),var(--ember))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🔥</div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>Posting to your pod...</div>
        <div style={{ fontSize:12, color:"var(--text3)", fontFamily:"'Space Mono',monospace" }}>Syncing with Firestore</div>
      </div>
    </div>
  );

  // ── PHASE: DONE ──
  if (phase === "done") return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--dark)", padding:24, textAlign:"center" }}>
      <div style={{ animation:"successPop 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
        {/* Success ring */}
        <div style={{ width:96, height:96, borderRadius:"50%", background: proofType==="halfway" ? "rgba(52,211,153,0.1)" : "rgba(255,77,0,0.1)", border: `2px solid ${proofType==="halfway" ? "var(--green)" : "var(--fire)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, margin:"0 auto 24px", boxShadow: proofType==="halfway" ? "0 0 40px rgba(52,211,153,0.2)" : "0 0 40px rgba(255,77,0,0.2)" }}>
          {proofType === "halfway" ? "½" : "✓"}
        </div>

        <h2 style={{ fontSize:24, fontWeight:700, marginBottom:8, letterSpacing:"-0.5px" }}>
          {proofType === "halfway" ? "Halfway counts!" : "Proof posted!"}
        </h2>
        <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7, maxWidth:280, margin:"0 auto 28px" }}>
          {proofType === "halfway"
            ? "Your streak is safe. Starting is the hardest part — you did it."
            : "Your pod can see it. Credibility +15. Keep the streak alive."}
        </p>

        {/* Stats row */}
        <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:32 }}>
          {[
            { label:"Streak", value: proofType==="halfway" ? "Safe 🛡" : "+1 🔥" },
            { label:"Credibility", value: proofType==="halfway" ? "+5" : "+15" },
            { label:"Pod notified", value:"3 members" },
          ].map(s => (
            <div key={s.label} style={{ background:"var(--card)", border:"1px solid var(--border2)", borderRadius:R("md"), padding:"12px 16px", minWidth:90 }}>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:3 }}>{s.value}</div>
              <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"'Space Mono',monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <PrimaryBtn onClick={handleDone}>Back to Dashboard →</PrimaryBtn>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
const FUNNY_TOASTS = [
  { msg:"Your pod mate just checked in. Don't let them have all the glory.", icon:"👀" },
  { msg:"Day 13. One more day and your streak is older than most relationships.", icon:"🔥" },
  { msg:"Your morning stack is waiting. It misses you more than you miss your bed.", icon:"📚" },
  { msg:"Karthik went ghost again. That's 3 days. Your credibility is clean — keep it that way.", icon:"👻" },
  { msg:"The Pace Engine ran. You levelled up. Your Week 1 self would be shook.", icon:"⚡" },
];

const DASHBOARD_SCREENS = ["dashboard","pod","stack","pace","insights","leaderboard"];

export default function ForgeApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [screen, setScreen]         = useState("splash");
  const [forgeState, setForgeState] = useState({ habit:null, mode:null, persona:null, time:null });
  const [proofHabit, setProofHabit] = useState(null);
  const [checkedHabits, setCheckedHabits] = useState({});
  const [lapseUser, setLapseUser]   = useState(null);
  const { toasts, show: showToast } = useToast();
  const toastIdx = useRef(0);

  const go = useCallback(s => setScreen(s), []);

  const handleFinish = () => {
    spawnConfetti(44);
    go("dashboard");
    // Welcome toasts
    setTimeout(() => showToast("Habit locked in. The forge is lit. 🔥", "🔥"), 1200);
    setTimeout(() => showToast("Your pod has been matched. 3 members waiting.", "👥"), 3500);
  };

  // Periodic funny toast while on dashboard screens
  useEffect(() => {
    if (!DASHBOARD_SCREENS.includes(screen)) return;
    const iv = setInterval(() => {
      const t = FUNNY_TOASTS[toastIdx.current % FUNNY_TOASTS.length];
      showToast(t.msg, t.icon);
      toastIdx.current++;
    }, 22000);
    return () => clearInterval(iv);
  }, [screen]);

  function openProof(habit) { setProofHabit(habit); go("proof"); }
  function handleProofComplete(key, status) {
    setCheckedHabits(s => ({ ...s, [key]: status }));
    go("dashboard");
    if (status === "partial") showToast("Halfway counts! Streak safe. 🛡️", "½");
    else showToast("Proof posted to pod! +15 credibility. 🔥", "✓");
  }

  function openLapse(user) { setLapseUser(user); go("lapse"); }

  const showNav = DASHBOARD_SCREENS.includes(screen);

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <style>{css}</style>
      <ToastContainer toasts={toasts} />

      {/* — Onboarding — */}
      {screen==="splash"    && <SplashScreen onNext={()=>go("ob1")} />}
      {screen==="ob1"       && <ObHabit     state={forgeState} setState={setForgeState} onNext={()=>go("ob2")} />}
      {screen==="ob2"       && <ObMode      state={forgeState} setState={setForgeState} onNext={()=>go("ob3")} />}
      {screen==="ob3"       && <ObPersona   state={forgeState} setState={setForgeState} onNext={()=>go("ob4")} />}
      {screen==="ob4"       && <ObTime      state={forgeState} setState={setForgeState} onFinish={handleFinish} />}

      {/* — Main App — */}
      {screen==="dashboard" && <Dashboard   state={forgeState} checkedHabits={checkedHabits} onOpenChat={()=>go("chat")} onOpenProof={openProof} onGo={go} />}
      {screen==="pod"       && <PodFeedScreen   forgeState={forgeState} onBack={()=>go("dashboard")} showToast={showToast} onLapse={openLapse} />}
      {screen==="stack"     && <RoutineStackScreen forgeState={forgeState} onBack={()=>go("dashboard")} showToast={showToast} />}
      {screen==="pace"      && <PaceEngineScreen   forgeState={forgeState} onBack={()=>go("dashboard")} />}
      {screen==="insights"  && <AIInsightsScreen   forgeState={forgeState} onBack={()=>go("dashboard")} showToast={showToast} onGo={go} />}
      {screen==="leaderboard" && <LeaderboardScreen forgeState={forgeState} onBack={()=>go("dashboard")} showToast={showToast} onGo={go} />}

      {/* — Detail screens — */}
      {screen==="proof"     && <ProofCheckIn state={forgeState} habit={proofHabit} onBack={()=>go("dashboard")} onComplete={(status)=>handleProofComplete(proofHabit?.key??"h1", status)} />}
      {screen==="chat"      && <ChatScreen  state={forgeState} onBack={()=>go("dashboard")} />}
      {screen==="lapse"     && <LapseScreen forgeState={forgeState} lapseUser={lapseUser} onBack={()=>go("pod")} showToast={showToast} />}

      {/* — Persistent Bottom Nav — */}
      {showNav && <BottomNav active={screen} onGo={go} />}
    </>
  );
}
