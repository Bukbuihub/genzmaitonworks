import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Candy Palette Themes (restored — fixes brd2 bug) ─────────────────────────
const THEMES = {
  hibiscus:  { name:"Hibiscus",   swatch:"#EE2A7B", bg:"#0D0006", bg2:"#16000C", bg3:"#1E0011", brd:"#2A0018", brd2:"#3A0022", acc:"#EE2A7B", accTxt:"#FFF", accBg:"rgba(238,42,123,.15)", cta:"#CDFF30", ctaTxt:"#000", txt:"#FFF", txt2:"#CC7799", txt3:"#662244" },
  default:   { name:"Purple",     swatch:"#7D39EB", bg:"#080808", bg2:"#111",    bg3:"#161616", brd:"#1E1E1E", brd2:"#282828", acc:"#7D39EB", accTxt:"#FFF", accBg:"rgba(125,57,235,.14)", cta:"#C6FF33", ctaTxt:"#000", txt:"#FFF", txt2:"#888", txt3:"#555" },
  bubblegum: { name:"Bubblegum",  swatch:"#FF71DA", bg:"#04000D", bg2:"#08001A", bg3:"#0D0022", brd:"#140030", brd2:"#1E0044", acc:"#FF71DA", accTxt:"#000", accBg:"rgba(255,113,218,.13)", cta:"#0066FF", ctaTxt:"#FFF", txt:"#FFF", txt2:"#BB88CC", txt3:"#554466" },
  blueberry: { name:"Blueberry",  swatch:"#0066FF", bg:"#00050F", bg2:"#000A1C", bg3:"#000D24", brd:"#001440", brd2:"#001E5A", acc:"#0066FF", accTxt:"#FFF", accBg:"rgba(0,102,255,.15)",  cta:"#FF71DA", ctaTxt:"#000", txt:"#FFF", txt2:"#6699CC", txt3:"#224488" },
  sourApple: { name:"Sour Apple", swatch:"#C7EF8E", bg:"#020800", bg2:"#060F00", bg3:"#091500", brd:"#0F2000", brd2:"#162E00", acc:"#C7EF8E", accTxt:"#000", accBg:"rgba(199,239,142,.12)", cta:"#EE2A7B", ctaTxt:"#FFF", txt:"#FFF", txt2:"#88BB66", txt3:"#445522" },
  summerSky: { name:"Summer Sky", swatch:"#CCF6FF", bg:"#000A0F", bg2:"#001018", bg3:"#001620", brd:"#001E30", brd2:"#002A44", acc:"#CCF6FF", accTxt:"#000", accBg:"rgba(204,246,255,.10)", cta:"#FF7ABF", ctaTxt:"#000", txt:"#FFF", txt2:"#77BBCC", txt3:"#335566" },
  black:     { name:"Black",      swatch:"#444",    bg:"#000",    bg2:"#0A0A0A", bg3:"#111",    brd:"#1A1A1A", brd2:"#222",    acc:"#EEE",    accTxt:"#000", accBg:"rgba(238,238,238,.08)", cta:"#FFF",    ctaTxt:"#000", txt:"#FFF", txt2:"#666", txt3:"#333" },
};
const safeTheme = k => THEMES[k] || THEMES.hibiscus; // fallback prevents brd2 crash

// ── Constants ─────────────────────────────────────────────────────────────────
const AMBIENT     = ["พี่ขอด่วน","ป่วยจริงรึป่าวคะ?","Noted krub","Noted ka","ขอบคุณที่แจ้งให้ทราบค่ะ","พี่อาบน้ำร้อนมาก่อน","ขอโทษที่รบกวนวันหยุดนะ แต่..","GenZ ก็เป็นเงี้ย","Sent at 1:47 AM","ขอ 5 นาทีครับ","พี่ติดประชุมครับ","ฝากน้องทำต่อด้วย","เดี๋ยวขอ sync ก่อน","พี่ว่าเอาใหม่","งานด่วนของพี่ = trauma","พร้อมเริ่มงานเลยมั้ย??","พี่ว่ายังไม่ใช่","เราต้อง Active กว่านี้","deadline วันนี้นะ","ลองดูก่อนได้มั้ย"];
const STAGES      = ["Applied","Screening","Interview","Offer","Rejected","Withdrawn"];
const WORK_TYPES  = ["Hybrid","Office 100%","Remote"];
const INT_FMTS    = ["Online","Onsite"];
const INT_STAGES  = ["HR Screen","1st Round","2nd Round","3rd Round","Final Round"];
const BASE_TRACKS = ["Business Development","Sales","Consultant"];
const STAGE_C     = { Applied:{c:"#9CA3AF",bg:"rgba(156,163,175,.1)"}, Screening:{c:"#A78BFA",bg:"rgba(167,139,250,.1)"}, Interview:{c:"#818CF8",bg:"rgba(129,140,248,.1)"}, Offer:{c:"#CDFF30",bg:"rgba(205,255,48,.08)"}, Rejected:{c:"#F87171",bg:"rgba(248,113,113,.09)"}, Withdrawn:{c:"#6B7280",bg:"rgba(107,114,128,.09)"} };

const fmtDate  = d => d ? new Date(d+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"2-digit"}) : "–";
const stars    = n => "★".repeat(n)+"☆".repeat(5-n);
const genCode  = () => String(Math.floor(1000+Math.random()*9000));
const uColor   = n => ["#EE2A7B","#7D39EB","#FF71DA","#CDFF30","#F87171","#0066FF"][n.charCodeAt(0)%6];
const blankJob = () => ({title:"",company:"",industry:"",source:"",sourceUrl:"",stage:"Applied",dateApplied:new Date().toISOString().slice(0,10),lastUpdated:"",hrContact:"",hrEmail:"",nextAction:"",interest:3,notes:"",workType:"Hybrid",salary:"",careerTrack:"Sales",officeLocation:"",interviewDate:"",interviewStage:"HR Screen",interviewFormat:"Online",interviewNote:""});

