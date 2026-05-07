import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Kawaii Light-Mode Themes ──────────────────────────────────────────────────
const THEMES = {
  hibiscus:  { name:"Hibiscus",  swatch:"#EE2A7B", bg:"linear-gradient(155deg,#FFF0F7,#FEFCFF,#FFF5EE)", bg2:"#FFFFFF", bg3:"#FFF5F9", brd:"rgba(238,42,123,.1)", brd2:"rgba(238,42,123,.2)", acc:"#EE2A7B", accTxt:"#FFF", accBg:"rgba(238,42,123,.08)", cta:"#AAEE00", ctaTxt:"#0F2000", txt:"#1A0010", txt2:"#7D3356", txt3:"#C8A0B4" },
  default:   { name:"Purple",   swatch:"#7D39EB", bg:"linear-gradient(155deg,#F5F0FF,#FDFEFF,#F0F2FF)", bg2:"#FFFFFF", bg3:"#F8F4FF", brd:"rgba(125,57,235,.1)", brd2:"rgba(125,57,235,.2)", acc:"#7D39EB", accTxt:"#FFF", accBg:"rgba(125,57,235,.08)", cta:"#C6FF33", ctaTxt:"#141A00", txt:"#140020", txt2:"#5C3380", txt3:"#B0A0C8" },
  bubblegum: { name:"Bubblegum",swatch:"#FF71DA", bg:"linear-gradient(155deg,#FEF0FF,#FEFCFF,#FFF0F8)", bg2:"#FFFFFF", bg3:"#FEF0FF", brd:"rgba(255,113,218,.1)", brd2:"rgba(255,113,218,.2)", acc:"#FF71DA", accTxt:"#000", accBg:"rgba(255,113,218,.08)", cta:"#0066FF", ctaTxt:"#FFF", txt:"#200020", txt2:"#8C3680", txt3:"#D4A0C8" },
  blueberry: { name:"Blueberry",swatch:"#0066FF", bg:"linear-gradient(155deg,#EFF5FF,#FDFEFF,#F0EEFF)", bg2:"#FFFFFF", bg3:"#EFF5FF", brd:"rgba(0,102,255,.1)", brd2:"rgba(0,102,255,.2)", acc:"#0066FF", accTxt:"#FFF", accBg:"rgba(0,102,255,.07)", cta:"#FF71DA", ctaTxt:"#000", txt:"#000F20", txt2:"#2B5499", txt3:"#9ABCDD" },
  sourApple: { name:"Sour Apple",swatch:"#5BB31A", bg:"linear-gradient(155deg,#F2FAF0,#FEFFFC,#FFFAF0)", bg2:"#FFFFFF", bg3:"#F4FAF1", brd:"rgba(91,179,26,.1)", brd2:"rgba(91,179,26,.2)", acc:"#45A010", accTxt:"#FFF", accBg:"rgba(91,179,26,.08)", cta:"#EE2A7B", ctaTxt:"#FFF", txt:"#061200", txt2:"#2A5C10", txt3:"#88BC65" },
  summerSky: { name:"Summer Sky",swatch:"#0099CC", bg:"linear-gradient(155deg,#EEF9FF,#FEFEFF,#F2EEFF)", bg2:"#FFFFFF", bg3:"#EEF8FF", brd:"rgba(0,153,204,.1)", brd2:"rgba(0,153,204,.2)", acc:"#0099CC", accTxt:"#FFF", accBg:"rgba(0,153,204,.07)", cta:"#FF7ABF", ctaTxt:"#000", txt:"#001520", txt2:"#196485", txt3:"#7CC6E0" },
  black:     { name:"Mono",     swatch:"#333",    bg:"linear-gradient(155deg,#F5F5F7,#FFFFFF,#F0F0F5)", bg2:"#FFFFFF", bg3:"#F5F5F7", brd:"rgba(0,0,0,.07)", brd2:"rgba(0,0,0,.13)", acc:"#222222", accTxt:"#FFF", accBg:"rgba(0,0,0,.05)", cta:"#6C63FF", ctaTxt:"#FFF", txt:"#111", txt2:"#555", txt3:"#AAA" },
};
const safeT = k => THEMES[k] || THEMES.hibiscus;

// ── Constants ─────────────────────────────────────────────────────────────────
const AMBIENT     = ["พี่ขอด่วน","ป่วยจริงรึป่าวคะ?","Noted krub","Noted ka","ขอบคุณที่แจ้งให้ทราบค่ะ","พี่อาบน้ำร้อนมาก่อน","ขอโทษที่รบกวนวันหยุดนะ แต่..","GenZ ก็เป็นเงี้ย","Sent at 1:47 AM","ขอ 5 นาทีครับ","พี่ติดประชุมครับ","ฝากน้องทำต่อด้วย","เดี๋ยวขอ sync ก่อน","งานด่วนของพี่ = trauma","พร้อมเริ่มงานเลยมั้ย??","พี่ว่ายังไม่ใช่","เราต้อง Active กว่านี้","deadline วันนี้นะ"];
const STAGES      = ["Applied","Screening","Interview","Offer","Rejected","Withdrawn"];
const WORK_TYPES  = ["Hybrid","Office 100%","Remote"];
const INT_FMTS    = ["Online","Onsite"];
const INT_STAGES  = ["HR Screen","1st Round","2nd Round","3rd Round","Final Round"];
const BASE_TRACKS = ["Business Development","Sales","Consultant"];
const STAGE_C     = { Applied:{c:"#5B7EF5",bg:"rgba(91,126,245,.1)"}, Screening:{c:"#9B51E0",bg:"rgba(155,81,224,.1)"}, Interview:{c:"#6366F1",bg:"rgba(99,102,241,.1)"}, Offer:{c:"#16A34A",bg:"rgba(22,163,74,.1)"}, Rejected:{c:"#DC2626",bg:"rgba(220,38,38,.08)"}, Withdrawn:{c:"#94A3B8",bg:"rgba(148,163,184,.08)"} };
const STAT_ICO    = { Total:"🗂️", Pipeline:"🚀", Interview:"💬", Offers:"🌟", Rejected:"🙃" };

const fmtDate  = d => d ? new Date(d+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"2-digit"}) : "–";
const stars    = n => "★".repeat(n)+"☆".repeat(5-n);
const genCode  = () => String(Math.floor(1000+Math.random()*9000));
const uColor   = n => ["#EE2A7B","#7D39EB","#FF71DA","#45A010","#0066FF","#0099CC"][n.charCodeAt(0)%6];
const blankJob = () => ({title:"",company:"",industry:"",source:"",sourceUrl:"",stage:"Applied",dateApplied:new Date().toISOString().slice(0,10),lastUpdated:"",hrContact:"",hrEmail:"",nextAction:"",interest:3,notes:"",workType:"Hybrid",salary:"",careerTrack:"Sales",officeLocation:"",interviewDate:"",interviewStage:"HR Screen",interviewFormat:"Online",interviewNote:""});

