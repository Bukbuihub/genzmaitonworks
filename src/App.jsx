import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client (ค่า env ตั้งใน Vercel) ──────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Themes ────────────────────────────────────────────────────────────────────
const THEMES = {
  default:   { name:"Purple",     swatch:"#7D39EB", bg:"#080808", bg2:"#111",    bg3:"#161616", brd:"#1E1E1E", brd2:"#282828", acc:"#7D39EB", accTxt:"#FFF", accBg:"rgba(125,57,235,.14)", cta:"#C6FF33", ctaTxt:"#000", txt:"#FFF", txt2:"#888", txt3:"#555" },
  hibiscus:  { name:"Hibiscus",   swatch:"#EE2A7B", bg:"#0D0006", bg2:"#16000C", bg3:"#1E0011", brd:"#2A0018", brd2:"#3A0022", acc:"#EE2A7B", accTxt:"#FFF", accBg:"rgba(238,42,123,.15)", cta:"#CDFF30", ctaTxt:"#000", txt:"#FFF", txt2:"#CC7799", txt3:"#662244" },
  bubblegum: { name:"Bubblegum",  swatch:"#FF71DA", bg:"#04000D", bg2:"#08001A", bg3:"#0D0022", brd:"#140030", brd2:"#1E0044", acc:"#FF71DA", accTxt:"#000", accBg:"rgba(255,113,218,.13)", cta:"#0066FF", ctaTxt:"#FFF", txt:"#FFF", txt2:"#BB88CC", txt3:"#554466" },
  blueberry: { name:"Blueberry",  swatch:"#0066FF", bg:"#00050F", bg2:"#000A1C", bg3:"#000D24", brd:"#001440", brd2:"#001E5A", acc:"#0066FF", accTxt:"#FFF", accBg:"rgba(0,102,255,.15)",  cta:"#FF71DA", ctaTxt:"#000", txt:"#FFF", txt2:"#6699CC", txt3:"#224488" },
  sourApple: { name:"Sour Apple", swatch:"#C7EF8E", bg:"#020800", bg2:"#060F00", bg3:"#091500", brd:"#0F2000", brd2:"#162E00", acc:"#C7EF8E", accTxt:"#000", accBg:"rgba(199,239,142,.12)", cta:"#EE2A7B", ctaTxt:"#FFF", txt:"#FFF", txt2:"#88BB66", txt3:"#445522" },
  summerSky: { name:"Summer Sky", swatch:"#CCF6FF", bg:"#000A0F", bg2:"#001018", bg3:"#001620", brd:"#001E30", brd2:"#002A44", acc:"#CCF6FF", accTxt:"#000", accBg:"rgba(204,246,255,.10)", cta:"#FF7ABF", ctaTxt:"#000", txt:"#FFF", txt2:"#77BBCC", txt3:"#335566" },
  black:     { name:"Black",      swatch:"#444",    bg:"#000",    bg2:"#0A0A0A", bg3:"#111",    brd:"#1A1A1A", brd2:"#222",    acc:"#EEEEEE", accTxt:"#000", accBg:"rgba(238,238,238,.08)", cta:"#FFF",    ctaTxt:"#000", txt:"#FFF", txt2:"#666", txt3:"#333" },
};

const AMBIENT = ["พี่ขอด่วน","ป่วยจริงรึป่าวคะ?","Noted krub","Noted ka","ขอบคุณที่แจ้งให้ทราบค่ะ","พี่อาบน้ำร้อนมาก่อนน้อง","ขอโทษที่รบกวนวันหยุดนะ แต่.....","GenZ ก็เป็นเงี้ย","Sent from my iPhone at 1:47 AM","ขอ 5 นาทีครับ","ขอเร็วๆ นะ","พี่ติดประชุมครับ","ฝากน้องทำต่อด้วย","ตามนี้เลยครับ","เดี๋ยวขอ sync ก่อน","พี่ว่าเอาใหม่","พี่ไม่ได้กดดันนะ แต่....","งานด่วนของพี่ = trauma ของหนู","พร้อมเริ่มงานเลยมั้ย??","พี่ว่ายังไม่ใช่","เราต้อง Active กว่านี้","deadline วันนี้นะ","ลองดูก่อนได้มั้ย"];
const STAGES      = ["Applied","Screening","Interview","Offer","Rejected","Withdrawn"];
const WORK_TYPES  = ["Hybrid","Office 100%","Remote"];
const INT_FMTS    = ["Online","Onsite"];
const INT_STAGES  = ["HR Screen","1st Round","2nd Round","3rd Round","Final Round"];
const BASE_TRACKS = ["Business Development","Sales","Consultant"];
const STAGE_C     = { Applied:{c:"#9CA3AF",bg:"rgba(156,163,175,.13)"}, Screening:{c:"#A78BFA",bg:"rgba(167,139,250,.13)"}, Interview:{c:"#818CF8",bg:"rgba(129,140,248,.13)"}, Offer:{c:"#C6FF33",bg:"rgba(198,255,51,.11)"}, Rejected:{c:"#F87171",bg:"rgba(248,113,113,.11)"}, Withdrawn:{c:"#6B7280",bg:"rgba(107,114,128,.11)"} };

const fmtDate  = d => d ? new Date(d+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"2-digit"}) : "–";
const stars    = n => "★".repeat(n)+"☆".repeat(5-n);
const userColor= n => ["#EE2A7B","#0066FF","#FF71DA","#CDFF30","#F87171","#C7EF8E"][n.charCodeAt(0)%6];
const genCode  = () => String(Math.floor(1000 + Math.random() * 9000));
const blankJob = () => ({ title:"", company:"", industry:"", source:"", sourceUrl:"", stage:"Applied", dateApplied:new Date().toISOString().slice(0,10), lastUpdated:"", hrContact:"", hrEmail:"", nextAction:"", interest:3, notes:"", workType:"Hybrid", salary:"", careerTrack:"Sales", officeLocation:"", interviewDate:"", interviewStage:"HR Screen", interviewFormat:"Online", interviewNote:"" });