// ── Floating Ambient Text (Login only) ───────────────────────────────────────
function FloatingText({ t }) {
  const css = useMemo(()=>{
    const cols=[t.acc,t.cta,`${t.acc}99`,`${t.cta}88`,`${t.txt2}66`];
    return AMBIENT.map((_,i)=>{
      const l=2+(i*4.7)%90, dur=13+(i*3.1)%15, delay=-((i*2.8)%(dur*.85));
      const fs=11+(i%7)*4, col=cols[i%cols.length], op=.07+(i%5)*.03;
      const rot=-22+(i%8)*6, dx=-60+(i%5)*30, gr=5+(i%4)*7, sc=.87+(i%4)*.08;
      return `.fw${i}{position:absolute;left:${l}%;font-size:${fs}px;font-weight:900;white-space:nowrap;opacity:0;font-family:'Kanit',system-ui;color:${col};animation:fw${i}a ${dur}s linear ${delay}s infinite;pointer-events:none;}
@keyframes fw${i}a{0%{transform:translateY(108vh) translateX(0) rotate(${rot}deg) scale(${sc});opacity:0;}8%{opacity:${op*.5};}20%{transform:translateY(78vh) translateX(${dx*.3}px) rotate(${rot-3}deg) scale(${sc+.1});opacity:${op};text-shadow:0 0 ${gr}px ${col},0 0 ${gr*2}px ${col}44;}55%{transform:translateY(45vh) translateX(${dx}px) rotate(${rot+4}deg) scale(${sc+.1});opacity:${op};}88%{transform:translateY(12vh) translateX(${dx*1.5}px) rotate(${rot}deg);opacity:${op*.25};}100%{transform:translateY(-14vh) translateX(${dx*1.8}px) scale(.82);opacity:0;}}`;
    }).join('');
  },[t.acc,t.cta]);
  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:1}}>
      <style>{css}</style>
      {AMBIENT.map((w,i)=><div key={i} className={`fw${i}`}>{w}</div>)}
    </div>
  );
}

// ── Theme Switcher ────────────────────────────────────────────────────────────
function ThemeSwitcher({cur,set,t}) {
  return (
    <div style={{display:"flex",gap:6,alignItems:"center",padding:"6px 12px",background:t.bg2,borderRadius:20,border:`1px solid ${t.brd2}`}}>
      {Object.entries(THEMES).map(([k,th])=>(
        <button key={k} onClick={()=>set(k)} title={th.name}
          style={{width:15,height:15,borderRadius:"50%",background:th.swatch,border:`2.5px solid ${cur===k?"#FFF":"transparent"}`,cursor:"pointer",padding:0,transition:"transform .15s",flexShrink:0,boxShadow:cur===k?`0 0 10px ${th.swatch}`:""}}
          onMouseEnter={e=>e.target.style.transform="scale(1.5)"}
          onMouseLeave={e=>e.target.style.transform="scale(1)"}
        />
      ))}
    </div>
  );
}

// ── UI Atoms ──────────────────────────────────────────────────────────────────
const StageBadge = ({stage}) => {
  const {c,bg}=STAGE_C[stage]||{c:"#888",bg:"rgba(0,0,0,.1)"};
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,background:bg,color:c,fontSize:11,fontWeight:700,whiteSpace:"nowrap",border:`1px solid ${c}44`,fontFamily:"'Kanit',system-ui"}}><span style={{width:5,height:5,borderRadius:"50%",background:c,flexShrink:0}}/>{stage}</span>;
};
const Pill=({label,active,onClick,t})=>(
  <button onClick={onClick} style={{padding:"5px 13px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",border:`1.5px solid ${active?t.acc:t.brd2}`,background:active?t.accBg:"transparent",color:active?t.acc:t.txt3,transition:"all .18s",whiteSpace:"nowrap",fontFamily:"'Kanit',system-ui"}}>{label}</button>
);
const Fld=({label,span,children})=>(
  <div style={{gridColumn:span===2?"1/-1":"span 1"}}>
    <label style={{display:"block",fontSize:10,color:"rgba(255,255,255,.3)",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6,fontFamily:"'Kanit',system-ui"}}>{label}</label>
    {children}
  </div>
);