// ── Morphing Blob Background ──────────────────────────────────────────────────
function BlobBg({ t }) {
  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <style>{`
        @keyframes bM0{0%,100%{border-radius:62% 38% 48% 52%/42% 58% 42% 58%}33%{border-radius:44% 56% 67% 33%/55% 45% 55% 45%}66%{border-radius:55% 45% 38% 62%/66% 34% 66% 34%}}
        @keyframes bM1{0%,100%{border-radius:38% 62% 54% 46%/55% 42% 58% 45%}40%{border-radius:66% 34% 44% 56%/40% 60% 40% 60%}75%{border-radius:52% 48% 62% 38%/38% 62% 50% 50%}}
        @keyframes bM2{0%,100%{border-radius:55% 45% 62% 38%/66% 34% 66% 34%}50%{border-radius:44% 56% 38% 62%/42% 58% 42% 58%}}
        @keyframes wobble{0%,100%{transform:rotate(0deg) scale(1)}25%{transform:rotate(-6deg) scale(1.06)}75%{transform:rotate(6deg) scale(1.06)}}
      `}</style>
      {[
        {c:t.acc,s:680,top:"-22%",left:"-16%",a:"bM0",dur:"16s",del:"0s"},
        {c:t.cta,s:500,top:"32%",right:"-18%",a:"bM1",dur:"12s",del:"-4s"},
        {c:t.acc,s:420,bottom:"-18%",left:"8%",a:"bM2",dur:"18s",del:"-8s"},
        {c:t.cta,s:260,top:"6%",right:"25%",a:"bM0",dur:"14s",del:"-6s"},
      ].map((b,i)=>(
        <div key={i} style={{position:"absolute",width:b.s,height:b.s,top:b.top,left:b.left,right:b.right,bottom:b.bottom,background:b.c,opacity:.06,filter:"blur(80px)",animation:`${b.a} ${b.dur} ease-in-out ${b.del} infinite`}}/>
      ))}
    </div>
  );
}

// ── Floating Ambient Text — Login Only ────────────────────────────────────────
function FloatingText({ t }) {
  const css = useMemo(()=>{
    const cols=[`${t.acc}55`,`${t.cta}44`,`${t.acc}33`,`${t.txt3}44`];
    return AMBIENT.map((_,i)=>{
      const l=2+(i*4.7)%90, dur=14+(i*3.2)%16, delay=-((i*2.9)%(dur*.85));
      const fs=10+(i%5)*4, col=cols[i%cols.length], op=.06+(i%4)*.025;
      const rot=-18+(i%7)*6, dx=-50+(i%5)*25;
      return `.fw${i}{position:absolute;left:${l}%;font-size:${fs}px;font-weight:800;white-space:nowrap;opacity:0;font-family:'Nunito',system-ui;color:${col};animation:fw${i}a ${dur}s linear ${delay}s infinite;pointer-events:none;}
@keyframes fw${i}a{0%{transform:translateY(108vh) translateX(0) rotate(${rot}deg);opacity:0;}10%{opacity:${op};}50%{transform:translateY(46vh) translateX(${dx}px) rotate(${rot+4}deg);opacity:${op};}90%{opacity:${op*.3};}100%{transform:translateY(-12vh) translateX(${dx*1.6}px) rotate(${rot-2}deg);opacity:0;}}`;
    }).join('');
  },[t.acc,t.cta,t.txt3]);
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
    <div style={{display:"flex",gap:6,alignItems:"center",padding:"7px 14px",background:t.bg2,borderRadius:100,boxShadow:`0 2px 16px ${t.acc}14`,border:`1px solid ${t.brd}`}}>
      {Object.entries(THEMES).map(([k,th])=>(
        <button key={k} onClick={()=>set(k)} title={th.name}
          style={{width:16,height:16,borderRadius:"50%",background:th.swatch,border:`2.5px solid ${cur===k?"rgba(0,0,0,.3)":"transparent"}`,cursor:"pointer",padding:0,transition:"transform .18s",flexShrink:0,boxShadow:cur===k?`0 0 0 3px ${th.swatch}44`:""}}
          onMouseEnter={e=>e.target.style.transform="scale(1.5)"}
          onMouseLeave={e=>e.target.style.transform="scale(1)"}
        />
      ))}
    </div>
  );
}

// ── Shared card style ─────────────────────────────────────────────────────────
const kCard=(t,r=22,extra={})=>({background:t.bg2,borderRadius:r,boxShadow:`0 2px 24px ${t.acc}12, 0 0 0 1px ${t.brd}`,padding:20,...extra});