// ── Floating Background ───────────────────────────────────────────────────────
function FloatingBg({ acc, cta }) {
  const css = useMemo(() => {
    const colors = [acc, cta, acc+"BB", cta+"99", "#ffffff22"];
    return AMBIENT.map((_, i) => {
      const seed=i*7.3, left=2+(seed*4.1)%90, dur=12+(i*3.7)%18, delay=-((i*3.1)%(dur*0.85));
      const fs=10+(i%7)*4, col=colors[i%colors.length], op=0.08+(i%6)*0.045;
      const rot=-25+(i%9)*6, driftX=-60+(i%5)*30, glowR=4+(i%4)*6;
      const scl1=0.85+(i%4)*0.1, scl2=1.05+(i%3)*0.08, blur=i%5===0?"blur(1.5px)":"none";
      return `.fw${i}{position:absolute;left:${left}%;font-size:${fs}px;font-weight:900;white-space:nowrap;opacity:0;font-family:'Kanit',system-ui;color:${col};filter:${blur};animation:fw${i}a ${dur}s linear ${delay}s infinite;pointer-events:none;}
@keyframes fw${i}a{0%{transform:translateY(108vh) translateX(0) rotate(${rot}deg) scale(${scl1});opacity:0;text-shadow:0 0 0px ${col};}6%{opacity:${op*0.6};}15%{transform:translateY(80vh) translateX(${driftX*0.3}px) rotate(${rot-3}deg) scale(${scl2});opacity:${op};text-shadow:0 0 ${glowR}px ${col},0 0 ${glowR*2}px ${col}44;}50%{transform:translateY(48vh) translateX(${driftX}px) rotate(${rot+4}deg) scale(${scl2});opacity:${op};text-shadow:0 0 ${glowR+4}px ${col},0 0 ${(glowR+4)*2}px ${col}55;}85%{transform:translateY(16vh) translateX(${driftX*1.3}px) rotate(${rot+1}deg) scale(${scl1*0.95});opacity:${op*0.7};}94%{opacity:${op*0.2};}100%{transform:translateY(-14vh) translateX(${driftX*1.5}px) rotate(${rot-2}deg) scale(0.9);opacity:0;text-shadow:none;}}`;
    }).join('');
  }, [acc, cta]);
  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <style>{css}</style>
      {AMBIENT.map((w,i) => <div key={i} className={`fw${i}`}>{w}</div>)}
    </div>
  );
}