// ── Login Screen — MoMoney Editorial ─────────────────────────────────────────
function LoginScreen({onLogin,themeKey,setThemeKey}) {
  const t=safeTheme(themeKey);
  const [step,setStep]=useState('name'), [name,setName]=useState(''), [code,setCode]=useState('');
  const [genC,setGenC]=useState(''), [err,setErr]=useState(''), [busy,setBusy]=useState(false), [copied,setCopied]=useState(false);

  const nextStep=async()=>{
    const n=name.trim(); if(!n) return; setBusy(true); setErr('');
    try {
      const {data:ex}=await sb.from('user_codes').select('code').eq('username',n).maybeSingle();
      if(ex) setStep('verify');
      else { const c=genCode(); setGenC(c); await sb.from('user_codes').insert({username:n,code:c}); setStep('newcode'); }
    } catch { setErr('เกิดข้อผิดพลาด ลองใหม่'); } finally { setBusy(false); }
  };
  const verify=async()=>{
    setBusy(true); setErr('');
    try {
      const {data:r}=await sb.from('user_codes').select('code').eq('username',name.trim()).maybeSingle();
      if(r?.code===code) onLogin(name.trim()); else { setErr('รหัสไม่ถูกต้อง 🚫 ลองใหม่'); setCode(''); }
    } catch { setErr('เกิดข้อผิดพลาด'); } finally { setBusy(false); }
  };

  const inp={background:t.bg3,color:"#FFF",border:`1.5px solid ${t.brd2}`,borderRadius:8,padding:"12px 14px",fontSize:14,width:"100%",outline:"none",fontFamily:"'Kanit',system-ui",display:"block",transition:"border-color .2s"};

  return (
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input:focus{border-color:${t.acc}!important;outline:none!important;}
      `}</style>

      {/* ── BIG EDITORIAL BACKGROUND TEXT ── */}
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:0,overflow:"hidden",userSelect:"none"}}>
        <div style={{fontFamily:"'Kanit',system-ui",fontWeight:900,lineHeight:.85,textAlign:"center",transform:"translateY(-2%)"}}>
          <div style={{fontSize:"clamp(72px,18vw,200px)",color:t.acc,opacity:.13,letterSpacing:"-4px",whiteSpace:"nowrap"}}>พวก GenZ</div>
          <div style={{fontSize:"clamp(80px,22vw,240px)",color:t.cta,opacity:.18,letterSpacing:"-5px",whiteSpace:"nowrap"}}>ไม่ทนงาน</div>
        </div>
      </div>

      {/* Floating ambient text — Login only */}
      <FloatingText t={t}/>

      {/* ── Decorative sticker badges ── */}
      {[
        {emoji:"💼",top:"12%",left:"8%",rot:-12},
        {emoji:"🎯",top:"18%",right:"9%",rot:8},
        {emoji:"📊",bottom:"22%",left:"6%",rot:15},
        {emoji:"✨",bottom:"16%",right:"7%",rot:-8},
      ].map((s,i)=>(
        <div key={i} style={{position:"absolute",top:s.top,left:s.left,right:s.right,bottom:s.bottom,zIndex:2,pointerEvents:"none",
          background:t.bg3,border:`2px solid ${t.brd2}`,borderRadius:16,padding:"10px 14px",
          fontSize:26,transform:`rotate(${s.rot}deg)`,display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 4px 16px rgba(0,0,0,.4)`}}>
          {s.emoji}
        </div>
      ))}

      {/* ── Login Card ── */}
      <div style={{position:"relative",zIndex:10,width:"100%",maxWidth:380,background:t.bg2,border:`1.5px solid ${t.brd2}`,borderRadius:20,padding:"28px 26px",boxShadow:`0 32px 80px rgba(0,0,0,.7),0 0 0 1px ${t.acc}22`,backdropFilter:"blur(16px)"}}>
        {/* Accent top line */}
        <div style={{position:"absolute",top:0,left:20,right:20,height:2,background:`linear-gradient(90deg,${t.acc},${t.cta})`,borderRadius:2}}/>

        {/* Brand pill */}
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:t.accBg,border:`1.5px solid ${t.acc}44`,borderRadius:20,padding:"4px 12px",marginBottom:18}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:t.acc,display:"inline-block"}}/>
          <span style={{fontSize:11,fontWeight:700,color:t.acc,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Kanit',system-ui"}}>Job Tracker</span>
        </div>

        {step==='name'&&(<>
          <div style={{fontSize:22,fontWeight:900,color:t.txt,marginBottom:4,fontFamily:"'Kanit',system-ui",letterSpacing:"-.5px"}}>เข้าสู่ระบบ</div>
          <div style={{fontSize:12,color:t.txt3,marginBottom:20,fontFamily:"'Kanit',system-ui"}}>ใส่ชื่อของคุณเพื่อเริ่มต้น</div>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&nextStep()} placeholder="ชื่อของคุณ..." style={inp} autoFocus/>
          {err&&<div style={{fontSize:11,color:"#F87171",marginTop:8}}>{err}</div>}
          <button onClick={nextStep} disabled={!name.trim()||busy}
            style={{marginTop:14,width:"100%",background:name.trim()?t.cta:"#1A1A1A",color:name.trim()?t.ctaTxt:"#444",border:"none",borderRadius:10,cursor:name.trim()?"pointer":"not-allowed",fontWeight:900,fontSize:15,fontFamily:"'Kanit',system-ui",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0",overflow:"hidden",boxShadow:name.trim()?`0 4px 20px ${t.cta}44`:"none"}}>
            <span style={{padding:"13px 20px",flex:1,textAlign:"left"}}>{busy?"กำลังโหลด...":"ถัดไป"}</span>
            <span style={{padding:"13px 18px",borderLeft:`2px solid ${name.trim()?`${t.ctaTxt}33`:"#333"}`,fontSize:18}}>→</span>
          </button>
        </>)}

        {step==='newcode'&&(<>
          <div style={{fontSize:13,fontWeight:700,color:t.cta,marginBottom:3,fontFamily:"'Kanit',system-ui"}}>👋 ยินดีต้อนรับ!</div>
          <div style={{fontSize:20,fontWeight:900,color:t.txt,marginBottom:12,fontFamily:"'Kanit',system-ui"}}>คุณ <span style={{color:t.acc}}>{name}</span></div>
          <div style={{fontSize:12,color:t.txt2,lineHeight:1.7,marginBottom:16,fontFamily:"'Kanit',system-ui"}}>
            นี่คือ <b style={{color:t.txt}}>Verification Code</b> ของคุณ<br/>
            <span style={{fontSize:10,color:t.txt3}}>จดเก็บไว้ด้วย — ต้องใช้ทุกครั้งที่ login!</span>
          </div>
          <div onClick={()=>{navigator.clipboard?.writeText(genC);setCopied(true);setTimeout(()=>setCopied(false),2e3);}}
            style={{background:t.bg3,border:`2px solid ${t.acc}`,borderRadius:14,padding:"22px 16px",textAlign:"center",marginBottom:16,cursor:"pointer",userSelect:"none",boxShadow:`0 0 28px ${t.acc}33`}}>
            <div style={{fontSize:52,fontWeight:900,letterSpacing:18,color:t.cta,lineHeight:1,fontFamily:"'Kanit',system-ui",textShadow:`0 0 24px ${t.cta}88`}}>{genC}</div>
            <div style={{fontSize:10,color:t.txt3,marginTop:10,fontFamily:"'Kanit',system-ui"}}>{copied?"✓ Copied!":"แตะเพื่อ copy"}</div>
          </div>
          <button onClick={()=>onLogin(name)} style={{width:"100%",background:t.cta,color:t.ctaTxt,border:"none",borderRadius:10,cursor:"pointer",fontWeight:900,fontSize:14,fontFamily:"'Kanit',system-ui",padding:"13px",boxShadow:`0 4px 20px ${t.cta}55`}}>
            จำแล้ว! เข้าเลย →
          </button>
        </>)}

        {step==='verify'&&(<>
          <div style={{fontSize:20,fontWeight:900,color:t.txt,marginBottom:4,fontFamily:"'Kanit',system-ui"}}>ยืนยันตัวตน</div>
          <div style={{fontSize:12,color:t.txt3,marginBottom:18,fontFamily:"'Kanit',system-ui"}}>สวัสดี <span style={{color:t.acc,fontWeight:700}}>{name}</span>! ใส่ 4-digit code ของคุณ</div>
          <input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,4))} onKeyDown={e=>e.key==="Enter"&&code.length===4&&verify()} placeholder="• • • •" maxLength={4} autoFocus
            style={{...inp,fontSize:40,letterSpacing:20,textAlign:"center",fontWeight:900,padding:"16px"}}/>
          {err&&<div style={{fontSize:11,color:"#F87171",marginTop:8,textAlign:"center"}}>{err}</div>}
          <button onClick={verify} disabled={code.length!==4||busy}
            style={{marginTop:14,width:"100%",background:code.length===4?t.cta:"#1A1A1A",color:code.length===4?t.ctaTxt:"#444",border:"none",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0",borderRadius:10,cursor:code.length===4?"pointer":"not-allowed",fontFamily:"'Kanit',system-ui",overflow:"hidden",transition:"all .2s",boxShadow:code.length===4?`0 4px 20px ${t.cta}44`:"none"}}>
            <span style={{padding:"13px 20px",flex:1,textAlign:"left",fontWeight:900,fontSize:14}}>{busy?"กำลังตรวจสอบ...":"เข้าสู่ระบบ"}</span>
            <span style={{padding:"13px 18px",borderLeft:`2px solid ${code.length===4?`${t.ctaTxt}33`:"#333"}`,fontSize:18}}>→</span>
          </button>
          <button onClick={()=>{setStep('name');setCode('');setErr('');}}
            style={{marginTop:10,width:"100%",background:"transparent",border:`1.5px solid ${t.brd2}`,color:t.txt3,padding:"9px",borderRadius:9,cursor:"pointer",fontSize:12,fontFamily:"'Kanit',system-ui"}}>
            ← เปลี่ยนชื่อผู้ใช้
          </button>
        </>)}
      </div>

      {/* Theme picker */}
      <div style={{position:"relative",zIndex:10,marginTop:22,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:9,color:t.txt3,letterSpacing:2,textTransform:"uppercase",fontWeight:700,fontFamily:"'Kanit',system-ui"}}>THEME</span>
        <ThemeSwitcher cur={themeKey} set={setThemeKey} t={t}/>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({jobs,t}) {
  const cnt=s=>jobs.filter(j=>j.stage===s).length, total=jobs.length;
  const upcoming=jobs.filter(j=>j.nextAction&&!["Rejected","Withdrawn"].includes(j.stage)).sort((a,b)=>new Date(a.nextAction)-new Date(b.nextAction)).slice(0,4);
  const allTracks=[...new Set(jobs.map(j=>j.careerTrack).filter(Boolean))];

  return (
    <div>
      {/* ── KPI Row ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:14}}>
        {[{l:"Total",v:total,c:t.txt},{l:"Pipeline",v:cnt("Applied")+cnt("Screening"),c:t.acc},{l:"Interview",v:cnt("Interview"),c:"#818CF8"},{l:"Offers",v:cnt("Offer"),c:t.cta},{l:"Rejected",v:cnt("Rejected"),c:"#F87171"}].map(({l,v,c})=>(
          <div key={l} style={{background:t.bg2,border:`1px solid ${t.brd}`,borderLeft:`3px solid ${c}`,borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontSize:9,color:t.txt3,marginBottom:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'Kanit',system-ui"}}>{l}</div>
            <div style={{fontSize:38,fontWeight:900,color:c,lineHeight:1,letterSpacing:"-2px",fontFamily:"'Kanit',system-ui",textShadow:v>0?`0 0 30px ${c}44`:"none"}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:12}}>
        {/* Pipeline */}
        <div style={{background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:12,padding:20}}>
          <div style={{fontSize:14,fontWeight:900,marginBottom:18,color:t.txt,fontFamily:"'Kanit',system-ui",letterSpacing:"-.3px"}}>Application Pipeline</div>
          {["Applied","Screening","Interview","Offer"].map(s=>{
            const n=cnt(s),pct=total?Math.round(n/total*100):0,c=STAGE_C[s].c;
            return (
              <div key={s} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:t.txt2,fontFamily:"'Kanit',system-ui",fontWeight:600}}>{s}</span>
                  <span style={{fontSize:13,fontWeight:900,color:c,fontFamily:"'Kanit',system-ui"}}>{n} <span style={{color:t.txt3,fontWeight:400,fontSize:11}}>({pct}%)</span></span>
                </div>
                <div style={{height:4,background:t.bg3,borderRadius:4}}>
                  <div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:4,transition:"width .7s",boxShadow:pct>0?`0 0 10px ${c}88`:""}}/>
                </div>
              </div>
            );
          })}
          <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${t.brd}`,display:"flex",gap:14}}>
            {["Rejected","Withdrawn"].map(s=>(
              <span key={s} style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:5,height:5,background:STAGE_C[s].c,borderRadius:"50%",display:"inline-block"}}/>
                <span style={{fontSize:11,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>{s}: <b style={{color:t.txt2}}>{cnt(s)}</b></span>
              </span>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div style={{background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:12,padding:20}}>
          <div style={{fontSize:14,fontWeight:900,marginBottom:16,color:t.txt,fontFamily:"'Kanit',system-ui",letterSpacing:"-.3px"}}>Breakdown</div>
          <div style={{fontSize:9,color:t.txt3,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10,fontFamily:"'Kanit',system-ui"}}>Career Track</div>
          {!allTracks.length&&<div style={{fontSize:12,color:t.txt3,marginBottom:10}}>–</div>}
          {allTracks.map(tr=>{const n=jobs.filter(j=>j.careerTrack===tr).length; return(
            <div key={tr} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
              <span style={{fontSize:11,color:t.txt2,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Kanit',system-ui"}}>{tr}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:44,height:3,background:t.bg3,borderRadius:2}}><div style={{height:"100%",width:`${total?n/total*100:0}%`,background:t.acc,borderRadius:2}}/></div>
                <span style={{fontSize:13,fontWeight:900,color:t.acc,minWidth:14,textAlign:"right",fontFamily:"'Kanit',system-ui"}}>{n}</span>
              </div>
            </div>
          );})}
          <div style={{fontSize:9,color:t.txt3,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,margin:"16px 0 10px",fontFamily:"'Kanit',system-ui"}}>Work Type</div>
          {WORK_TYPES.map(w=>{const n=jobs.filter(j=>j.workType===w).length; return(
            <div key={w} style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
              <span style={{fontSize:11,color:t.txt2,fontFamily:"'Kanit',system-ui"}}>{w}</span>
              <span style={{fontSize:12,fontWeight:900,color:t.txt,fontFamily:"'Kanit',system-ui"}}>{n}</span>
            </div>
          );})}
        </div>
      </div>

      {upcoming.length>0&&(
        <div style={{background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:12,padding:20}}>
          <div style={{fontSize:14,fontWeight:900,marginBottom:14,color:t.txt,fontFamily:"'Kanit',system-ui",letterSpacing:"-.3px"}}>Upcoming Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {upcoming.map(j=>(
              <div key={j.id} style={{background:t.bg3,border:`1px solid ${t.brd}`,borderLeft:`3px solid ${t.cta}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><StageBadge stage={j.stage}/><span style={{fontSize:12,color:t.cta,fontWeight:900,fontFamily:"'Kanit',system-ui",textShadow:`0 0 12px ${t.cta}66`}}>{fmtDate(j.nextAction)}</span></div>
                <div style={{fontSize:13,fontWeight:900,color:t.txt,marginBottom:2,fontFamily:"'Kanit',system-ui"}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>{j.company}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Jobs Tab ──────────────────────────────────────────────────────────────────
function JobsTab({jobs,onEdit,onDelete,sfilt,setSfilt,tfilt,setTfilt,t}) {
  const [pendDel,setPendDel]=useState(null);
  const allTracks=[...new Set(jobs.map(j=>j.careerTrack).filter(Boolean))];
  const filtered=jobs.filter(j=>(sfilt==="All"||j.stage===sfilt)&&(tfilt==="All"||j.careerTrack===tfilt));
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:9,color:t.txt3,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginRight:2,fontFamily:"'Kanit',system-ui"}}>Stage</span>
        {["All",...STAGES].map(s=><Pill key={s} label={s} active={sfilt===s} onClick={()=>setSfilt(s)} t={t}/>)}
        <span style={{fontSize:9,color:t.txt3,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginLeft:8,marginRight:2,fontFamily:"'Kanit',system-ui"}}>Track</span>
        {["All",...allTracks].map(tr=><Pill key={tr} label={tr} active={tfilt===tr} onClick={()=>setTfilt(tr)} t={t}/>)}
        <span style={{marginLeft:"auto",fontSize:11,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>{filtered.length} result{filtered.length!==1?"s":""}</span>
      </div>
      <div style={{background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:12,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${t.brd}`}}>
              {["Job Title","Source","Track","Work","Salary (฿)","Stage","Applied","Interest","Next",""].map(h=>(
                <th key={h} style={{padding:"11px 13px",textAlign:"left",fontSize:9,fontWeight:700,color:t.txt3,letterSpacing:1.5,textTransform:"uppercase",whiteSpace:"nowrap",fontFamily:"'Kanit',system-ui"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!filtered.length
              ? <tr><td colSpan={10} style={{padding:60,textAlign:"center",color:t.txt3,fontFamily:"'Kanit',system-ui"}}>No jobs yet — add your first application!</td></tr>
              : filtered.map(j=>(
                <tr key={j.id} style={{borderBottom:`1px solid ${t.bg3}`,cursor:"pointer",transition:"background .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=t.bg3}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  onClick={()=>onEdit(j)}>
                  <td style={{padding:"11px 13px"}}>
                    <div style={{fontWeight:900,color:t.txt,marginBottom:2,fontFamily:"'Kanit',system-ui",fontSize:13}}>{j.title||"–"}</div>
                    <div style={{fontSize:10,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>{j.company}{j.industry?` · ${j.industry}`:""}</div>
                  </td>
                  <td style={{padding:"11px 13px"}}>
                    {j.sourceUrl
                      ? <a href={j.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:11,color:t.acc,textDecoration:"none",fontWeight:700,fontFamily:"'Kanit',system-ui"}}>{j.source||"Link"} ↗</a>
                      : <span style={{fontSize:11,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>{j.source||"–"}</span>}
                  </td>
                  <td style={{padding:"11px 13px"}}><span style={{fontSize:10,background:t.accBg,border:`1px solid ${t.acc}44`,color:t.acc,padding:"3px 8px",borderRadius:5,fontFamily:"'Kanit',system-ui",fontWeight:700}}>{j.careerTrack||"–"}</span></td>
                  <td style={{padding:"11px 13px"}}><span style={{fontSize:10,color:t.txt3,background:t.bg3,border:`1px solid ${t.brd}`,padding:"3px 7px",borderRadius:5,fontFamily:"'Kanit',system-ui"}}>{j.workType}</span></td>
                  <td style={{padding:"11px 13px",color:t.txt,fontWeight:900,fontFamily:"'Kanit',system-ui"}}>{j.salary||"–"}</td>
                  <td style={{padding:"11px 13px"}}><StageBadge stage={j.stage}/></td>
                  <td style={{padding:"11px 13px",color:t.txt3,whiteSpace:"nowrap",fontFamily:"'Kanit',system-ui"}}>{fmtDate(j.dateApplied)}</td>
                  <td style={{padding:"11px 13px",color:t.cta,fontSize:13,textShadow:`0 0 8px ${t.cta}66`}}>{stars(j.interest)}</td>
                  <td style={{padding:"11px 13px",color:t.txt3,whiteSpace:"nowrap",fontFamily:"'Kanit',system-ui"}}>{fmtDate(j.nextAction)}</td>
                  <td style={{padding:"11px 13px"}} onClick={e=>e.stopPropagation()}>
                    {pendDel===j.id
                      ? <div style={{display:"flex",gap:4,alignItems:"center"}}>
                          <button onClick={()=>{onDelete(j.id);setPendDel(null);}} style={{background:"#F87171",border:"none",color:"#000",fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:5,cursor:"pointer"}}>✓</button>
                          <button onClick={()=>setPendDel(null)} style={{background:t.bg3,border:"none",color:t.txt2,fontSize:10,padding:"3px 8px",borderRadius:5,cursor:"pointer"}}>✗</button>
                        </div>
                      : <button onClick={()=>setPendDel(j.id)} style={{background:"transparent",border:`1px solid ${t.brd2}`,color:t.txt3,cursor:"pointer",fontSize:12,padding:"3px 8px",borderRadius:5,transition:"all .15s"}}
                          onMouseEnter={e=>{e.target.style.borderColor="#F87171";e.target.style.color="#F87171";}}
                          onMouseLeave={e=>{e.target.style.borderColor=t.brd2;e.target.style.color=t.txt3;}}>✕</button>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Interviews Tab ────────────────────────────────────────────────────────────
function InterviewsTab({jobs,onEdit,t}) {
  if(!jobs.length) return (
    <div style={{textAlign:"center",padding:"80px 0"}}>
      <div style={{fontSize:40,marginBottom:12}}>📅</div>
      <div style={{fontSize:16,color:t.txt2,marginBottom:4,fontFamily:"'Kanit',system-ui",fontWeight:700}}>No active interviews</div>
      <div style={{fontSize:12,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>Set a job to "Interview" stage to see it here</div>
    </div>
  );
  return (
    <div>
      <div style={{fontSize:26,fontWeight:900,marginBottom:4,color:t.txt,fontFamily:"'Kanit',system-ui",letterSpacing:"-1px"}}>Active <span style={{color:t.acc}}>Interviews</span></div>
      <div style={{fontSize:12,color:t.txt3,marginBottom:20,fontFamily:"'Kanit',system-ui"}}>{jobs.length} interview{jobs.length>1?"s":""} in progress</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>
        {jobs.map(j=>(
          <div key={j.id} onClick={()=>onEdit(j)} style={{background:t.bg2,border:`1px solid ${t.brd}`,borderTop:`3px solid ${t.acc}`,borderRadius:12,padding:18,cursor:"pointer",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=t.bg3;e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.background=t.bg2;e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontWeight:900,fontSize:14,color:t.txt,marginBottom:3,fontFamily:"'Kanit',system-ui"}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>{j.company}</div>
              </div>
              <span style={{fontSize:10,background:t.cta,color:t.ctaTxt,padding:"4px 10px",borderRadius:20,fontWeight:900,whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Kanit',system-ui",boxShadow:`0 2px 10px ${t.cta}44`}}>{j.interviewStage||"TBD"}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
              {[{l:"Date",v:j.interviewDate?fmtDate(j.interviewDate):"TBD"},{l:"Format",v:j.interviewFormat},{l:"Work Type",v:j.workType},{l:"Salary",v:j.salary?`฿${j.salary}`:"–"}].map(({l,v})=>(
                <div key={l} style={{background:t.bg3,borderRadius:7,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:t.txt3,textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:3,fontFamily:"'Kanit',system-ui"}}>{l}</div>
                  <div style={{fontSize:11,color:t.txt,fontWeight:700,fontFamily:"'Kanit',system-ui"}}>{v}</div>
                </div>
              ))}
            </div>
            {j.interviewNote&&<div style={{fontSize:10,color:t.txt2,background:t.bg3,borderRadius:6,padding:"8px 10px",borderLeft:`2px solid ${t.acc}`,marginBottom:10,fontFamily:"'Kanit',system-ui"}}>{j.interviewNote}</div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>{j.careerTrack}</span>
              <span style={{color:t.cta,fontSize:12,textShadow:`0 0 8px ${t.cta}66`}}>{stars(j.interest)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Offers Tab ────────────────────────────────────────────────────────────────
function OffersTab({jobs,onEdit,t}) {
  if(!jobs.length) return (
    <div style={{textAlign:"center",padding:"80px 0"}}>
      <div style={{fontSize:40,marginBottom:12}}>🎯</div>
      <div style={{fontSize:16,color:t.txt2,marginBottom:4,fontFamily:"'Kanit',system-ui",fontWeight:700}}>No offers yet — keep going!</div>
      <div style={{fontSize:12,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>Set a job to "Offer" stage to compare here</div>
    </div>
  );
  const sorted=[...jobs].sort((a,b)=>(parseInt(b.salary?.replace(/,/g,"")||0))-(parseInt(a.salary?.replace(/,/g,"")||0)));
  const topId=sorted[0]?.id;
  return (
    <div>
      <div style={{fontSize:26,fontWeight:900,marginBottom:4,color:t.txt,fontFamily:"'Kanit',system-ui",letterSpacing:"-1px"}}>Offer <span style={{color:t.cta}}>Comparison</span></div>
      <div style={{fontSize:12,color:t.txt3,marginBottom:20,fontFamily:"'Kanit',system-ui"}}>{jobs.length} offer{jobs.length>1?"s":""} received</div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(sorted.length,3)},1fr)`,gap:12}}>
        {sorted.map(j=>{
          const isTop=j.id===topId&&jobs.length>1;
          return (
            <div key={j.id} onClick={()=>onEdit(j)} style={{background:t.bg2,border:`1.5px solid ${isTop?t.cta:t.brd}`,borderRadius:14,padding:22,cursor:"pointer",position:"relative",transition:"all .15s",boxShadow:isTop?`0 8px 32px ${t.cta}22`:""}}
              onMouseEnter={e=>{e.currentTarget.style.background=t.bg3;e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=t.bg2;e.currentTarget.style.transform="translateY(0)";}}>
              {isTop&&<div style={{position:"absolute",top:14,right:14,background:t.cta,color:t.ctaTxt,fontSize:9,fontWeight:900,padding:"4px 10px",borderRadius:10,letterSpacing:.8,textTransform:"uppercase",fontFamily:"'Kanit',system-ui",boxShadow:`0 2px 10px ${t.cta}55`}}>Top Offer ✦</div>}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:14,fontWeight:900,color:t.txt,marginBottom:3,fontFamily:"'Kanit',system-ui"}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>{j.company}</div>
              </div>
              <div style={{fontSize:40,fontWeight:900,color:t.cta,letterSpacing:"-2px",marginBottom:2,fontFamily:"'Kanit',system-ui",textShadow:`0 0 24px ${t.cta}55`}}>฿{j.salary||"–"}</div>
              <div style={{fontSize:10,color:t.txt3,marginBottom:18,fontFamily:"'Kanit',system-ui"}}>per month</div>
              <div style={{borderTop:`1px solid ${t.brd}`,paddingTop:14,display:"flex",flexDirection:"column",gap:9}}>
                {[{l:"Work Type",v:j.workType},{l:"Location",v:j.officeLocation||"–"},{l:"Track",v:j.careerTrack},{l:"Industry",v:j.industry||"–"}].map(({l,v})=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>{l}</span>
                    <span style={{fontSize:11,color:t.txt,fontWeight:700,fontFamily:"'Kanit',system-ui"}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,color:t.txt3,fontFamily:"'Kanit',system-ui"}}>Next: {fmtDate(j.nextAction)}</span>
                <span style={{color:t.cta,fontSize:12,textShadow:`0 0 8px ${t.cta}66`}}>{stars(j.interest)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({form,setForm,editId,onSave,onClose,t}) {
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const showInt=["Interview","Offer"].includes(form.stage);
  const isCustom=form.careerTrack&&!BASE_TRACKS.includes(form.careerTrack);
  const [customTrack,setCustomTrack]=useState(isCustom);
  return (
    <>
      <style>{`.mf input,.mf select,.mf textarea{background:${t.bg3}!important;color:#FFF!important;border:1.5px solid ${t.brd2}!important;border-radius:8px!important;padding:10px 13px!important;font-size:13px!important;width:100%;outline:none!important;font-family:'Kanit',system-ui;-webkit-appearance:none;appearance:none;transition:border-color .2s;}.mf input:focus,.mf select:focus,.mf textarea:focus{border-color:${t.acc}!important;}.mf textarea{resize:vertical;}.mf select option{background:#111;}.mf input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.4);}`}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div style={{fontSize:18,fontWeight:900,color:t.txt,fontFamily:"'Kanit',system-ui",letterSpacing:"-.5px"}}>{editId?"Edit Application":"New Application"}</div>
        <button onClick={onClose} style={{background:t.bg3,border:`1px solid ${t.brd2}`,color:t.txt3,cursor:"pointer",fontSize:16,padding:"4px 10px",borderRadius:7}}>✕</button>
      </div>
      <div className="mf">
        {[{h:"Basic Info"},{h:"Job Details",c:t.acc},{h:"Timeline & HR"},{h:showInt?"Interview Details":null,c:"#818CF8"},{h:"Additional"}].filter(x=>x.h).map(({h,c})=>(
          <div key={h}>
            <div style={{fontSize:9,fontWeight:700,color:c||t.txt3,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10,marginTop:16,paddingBottom:8,borderBottom:`1px solid ${t.brd}`,fontFamily:"'Kanit',system-ui"}}>{h}</div>
            {h==="Basic Info"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:4}}>
                <Fld label="Job Title" span={2}><input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Business Development Manager"/></Fld>
                <Fld label="Company"><input value={form.company} onChange={e=>set("company",e.target.value)} placeholder="Company name"/></Fld>
                <Fld label="Industry"><input value={form.industry} onChange={e=>set("industry",e.target.value)} placeholder="Technology, Finance…"/></Fld>
                <Fld label="Source Platform"><input value={form.source} onChange={e=>set("source",e.target.value)} placeholder="LinkedIn, JobsDB, Referral…"/></Fld>
                <Fld label="Source URL"><div style={{display:"flex",gap:7}}><input value={form.sourceUrl} onChange={e=>set("sourceUrl",e.target.value)} placeholder="https://..." style={{flex:1}}/>{form.sourceUrl&&<a href={form.sourceUrl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",background:t.accBg,border:`1px solid ${t.acc}44`,color:t.acc,borderRadius:8,padding:"0 12px",fontSize:16,textDecoration:"none",flexShrink:0}}>↗</a>}</div></Fld>
                <Fld label="Stage"><select value={form.stage} onChange={e=>set("stage",e.target.value)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></Fld>
              </div>
            )}
            {h==="Job Details"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:4}}>
                <Fld label="Career Track">
                  <select value={customTrack?"__custom__":form.careerTrack} onChange={e=>{if(e.target.value==="__custom__"){setCustomTrack(true);set("careerTrack","");}else{setCustomTrack(false);set("careerTrack",e.target.value);}}}>
                    {BASE_TRACKS.map(tr=><option key={tr}>{tr}</option>)}
                    <option value="__custom__">＋ Custom…</option>
                  </select>
                  {customTrack&&<input style={{marginTop:8}} value={form.careerTrack} onChange={e=>set("careerTrack",e.target.value)} placeholder="Type your track…" autoFocus/>}
                </Fld>
                <Fld label="Work Type"><select value={form.workType} onChange={e=>set("workType",e.target.value)}>{WORK_TYPES.map(w=><option key={w}>{w}</option>)}</select></Fld>
                <Fld label="Salary (฿/month)"><input value={form.salary} onChange={e=>set("salary",e.target.value)} placeholder="85,000"/></Fld>
                <Fld label="Office Location"><input value={form.officeLocation} onChange={e=>set("officeLocation",e.target.value)} placeholder="Silom, Bangkok"/></Fld>
              </div>
            )}
            {h==="Timeline & HR"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:4}}>
                <Fld label="Date Applied"><input type="date" value={form.dateApplied} onChange={e=>set("dateApplied",e.target.value)}/></Fld>
                <Fld label="Next Action Date"><input type="date" value={form.nextAction} onChange={e=>set("nextAction",e.target.value)}/></Fld>
                <Fld label="HR Contact"><input value={form.hrContact} onChange={e=>set("hrContact",e.target.value)} placeholder="Name"/></Fld>
                <Fld label="HR Email / Phone"><input value={form.hrEmail} onChange={e=>set("hrEmail",e.target.value)} placeholder="email@company.com"/></Fld>
              </div>
            )}
            {h==="Interview Details"&&showInt&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:4}}>
                <Fld label="Interview Date"><input type="date" value={form.interviewDate} onChange={e=>set("interviewDate",e.target.value)}/></Fld>
                <Fld label="Round"><select value={form.interviewStage} onChange={e=>set("interviewStage",e.target.value)}>{INT_STAGES.map(s=><option key={s}>{s}</option>)}</select></Fld>
                <Fld label="Format" span={2}><div style={{display:"flex",gap:8}}>{INT_FMTS.map(f=><button key={f} onClick={()=>set("interviewFormat",f)} style={{flex:1,padding:"10px",borderRadius:8,border:`1.5px solid ${form.interviewFormat===f?t.acc:t.brd2}`,background:form.interviewFormat===f?t.accBg:"transparent",color:form.interviewFormat===f?t.acc:t.txt3,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Kanit',system-ui",transition:"all .15s"}}>{f==="Online"?"💻":"🏢"} {f}</button>)}</div></Fld>
                <Fld label="Interview Notes" span={2}><textarea rows={2} value={form.interviewNote} onChange={e=>set("interviewNote",e.target.value)} placeholder="Who you're meeting, what to prepare…"/></Fld>
              </div>
            )}
            {h==="Additional"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8}}>
                <Fld label="Interest Level"><div style={{display:"flex",gap:4,padding:"6px 0"}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>set("interest",n)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:22,color:n<=form.interest?t.cta:t.brd2,transition:"all .1s",padding:"0 2px",lineHeight:1,textShadow:n<=form.interest?`0 0 12px ${t.cta}`:"none"}}>★</button>)}</div></Fld>
                <Fld label="Notes" span={2}><textarea rows={2} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Key observations about this role…"/></Fld>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
        <button onClick={onClose} style={{background:"transparent",border:`1.5px solid ${t.brd2}`,color:t.txt3,padding:"10px 20px",borderRadius:9,cursor:"pointer",fontSize:13,fontFamily:"'Kanit',system-ui"}}>Cancel</button>
        <button onClick={onSave} style={{background:t.cta,color:t.ctaTxt,border:"none",padding:"0",borderRadius:10,cursor:"pointer",fontFamily:"'Kanit',system-ui",display:"flex",alignItems:"center",overflow:"hidden",boxShadow:`0 4px 16px ${t.cta}55`}}>
          <span style={{padding:"10px 20px",fontWeight:900,fontSize:13}}>{editId?"Save Changes":"Add Job"}</span>
          <span style={{padding:"10px 16px",borderLeft:`2px solid ${t.ctaTxt}33`,fontSize:16}}>→</span>
        </button>
      </div>
    </>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [themeKey,setThemeKey] = useState(()=>{
    const saved=localStorage.getItem('jt_theme');
    return THEMES[saved] ? saved : "hibiscus"; // safe fallback
  });
  const [user,setUser]     = useState(null);
  const [jobs,setJobs]     = useState([]);
  const [tab,setTab]       = useState("dashboard");
  const [modal,setModal]   = useState(false);
  const [form,setForm]     = useState(blankJob());
  const [editId,setEditId] = useState(null);
  const [sfilt,setSfilt]   = useState("All");
  const [tfilt,setTfilt]   = useState("All");
  const [loaded,setLoaded] = useState(false);
  const t = safeTheme(themeKey);

  const changeTheme=k=>{ setThemeKey(k); localStorage.setItem('jt_theme',k); };

  useEffect(()=>{
    if(!user) return; setLoaded(false);
    (async()=>{
      try { const {data}=await sb.from('user_jobs').select('jobs_data').eq('username',user).maybeSingle(); setJobs(data?.jobs_data||[]); }
      catch { setJobs([]); }
      setLoaded(true);
    })();
  },[user]);

  useEffect(()=>{
    if(!user||!loaded) return;
    (async()=>{ try { await sb.from('user_jobs').upsert({username:user,jobs_data:jobs,updated_at:new Date().toISOString()}); } catch {} })();
  },[jobs,loaded,user]);

  const handleLogin  = u=>{setUser(u);setTab("dashboard");};
  const handleLogout = ()=>{setUser(null);setJobs([]);setLoaded(false);setModal(false);};
  const openAdd      = ()=>{setEditId(null);setForm(blankJob());setModal(true);};
  const openEdit     = j=>{setEditId(j.id);setForm({...j});setModal(true);};
  const delJob       = id=>setJobs(js=>js.filter(j=>j.id!==id));
  const saveJob      = ()=>{
    const now=new Date().toISOString().slice(0,10);
    if(editId) setJobs(js=>js.map(j=>j.id===editId?{...form,id:editId,lastUpdated:now}:j));
    else       setJobs(js=>[...js,{...form,id:Date.now(),lastUpdated:now}]);
    setModal(false);
  };

  const iCnt=jobs.filter(j=>j.stage==="Interview").length;
  const oCnt=jobs.filter(j=>j.stage==="Offer").length;

  if(!user) return <LoginScreen onLogin={handleLogin} themeKey={themeKey} setThemeKey={changeTheme}/>;

  return (
    <div style={{fontFamily:"'Kanit',system-ui,sans-serif",background:t.bg,minHeight:"100vh",color:t.txt}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700;800;900&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${t.brd2};border-radius:4px;}`}</style>

      {/* ── Header ── */}
      <header style={{borderBottom:`1px solid ${t.brd}`,padding:"0 22px",display:"flex",alignItems:"center",gap:12,height:54,position:"sticky",top:0,background:`${t.bg}F2`,backdropFilter:"blur(16px)",zIndex:200}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"baseline",flexShrink:0,fontFamily:"'Kanit',system-ui",fontWeight:900,fontSize:15,letterSpacing:"-.3px",lineHeight:1}}>
          <span style={{color:t.txt}}>พวก</span>
          <span style={{color:t.cta,textShadow:`0 0 16px ${t.cta}88`}}>GenZ</span>
          <span style={{color:t.txt}}>ไม่</span>
          <span style={{color:t.acc,textShadow:`0 0 16px ${t.acc}88`}}>ทน</span>
          <span style={{color:t.txt}}>งาน</span>
        </div>

        <nav style={{display:"flex",gap:1}}>
          {[{id:"dashboard",l:"Dashboard"},{id:"jobs",l:`Jobs (${jobs.length})`},{id:"interviews",l:`Interviews${iCnt?` (${iCnt})`:""}`},{id:"offers",l:`Offers${oCnt?` (${oCnt})`:""}`}].map(({id,l})=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{padding:"5px 12px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Kanit',system-ui",background:tab===id?t.accBg:"transparent",color:tab===id?t.acc:t.txt3,transition:"all .15s",boxShadow:tab===id?`inset 0 0 0 1px ${t.acc}55`:""}}
              onMouseEnter={e=>{if(tab!==id){e.target.style.background=t.bg3;e.target.style.color=t.txt;}}}
              onMouseLeave={e=>{if(tab!==id){e.target.style.background="transparent";e.target.style.color=t.txt3;}}}>
              {l}
            </button>
          ))}
        </nav>

        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <ThemeSwitcher cur={themeKey} set={changeTheme} t={t}/>
          <div style={{display:"flex",alignItems:"center",gap:6,background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:20,padding:"4px 12px 4px 4px"}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:uColor(user),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:"#000"}}>{user.slice(0,2).toUpperCase()}</div>
            <span style={{fontSize:12,fontWeight:700,color:t.txt2}}>{user}</span>
          </div>
          <button onClick={handleLogout} style={{background:"transparent",border:`1px solid ${t.brd2}`,color:t.txt3,padding:"5px 11px",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,transition:"all .15s"}}
            onMouseEnter={e=>{e.target.style.borderColor="#F87171";e.target.style.color="#F87171";}}
            onMouseLeave={e=>{e.target.style.borderColor=t.brd2;e.target.style.color=t.txt3;}}>Logout</button>

          {/* MoMoney-style split CTA button */}
          <button onClick={openAdd} style={{background:t.cta,color:t.ctaTxt,border:"none",borderRadius:9,cursor:"pointer",fontFamily:"'Kanit',system-ui",fontWeight:900,fontSize:13,flexShrink:0,display:"flex",alignItems:"center",padding:"0",overflow:"hidden",boxShadow:`0 4px 16px ${t.cta}55`}}
            onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            <span style={{padding:"7px 14px"}}>+ Add Job</span>
            <span style={{padding:"7px 12px",borderLeft:`2px solid ${t.ctaTxt}33`,fontSize:16}}>→</span>
          </button>
        </div>
      </header>

      <main style={{padding:"24px 22px 60px",maxWidth:1300,margin:"0 auto"}}>
        {tab==="dashboard"  && <Dashboard    jobs={jobs} t={t}/>}
        {tab==="jobs"       && <JobsTab       jobs={jobs} onEdit={openEdit} onDelete={delJob} sfilt={sfilt} setSfilt={setSfilt} tfilt={tfilt} setTfilt={setTfilt} t={t}/>}
        {tab==="interviews" && <InterviewsTab jobs={jobs.filter(j=>j.stage==="Interview")} onEdit={openEdit} t={t}/>}
        {tab==="offers"     && <OffersTab     jobs={jobs.filter(j=>j.stage==="Offer")} onEdit={openEdit} t={t}/>}
      </main>

      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
          onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div style={{background:t.bg2,border:`1.5px solid ${t.brd2}`,borderRadius:16,width:"100%",maxWidth:620,maxHeight:"92vh",overflowY:"auto",padding:26,position:"relative",boxShadow:`0 32px 80px rgba(0,0,0,.7)`}}>
            <div style={{position:"absolute",top:0,left:20,right:20,height:2,background:`linear-gradient(90deg,${t.acc},${t.cta})`,borderRadius:2}}/>
            <Modal form={form} setForm={setForm} editId={editId} onSave={saveJob} onClose={()=>setModal(false)} t={t}/>
          </div>
        </div>
      )}
    </div>
  );
}