// ── UI Atoms ──────────────────────────────────────────────────────────────────
const StageBadge = ({stage})=>{
  const {c,bg}=STAGE_C[stage]||{c:"#888",bg:"rgba(0,0,0,.08)"};
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 11px",borderRadius:100,background:bg,color:c,fontSize:11,fontWeight:700,whiteSpace:"nowrap",fontFamily:"'Nunito',system-ui"}}><span style={{width:5,height:5,borderRadius:"50%",background:c,flexShrink:0}}/>{stage}</span>;
};
const Pill=({label,active,onClick,t})=>(
  <button onClick={onClick} style={{padding:"6px 15px",borderRadius:100,fontSize:11,fontWeight:700,cursor:"pointer",border:`1.5px solid ${active?t.acc:t.brd2}`,background:active?t.accBg:"transparent",color:active?t.acc:t.txt3,transition:"all .18s",whiteSpace:"nowrap",fontFamily:"'Nunito',system-ui"}}>{label}</button>
);
const Fld=({label,span,children})=>(
  <div style={{gridColumn:span===2?"1/-1":"span 1"}}>
    <label style={{display:"block",fontSize:10,color:"rgba(0,0,0,.35)",fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",marginBottom:6,fontFamily:"'Nunito',system-ui"}}>{label}</label>
    {children}
  </div>
);
const Tag=({children,t})=>(
  <span style={{fontSize:10,background:t.accBg,border:`1.5px solid ${t.acc}33`,color:t.acc,padding:"3px 9px",borderRadius:100,fontWeight:700,fontFamily:"'Nunito',system-ui"}}>{children}</span>
);

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({onLogin,themeKey,setThemeKey}) {
  const t=safeT(themeKey);
  const [step,setStep]=useState('name'), [name,setName]=useState(''), [code,setCode]=useState('');
  const [genC,setGenC]=useState(''), [err,setErr]=useState(''), [busy,setBusy]=useState(false), [copied,setCopied]=useState(false);

  const nextStep=async()=>{
    const n=name.trim(); if(!n) return; setBusy(true); setErr('');
    try {
      const {data:ex}=await sb.from('user_codes').select('code').eq('username',n).maybeSingle();
      if(ex) setStep('verify'); else { const c=genCode(); setGenC(c); await sb.from('user_codes').insert({username:n,code:c}); setStep('newcode'); }
    } catch { setErr('เกิดข้อผิดพลาด ลองใหม่'); } finally { setBusy(false); }
  };
  const verify=async()=>{
    setBusy(true); setErr('');
    try {
      const {data:r}=await sb.from('user_codes').select('code').eq('username',name.trim()).maybeSingle();
      if(r?.code===code) onLogin(name.trim()); else { setErr('รหัสไม่ถูกต้อง 🚫 ลองใหม่'); setCode(''); }
    } catch { setErr('เกิดข้อผิดพลาด'); } finally { setBusy(false); }
  };

  const inp={background:t.bg3,color:t.txt,border:`1.5px solid ${t.brd2}`,borderRadius:14,padding:"13px 16px",fontSize:14,width:"100%",outline:"none",fontFamily:"'Nunito',system-ui",display:"block",fontWeight:600,transition:"all .2s",boxSizing:"border-box"};

  return (
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden",fontFamily:"'Nunito',system-ui"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input:focus{border-color:${t.acc}!important;box-shadow:0 0 0 4px ${t.acc}18!important;}
        input::placeholder{color:${t.txt3};opacity:.8;}
      `}</style>

      <BlobBg t={t}/>
      <FloatingText t={t}/>

      {/* Giant faded background title */}
      <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:0,userSelect:"none",overflow:"hidden"}}>
        <div style={{fontFamily:"'Nunito',system-ui",fontWeight:900,textAlign:"center",lineHeight:.85,color:t.acc,opacity:.04,fontSize:"clamp(80px,20vw,220px)",letterSpacing:"-6px",whiteSpace:"nowrap"}}>
          ไม่ทน<br/>งาน
        </div>
      </div>

      {/* Floating sticker decorations */}
      {[{e:"💼",top:"14%",left:"8%",r:-14},{e:"🎯",top:"16%",right:"7%",r:10},{e:"✨",bottom:"24%",left:"7%",r:16},{e:"📊",bottom:"20%",right:"9%",r:-9}].map((s,i)=>(
        <div key={i} style={{position:"fixed",top:s.top,left:s.left,right:s.right,bottom:s.bottom,zIndex:2,pointerEvents:"none",
          background:t.bg2,border:`1.5px solid ${t.brd2}`,
          borderRadius:`${52+(i%3)*10}% ${48-(i%3)*6}% ${44+(i%2)*12}% ${56-(i%2)*8}%/${40+(i%4)*8}% ${60-(i%4)*5}% ${48+(i%3)*7}% ${52-(i%3)*6}%`,
          width:56,height:56,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:24,transform:`rotate(${s.r}deg)`,
          boxShadow:`0 4px 18px ${t.acc}18`,
          animation:"wobble 3s ease-in-out infinite",animationDelay:`${i*.7}s`}}>
          {s.e}
        </div>
      ))}

      {/* Login card */}
      <div style={{...kCard(t,28,{padding:"28px 26px"}),position:"relative",zIndex:10,width:"100%",maxWidth:380,boxShadow:`0 8px 48px ${t.acc}22, 0 0 0 1px ${t.brd}`}}>

        {/* Gradient top accent */}
        <div style={{position:"absolute",top:0,left:24,right:24,height:3,background:`linear-gradient(90deg,${t.acc},${t.cta})`,borderRadius:"0 0 4px 4px"}}/>

        {/* Brand pill */}
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:t.accBg,borderRadius:100,padding:"5px 13px",marginBottom:20,border:`1.5px solid ${t.acc}33`}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:t.acc,display:"inline-block"}}/>
          <span style={{fontSize:10,fontWeight:800,color:t.acc,letterSpacing:1.5,textTransform:"uppercase"}}>Job Tracker ✦</span>
        </div>

        {step==='name'&&(<>
          <div style={{fontSize:24,fontWeight:900,color:t.txt,marginBottom:4,letterSpacing:"-.5px"}}>สวัสดี! 👋</div>
          <div style={{fontSize:13,color:t.txt3,marginBottom:22,fontWeight:600}}>ใส่ชื่อของคุณเพื่อเริ่มต้น</div>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&nextStep()} placeholder="ชื่อของคุณ..." style={inp} autoFocus/>
          {err&&<div style={{fontSize:11,color:"#DC2626",marginTop:8,fontWeight:700}}>{err}</div>}
          <button onClick={nextStep} disabled={!name.trim()||busy}
            style={{marginTop:14,width:"100%",background:name.trim()?t.cta:"#E5E5E5",color:name.trim()?t.ctaTxt:"#AAA",border:"none",borderRadius:100,padding:"14px 20px",fontWeight:800,fontSize:15,fontFamily:"'Nunito',system-ui",cursor:name.trim()?"pointer":"default",transition:"all .2s",boxShadow:name.trim()?`0 4px 20px ${t.cta}55`:""}}
            onMouseEnter={e=>{if(name.trim())e.target.style.transform="scale(1.02)";}}
            onMouseLeave={e=>e.target.style.transform="scale(1)"}>
            {busy?"กำลังโหลด...":"ไปต่อเลย →"}
          </button>
        </>)}

        {step==='newcode'&&(<>
          <div style={{fontSize:14,fontWeight:800,color:t.cta==="#AAEE00"?"#557700":t.acc,marginBottom:3}}>🌸 ยินดีต้อนรับ!</div>
          <div style={{fontSize:22,fontWeight:900,color:t.txt,marginBottom:14,letterSpacing:"-.5px"}}>คุณ <span style={{color:t.acc}}>{name}</span></div>
          <div style={{fontSize:12,color:t.txt2,lineHeight:1.8,marginBottom:16,fontWeight:600}}>นี่คือ <b style={{color:t.txt}}>Verification Code</b> ของคุณ<br/><span style={{fontSize:11,color:t.txt3}}>จดเก็บไว้ด้วย — ต้องใช้ทุกครั้งที่ login!</span></div>
          <div onClick={()=>{navigator.clipboard?.writeText(genC);setCopied(true);setTimeout(()=>setCopied(false),2e3);}}
            style={{background:`linear-gradient(135deg,${t.accBg},${t.bg3})`,border:`2px solid ${t.acc}44`,borderRadius:18,padding:"22px 16px",textAlign:"center",marginBottom:16,cursor:"pointer",userSelect:"none",boxShadow:`0 4px 20px ${t.acc}22`}}>
            <div style={{fontSize:52,fontWeight:900,letterSpacing:18,color:t.acc,lineHeight:1}}>{genC}</div>
            <div style={{fontSize:11,color:t.txt3,marginTop:10,fontWeight:600}}>{copied?"✓ Copied! 🎉":"แตะเพื่อ copy"}</div>
          </div>
          <button onClick={()=>onLogin(name)} style={{width:"100%",background:t.cta,color:t.ctaTxt,border:"none",borderRadius:100,padding:"14px",fontWeight:800,fontSize:14,fontFamily:"'Nunito',system-ui",cursor:"pointer",boxShadow:`0 4px 20px ${t.cta}55`}}>
            จำแล้ว! เริ่มเลย 🚀
          </button>
        </>)}

        {step==='verify'&&(<>
          <div style={{fontSize:22,fontWeight:900,color:t.txt,marginBottom:4,letterSpacing:"-.5px"}}>ยืนยันตัวตน 🔐</div>
          <div style={{fontSize:12,color:t.txt3,marginBottom:20,fontWeight:600}}>สวัสดี <span style={{color:t.acc,fontWeight:800}}>{name}</span>! ใส่ 4-digit code ของคุณ</div>
          <input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,4))} onKeyDown={e=>e.key==="Enter"&&code.length===4&&verify()} placeholder="• • • •" maxLength={4} autoFocus
            style={{...inp,fontSize:38,letterSpacing:18,textAlign:"center",fontWeight:900,padding:"16px"}}/>
          {err&&<div style={{fontSize:11,color:"#DC2626",marginTop:8,textAlign:"center",fontWeight:700}}>{err}</div>}
          <button onClick={verify} disabled={code.length!==4||busy}
            style={{marginTop:14,width:"100%",background:code.length===4?t.cta:"#E5E5E5",color:code.length===4?t.ctaTxt:"#AAA",border:"none",borderRadius:100,padding:"14px",fontWeight:800,fontSize:14,fontFamily:"'Nunito',system-ui",cursor:code.length===4?"pointer":"default",transition:"all .2s",boxShadow:code.length===4?`0 4px 20px ${t.cta}55`:""}}>
            {busy?"กำลังตรวจสอบ...":"เข้าสู่ระบบ ✓"}
          </button>
          <button onClick={()=>{setStep('name');setCode('');setErr('');}}
            style={{marginTop:10,width:"100%",background:"transparent",border:`1.5px solid ${t.brd2}`,color:t.txt3,padding:"9px",borderRadius:100,cursor:"pointer",fontSize:12,fontFamily:"'Nunito',system-ui",fontWeight:700}}>
            ← เปลี่ยนชื่อผู้ใช้
          </button>
        </>)}
      </div>

      <div style={{position:"relative",zIndex:10,marginTop:22,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:10,color:t.txt3,fontWeight:700,letterSpacing:1}}>THEME</span>
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
      {/* ── KPI Bubbles ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:16}}>
        {[{l:"Total",v:total,c:t.acc},{l:"Pipeline",v:cnt("Applied")+cnt("Screening"),c:t.acc},{l:"Interview",v:cnt("Interview"),c:"#6366F1"},{l:"Offers",v:cnt("Offer"),c:"#16A34A"},{l:"Rejected",v:cnt("Rejected"),c:"#DC2626"}].map(({l,v,c})=>(
          <div key={l} style={{...kCard(t,22,{padding:"18px"}),transition:"transform .18s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:`${c}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{STAT_ICO[l]}</div>
              <span style={{fontSize:10,color:t.txt3,fontWeight:800,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Nunito',system-ui"}}>{l}</span>
            </div>
            <div style={{fontSize:40,fontWeight:900,color:c,letterSpacing:"-2px",lineHeight:1,fontFamily:"'Nunito',system-ui"}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:12}}>
        <div style={kCard(t)}>
          <div style={{fontSize:14,fontWeight:800,marginBottom:18,color:t.txt,fontFamily:"'Nunito',system-ui"}}>📈 Application Pipeline</div>
          {["Applied","Screening","Interview","Offer"].map(s=>{
            const n=cnt(s),pct=total?Math.round(n/total*100):0,c=STAGE_C[s].c;
            return (
              <div key={s} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <span style={{fontSize:12,color:t.txt2,fontWeight:700,fontFamily:"'Nunito',system-ui"}}>{s}</span>
                  <span style={{fontSize:12,fontWeight:800,color:c,fontFamily:"'Nunito',system-ui"}}>{n} <span style={{color:t.txt3,fontWeight:600}}>({pct}%)</span></span>
                </div>
                <div style={{height:8,background:t.bg3,borderRadius:100}}>
                  <div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:100,transition:"width .7s ease",boxShadow:pct>0?`0 2px 8px ${c}66`:""}}/>
                </div>
              </div>
            );
          })}
          <div style={{marginTop:14,paddingTop:12,borderTop:`1.5px dashed ${t.brd2}`,display:"flex",gap:16}}>
            {["Rejected","Withdrawn"].map(s=>(
              <span key={s} style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:6,height:6,background:STAGE_C[s].c,borderRadius:"50%",display:"inline-block"}}/>
                <span style={{fontSize:11,color:t.txt3,fontFamily:"'Nunito',system-ui",fontWeight:700}}>{s}: <b style={{color:t.txt2}}>{cnt(s)}</b></span>
              </span>
            ))}
          </div>
        </div>

        <div style={kCard(t)}>
          <div style={{fontSize:14,fontWeight:800,marginBottom:16,color:t.txt,fontFamily:"'Nunito',system-ui"}}>🍰 Breakdown</div>
          <div style={{fontSize:9,color:t.txt3,fontWeight:800,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10,fontFamily:"'Nunito',system-ui"}}>Career Track</div>
          {!allTracks.length&&<div style={{fontSize:12,color:t.txt3,marginBottom:10}}>–</div>}
          {allTracks.map(tr=>{const n=jobs.filter(j=>j.careerTrack===tr).length; return(
            <div key={tr} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:11,color:t.txt2,maxWidth:88,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Nunito',system-ui",fontWeight:700}}>{tr}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:44,height:6,background:t.bg3,borderRadius:100}}><div style={{height:"100%",width:`${total?n/total*100:0}%`,background:t.acc,borderRadius:100,transition:"width .6s"}}/></div>
                <span style={{fontSize:12,fontWeight:800,color:t.acc,minWidth:14,textAlign:"right",fontFamily:"'Nunito',system-ui"}}>{n}</span>
              </div>
            </div>
          );})}
          <div style={{fontSize:9,color:t.txt3,fontWeight:800,textTransform:"uppercase",letterSpacing:1.2,margin:"16px 0 10px",fontFamily:"'Nunito',system-ui"}}>Work Type</div>
          {WORK_TYPES.map(w=>{const n=jobs.filter(j=>j.workType===w).length; return(
            <div key={w} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:11,color:t.txt2,fontFamily:"'Nunito',system-ui",fontWeight:700}}>{w}</span>
              <span style={{fontSize:11,fontWeight:800,color:t.txt,fontFamily:"'Nunito',system-ui"}}>{n}</span>
            </div>
          );})}
        </div>
      </div>

      {upcoming.length>0&&(
        <div style={kCard(t)}>
          <div style={{fontSize:14,fontWeight:800,marginBottom:14,color:t.txt,fontFamily:"'Nunito',system-ui"}}>⏰ Upcoming Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {upcoming.map(j=>(
              <div key={j.id} style={{background:t.bg3,borderRadius:16,padding:"12px 14px",border:`1.5px solid ${t.brd}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <StageBadge stage={j.stage}/>
                  <span style={{fontSize:11,color:t.acc,fontWeight:800,fontFamily:"'Nunito',system-ui"}}>{fmtDate(j.nextAction)}</span>
                </div>
                <div style={{fontSize:13,fontWeight:800,color:t.txt,marginBottom:2,fontFamily:"'Nunito',system-ui"}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3,fontFamily:"'Nunito',system-ui"}}>{j.company}</div>
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
        <span style={{fontSize:9,color:t.txt3,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",marginRight:2,fontFamily:"'Nunito',system-ui"}}>Stage</span>
        {["All",...STAGES].map(s=><Pill key={s} label={s} active={sfilt===s} onClick={()=>setSfilt(s)} t={t}/>)}
        <span style={{fontSize:9,color:t.txt3,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",marginLeft:8,marginRight:2,fontFamily:"'Nunito',system-ui"}}>Track</span>
        {["All",...allTracks].map(tr=><Pill key={tr} label={tr} active={tfilt===tr} onClick={()=>setTfilt(tr)} t={t}/>)}
        <span style={{marginLeft:"auto",fontSize:11,color:t.txt3,fontFamily:"'Nunito',system-ui",fontWeight:600}}>{filtered.length} result{filtered.length!==1?"s":""}</span>
      </div>
      <div style={{...kCard(t,22,{padding:0}),overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:`1.5px solid ${t.brd}`}}>
              {["Job Title","Source","Track","Work","Salary (฿)","Stage","Applied","Interest","Next",""].map(h=>(
                <th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:9,fontWeight:800,color:t.txt3,letterSpacing:1.2,textTransform:"uppercase",whiteSpace:"nowrap",fontFamily:"'Nunito',system-ui"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!filtered.length
              ? <tr><td colSpan={10} style={{padding:60,textAlign:"center",color:t.txt3,fontFamily:"'Nunito',system-ui"}}>
                  <div style={{fontSize:36,marginBottom:12}}>🌱</div>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>ยังไม่มี Job ในระบบ</div>
                  <div style={{fontSize:12}}>กด "Add Job" เพื่อเริ่มต้น!</div>
                </td></tr>
              : filtered.map(j=>(
                <tr key={j.id} style={{borderBottom:`1px solid ${t.brd}`,cursor:"pointer",transition:"background .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=t.bg3}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  onClick={()=>onEdit(j)}>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{fontWeight:800,color:t.txt,marginBottom:2,fontFamily:"'Nunito',system-ui",fontSize:13}}>{j.title||"–"}</div>
                    <div style={{fontSize:10,color:t.txt3,fontFamily:"'Nunito',system-ui"}}>{j.company}{j.industry?` · ${j.industry}`:""}</div>
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    {j.sourceUrl
                      ? <a href={j.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:11,color:t.acc,textDecoration:"none",fontWeight:700,fontFamily:"'Nunito',system-ui"}}>{j.source||"Link"} ↗</a>
                      : <span style={{fontSize:11,color:t.txt3,fontFamily:"'Nunito',system-ui"}}>{j.source||"–"}</span>}
                  </td>
                  <td style={{padding:"12px 14px"}}><Tag t={t}>{j.careerTrack||"–"}</Tag></td>
                  <td style={{padding:"12px 14px"}}><span style={{fontSize:10,color:t.txt2,background:t.bg3,border:`1px solid ${t.brd2}`,padding:"3px 8px",borderRadius:100,fontFamily:"'Nunito',system-ui",fontWeight:700}}>{j.workType}</span></td>
                  <td style={{padding:"12px 14px",color:t.txt,fontWeight:800,fontFamily:"'Nunito',system-ui"}}>{j.salary||"–"}</td>
                  <td style={{padding:"12px 14px"}}><StageBadge stage={j.stage}/></td>
                  <td style={{padding:"12px 14px",color:t.txt3,whiteSpace:"nowrap",fontFamily:"'Nunito',system-ui"}}>{fmtDate(j.dateApplied)}</td>
                  <td style={{padding:"12px 14px",color:t.acc,fontSize:13}}>{stars(j.interest)}</td>
                  <td style={{padding:"12px 14px",color:t.txt3,whiteSpace:"nowrap",fontFamily:"'Nunito',system-ui"}}>{fmtDate(j.nextAction)}</td>
                  <td style={{padding:"12px 14px"}} onClick={e=>e.stopPropagation()}>
                    {pendDel===j.id
                      ? <div style={{display:"flex",gap:4,alignItems:"center"}}>
                          <button onClick={()=>{onDelete(j.id);setPendDel(null);}} style={{background:"#FEE2E2",border:"none",color:"#DC2626",fontSize:10,fontWeight:800,padding:"3px 9px",borderRadius:100,cursor:"pointer",fontFamily:"'Nunito',system-ui"}}>ลบ ✓</button>
                          <button onClick={()=>setPendDel(null)} style={{background:t.bg3,border:"none",color:t.txt2,fontSize:10,padding:"3px 9px",borderRadius:100,cursor:"pointer",fontFamily:"'Nunito',system-ui"}}>ไม่</button>
                        </div>
                      : <button onClick={()=>setPendDel(j.id)} style={{background:"transparent",border:`1.5px solid ${t.brd2}`,color:t.txt3,cursor:"pointer",fontSize:12,padding:"3px 9px",borderRadius:100,transition:"all .15s",fontFamily:"'Nunito',system-ui"}}
                          onMouseEnter={e=>{e.target.style.background="#FEE2E2";e.target.style.borderColor="#DC2626";e.target.style.color="#DC2626";}}
                          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor=t.brd2;e.target.style.color=t.txt3;}}>✕</button>}
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
      <div style={{fontSize:44,marginBottom:12,animation:"wobble 2.5s ease-in-out infinite"}}>📅</div>
      <div style={{fontSize:16,color:t.txt,marginBottom:6,fontFamily:"'Nunito',system-ui",fontWeight:800}}>ยังไม่มี Interview</div>
      <div style={{fontSize:13,color:t.txt3,fontFamily:"'Nunito',system-ui"}}>เปลี่ยน Stage เป็น "Interview" เพื่อดูที่นี่ 🌸</div>
    </div>
  );
  return (
    <div>
      <div style={{fontSize:26,fontWeight:900,marginBottom:4,color:t.txt,fontFamily:"'Nunito',system-ui",letterSpacing:"-1px"}}>💬 Active <span style={{color:t.acc}}>Interviews</span></div>
      <div style={{fontSize:12,color:t.txt3,marginBottom:20,fontFamily:"'Nunito',system-ui",fontWeight:600}}>{jobs.length} interview{jobs.length>1?"s":""} in progress</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>
        {jobs.map(j=>(
          <div key={j.id} onClick={()=>onEdit(j)} style={{...kCard(t,22,{padding:20}),cursor:"pointer",transition:"all .18s",borderTop:`3px solid ${t.acc}`}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 8px 32px ${t.acc}22, 0 0 0 1px ${t.brd}`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=`0 2px 24px ${t.acc}12, 0 0 0 1px ${t.brd}`;}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:t.txt,marginBottom:3,fontFamily:"'Nunito',system-ui"}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3,fontFamily:"'Nunito',system-ui"}}>{j.company}</div>
              </div>
              <span style={{fontSize:10,background:t.cta,color:t.ctaTxt,padding:"5px 11px",borderRadius:100,fontWeight:800,whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Nunito',system-ui",boxShadow:`0 2px 12px ${t.cta}44`}}>{j.interviewStage||"TBD"}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[{l:"Date",v:j.interviewDate?fmtDate(j.interviewDate):"TBD"},{l:"Format",v:j.interviewFormat},{l:"Work Type",v:j.workType},{l:"Salary",v:j.salary?`฿${j.salary}`:"–"}].map(({l,v})=>(
                <div key={l} style={{background:t.bg3,borderRadius:12,padding:"9px 11px"}}>
                  <div style={{fontSize:9,color:t.txt3,textTransform:"uppercase",letterSpacing:1,fontWeight:800,marginBottom:3,fontFamily:"'Nunito',system-ui"}}>{l}</div>
                  <div style={{fontSize:11,color:t.txt,fontWeight:700,fontFamily:"'Nunito',system-ui"}}>{v}</div>
                </div>
              ))}
            </div>
            {j.interviewNote&&<div style={{fontSize:10,color:t.txt2,background:t.bg3,borderRadius:10,padding:"9px 11px",borderLeft:`3px solid ${t.acc}`,marginBottom:10,fontFamily:"'Nunito',system-ui"}}>{j.interviewNote}</div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <Tag t={t}>{j.careerTrack}</Tag>
              <span style={{color:t.acc,fontSize:13}}>{stars(j.interest)}</span>
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
      <div style={{fontSize:44,marginBottom:12,animation:"wobble 2.5s ease-in-out infinite"}}>🎯</div>
      <div style={{fontSize:16,color:t.txt,marginBottom:6,fontFamily:"'Nunito',system-ui",fontWeight:800}}>ยังไม่มี Offer</div>
      <div style={{fontSize:13,color:t.txt3,fontFamily:"'Nunito',system-ui"}}>Offer ดีๆ กำลังมา รอได้เลย! ✨</div>
    </div>
  );
  const sorted=[...jobs].sort((a,b)=>(parseInt(b.salary?.replace(/,/g,"")||0))-(parseInt(a.salary?.replace(/,/g,"")||0)));
  const topId=sorted[0]?.id;
  return (
    <div>
      <div style={{fontSize:26,fontWeight:900,marginBottom:4,color:t.txt,fontFamily:"'Nunito',system-ui",letterSpacing:"-1px"}}>🌟 Offer <span style={{color:t.acc}}>Comparison</span></div>
      <div style={{fontSize:12,color:t.txt3,marginBottom:20,fontFamily:"'Nunito',system-ui",fontWeight:600}}>{jobs.length} offer{jobs.length>1?"s":""} received</div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(sorted.length,3)},1fr)`,gap:12}}>
        {sorted.map(j=>{
          const isTop=j.id===topId&&jobs.length>1;
          return (
            <div key={j.id} onClick={()=>onEdit(j)} style={{...kCard(t,24,{padding:22}),cursor:"pointer",position:"relative",transition:"all .18s",border:`2px solid ${isTop?t.acc:t.brd}`,boxShadow:isTop?`0 8px 40px ${t.acc}22`:""}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";}}>
              {isTop&&(
                <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:t.acc,color:t.accTxt,fontSize:10,fontWeight:800,padding:"4px 14px",borderRadius:100,whiteSpace:"nowrap",fontFamily:"'Nunito',system-ui",boxShadow:`0 4px 12px ${t.acc}44`}}>
                  ⭐ Best Offer
                </div>
              )}
              <div style={{marginBottom:14,marginTop:isTop?8:0}}>
                <div style={{fontSize:14,fontWeight:800,color:t.txt,marginBottom:3,fontFamily:"'Nunito',system-ui"}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3,fontFamily:"'Nunito',system-ui"}}>{j.company}</div>
              </div>
              <div style={{fontSize:38,fontWeight:900,color:t.acc,letterSpacing:"-2px",marginBottom:2,fontFamily:"'Nunito',system-ui"}}>฿{j.salary||"–"}</div>
              <div style={{fontSize:10,color:t.txt3,marginBottom:18,fontFamily:"'Nunito',system-ui",fontWeight:600}}>per month</div>
              <div style={{borderTop:`1.5px dashed ${t.brd2}`,paddingTop:14,display:"flex",flexDirection:"column",gap:10}}>
                {[{l:"Work Type",v:j.workType},{l:"Location",v:j.officeLocation||"–"},{l:"Track",v:j.careerTrack},{l:"Industry",v:j.industry||"–"}].map(({l,v})=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:t.txt3,fontFamily:"'Nunito',system-ui",fontWeight:600}}>{l}</span>
                    <span style={{fontSize:11,color:t.txt,fontWeight:700,fontFamily:"'Nunito',system-ui"}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,color:t.txt3,fontFamily:"'Nunito',system-ui"}}>Next: {fmtDate(j.nextAction)}</span>
                <span style={{color:t.acc,fontSize:13}}>{stars(j.interest)}</span>
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
  const inp={background:t.bg3,color:t.txt,border:`1.5px solid ${t.brd2}`,borderRadius:12,padding:"11px 14px",fontSize:13,width:"100%",outline:"none",fontFamily:"'Nunito',system-ui",WebkitAppearance:"none",appearance:"none",fontWeight:600};
  const sec=(emoji,label)=>(
    <div style={{display:"flex",alignItems:"center",gap:8,margin:"20px 0 12px",paddingBottom:10,borderBottom:`1.5px dashed ${t.brd2}`}}>
      <span style={{fontSize:16}}>{emoji}</span>
      <span style={{fontSize:10,fontWeight:800,color:t.txt3,letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'Nunito',system-ui"}}>{label}</span>
    </div>
  );
  return (
    <>
      <style>{`.mf input,.mf select,.mf textarea{background:${t.bg3}!important;color:${t.txt}!important;border:1.5px solid ${t.brd2}!important;border-radius:12px!important;padding:11px 14px!important;font-size:13px!important;width:100%;outline:none!important;font-family:'Nunito',system-ui;font-weight:600;-webkit-appearance:none;appearance:none;transition:all .2s;}.mf input:focus,.mf select:focus,.mf textarea:focus{border-color:${t.acc}!important;box-shadow:0 0 0 4px ${t.acc}18!important;}.mf textarea{resize:vertical;}.mf select option{background:white;color:#111;}.mf input[type="date"]::-webkit-calendar-picker-indicator{opacity:.5;cursor:pointer;}`}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:20,fontWeight:900,color:t.txt,fontFamily:"'Nunito',system-ui",letterSpacing:"-.5px"}}>{editId?"✏️ แก้ไข Job":"✨ เพิ่ม Job ใหม่"}</div>
        <button onClick={onClose} style={{background:t.bg3,border:`1.5px solid ${t.brd2}`,color:t.txt3,cursor:"pointer",fontSize:16,padding:"5px 11px",borderRadius:100,fontFamily:"'Nunito',system-ui",fontWeight:700}}>✕</button>
      </div>
      <div className="mf">
        {sec("📋","Basic Info")}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:4}}>
          <Fld label="Job Title" span={2}><input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Business Development Manager"/></Fld>
          <Fld label="Company"><input value={form.company} onChange={e=>set("company",e.target.value)} placeholder="Company name"/></Fld>
          <Fld label="Industry"><input value={form.industry} onChange={e=>set("industry",e.target.value)} placeholder="Technology, Finance…"/></Fld>
          <Fld label="Source Platform"><input value={form.source} onChange={e=>set("source",e.target.value)} placeholder="LinkedIn, JobsDB, Referral…"/></Fld>
          <Fld label="Source URL"><div style={{display:"flex",gap:7}}><input value={form.sourceUrl} onChange={e=>set("sourceUrl",e.target.value)} placeholder="https://..." style={{flex:1}}/>{form.sourceUrl&&<a href={form.sourceUrl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",background:t.accBg,border:`1.5px solid ${t.acc}44`,color:t.acc,borderRadius:12,padding:"0 12px",fontSize:16,textDecoration:"none",flexShrink:0}}>↗</a>}</div></Fld>
          <Fld label="Stage"><select value={form.stage} onChange={e=>set("stage",e.target.value)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></Fld>
        </div>

        {sec("💼","Job Details")}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:4}}>
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

        {sec("📅","Timeline & HR")}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:4}}>
          <Fld label="Date Applied"><input type="date" value={form.dateApplied} onChange={e=>set("dateApplied",e.target.value)}/></Fld>
          <Fld label="Next Action Date"><input type="date" value={form.nextAction} onChange={e=>set("nextAction",e.target.value)}/></Fld>
          <Fld label="HR Contact"><input value={form.hrContact} onChange={e=>set("hrContact",e.target.value)} placeholder="Name"/></Fld>
          <Fld label="HR Email / Phone"><input value={form.hrEmail} onChange={e=>set("hrEmail",e.target.value)} placeholder="email@company.com"/></Fld>
        </div>

        {showInt&&(<>
          {sec("🎤","Interview Details")}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:4}}>
            <Fld label="Interview Date"><input type="date" value={form.interviewDate} onChange={e=>set("interviewDate",e.target.value)}/></Fld>
            <Fld label="Round"><select value={form.interviewStage} onChange={e=>set("interviewStage",e.target.value)}>{INT_STAGES.map(s=><option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Format" span={2}><div style={{display:"flex",gap:8}}>{INT_FMTS.map(f=><button key={f} onClick={()=>set("interviewFormat",f)} style={{flex:1,padding:"11px",borderRadius:12,border:`1.5px solid ${form.interviewFormat===f?t.acc:t.brd2}`,background:form.interviewFormat===f?t.accBg:"transparent",color:form.interviewFormat===f?t.acc:t.txt3,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Nunito',system-ui",transition:"all .15s"}}>{f==="Online"?"💻 Online":"🏢 Onsite"}</button>)}</div></Fld>
            <Fld label="Interview Notes" span={2}><textarea rows={2} value={form.interviewNote} onChange={e=>set("interviewNote",e.target.value)} placeholder="Who you're meeting, what to prepare…"/></Fld>
          </div>
        </>)}

        {sec("⭐","Additional")}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:8}}>
          <Fld label="Interest Level">
            <div style={{display:"flex",gap:4,padding:"7px 0"}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>set("interest",n)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:24,color:n<=form.interest?t.acc:"#DDD",transition:"all .15s",padding:"0 3px",lineHeight:1}}
                  onMouseEnter={e=>e.target.style.transform="scale(1.2)"}
                  onMouseLeave={e=>e.target.style.transform="scale(1)"}>★</button>
              ))}
            </div>
          </Fld>
          <Fld label="Notes" span={2}><textarea rows={2} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Key observations about this role…"/></Fld>
        </div>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
        <button onClick={onClose} style={{background:"transparent",border:`1.5px solid ${t.brd2}`,color:t.txt3,padding:"11px 20px",borderRadius:100,cursor:"pointer",fontSize:13,fontFamily:"'Nunito',system-ui",fontWeight:700}}>Cancel</button>
        <button onClick={onSave} style={{background:t.cta,color:t.ctaTxt,border:"none",padding:"11px 24px",borderRadius:100,cursor:"pointer",fontSize:13,fontWeight:800,fontFamily:"'Nunito',system-ui",boxShadow:`0 4px 16px ${t.cta}55`}}>
          {editId?"💾 Save Changes":"🚀 Add Job"}
        </button>
      </div>
    </>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [themeKey,setThemeKey] = useState(()=>{ const s=localStorage.getItem('jt_theme'); return THEMES[s]?s:"hibiscus"; });
  const [user,setUser]     = useState(null);
  const [jobs,setJobs]     = useState([]);
  const [tab,setTab]       = useState("dashboard");
  const [modal,setModal]   = useState(false);
  const [form,setForm]     = useState(blankJob());
  const [editId,setEditId] = useState(null);
  const [sfilt,setSfilt]   = useState("All");
  const [tfilt,setTfilt]   = useState("All");
  const [loaded,setLoaded] = useState(false);
  const t = safeT(themeKey);

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
    <div style={{fontFamily:"'Nunito',system-ui,sans-serif",background:t.bg,minHeight:"100vh",color:t.txt,position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${t.brd2};border-radius:100px;}
        @keyframes wobble{0%,100%{transform:rotate(0deg) scale(1)}25%{transform:rotate(-6deg) scale(1.06)}75%{transform:rotate(6deg) scale(1.06)}}
      `}</style>

      <BlobBg t={t}/>

      {/* ── Header ── */}
      <header style={{padding:"0 22px",display:"flex",alignItems:"center",gap:12,height:58,position:"sticky",top:0,background:`${t.bg2}E8`,backdropFilter:"blur(20px)",zIndex:200,boxShadow:`0 1px 0 ${t.brd}, 0 4px 24px ${t.acc}08`}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:2,flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${t.acc},${t.cta})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 2px 10px ${t.acc}44`,marginRight:6}}>✦</div>
          <span style={{fontFamily:"'Nunito',system-ui",fontWeight:900,fontSize:15,letterSpacing:"-.3px",color:t.txt}}>พวก<span style={{color:t.acc}}>GenZ</span>ไม่<span style={{color:t.acc}}>ทน</span>งาน</span>
        </div>

        {/* Nav pills */}
        <nav style={{display:"flex",gap:3,background:t.bg3,padding:"4px",borderRadius:100,border:`1px solid ${t.brd}`}}>
          {[{id:"dashboard",l:"🏠 Home"},{id:"jobs",l:`💼 Jobs (${jobs.length})`},{id:"interviews",l:`💬${iCnt?` (${iCnt})`:""} Interview`},{id:"offers",l:`🌟${oCnt?` (${oCnt})`:""} Offers`}].map(({id,l})=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{padding:"5px 13px",borderRadius:100,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Nunito',system-ui",background:tab===id?t.bg2:"transparent",color:tab===id?t.acc:t.txt3,transition:"all .18s",boxShadow:tab===id?`0 1px 8px ${t.acc}20`:""}}
              onMouseEnter={e=>{if(tab!==id)e.target.style.color=t.txt;}}
              onMouseLeave={e=>{if(tab!==id)e.target.style.color=t.txt3;}}>
              {l}
            </button>
          ))}
        </nav>

        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <ThemeSwitcher cur={themeKey} set={changeTheme} t={t}/>

          {/* User pill */}
          <div style={{display:"flex",alignItems:"center",gap:7,background:t.bg3,border:`1.5px solid ${t.brd}`,borderRadius:100,padding:"4px 14px 4px 4px",boxShadow:`0 2px 10px ${t.acc}10`}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${uColor(user)},${t.cta})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#FFF",boxShadow:`0 2px 8px ${uColor(user)}66`}}>{user.slice(0,2).toUpperCase()}</div>
            <span style={{fontSize:12,fontWeight:800,color:t.txt2}}>{user}</span>
          </div>

          <button onClick={handleLogout} style={{background:"transparent",border:`1.5px solid ${t.brd2}`,color:t.txt3,padding:"6px 14px",borderRadius:100,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Nunito',system-ui",transition:"all .18s"}}
            onMouseEnter={e=>{e.target.style.background="#FEE2E2";e.target.style.borderColor="#FCA5A5";e.target.style.color="#DC2626";}}
            onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor=t.brd2;e.target.style.color=t.txt3;}}>
            Logout
          </button>

          {/* CTA button */}
          <button onClick={openAdd} style={{background:`linear-gradient(135deg,${t.acc},${t.cta})`,color:t.accTxt==="#FFF"?t.accTxt:t.ctaTxt,border:"none",padding:"8px 18px",borderRadius:100,cursor:"pointer",fontFamily:"'Nunito',system-ui",fontWeight:800,fontSize:13,flexShrink:0,boxShadow:`0 4px 16px ${t.acc}44`,transition:"transform .18s"}}
            onMouseEnter={e=>e.target.style.transform="scale(1.04)"}
            onMouseLeave={e=>e.target.style.transform="scale(1)"}>
            + Add Job ✨
          </button>
        </div>
      </header>

      <main style={{padding:"28px 22px 80px",maxWidth:1300,margin:"0 auto",position:"relative",zIndex:1}}>
        {tab==="dashboard"  && <Dashboard    jobs={jobs} t={t}/>}
        {tab==="jobs"       && <JobsTab       jobs={jobs} onEdit={openEdit} onDelete={delJob} sfilt={sfilt} setSfilt={setSfilt} tfilt={tfilt} setTfilt={setTfilt} t={t}/>}
        {tab==="interviews" && <InterviewsTab jobs={jobs.filter(j=>j.stage==="Interview")} onEdit={openEdit} t={t}/>}
        {tab==="offers"     && <OffersTab     jobs={jobs.filter(j=>j.stage==="Offer")} onEdit={openEdit} t={t}/>}
      </main>

      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
          onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div style={{...kCard(t,28,{padding:28}),width:"100%",maxWidth:640,maxHeight:"92vh",overflowY:"auto",position:"relative",boxShadow:`0 24px 60px rgba(0,0,0,.18), 0 0 0 1px ${t.brd}`}}>
            <div style={{position:"absolute",top:0,left:24,right:24,height:3,background:`linear-gradient(90deg,${t.acc},${t.cta})`,borderRadius:"0 0 6px 6px"}}/>
            <Modal form={form} setForm={setForm} editId={editId} onSave={saveJob} onClose={()=>setModal(false)} t={t}/>
          </div>
        </div>
      )}
    </div>
  );
}