// ── UI Atoms ──────────────────────────────────────────────────────────────────
const StageBadge = ({ stage }) => {
  const {c,bg}=STAGE_C[stage]||{c:"#888",bg:"rgba(0,0,0,.1)"};
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,background:bg,color:c,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}><span style={{width:5,height:5,borderRadius:"50%",background:c,flexShrink:0}}/>{stage}</span>;
};
const Pill = ({label,active,onClick,t}) => (
  <button onClick={onClick} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${active?t.acc:t.brd2}`,background:active?t.accBg:"transparent",color:active?t.acc:t.txt3,transition:"all .18s",whiteSpace:"nowrap"}}>{label}</button>
);
const Fld = ({label,span,children}) => (
  <div style={{gridColumn:span===2?"1/-1":"span 1"}}>
    <label style={{display:"block",fontSize:10,color:"#555",fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:5}}>{label}</label>
    {children}
  </div>
);
const SecHead = ({children,color}) => (
  <div style={{fontSize:10,fontWeight:700,color:color||"#444",letterSpacing:1.2,textTransform:"uppercase",marginBottom:10,marginTop:4,paddingBottom:8,borderBottom:"1px solid #1A1A1A"}}>{children}</div>
);
function ThemeSwitcher({cur,set}) {
  return (
    <div style={{display:"flex",gap:6,alignItems:"center",padding:"5px 12px",background:"rgba(255,255,255,.04)",borderRadius:20,border:"1px solid rgba(255,255,255,.08)"}}>
      {Object.entries(THEMES).map(([k,th])=>(
        <button key={k} onClick={()=>set(k)} title={th.name}
          style={{width:15,height:15,borderRadius:"50%",background:th.swatch,border:`2.5px solid ${cur===k?"rgba(255,255,255,.9)":"transparent"}`,cursor:"pointer",padding:0,transition:"transform .15s, border-color .15s",flexShrink:0,boxShadow:cur===k?`0 0 8px ${th.swatch}88`:"none"}}
          onMouseEnter={e=>e.target.style.transform="scale(1.5)"}
          onMouseLeave={e=>e.target.style.transform="scale(1)"}
        />
      ))}
    </div>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, themeKey, setThemeKey }) {
  const t = THEMES[themeKey];
  const [step,setStep]     = useState('name');
  const [name,setName]     = useState('');
  const [code,setCode]     = useState('');
  const [genC,setGenC]     = useState('');
  const [err,setErr]       = useState('');
  const [busy,setBusy]     = useState(false);
  const [copied,setCopied] = useState(false);

  const nextStep = async () => {
    const n = name.trim(); if (!n) return;
    setBusy(true); setErr('');
    try {
      const { data: existing } = await supabase
        .from('user_codes').select('code').eq('username', n).maybeSingle();
      if (existing) {
        setStep('verify');
      } else {
        const c = genCode(); setGenC(c);
        await supabase.from('user_codes').insert({ username: n, code: c });
        setStep('newcode');
      }
    } catch { setErr('เกิดข้อผิดพลาด ลองใหม่'); }
    finally { setBusy(false); }
  };

  const verify = async () => {
    setBusy(true); setErr('');
    try {
      const { data: r } = await supabase
        .from('user_codes').select('code').eq('username', name.trim()).maybeSingle();
      if (r?.code === code) { onLogin(name.trim()); }
      else { setErr('รหัสไม่ถูกต้อง 🚫 ลองใหม่'); setCode(''); }
    } catch { setErr('เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  };

  const inp = { background:"rgba(255,255,255,.05)", color:"#FFF", border:`1px solid ${t.brd2}`, borderRadius:9, padding:"11px 14px", fontSize:14, width:"100%", outline:"none", fontFamily:"'Kanit',system-ui,sans-serif", display:"block" };

  return (
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Kanit',system-ui,sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <FloatingBg acc={t.acc} cta={t.cta}/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle, ${t.acc}18 0%, transparent 70%)`,pointerEvents:"none",zIndex:0}}/>

      <div style={{position:"relative",zIndex:1,textAlign:"center",marginBottom:40}}>
        <div style={{fontSize:11,fontWeight:700,color:t.acc,letterSpacing:4,textTransform:"uppercase",marginBottom:14,textShadow:`0 0 20px ${t.acc}`}}>Welcome to</div>
        <div style={{lineHeight:1,marginBottom:4}}>
          <span style={{fontSize:62,fontWeight:900,letterSpacing:"-2px",color:t.txt}}>พวก</span>
          <span style={{fontSize:62,fontWeight:900,letterSpacing:"-2px",color:t.cta,textShadow:`0 0 30px ${t.cta}88`}}>GenZ</span>
        </div>
        <div style={{lineHeight:1,marginBottom:16}}>
          <span style={{fontSize:54,fontWeight:900,letterSpacing:"-2px",color:t.txt}}>ไม่</span>
          <span style={{fontSize:54,fontWeight:900,letterSpacing:"-2px",color:t.acc,textShadow:`0 0 24px ${t.acc}88`}}>ทน</span>
          <span style={{fontSize:54,fontWeight:900,letterSpacing:"-2px",color:t.txt}}>งาน</span>
        </div>
        <div style={{fontSize:11,color:t.txt3,letterSpacing:2}}>Job Application Tracker</div>
      </div>

      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:360,background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:16,padding:24,boxShadow:`0 24px 64px rgba(0,0,0,.6),0 0 40px ${t.acc}11`}}>
        {step==='name' && (
          <>
            <div style={{fontSize:15,fontWeight:800,color:t.txt,marginBottom:4}}>เข้าสู่ระบบ</div>
            <div style={{fontSize:12,color:t.txt3,marginBottom:16}}>ใส่ชื่อของคุณเพื่อเริ่มต้น</div>
            <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&nextStep()} placeholder="ชื่อของคุณ..." style={inp} autoFocus/>
            {err&&<div style={{fontSize:11,color:"#F87171",marginTop:8}}>{err}</div>}
            <button onClick={nextStep} disabled={!name.trim()||busy}
              style={{marginTop:10,width:"100%",background:name.trim()?t.cta:"#1A1A1A",color:name.trim()?t.ctaTxt:"#444",border:"none",padding:"11px",borderRadius:9,cursor:name.trim()?"pointer":"default",fontWeight:900,fontSize:15,fontFamily:"'Kanit',system-ui,sans-serif",transition:"all .2s",boxShadow:name.trim()?`0 4px 20px ${t.cta}44`:"none"}}>
              {busy?"กำลังโหลด...":"ถัดไป →"}
            </button>
          </>
        )}
        {step==='newcode' && (
          <>
            <div style={{fontSize:13,fontWeight:700,color:t.cta,marginBottom:3}}>👋 ยินดีต้อนรับ!</div>
            <div style={{fontSize:14,fontWeight:700,color:t.txt,marginBottom:12}}>คุณ <span style={{color:t.acc}}>{name}</span></div>
            <div style={{fontSize:12,color:t.txt2,lineHeight:1.8,marginBottom:16}}>
              นี่คือ <b style={{color:t.txt}}>Verification Code</b> ของคุณ<br/>
              <span style={{fontSize:10,color:t.txt3}}>จดเก็บไว้ด้วย — ต้องใช้ทุกครั้งที่ login!</span>
            </div>
            <div onClick={()=>{navigator.clipboard?.writeText(genC);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
              style={{background:t.bg3,border:`2px solid ${t.acc}`,borderRadius:12,padding:"20px 12px",textAlign:"center",marginBottom:16,cursor:"pointer",userSelect:"none",boxShadow:`0 0 24px ${t.acc}33`}}>
              <div style={{fontFamily:"'Kanit',system-ui,sans-serif",fontSize:48,fontWeight:900,letterSpacing:18,color:t.cta,lineHeight:1,textShadow:`0 0 20px ${t.cta}`}}>{genC}</div>
              <div style={{fontSize:10,color:t.txt3,marginTop:8}}>{copied?"✓ Copied!":"แตะเพื่อ copy"}</div>
            </div>
            <button onClick={()=>onLogin(name)} style={{width:"100%",background:t.cta,color:t.ctaTxt,border:"none",padding:"11px",borderRadius:9,cursor:"pointer",fontWeight:900,fontSize:14,fontFamily:"'Kanit',system-ui,sans-serif",boxShadow:`0 4px 20px ${t.cta}55`}}>
              จำแล้ว! เข้าเลย →
            </button>
          </>
        )}
        {step==='verify' && (
          <>
            <div style={{fontSize:14,fontWeight:800,color:t.txt,marginBottom:4}}>ยืนยันตัวตน</div>
            <div style={{fontSize:12,color:t.txt3,marginBottom:16}}>สวัสดี <span style={{color:t.acc,fontWeight:700}}>{name}</span>! ใส่ 4-digit verification code</div>
            <input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,4))} onKeyDown={e=>e.key==="Enter"&&code.length===4&&verify()} placeholder="• • • •" maxLength={4} autoFocus
              style={{...inp,fontSize:38,letterSpacing:16,textAlign:"center",fontWeight:900,padding:"14px"}}/>
            {err&&<div style={{fontSize:11,color:"#F87171",marginTop:8,textAlign:"center"}}>{err}</div>}
            <button onClick={verify} disabled={code.length!==4||busy}
              style={{marginTop:10,width:"100%",background:code.length===4?t.cta:"#1A1A1A",color:code.length===4?t.ctaTxt:"#444",border:"none",padding:"11px",borderRadius:9,cursor:code.length===4?"pointer":"default",fontWeight:900,fontSize:15,fontFamily:"'Kanit',system-ui,sans-serif",transition:"all .2s"}}>
              {busy?"กำลังตรวจสอบ...":"เข้าสู่ระบบ →"}
            </button>
            <button onClick={()=>{setStep('name');setCode('');setErr('');}}
              style={{marginTop:8,width:"100%",background:"transparent",border:`1px solid ${t.brd2}`,color:t.txt3,padding:"8px",borderRadius:9,cursor:"pointer",fontSize:11,fontFamily:"'Kanit',system-ui,sans-serif"}}>
              ← เปลี่ยนชื่อผู้ใช้
            </button>
          </>
        )}
      </div>
      <div style={{position:"relative",zIndex:1,marginTop:22,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:9,color:t.txt3,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700}}>Theme</span>
        <ThemeSwitcher cur={themeKey} set={setThemeKey}/>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ jobs, t }) {
  const cnt = s => jobs.filter(j=>j.stage===s).length;
  const total = jobs.length;
  const upcoming = jobs.filter(j=>j.nextAction&&!["Rejected","Withdrawn"].includes(j.stage)).sort((a,b)=>new Date(a.nextAction)-new Date(b.nextAction)).slice(0,4);
  const allTracks = [...new Set(jobs.map(j=>j.careerTrack).filter(Boolean))];
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10,marginBottom:14}}>
        {[{l:"Total",v:total,c:t.txt},{l:"Pipeline",v:cnt("Applied")+cnt("Screening"),c:t.acc},{l:"Interview",v:cnt("Interview"),c:"#818CF8"},{l:"Offers",v:cnt("Offer"),c:t.cta},{l:"Rejected",v:cnt("Rejected"),c:"#F87171"}].map(({l,v,c})=>(
          <div key={l} style={{background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:10,color:t.txt3,marginBottom:8,fontWeight:600,letterSpacing:.5}}>{l}</div>
            <div style={{fontSize:32,fontWeight:900,color:c,lineHeight:1,letterSpacing:"-1px",fontFamily:"'Kanit',system-ui,sans-serif",textShadow:v>0?`0 0 20px ${c}44`:"none"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:12}}>
        <div style={{background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:12,padding:18}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:16,color:t.txt}}>Application Pipeline</div>
          {["Applied","Screening","Interview","Offer"].map(s=>{
            const n=cnt(s),pct=total?Math.round(n/total*100):0,c=STAGE_C[s].c;
            return (
              <div key={s} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,color:t.txt2}}>{s}</span>
                  <span style={{fontSize:12,fontWeight:700,color:c}}>{n} <span style={{color:t.txt3,fontWeight:400}}>({pct}%)</span></span>
                </div>
                <div style={{height:4,background:t.bg3,borderRadius:3}}>
                  <div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:3,transition:"width .6s",boxShadow:pct>0?`0 0 8px ${c}88`:"none"}}/>
                </div>
              </div>
            );
          })}
          <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${t.brd}`,display:"flex",gap:14}}>
            {["Rejected","Withdrawn"].map(s=>(
              <span key={s} style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:5,height:5,background:STAGE_C[s].c,borderRadius:"50%",display:"inline-block"}}/>
                <span style={{fontSize:11,color:t.txt3}}>{s}: <b style={{color:t.txt2}}>{cnt(s)}</b></span>
              </span>
            ))}
          </div>
        </div>
        <div style={{background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:12,padding:18}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:t.txt}}>Breakdown</div>
          <div style={{fontSize:9,color:t.txt3,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Career Track</div>
          {!allTracks.length&&<div style={{fontSize:12,color:t.txt3,marginBottom:10}}>–</div>}
          {allTracks.map(tr=>{const n=jobs.filter(j=>j.careerTrack===tr).length;return(
            <div key={tr} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <span style={{fontSize:11,color:t.txt2,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tr}</span>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:40,height:3,background:t.bg3,borderRadius:2}}><div style={{height:"100%",width:`${total?n/total*100:0}%`,background:t.acc,borderRadius:2}}/></div>
                <span style={{fontSize:11,fontWeight:700,color:t.acc,minWidth:12,textAlign:"right"}}>{n}</span>
              </div>
            </div>
          );})}
          <div style={{fontSize:9,color:t.txt3,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,margin:"14px 0 8px"}}>Work Type</div>
          {WORK_TYPES.map(w=>{const n=jobs.filter(j=>j.workType===w).length;return<div key={w} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:t.txt2}}>{w}</span><span style={{fontSize:11,fontWeight:600,color:t.txt}}>{n}</span></div>;})}
        </div>
      </div>
      {upcoming.length>0&&(
        <div style={{background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:12,padding:18}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:t.txt}}>Upcoming Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:9}}>
            {upcoming.map(j=>(
              <div key={j.id} style={{background:t.bg3,border:`1px solid ${t.brd}`,borderRadius:10,padding:"11px 13px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <StageBadge stage={j.stage}/>
                  <span style={{fontSize:11,color:t.cta,fontWeight:700}}>{fmtDate(j.nextAction)}</span>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:t.txt,marginBottom:2}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3}}>{j.company}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Jobs Tab ──────────────────────────────────────────────────────────────────
function JobsTab({ jobs, onEdit, onDelete, sfilt, setSfilt, tfilt, setTfilt, t }) {
  const [pendDel,setPendDel] = useState(null);
  const allTracks = [...new Set(jobs.map(j=>j.careerTrack).filter(Boolean))];
  const filtered  = jobs.filter(j=>(sfilt==="All"||j.stage===sfilt)&&(tfilt==="All"||j.careerTrack===tfilt));
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:9,color:t.txt3,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginRight:2}}>Stage</span>
        {["All",...STAGES].map(s=><Pill key={s} label={s} active={sfilt===s} onClick={()=>setSfilt(s)} t={t}/>)}
        <span style={{fontSize:9,color:t.txt3,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginLeft:8,marginRight:2}}>Track</span>
        {["All",...allTracks].map(tr=><Pill key={tr} label={tr} active={tfilt===tr} onClick={()=>setTfilt(tr)} t={t}/>)}
        <span style={{marginLeft:"auto",fontSize:11,color:t.txt3}}>{filtered.length} result{filtered.length!==1?"s":""}</span>
      </div>
      <div style={{background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:12,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${t.brd}`}}>
              {["Job Title","Source","Track","Work","Salary (฿)","Stage","Applied","Interest","Next",""].map(h=>(
                <th key={h} style={{padding:"10px 13px",textAlign:"left",fontSize:9,fontWeight:700,color:t.txt3,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!filtered.length
              ? <tr><td colSpan={10} style={{padding:60,textAlign:"center",color:t.txt3}}>No jobs yet — add your first application!</td></tr>
              : filtered.map(j=>(
                <tr key={j.id} style={{borderBottom:`1px solid ${t.bg3}`,cursor:"pointer",transition:"background .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=t.bg3}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  onClick={()=>onEdit(j)}>
                  <td style={{padding:"10px 13px"}}>
                    <div style={{fontWeight:700,color:t.txt,marginBottom:2}}>{j.title||"–"}</div>
                    <div style={{fontSize:10,color:t.txt3}}>{j.company}{j.industry?` · ${j.industry}`:""}</div>
                  </td>
                  <td style={{padding:"10px 13px"}}>
                    {j.sourceUrl
                      ? <a href={j.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                          style={{fontSize:11,color:t.acc,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:3,fontWeight:600}}>{j.source||"Link"} ↗</a>
                      : <span style={{fontSize:11,color:t.txt3}}>{j.source||"–"}</span>}
                  </td>
                  <td style={{padding:"10px 13px"}}><span style={{fontSize:10,color:t.acc,background:t.accBg,border:`1px solid ${t.acc}33`,padding:"2px 7px",borderRadius:4}}>{j.careerTrack||"–"}</span></td>
                  <td style={{padding:"10px 13px"}}><span style={{fontSize:10,color:t.txt3,background:t.bg3,border:`1px solid ${t.brd2}`,padding:"2px 6px",borderRadius:4}}>{j.workType}</span></td>
                  <td style={{padding:"10px 13px",color:t.txt,fontWeight:600}}>{j.salary||"–"}</td>
                  <td style={{padding:"10px 13px"}}><StageBadge stage={j.stage}/></td>
                  <td style={{padding:"10px 13px",color:t.txt3,whiteSpace:"nowrap"}}>{fmtDate(j.dateApplied)}</td>
                  <td style={{padding:"10px 13px",color:t.cta,fontSize:13,letterSpacing:.5}}>{stars(j.interest)}</td>
                  <td style={{padding:"10px 13px",color:t.txt3,whiteSpace:"nowrap"}}>{fmtDate(j.nextAction)}</td>
                  <td style={{padding:"10px 13px"}} onClick={e=>e.stopPropagation()}>
                    {pendDel===j.id
                      ? <div style={{display:"flex",gap:4,alignItems:"center"}}>
                          <span style={{fontSize:9,color:"#F87171",fontWeight:700}}>ลบ?</span>
                          <button onClick={()=>{onDelete(j.id);setPendDel(null);}} style={{background:"#F87171",border:"none",color:"#000",fontSize:10,fontWeight:800,padding:"3px 7px",borderRadius:5,cursor:"pointer"}}>✓</button>
                          <button onClick={()=>setPendDel(null)} style={{background:t.bg3,border:"none",color:t.txt2,fontSize:10,fontWeight:800,padding:"3px 7px",borderRadius:5,cursor:"pointer"}}>✗</button>
                        </div>
                      : <button onClick={()=>setPendDel(j.id)} style={{background:"transparent",border:`1px solid ${t.brd2}`,color:t.txt3,cursor:"pointer",fontSize:12,padding:"3px 7px",borderRadius:5,transition:"all .15s"}}
                          onMouseEnter={e=>{e.target.style.background="rgba(248,113,113,.12)";e.target.style.borderColor="#F87171";e.target.style.color="#F87171";}}
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
function InterviewsTab({ jobs, onEdit, t }) {
  if (!jobs.length) return (
    <div style={{textAlign:"center",padding:"80px 0"}}>
      <div style={{fontSize:40,marginBottom:12}}>📅</div>
      <div style={{fontSize:15,color:t.txt2,marginBottom:4}}>No active interviews</div>
      <div style={{fontSize:12,color:t.txt3}}>Set a job to "Interview" stage to see it here</div>
    </div>
  );
  return (
    <div>
      <div style={{fontFamily:"'Kanit',system-ui,sans-serif",fontSize:22,fontWeight:900,letterSpacing:"-.5px",marginBottom:4,color:t.txt}}>Active Interviews</div>
      <div style={{fontSize:12,color:t.txt3,marginBottom:18}}>{jobs.length} interview{jobs.length>1?"s":""} in progress</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>
        {jobs.map(j=>(
          <div key={j.id} onClick={()=>onEdit(j)} style={{background:t.bg2,border:`1px solid ${t.brd}`,borderTop:`3px solid ${t.acc}`,borderRadius:12,padding:18,cursor:"pointer",transition:"background .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=t.bg3}
            onMouseLeave={e=>e.currentTarget.style.background=t.bg2}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontWeight:800,fontSize:13,color:t.txt,marginBottom:2}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3}}>{j.company}</div>
              </div>
              <span style={{fontSize:10,background:t.cta,color:t.ctaTxt,padding:"3px 9px",borderRadius:20,fontWeight:800,whiteSpace:"nowrap",flexShrink:0}}>{j.interviewStage||"TBD"}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}>
              {[{l:"Date",v:j.interviewDate?fmtDate(j.interviewDate):"TBD"},{l:"Format",v:j.interviewFormat},{l:"Work Type",v:j.workType},{l:"Salary",v:j.salary?`฿${j.salary}`:"–"}].map(({l,v})=>(
                <div key={l} style={{background:t.bg3,borderRadius:7,padding:"7px 9px"}}>
                  <div style={{fontSize:9,color:t.txt3,textTransform:"uppercase",letterSpacing:.7,fontWeight:700,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:11,color:t.txt,fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
            {j.interviewNote&&<div style={{fontSize:10,color:t.txt2,background:t.bg3,borderRadius:6,padding:"7px 9px",borderLeft:`2px solid ${t.acc}`,marginBottom:9}}>{j.interviewNote}</div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:t.txt3}}>{j.careerTrack}</span>
              <span style={{color:t.cta,fontSize:12}}>{stars(j.interest)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Offers Tab ────────────────────────────────────────────────────────────────
function OffersTab({ jobs, onEdit, t }) {
  if (!jobs.length) return (
    <div style={{textAlign:"center",padding:"80px 0"}}>
      <div style={{fontSize:40,marginBottom:12}}>🎯</div>
      <div style={{fontSize:15,color:t.txt2,marginBottom:4}}>No offers yet — keep going!</div>
      <div style={{fontSize:12,color:t.txt3}}>Set a job to "Offer" stage to compare here</div>
    </div>
  );
  const sorted=[...jobs].sort((a,b)=>(parseInt(b.salary?.replace(/,/g,"")||0))-(parseInt(a.salary?.replace(/,/g,"")||0)));
  const topId=sorted[0]?.id;
  return (
    <div>
      <div style={{fontFamily:"'Kanit',system-ui,sans-serif",fontSize:22,fontWeight:900,letterSpacing:"-.5px",marginBottom:4,color:t.txt}}>Offer Comparison</div>
      <div style={{fontSize:12,color:t.txt3,marginBottom:18}}>{jobs.length} offer{jobs.length>1?"s":""} received</div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(sorted.length,3)},1fr)`,gap:12}}>
        {sorted.map(j=>{
          const isTop=j.id===topId&&jobs.length>1;
          return (
            <div key={j.id} onClick={()=>onEdit(j)} style={{background:t.bg2,border:`1.5px solid ${isTop?t.cta:t.brd}`,borderRadius:14,padding:20,cursor:"pointer",position:"relative",transition:"background .15s",boxShadow:isTop?`0 8px 32px ${t.cta}33`:"none"}}
              onMouseEnter={e=>e.currentTarget.style.background=t.bg3}
              onMouseLeave={e=>e.currentTarget.style.background=t.bg2}>
              {isTop&&<div style={{position:"absolute",top:12,right:12,background:t.cta,color:t.ctaTxt,fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:10,letterSpacing:.6,textTransform:"uppercase"}}>Top Offer</div>}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:800,color:t.txt,marginBottom:2}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3}}>{j.company}</div>
              </div>
              <div style={{fontFamily:"'Kanit',system-ui,sans-serif",fontSize:34,fontWeight:900,color:t.cta,letterSpacing:"-1px",marginBottom:2,textShadow:`0 0 20px ${t.cta}55`}}>฿{j.salary||"–"}</div>
              <div style={{fontSize:10,color:t.txt3,marginBottom:16}}>per month</div>
              <div style={{borderTop:`1px solid ${t.brd}`,paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
                {[{l:"Work Type",v:j.workType},{l:"Location",v:j.officeLocation||"–"},{l:"Track",v:j.careerTrack},{l:"Industry",v:j.industry||"–"}].map(({l,v})=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:t.txt3}}>{l}</span>
                    <span style={{fontSize:11,color:t.txt,fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:10,color:t.txt3}}>Next: {fmtDate(j.nextAction)}</span>
                <span style={{color:t.cta,fontSize:12}}>{stars(j.interest)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ form, setForm, editId, onSave, onClose, t }) {
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const showInt=["Interview","Offer"].includes(form.stage);
  const isCustom=form.careerTrack&&!BASE_TRACKS.includes(form.careerTrack);
  const [customTrack,setCustomTrack]=useState(isCustom);
  return (
    <>
      <style>{`.mf input,.mf select,.mf textarea{background:#191919!important;color:#FFF!important;border:1px solid #272727!important;border-radius:8px!important;padding:8px 12px!important;font-size:13px!important;width:100%;outline:none!important;font-family:inherit;-webkit-appearance:none;appearance:none;}.mf input:focus,.mf select:focus,.mf textarea:focus{border-color:${t.acc}!important;box-shadow:0 0 0 3px ${t.accBg}!important;}.mf textarea{resize:vertical;}.mf select option{background:#191919;}.mf input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.4);}`}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontFamily:"'Kanit',system-ui,sans-serif",fontSize:16,fontWeight:800,color:"#FFF"}}>{editId?"Edit Application":"New Application"}</div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:"#666",cursor:"pointer",fontSize:20,padding:"2px 6px"}}>✕</button>
      </div>
      <div className="mf">
        <SecHead>Basic Info</SecHead>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <Fld label="Job Title" span={2}><input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Business Development Manager"/></Fld>
          <Fld label="Company"><input value={form.company} onChange={e=>set("company",e.target.value)} placeholder="Company name"/></Fld>
          <Fld label="Industry"><input value={form.industry} onChange={e=>set("industry",e.target.value)} placeholder="Technology, Finance…"/></Fld>
          <Fld label="Source Platform"><input value={form.source} onChange={e=>set("source",e.target.value)} placeholder="LinkedIn, JobsDB, Referral…"/></Fld>
          <Fld label="Source URL">
            <div style={{display:"flex",gap:6}}>
              <input value={form.sourceUrl} onChange={e=>set("sourceUrl",e.target.value)} placeholder="https://..." style={{flex:1}}/>
              {form.sourceUrl&&<a href={form.sourceUrl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",background:t.accBg,border:`1px solid ${t.acc}44`,color:t.acc,borderRadius:8,padding:"0 11px",fontSize:15,textDecoration:"none",flexShrink:0}}>↗</a>}
            </div>
          </Fld>
          <Fld label="Stage"><select value={form.stage} onChange={e=>set("stage",e.target.value)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></Fld>
        </div>
        <SecHead color={t.acc}>Job Details</SecHead>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <Fld label="Career Track">
            <select value={customTrack?"__custom__":form.careerTrack} onChange={e=>{if(e.target.value==="__custom__"){setCustomTrack(true);set("careerTrack","");}else{setCustomTrack(false);set("careerTrack",e.target.value);}}}>
              {BASE_TRACKS.map(tr=><option key={tr}>{tr}</option>)}
              <option value="__custom__">＋ Custom…</option>
            </select>
            {customTrack&&<input style={{marginTop:7}} value={form.careerTrack} onChange={e=>set("careerTrack",e.target.value)} placeholder="Type your track…" autoFocus/>}
          </Fld>
          <Fld label="Work Type"><select value={form.workType} onChange={e=>set("workType",e.target.value)}>{WORK_TYPES.map(w=><option key={w}>{w}</option>)}</select></Fld>
          <Fld label="Salary (฿/month)"><input value={form.salary} onChange={e=>set("salary",e.target.value)} placeholder="85,000"/></Fld>
          <Fld label="Office Location"><input value={form.officeLocation} onChange={e=>set("officeLocation",e.target.value)} placeholder="Silom, Bangkok"/></Fld>
        </div>
        <SecHead>Timeline & HR</SecHead>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <Fld label="Date Applied"><input type="date" value={form.dateApplied} onChange={e=>set("dateApplied",e.target.value)}/></Fld>
          <Fld label="Next Action Date"><input type="date" value={form.nextAction} onChange={e=>set("nextAction",e.target.value)}/></Fld>
          <Fld label="HR Contact"><input value={form.hrContact} onChange={e=>set("hrContact",e.target.value)} placeholder="Name"/></Fld>
          <Fld label="HR Email / Phone"><input value={form.hrEmail} onChange={e=>set("hrEmail",e.target.value)} placeholder="email@company.com"/></Fld>
        </div>
        {showInt&&(
          <>
            <SecHead color="#818CF8">Interview Details</SecHead>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <Fld label="Interview Date"><input type="date" value={form.interviewDate} onChange={e=>set("interviewDate",e.target.value)}/></Fld>
              <Fld label="Round"><select value={form.interviewStage} onChange={e=>set("interviewStage",e.target.value)}>{INT_STAGES.map(s=><option key={s}>{s}</option>)}</select></Fld>
              <Fld label="Format" span={2}>
                <div style={{display:"flex",gap:8}}>
                  {INT_FMTS.map(f=>(
                    <button key={f} onClick={()=>set("interviewFormat",f)} style={{flex:1,padding:"9px",borderRadius:8,border:`1px solid ${form.interviewFormat===f?t.acc:t.brd2}`,background:form.interviewFormat===f?t.accBg:"transparent",color:form.interviewFormat===f?t.acc:t.txt3,cursor:"pointer",fontSize:13,fontWeight:600,transition:"all .15s"}}>
                      {f==="Online"?"💻":"🏢"} {f}
                    </button>
                  ))}
                </div>
              </Fld>
              <Fld label="Interview Notes" span={2}><textarea rows={2} value={form.interviewNote} onChange={e=>set("interviewNote",e.target.value)} placeholder="Who you're meeting, what to prepare…"/></Fld>
            </div>
          </>
        )}
        <SecHead>Additional</SecHead>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          <Fld label="Interest Level">
            <div style={{display:"flex",gap:4,padding:"5px 0"}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>set("interest",n)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:22,color:n<=form.interest?t.cta:"#2A2A2A",transition:"color .1s",padding:"0 2px",lineHeight:1,textShadow:n<=form.interest?`0 0 10px ${t.cta}`:"none"}}>★</button>
              ))}
            </div>
          </Fld>
          <Fld label="Notes" span={2}><textarea rows={2} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Key observations about this role…"/></Fld>
        </div>
      </div>
      <div style={{display:"flex",gap:9,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{background:"transparent",border:`1px solid ${t.brd2}`,color:t.txt3,padding:"9px 18px",borderRadius:8,cursor:"pointer",fontSize:13}}>Cancel</button>
        <button onClick={onSave} style={{background:t.cta,color:t.ctaTxt,border:"none",padding:"9px 22px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:900,fontFamily:"'Kanit',system-ui,sans-serif",boxShadow:`0 4px 16px ${t.cta}55`}}>
          {editId?"Save Changes":"Add Job"}
        </button>
      </div>
    </>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [themeKey,setThemeKey] = useState(()=>localStorage.getItem('jt_theme')||"hibiscus");
  const [user,setUser]         = useState(null);
  const [jobs,setJobs]         = useState([]);
  const [tab,setTab]           = useState("dashboard");
  const [modal,setModal]       = useState(false);
  const [form,setForm]         = useState(blankJob());
  const [editId,setEditId]     = useState(null);
  const [sfilt,setSfilt]       = useState("All");
  const [tfilt,setTfilt]       = useState("All");
  const [loaded,setLoaded]     = useState(false);
  const t = THEMES[themeKey];

  const changeTheme = key => { setThemeKey(key); localStorage.setItem('jt_theme', key); };

  // ── Load jobs from Supabase ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setLoaded(false);
    (async () => {
      try {
        const { data } = await supabase
          .from('user_jobs').select('jobs_data').eq('username', user).maybeSingle();
        setJobs(data?.jobs_data || []);
      } catch { setJobs([]); }
      setLoaded(true);
    })();
  }, [user]);

  // ── Save jobs to Supabase ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !loaded) return;
    (async () => {
      try {
        await supabase.from('user_jobs').upsert({
          username: user,
          jobs_data: jobs,
          updated_at: new Date().toISOString()
        });
      } catch {}
    })();
  }, [jobs, loaded, user]);

  const handleLogin  = u => { setUser(u); setTab("dashboard"); };
  const handleLogout = () => { setUser(null); setJobs([]); setLoaded(false); setModal(false); };
  const openAdd      = () => { setEditId(null); setForm(blankJob()); setModal(true); };
  const openEdit     = j  => { setEditId(j.id); setForm({...j}); setModal(true); };
  const delJob       = id => setJobs(js=>js.filter(j=>j.id!==id));
  const saveJob      = () => {
    const now=new Date().toISOString().slice(0,10);
    if (editId) setJobs(js=>js.map(j=>j.id===editId?{...form,id:editId,lastUpdated:now}:j));
    else        setJobs(js=>[...js,{...form,id:Date.now(),lastUpdated:now}]);
    setModal(false);
  };

  const iCnt=jobs.filter(j=>j.stage==="Interview").length;
  const oCnt=jobs.filter(j=>j.stage==="Offer").length;

  if (!user) return <LoginScreen onLogin={handleLogin} themeKey={themeKey} setThemeKey={changeTheme}/>;

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:t.bg,minHeight:"100vh",color:t.txt}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${t.brd2};border-radius:4px;}`}</style>

      <header style={{borderBottom:`1px solid ${t.brd}`,padding:"0 22px",display:"flex",alignItems:"center",gap:12,height:54,position:"sticky",top:0,background:`${t.bg}F2`,backdropFilter:"blur(12px)",zIndex:200}}>
        <div style={{display:"flex",alignItems:"baseline",flexShrink:0,fontFamily:"'Kanit',system-ui,sans-serif",fontWeight:900,fontSize:15,letterSpacing:"-.3px",lineHeight:1}}>
          <span style={{color:t.txt}}>พวก</span><span style={{color:t.cta,textShadow:`0 0 12px ${t.cta}88`}}>GenZ</span><span style={{color:t.txt}}>ไม่</span><span style={{color:t.acc,textShadow:`0 0 12px ${t.acc}88`}}>ทน</span><span style={{color:t.txt}}>งาน</span>
        </div>
        <nav style={{display:"flex",gap:1}}>
          {[{id:"dashboard",l:"Dashboard"},{id:"jobs",l:`Jobs (${jobs.length})`},{id:"interviews",l:`Interviews${iCnt?` (${iCnt})`:""}`},{id:"offers",l:`Offers${oCnt?` (${oCnt})`:""}`}].map(({id,l})=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{padding:"5px 12px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:tab===id?t.acc:"transparent",color:tab===id?t.accTxt:t.txt3,transition:"all .15s",boxShadow:tab===id?`0 2px 12px ${t.acc}44`:"none"}}
              onMouseEnter={e=>{if(tab!==id){e.target.style.background=t.bg3;e.target.style.color=t.txt;}}}
              onMouseLeave={e=>{if(tab!==id){e.target.style.background="transparent";e.target.style.color=t.txt3;}}}>
              {l}
            </button>
          ))}
        </nav>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <ThemeSwitcher cur={themeKey} set={changeTheme}/>
          <div style={{display:"flex",alignItems:"center",gap:6,background:t.bg2,border:`1px solid ${t.brd}`,borderRadius:20,padding:"4px 12px 4px 4px"}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:userColor(user),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#000"}}>{user.slice(0,2).toUpperCase()}</div>
            <span style={{fontFamily:"'Kanit',system-ui,sans-serif",fontSize:12,fontWeight:700,color:t.txt2}}>{user}</span>
          </div>
          <button onClick={handleLogout} style={{background:"transparent",border:`1px solid ${t.brd2}`,color:t.txt3,padding:"5px 11px",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600,transition:"all .15s"}}
            onMouseEnter={e=>{e.target.style.borderColor="#F87171";e.target.style.color="#F87171";}}
            onMouseLeave={e=>{e.target.style.borderColor=t.brd2;e.target.style.color=t.txt3;}}>Logout</button>
          <button onClick={openAdd} style={{background:t.cta,color:t.ctaTxt,border:"none",padding:"7px 14px",borderRadius:9,cursor:"pointer",fontFamily:"'Kanit',system-ui,sans-serif",fontWeight:900,fontSize:13,flexShrink:0,boxShadow:`0 4px 16px ${t.cta}55`}}
            onMouseEnter={e=>e.target.style.opacity=".85"} onMouseLeave={e=>e.target.style.opacity="1"}>
            + Add Job
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
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
          onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div style={{background:"#0F0F0F",border:`1px solid ${t.brd}`,borderRadius:16,width:"100%",maxWidth:620,maxHeight:"92vh",overflowY:"auto",padding:24}}>
            <Modal form={form} setForm={setForm} editId={editId} onSave={saveJob} onClose={()=>setModal(false)} t={t}/>
          </div>
        </div>
      )}
    </div>
  );
}
