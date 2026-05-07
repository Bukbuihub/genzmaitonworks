import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Theme System ──────────────────────────────────────────────────────────────
const PALETTE = {
  aurora:  { name:"Aurora",  g1:"#7C3AED", g2:"#3B82F6", cta:"#34D399", ctaTxt:"#000", orbs:["#6D28D9","#1D4ED8","#9333EA"], bg:"#03030A" },
  solar:   { name:"Solar",   g1:"#FB923C", g2:"#F472B6", cta:"#FDE68A", ctaTxt:"#000", orbs:["#C2410C","#BE185D","#7C3AED"], bg:"#080303" },
  matrix:  { name:"Matrix",  g1:"#10B981", g2:"#06B6D4", cta:"#6EE7B7", ctaTxt:"#000", orbs:["#065F46","#0E7490","#4338CA"], bg:"#020806" },
  cosmos:  { name:"Cosmos",  g1:"#C084FC", g2:"#F472B6", cta:"#E879F9", ctaTxt:"#000", orbs:["#7E22CE","#BE185D","#1D4ED8"], bg:"#050208" },
  glacier: { name:"Glacier", g1:"#38BDF8", g2:"#34D399", cta:"#7DD3FC", ctaTxt:"#000", orbs:["#0369A1","#065F46","#4338CA"], bg:"#020608" },
  void:    { name:"Void",    g1:"#64748B", g2:"#E2E8F0", cta:"#F8FAFC", ctaTxt:"#000", orbs:["#111827","#1F2937","#374151"], bg:"#010103" },
};

const mkT = k => {
  const p = PALETTE[k] || PALETTE.aurora;
  return {
    ...p, key:k,
    bg2:"rgba(255,255,255,0.04)", bg3:"rgba(255,255,255,0.08)",
    brd:"rgba(255,255,255,0.07)", brd2:"rgba(255,255,255,0.14)",
    acc:p.g1, accTxt:"#FFF", accBg:`${p.g1}28`,
    txt:"#FFF", txt2:"rgba(255,255,255,0.5)", txt3:"rgba(255,255,255,0.22)",
    grad:`linear-gradient(135deg,${p.g1},${p.g2})`,
  };
};

// ── Constants ─────────────────────────────────────────────────────────────────
const AMBIENT     = ["พี่ขอด่วน","ป่วยจริงรึป่าวคะ?","Noted krub","Noted ka","ขอบคุณที่แจ้งให้ทราบค่ะ","พี่อาบน้ำร้อนมาก่อน","ขอโทษที่รบกวนวันหยุดนะ แต่..","GenZ ก็เป็นเงี้ย","Sent at 1:47 AM","ขอ 5 นาทีครับ","พี่ติดประชุมครับ","ฝากน้องทำต่อด้วย","เดี๋ยวขอ sync ก่อน","งานด่วนของพี่ = trauma","พร้อมเริ่มงานเลยมั้ย??","พี่ว่ายังไม่ใช่","เราต้อง Active กว่านี้","deadline วันนี้นะ"];
const STAGES      = ["Applied","Screening","Interview","Offer","Rejected","Withdrawn"];
const WORK_TYPES  = ["Hybrid","Office 100%","Remote"];
const INT_FMTS    = ["Online","Onsite"];
const INT_STAGES  = ["HR Screen","1st Round","2nd Round","3rd Round","Final Round"];
const BASE_TRACKS = ["Business Development","Sales","Consultant"];
const STAGE_C     = { Applied:{c:"#94A3B8",bg:"rgba(148,163,184,.12)"}, Screening:{c:"#A78BFA",bg:"rgba(167,139,250,.12)"}, Interview:{c:"#818CF8",bg:"rgba(129,140,248,.12)"}, Offer:{c:"#34D399",bg:"rgba(52,211,153,.12)"}, Rejected:{c:"#F87171",bg:"rgba(248,113,113,.11)"}, Withdrawn:{c:"#6B7280",bg:"rgba(107,114,128,.11)"} };

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate  = d => d ? new Date(d+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"2-digit"}) : "–";
const stars    = n => "★".repeat(n)+"☆".repeat(5-n);
const genCode  = () => String(Math.floor(1000+Math.random()*9000));
const uColor   = n => ["#7C3AED","#10B981","#F472B6","#38BDF8","#F87171","#FBBF24"][n.charCodeAt(0)%6];
const blankJob = () => ({title:"",company:"",industry:"",source:"",sourceUrl:"",stage:"Applied",dateApplied:new Date().toISOString().slice(0,10),lastUpdated:"",hrContact:"",hrEmail:"",nextAction:"",interest:3,notes:"",workType:"Hybrid",salary:"",careerTrack:"Sales",officeLocation:"",interviewDate:"",interviewStage:"HR Screen",interviewFormat:"Online",interviewNote:""});

// ── Mesh Gradient Background ──────────────────────────────────────────────────
function MeshBg({ t }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
      {[{c:t.orbs[0],top:"-25%",left:"-15%",s:750},{c:t.orbs[1],top:"40%",right:"-20%",s:600},{c:t.orbs[2],bottom:"-20%",left:"22%",s:500}].map((o,i)=>(
        <div key={i} style={{position:"absolute",borderRadius:"50%",width:o.s,height:o.s,background:o.c,filter:"blur(150px)",opacity:.16,top:o.top,left:o.left,right:o.right,bottom:o.bottom}}/>
      ))}
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.045) 1px,transparent 1px)",backgroundSize:"40px 40px",WebkitMaskImage:"radial-gradient(ellipse at 50% 50%,black 30%,transparent 80%)",maskImage:"radial-gradient(ellipse at 50% 50%,black 30%,transparent 80%)"}}/>
    </div>
  );
}

// ── Floating Ambient Text ─────────────────────────────────────────────────────
function FloatingText({ t }) {
  const css = useMemo(()=>{
    const cols=[t.g1,t.g2,t.cta,`${t.g1}CC`,`${t.g2}AA`];
    return AMBIENT.map((_,i)=>{
      const l=3+(i*4.7)%88, dur=14+(i*3.3)%16, delay=-((i*2.9)%(dur*.9));
      const fs=10+(i%6)*5, col=cols[i%cols.length], op=.06+(i%5)*.03;
      const rot=-20+(i%7)*6, dx=-55+(i%5)*28, gr=6+(i%4)*7, sc=.88+(i%4)*.07;
      return `.fw${i}{position:absolute;left:${l}%;font-size:${fs}px;font-weight:900;white-space:nowrap;opacity:0;font-family:'Syne','Kanit',system-ui;color:${col};animation:fw${i}a ${dur}s linear ${delay}s infinite;pointer-events:none;}
@keyframes fw${i}a{0%{transform:translateY(108vh) translateX(0) rotate(${rot}deg) scale(${sc});opacity:0;}8%{opacity:${op*.5};}22%{transform:translateY(76vh) translateX(${dx*.35}px) rotate(${rot-3}deg) scale(${sc+.1});opacity:${op};text-shadow:0 0 ${gr}px ${col},0 0 ${gr*2.5}px ${col}44;}55%{transform:translateY(44vh) translateX(${dx}px) rotate(${rot+4}deg) scale(${sc+.1});opacity:${op};text-shadow:0 0 ${gr+5}px ${col},0 0 ${(gr+5)*2}px ${col}33;}88%{transform:translateY(12vh) translateX(${dx*1.5}px) rotate(${rot+1}deg) scale(${sc});opacity:${op*.3};}100%{transform:translateY(-15vh) translateX(${dx*1.8}px) rotate(${rot-2}deg) scale(.82);opacity:0;text-shadow:none;}}`;
    }).join('');
  },[t.g1,t.g2,t.cta]);
  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <style>{css}</style>
      {AMBIENT.map((w,i)=><div key={i} className={`fw${i}`}>{w}</div>)}
    </div>
  );
}

// ── Gradient Text Helper ──────────────────────────────────────────────────────
const G = ({children,t,size,weight="900",extra={}}) => (
  <span style={{background:t.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontSize:size,fontWeight:weight,fontFamily:"'Syne',system-ui",...extra}}>{children}</span>
);

// ── Shared Styles ─────────────────────────────────────────────────────────────
const glassCard = t => ({ background:t.bg2, border:`1px solid ${t.brd}`, backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderRadius:16 });
const glowBtn   = t => ({ background:t.grad, color:t.ctaTxt!=="transparent"?t.cta===t.g1?t.accTxt:t.ctaTxt:"#000", border:"none", borderRadius:10, cursor:"pointer", fontFamily:"'Syne',system-ui", fontWeight:700, boxShadow:`0 0 24px ${t.g1}55, 0 4px 16px rgba(0,0,0,.4)` });
const ctaBtn    = t => ({ background:t.cta, color:t.ctaTxt, border:"none", borderRadius:10, cursor:"pointer", fontFamily:"'Syne',system-ui", fontWeight:700, boxShadow:`0 0 20px ${t.cta}55, 0 4px 12px rgba(0,0,0,.4)` });

// ── UI Atoms ──────────────────────────────────────────────────────────────────
const StageBadge = ({stage}) => {
  const {c,bg}=STAGE_C[stage]||{c:"#888",bg:"rgba(0,0,0,.1)"};
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,background:bg,color:c,fontSize:11,fontWeight:600,whiteSpace:"nowrap",border:`1px solid ${c}33`}}><span style={{width:5,height:5,borderRadius:"50%",background:c,flexShrink:0}}/>{stage}</span>;
};

const Pill = ({label,active,onClick,t}) => (
  <button onClick={onClick} style={{padding:"5px 14px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${active?t.g1:t.brd2}`,background:active?`${t.g1}22`:"transparent",color:active?t.g1:t.txt3,transition:"all .2s",whiteSpace:"nowrap"}}>{label}</button>
);

const Fld = ({label,span,children}) => (
  <div style={{gridColumn:span===2?"1/-1":"span 1"}}>
    <label style={{display:"block",fontSize:10,color:"rgba(255,255,255,.3)",fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:6}}>{label}</label>
    {children}
  </div>
);

const SecHead = ({children,t}) => (
  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,marginTop:6}}>
    <div style={{height:1,flex:1,background:t.brd}}/>
    <span style={{fontSize:9,fontWeight:700,color:t.txt3,letterSpacing:2,textTransform:"uppercase"}}>{children}</span>
    <div style={{height:1,flex:1,background:t.brd}}/>
  </div>
);

// ── Theme Switcher ────────────────────────────────────────────────────────────
function ThemeSwitcher({cur,set}) {
  return (
    <div style={{display:"flex",gap:5,alignItems:"center",padding:"5px 10px",background:"rgba(255,255,255,.04)",borderRadius:20,border:"1px solid rgba(255,255,255,.07)"}}>
      {Object.entries(PALETTE).map(([k,p])=>(
        <button key={k} onClick={()=>set(k)} title={p.name}
          style={{width:14,height:14,borderRadius:"50%",background:`linear-gradient(135deg,${p.g1},${p.g2})`,border:`2px solid ${cur===k?"rgba(255,255,255,.9)":"transparent"}`,cursor:"pointer",padding:0,transition:"transform .15s",flexShrink:0,boxShadow:cur===k?`0 0 10px ${p.g1}99`:"none"}}
          onMouseEnter={e=>e.target.style.transform="scale(1.55)"}
          onMouseLeave={e=>e.target.style.transform="scale(1)"}
        />
      ))}
    </div>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({onLogin,themeKey,setThemeKey}) {
  const t=mkT(themeKey);
  const [step,setStep]=useState('name'), [name,setName]=useState(''), [code,setCode]=useState('');
  const [genC,setGenC]=useState(''), [err,setErr]=useState(''), [busy,setBusy]=useState(false), [copied,setCopied]=useState(false);

  const nextStep = async () => {
    const n=name.trim(); if(!n) return;
    setBusy(true); setErr('');
    try {
      const {data:ex}=await sb.from('user_codes').select('code').eq('username',n).maybeSingle();
      if(ex) setStep('verify');
      else { const c=genCode(); setGenC(c); await sb.from('user_codes').insert({username:n,code:c}); setStep('newcode'); }
    } catch { setErr('เกิดข้อผิดพลาด ลองใหม่'); }
    finally { setBusy(false); }
  };

  const verify = async () => {
    setBusy(true); setErr('');
    try {
      const {data:r}=await sb.from('user_codes').select('code').eq('username',name.trim()).maybeSingle();
      if(r?.code===code) onLogin(name.trim());
      else { setErr('รหัสไม่ถูกต้อง 🚫 ลองใหม่'); setCode(''); }
    } catch { setErr('เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  };

  const inp = {background:"rgba(255,255,255,.06)",color:"#FFF",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"12px 16px",fontSize:14,width:"100%",outline:"none",fontFamily:"'Inter',system-ui",display:"block",transition:"border-color .2s"};

  return (
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Inter',system-ui",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;700&family=Kanit:wght@700;800;900&family=Cormorant+Garamond:ital@1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input:focus{border-color:${t.g1}!important;box-shadow:0 0 0 3px ${t.g1}22!important;}
      `}</style>
      <MeshBg t={t}/>
      <FloatingText t={t}/>

      {/* Hero title */}
      <div style={{position:"relative",zIndex:1,textAlign:"center",marginBottom:48}}>
        <div style={{fontSize:11,fontWeight:600,color:t.txt3,letterSpacing:5,textTransform:"uppercase",marginBottom:20,fontFamily:"'Inter',system-ui"}}>
          TRACKING YOUR WAY TO THE TOP
        </div>
        <div style={{fontFamily:"'Syne',system-ui",fontWeight:900,lineHeight:.95,marginBottom:10}}>
          <div style={{fontSize:72,letterSpacing:"-3px"}}>
            <span style={{color:"rgba(255,255,255,.9)"}}>พวก</span>
            <G t={t} size={72} extra={{letterSpacing:"-3px"}}>GenZ</G>
          </div>
          <div style={{fontSize:64,letterSpacing:"-3px"}}>
            <span style={{color:"rgba(255,255,255,.9)"}}>ไม่</span>
            <span style={{color:t.cta,textShadow:`0 0 32px ${t.cta}88`,fontSize:64}}>ทน</span>
            <span style={{color:"rgba(255,255,255,.9)"}}>งาน</span>
          </div>
        </div>
        <div style={{fontSize:14,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:t.txt3,letterSpacing:.5,marginTop:12}}>
          Track every opportunity. Land what you deserve.
        </div>
      </div>

      {/* Glass card */}
      <div style={{...glassCard(t),position:"relative",zIndex:1,width:"100%",maxWidth:380,padding:28,boxShadow:`0 32px 80px rgba(0,0,0,.5),0 0 0 1px ${t.brd},inset 0 1px 0 rgba(255,255,255,.08)`}}>
        {/* Gradient top border */}
        <div style={{position:"absolute",top:0,left:16,right:16,height:1,background:t.grad,borderRadius:1}}/>

        {step==='name' && (
          <>
            <div style={{fontSize:18,fontWeight:700,color:t.txt,marginBottom:4,fontFamily:"'Syne',system-ui"}}>เข้าสู่ระบบ</div>
            <div style={{fontSize:12,color:t.txt3,marginBottom:20}}>ใส่ชื่อของคุณเพื่อเริ่มต้น</div>
            <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&nextStep()} placeholder="ชื่อของคุณ..." style={inp} autoFocus/>
            {err&&<div style={{fontSize:11,color:"#F87171",marginTop:8}}>{err}</div>}
            <button onClick={nextStep} disabled={!name.trim()||busy}
              style={{...ctaBtn(t),marginTop:14,width:"100%",padding:"13px",fontSize:14,transition:"opacity .2s",opacity:name.trim()?1:.4}}>
              {busy?"กำลังโหลด...":"ถัดไป →"}
            </button>
          </>
        )}

        {step==='newcode' && (
          <>
            <div style={{fontSize:12,fontWeight:600,color:t.cta,marginBottom:3,fontFamily:"'Inter',system-ui",letterSpacing:.5}}>👋 ยินดีต้อนรับ!</div>
            <div style={{fontSize:16,fontWeight:700,color:t.txt,marginBottom:4,fontFamily:"'Syne',system-ui"}}>คุณ <span style={{background:t.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{name}</span></div>
            <div style={{fontSize:12,color:t.txt2,lineHeight:1.7,marginBottom:16}}>นี่คือ <b style={{color:t.txt}}>Verification Code</b> ของคุณ<br/><span style={{fontSize:10,color:t.txt3}}>จดเก็บไว้ด้วย — ต้องใช้ทุกครั้งที่ login!</span></div>
            <div onClick={()=>{navigator.clipboard?.writeText(genC);setCopied(true);setTimeout(()=>setCopied(false),2e3);}}
              style={{background:`linear-gradient(135deg,${t.g1}22,${t.g2}22)`,border:`1px solid ${t.g1}55`,borderRadius:12,padding:"22px 16px",textAlign:"center",marginBottom:16,cursor:"pointer",userSelect:"none",boxShadow:`0 0 30px ${t.g1}33`}}>
              <div style={{fontSize:52,fontWeight:900,letterSpacing:20,color:t.cta,lineHeight:1,fontFamily:"'Syne',system-ui",textShadow:`0 0 24px ${t.cta}88`}}>{genC}</div>
              <div style={{fontSize:10,color:t.txt3,marginTop:10}}>{copied?"✓ Copied!":"แตะเพื่อ copy"}</div>
            </div>
            <button onClick={()=>onLogin(name)} style={{...ctaBtn(t),width:"100%",padding:"13px",fontSize:14}}>
              จำแล้ว! เข้าเลย →
            </button>
          </>
        )}

        {step==='verify' && (
          <>
            <div style={{fontSize:16,fontWeight:700,color:t.txt,marginBottom:4,fontFamily:"'Syne',system-ui"}}>ยืนยันตัวตน</div>
            <div style={{fontSize:12,color:t.txt3,marginBottom:18}}>สวัสดี <span style={{background:t.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",fontWeight:700}}>{name}</span>! ใส่ 4-digit code ของคุณ</div>
            <input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,4))} onKeyDown={e=>e.key==="Enter"&&code.length===4&&verify()} placeholder="• • • •" maxLength={4} autoFocus
              style={{...inp,fontSize:40,letterSpacing:20,textAlign:"center",fontWeight:900,padding:"16px",fontFamily:"'Syne',system-ui"}}/>
            {err&&<div style={{fontSize:11,color:"#F87171",marginTop:8,textAlign:"center"}}>{err}</div>}
            <button onClick={verify} disabled={code.length!==4||busy}
              style={{...ctaBtn(t),marginTop:14,width:"100%",padding:"13px",fontSize:14,opacity:code.length===4?1:.4,transition:"opacity .2s"}}>
              {busy?"กำลังตรวจสอบ...":"เข้าสู่ระบบ →"}
            </button>
            <button onClick={()=>{setStep('name');setCode('');setErr('');}}
              style={{marginTop:10,width:"100%",background:"transparent",border:`1px solid ${t.brd2}`,color:t.txt3,padding:"9px",borderRadius:9,cursor:"pointer",fontSize:11,fontFamily:"'Inter',system-ui"}}>
              ← เปลี่ยนชื่อผู้ใช้
            </button>
          </>
        )}
      </div>

      {/* Theme picker */}
      <div style={{position:"relative",zIndex:1,marginTop:24,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:9,color:t.txt3,letterSpacing:2,textTransform:"uppercase",fontWeight:700,fontFamily:"'Inter',system-ui"}}>Theme</span>
        <ThemeSwitcher cur={themeKey} set={setThemeKey}/>
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
      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:14}}>
        {[{l:"Total",v:total,c:t.txt,use:"plain"},{l:"Pipeline",v:cnt("Applied")+cnt("Screening"),c:t.g1,use:"grad"},{l:"Interview",v:cnt("Interview"),c:"#818CF8",use:"plain"},{l:"Offers",v:cnt("Offer"),c:t.cta,use:"plain"},{l:"Rejected",v:cnt("Rejected"),c:"#F87171",use:"plain"}].map(({l,v,c,use})=>(
          <div key={l} style={{...glassCard(t),padding:"16px 18px",borderTop:`1px solid ${c}44`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:use==="grad"?t.grad:c,opacity:.8}}/>
            <div style={{fontSize:10,color:t.txt3,marginBottom:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Inter',system-ui"}}>{l}</div>
            {use==="grad"
              ? <G t={t} size={36} extra={{display:"block",letterSpacing:"-1px",lineHeight:1}}>{v}</G>
              : <div style={{fontSize:36,fontWeight:900,color:c,lineHeight:1,letterSpacing:"-1px",fontFamily:"'Syne',system-ui",textShadow:v>0?`0 0 24px ${c}55`:"none"}}>{v}</div>}
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:12}}>
        <div style={{...glassCard(t),padding:20}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:18,color:t.txt,fontFamily:"'Syne',system-ui"}}>Application Pipeline</div>
          {["Applied","Screening","Interview","Offer"].map(s=>{
            const n=cnt(s),pct=total?Math.round(n/total*100):0,c=STAGE_C[s].c;
            return (
              <div key={s} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:t.txt2,fontFamily:"'Inter',system-ui"}}>{s}</span>
                  <span style={{fontSize:12,fontWeight:700,color:c,fontFamily:"'Syne',system-ui"}}>{n} <span style={{color:t.txt3,fontWeight:400}}>({pct}%)</span></span>
                </div>
                <div style={{height:3,background:"rgba(255,255,255,.06)",borderRadius:4}}>
                  <div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:4,transition:"width .7s ease",boxShadow:pct>0?`0 0 10px ${c}88`:"none"}}/>
                </div>
              </div>
            );
          })}
          <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${t.brd}`,display:"flex",gap:14}}>
            {["Rejected","Withdrawn"].map(s=>(
              <span key={s} style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:5,height:5,background:STAGE_C[s].c,borderRadius:"50%",display:"inline-block"}}/>
                <span style={{fontSize:11,color:t.txt3,fontFamily:"'Inter',system-ui"}}>{s}: <b style={{color:t.txt2}}>{cnt(s)}</b></span>
              </span>
            ))}
          </div>
        </div>

        <div style={{...glassCard(t),padding:20}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:16,color:t.txt,fontFamily:"'Syne',system-ui"}}>Breakdown</div>
          <div style={{fontSize:9,color:t.txt3,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10,fontFamily:"'Inter',system-ui"}}>Career Track</div>
          {!allTracks.length&&<div style={{fontSize:12,color:t.txt3,marginBottom:10}}>–</div>}
          {allTracks.map(tr=>{const n=jobs.filter(j=>j.careerTrack===tr).length; return(
            <div key={tr} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
              <span style={{fontSize:11,color:t.txt2,maxWidth:88,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Inter',system-ui"}}>{tr}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:44,height:2,background:"rgba(255,255,255,.08)",borderRadius:2}}><div style={{height:"100%",width:`${total?n/total*100:0}%`,background:t.grad,borderRadius:2}}/></div>
                <G t={t} size={12} extra={{minWidth:14,textAlign:"right"}}>{n}</G>
              </div>
            </div>
          );})}
          <div style={{fontSize:9,color:t.txt3,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,margin:"16px 0 10px",fontFamily:"'Inter',system-ui"}}>Work Type</div>
          {WORK_TYPES.map(w=>{const n=jobs.filter(j=>j.workType===w).length; return(
            <div key={w} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:11,color:t.txt2,fontFamily:"'Inter',system-ui"}}>{w}</span>
              <span style={{fontSize:11,fontWeight:600,color:t.txt,fontFamily:"'Syne',system-ui"}}>{n}</span>
            </div>
          );})}
        </div>
      </div>

      {upcoming.length>0&&(
        <div style={{...glassCard(t),padding:20}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:t.txt,fontFamily:"'Syne',system-ui"}}>Upcoming Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {upcoming.map(j=>(
              <div key={j.id} style={{background:t.bg3,border:`1px solid ${t.brd}`,borderRadius:12,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <StageBadge stage={j.stage}/>
                  <span style={{fontSize:11,color:t.cta,fontWeight:700,fontFamily:"'Syne',system-ui",textShadow:`0 0 12px ${t.cta}66`}}>{fmtDate(j.nextAction)}</span>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:t.txt,marginBottom:2,fontFamily:"'Syne',system-ui"}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3,fontFamily:"'Inter',system-ui"}}>{j.company}</div>
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
        <span style={{fontSize:9,color:t.txt3,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginRight:2,fontFamily:"'Inter',system-ui"}}>Stage</span>
        {["All",...STAGES].map(s=><Pill key={s} label={s} active={sfilt===s} onClick={()=>setSfilt(s)} t={t}/>)}
        <span style={{fontSize:9,color:t.txt3,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginLeft:8,marginRight:2,fontFamily:"'Inter',system-ui"}}>Track</span>
        {["All",...allTracks].map(tr=><Pill key={tr} label={tr} active={tfilt===tr} onClick={()=>setTfilt(tr)} t={t}/>)}
        <span style={{marginLeft:"auto",fontSize:11,color:t.txt3,fontFamily:"'Inter',system-ui"}}>{filtered.length} result{filtered.length!==1?"s":""}</span>
      </div>
      <div style={{...glassCard(t),overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${t.brd}`}}>
              {["Job Title","Source","Track","Work","Salary (฿)","Stage","Applied","Interest","Next",""].map(h=>(
                <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:9,fontWeight:700,color:t.txt3,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap",fontFamily:"'Inter',system-ui"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!filtered.length
              ? <tr><td colSpan={10} style={{padding:60,textAlign:"center",color:t.txt3,fontFamily:"'Inter',system-ui"}}>No jobs yet — add your first application!</td></tr>
              : filtered.map(j=>(
                <tr key={j.id} style={{borderBottom:`1px solid rgba(255,255,255,.04)`,cursor:"pointer",transition:"background .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  onClick={()=>onEdit(j)}>
                  <td style={{padding:"11px 14px"}}>
                    <div style={{fontWeight:700,color:t.txt,marginBottom:2,fontFamily:"'Syne',system-ui",fontSize:13}}>{j.title||"–"}</div>
                    <div style={{fontSize:10,color:t.txt3,fontFamily:"'Inter',system-ui"}}>{j.company}{j.industry?` · ${j.industry}`:""}</div>
                  </td>
                  <td style={{padding:"11px 14px"}}>
                    {j.sourceUrl
                      ? <a href={j.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:11,color:t.g2,textDecoration:"none",fontWeight:600,fontFamily:"'Inter',system-ui"}}>{j.source||"Link"} ↗</a>
                      : <span style={{fontSize:11,color:t.txt3,fontFamily:"'Inter',system-ui"}}>{j.source||"–"}</span>}
                  </td>
                  <td style={{padding:"11px 14px"}}><span style={{fontSize:10,background:`${t.g1}22`,border:`1px solid ${t.g1}44`,color:t.g1,padding:"3px 8px",borderRadius:5,fontFamily:"'Inter',system-ui"}}>{j.careerTrack||"–"}</span></td>
                  <td style={{padding:"11px 14px"}}><span style={{fontSize:10,color:t.txt3,background:"rgba(255,255,255,.06)",border:`1px solid ${t.brd}`,padding:"3px 7px",borderRadius:5,fontFamily:"'Inter',system-ui"}}>{j.workType}</span></td>
                  <td style={{padding:"11px 14px",color:t.txt,fontWeight:600,fontFamily:"'Syne',system-ui"}}>{j.salary||"–"}</td>
                  <td style={{padding:"11px 14px"}}><StageBadge stage={j.stage}/></td>
                  <td style={{padding:"11px 14px",color:t.txt3,whiteSpace:"nowrap",fontFamily:"'Inter',system-ui"}}>{fmtDate(j.dateApplied)}</td>
                  <td style={{padding:"11px 14px",color:t.cta,fontSize:13,textShadow:`0 0 8px ${t.cta}66`}}>{stars(j.interest)}</td>
                  <td style={{padding:"11px 14px",color:t.txt3,whiteSpace:"nowrap",fontFamily:"'Inter',system-ui"}}>{fmtDate(j.nextAction)}</td>
                  <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}>
                    {pendDel===j.id
                      ? <div style={{display:"flex",gap:4,alignItems:"center"}}>
                          <button onClick={()=>{onDelete(j.id);setPendDel(null);}} style={{background:"#F87171",border:"none",color:"#000",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,cursor:"pointer"}}>✓</button>
                          <button onClick={()=>setPendDel(null)} style={{background:"rgba(255,255,255,.1)",border:"none",color:t.txt2,fontSize:10,padding:"3px 8px",borderRadius:5,cursor:"pointer"}}>✗</button>
                        </div>
                      : <button onClick={()=>setPendDel(j.id)} style={{background:"transparent",border:`1px solid ${t.brd2}`,color:t.txt3,cursor:"pointer",fontSize:12,padding:"3px 8px",borderRadius:6,transition:"all .15s"}}
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
      <div style={{fontSize:15,color:t.txt2,marginBottom:4,fontFamily:"'Syne',system-ui"}}>No active interviews</div>
      <div style={{fontSize:12,color:t.txt3,fontFamily:"'Inter',system-ui"}}>Set a job to "Interview" stage to see it here</div>
    </div>
  );
  return (
    <div>
      <G t={t} size={26} extra={{display:"block",letterSpacing:"-1px",marginBottom:4}}>Active Interviews</G>
      <div style={{fontSize:12,color:t.txt3,marginBottom:20,fontFamily:"'Inter',system-ui"}}>{jobs.length} interview{jobs.length>1?"s":""} in progress</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>
        {jobs.map(j=>(
          <div key={j.id} onClick={()=>onEdit(j)} style={{...glassCard(t),padding:20,cursor:"pointer",transition:"background .15s,transform .15s",borderTop:`1px solid ${t.g1}66`,boxShadow:`0 4px 24px ${t.g1}11`}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.07)";e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.background=t.bg2;e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:t.txt,marginBottom:3,fontFamily:"'Syne',system-ui"}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3,fontFamily:"'Inter',system-ui"}}>{j.company}</div>
              </div>
              <span style={{fontSize:10,background:t.grad,color:"#000",padding:"4px 10px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,fontFamily:"'Syne',system-ui"}}>{j.interviewStage||"TBD"}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:12}}>
              {[{l:"Date",v:j.interviewDate?fmtDate(j.interviewDate):"TBD"},{l:"Format",v:j.interviewFormat},{l:"Work Type",v:j.workType},{l:"Salary",v:j.salary?`฿${j.salary}`:"–"}].map(({l,v})=>(
                <div key={l} style={{background:"rgba(255,255,255,.05)",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:t.txt3,textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:3,fontFamily:"'Inter',system-ui"}}>{l}</div>
                  <div style={{fontSize:11,color:t.txt,fontWeight:600,fontFamily:"'Syne',system-ui"}}>{v}</div>
                </div>
              ))}
            </div>
            {j.interviewNote&&<div style={{fontSize:10,color:t.txt2,background:"rgba(255,255,255,.04)",borderRadius:7,padding:"8px 10px",borderLeft:`2px solid ${t.g1}`,marginBottom:10,fontFamily:"'Inter',system-ui"}}>{j.interviewNote}</div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:t.txt3,fontFamily:"'Inter',system-ui"}}>{j.careerTrack}</span>
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
      <div style={{fontSize:15,color:t.txt2,marginBottom:4,fontFamily:"'Syne',system-ui"}}>No offers yet — keep going!</div>
      <div style={{fontSize:12,color:t.txt3,fontFamily:"'Inter',system-ui"}}>Set a job to "Offer" stage to compare here</div>
    </div>
  );
  const sorted=[...jobs].sort((a,b)=>(parseInt(b.salary?.replace(/,/g,"")||0))-(parseInt(a.salary?.replace(/,/g,"")||0)));
  const topId=sorted[0]?.id;
  return (
    <div>
      <G t={t} size={26} extra={{display:"block",letterSpacing:"-1px",marginBottom:4}}>Offer Comparison</G>
      <div style={{fontSize:12,color:t.txt3,marginBottom:20,fontFamily:"'Inter',system-ui"}}>{jobs.length} offer{jobs.length>1?"s":""} received</div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(sorted.length,3)},1fr)`,gap:12}}>
        {sorted.map(j=>{
          const isTop=j.id===topId&&jobs.length>1;
          return (
            <div key={j.id} onClick={()=>onEdit(j)} style={{...glassCard(t),padding:22,cursor:"pointer",position:"relative",transition:"background .15s,transform .15s",border:`1px solid ${isTop?t.g1:t.brd}`,boxShadow:isTop?`0 8px 40px ${t.g1}33,0 0 0 1px ${t.g1}44`:"none"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.07)";e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=t.bg2;e.currentTarget.style.transform="translateY(0)";}}>
              {isTop&&<div style={{position:"absolute",top:14,right:14,background:t.grad,fontSize:9,fontWeight:700,padding:"4px 9px",borderRadius:10,letterSpacing:.8,textTransform:"uppercase",color:"#fff",fontFamily:"'Syne',system-ui"}}>Top Offer</div>}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:14,fontWeight:700,color:t.txt,marginBottom:3,fontFamily:"'Syne',system-ui"}}>{j.title}</div>
                <div style={{fontSize:11,color:t.txt3,fontFamily:"'Inter',system-ui"}}>{j.company}</div>
              </div>
              <G t={t} size={38} extra={{display:"block",letterSpacing:"-1px",marginBottom:2}}>฿{j.salary||"–"}</G>
              <div style={{fontSize:10,color:t.txt3,marginBottom:18,fontFamily:"'Inter',system-ui"}}>per month</div>
              <div style={{borderTop:`1px solid ${t.brd}`,paddingTop:14,display:"flex",flexDirection:"column",gap:9}}>
                {[{l:"Work Type",v:j.workType},{l:"Location",v:j.officeLocation||"–"},{l:"Track",v:j.careerTrack},{l:"Industry",v:j.industry||"–"}].map(({l,v})=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:t.txt3,fontFamily:"'Inter',system-ui"}}>{l}</span>
                    <span style={{fontSize:11,color:t.txt,fontWeight:600,fontFamily:"'Syne',system-ui"}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,color:t.txt3,fontFamily:"'Inter',system-ui"}}>Next: {fmtDate(j.nextAction)}</span>
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
      <style>{`.mf input,.mf select,.mf textarea{background:rgba(255,255,255,.06)!important;color:#FFF!important;border:1px solid rgba(255,255,255,.1)!important;border-radius:9px!important;padding:10px 13px!important;font-size:13px!important;width:100%;outline:none!important;font-family:'Inter',system-ui;-webkit-appearance:none;appearance:none;transition:border-color .2s,box-shadow .2s;}.mf input:focus,.mf select:focus,.mf textarea:focus{border-color:${t.g1}!important;box-shadow:0 0 0 3px ${t.g1}22!important;}.mf textarea{resize:vertical;}.mf select option{background:#111;}.mf input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.4);}`}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <G t={t} size={18} extra={{letterSpacing:"-.5px"}}>{editId?"Edit Application":"New Application"}</G>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.07)",border:`1px solid ${t.brd2}`,color:t.txt3,cursor:"pointer",fontSize:16,padding:"4px 10px",borderRadius:7,lineHeight:1}}>✕</button>
      </div>
      <div className="mf">
        <SecHead t={t}>Basic Info</SecHead>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:16}}>
          <Fld label="Job Title" span={2}><input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Business Development Manager"/></Fld>
          <Fld label="Company"><input value={form.company} onChange={e=>set("company",e.target.value)} placeholder="Company name"/></Fld>
          <Fld label="Industry"><input value={form.industry} onChange={e=>set("industry",e.target.value)} placeholder="Technology, Finance…"/></Fld>
          <Fld label="Source Platform"><input value={form.source} onChange={e=>set("source",e.target.value)} placeholder="LinkedIn, JobsDB, Referral…"/></Fld>
          <Fld label="Source URL">
            <div style={{display:"flex",gap:7}}>
              <input value={form.sourceUrl} onChange={e=>set("sourceUrl",e.target.value)} placeholder="https://..." style={{flex:1}}/>
              {form.sourceUrl&&<a href={form.sourceUrl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",background:`${t.g1}22`,border:`1px solid ${t.g1}44`,color:t.g1,borderRadius:9,padding:"0 12px",fontSize:16,textDecoration:"none",flexShrink:0}}>↗</a>}
            </div>
          </Fld>
          <Fld label="Stage"><select value={form.stage} onChange={e=>set("stage",e.target.value)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></Fld>
        </div>
        <SecHead t={t}>Job Details</SecHead>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:16}}>
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
        <SecHead t={t}>Timeline & HR</SecHead>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:16}}>
          <Fld label="Date Applied"><input type="date" value={form.dateApplied} onChange={e=>set("dateApplied",e.target.value)}/></Fld>
          <Fld label="Next Action Date"><input type="date" value={form.nextAction} onChange={e=>set("nextAction",e.target.value)}/></Fld>
          <Fld label="HR Contact"><input value={form.hrContact} onChange={e=>set("hrContact",e.target.value)} placeholder="Name"/></Fld>
          <Fld label="HR Email / Phone"><input value={form.hrEmail} onChange={e=>set("hrEmail",e.target.value)} placeholder="email@company.com"/></Fld>
        </div>
        {showInt&&(<>
          <SecHead t={t}>Interview Details</SecHead>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:16}}>
            <Fld label="Interview Date"><input type="date" value={form.interviewDate} onChange={e=>set("interviewDate",e.target.value)}/></Fld>
            <Fld label="Round"><select value={form.interviewStage} onChange={e=>set("interviewStage",e.target.value)}>{INT_STAGES.map(s=><option key={s}>{s}</option>)}</select></Fld>
            <Fld label="Format" span={2}>
              <div style={{display:"flex",gap:8}}>
                {INT_FMTS.map(f=>(
                  <button key={f} onClick={()=>set("interviewFormat",f)} style={{flex:1,padding:"10px",borderRadius:9,border:`1px solid ${form.interviewFormat===f?t.g1:t.brd2}`,background:form.interviewFormat===f?`${t.g1}22`:"transparent",color:form.interviewFormat===f?t.g1:t.txt3,cursor:"pointer",fontSize:13,fontWeight:600,transition:"all .15s",fontFamily:"'Inter',system-ui"}}>
                    {f==="Online"?"💻":"🏢"} {f}
                  </button>
                ))}
              </div>
            </Fld>
            <Fld label="Interview Notes" span={2}><textarea rows={2} value={form.interviewNote} onChange={e=>set("interviewNote",e.target.value)} placeholder="Who you're meeting, what to prepare…"/></Fld>
          </div>
        </>)}
        <SecHead t={t}>Additional</SecHead>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:22}}>
          <Fld label="Interest Level">
            <div style={{display:"flex",gap:4,padding:"6px 0"}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>set("interest",n)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:22,color:n<=form.interest?t.cta:"rgba(255,255,255,.12)",transition:"all .1s",padding:"0 2px",lineHeight:1,textShadow:n<=form.interest?`0 0 12px ${t.cta}`:"none"}}>★</button>
              ))}
            </div>
          </Fld>
          <Fld label="Notes" span={2}><textarea rows={2} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Key observations about this role…"/></Fld>
        </div>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{background:"transparent",border:`1px solid ${t.brd2}`,color:t.txt3,padding:"10px 20px",borderRadius:9,cursor:"pointer",fontSize:13,fontFamily:"'Inter',system-ui"}}>Cancel</button>
        <button onClick={onSave} style={{...ctaBtn(t),padding:"10px 24px",fontSize:13}}>{editId?"Save Changes":"Add Job"}</button>
      </div>
    </>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [themeKey,setThemeKey] = useState(()=>localStorage.getItem('jt_theme')||"aurora");
  const [user,setUser]         = useState(null);
  const [jobs,setJobs]         = useState([]);
  const [tab,setTab]           = useState("dashboard");
  const [modal,setModal]       = useState(false);
  const [form,setForm]         = useState(blankJob());
  const [editId,setEditId]     = useState(null);
  const [sfilt,setSfilt]       = useState("All");
  const [tfilt,setTfilt]       = useState("All");
  const [loaded,setLoaded]     = useState(false);
  const t = mkT(themeKey);

  const changeTheme = k => { setThemeKey(k); localStorage.setItem('jt_theme',k); };

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

  const handleLogin  = u => { setUser(u); setTab("dashboard"); };
  const handleLogout = () => { setUser(null); setJobs([]); setLoaded(false); setModal(false); };
  const openAdd      = () => { setEditId(null); setForm(blankJob()); setModal(true); };
  const openEdit     = j  => { setEditId(j.id); setForm({...j}); setModal(true); };
  const delJob       = id => setJobs(js=>js.filter(j=>j.id!==id));
  const saveJob      = () => {
    const now=new Date().toISOString().slice(0,10);
    if(editId) setJobs(js=>js.map(j=>j.id===editId?{...form,id:editId,lastUpdated:now}:j));
    else       setJobs(js=>[...js,{...form,id:Date.now(),lastUpdated:now}]);
    setModal(false);
  };

  const iCnt=jobs.filter(j=>j.stage==="Interview").length;
  const oCnt=jobs.filter(j=>j.stage==="Offer").length;

  if(!user) return <LoginScreen onLogin={handleLogin} themeKey={themeKey} setThemeKey={changeTheme}/>;

  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",background:t.bg,minHeight:"100vh",color:t.txt,position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;700&family=Kanit:wght@700;800;900&family=Cormorant+Garamond:ital@1&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px;}
      `}</style>

      <MeshBg t={t}/>
      <FloatingText t={t}/>

      {/* Header */}
      <header style={{borderBottom:`1px solid ${t.brd}`,padding:"0 24px",display:"flex",alignItems:"center",gap:14,height:56,position:"sticky",top:0,background:`${t.bg}E8`,backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",zIndex:200}}>
        <div style={{display:"flex",alignItems:"baseline",flexShrink:0,fontFamily:"'Syne',system-ui",fontWeight:900,fontSize:15,letterSpacing:"-.5px",lineHeight:1,gap:0}}>
          <span style={{color:"rgba(255,255,255,.85)"}}>พวก</span>
          <G t={t} size={15}>GenZ</G>
          <span style={{color:"rgba(255,255,255,.85)"}}>ไม่</span>
          <span style={{color:t.cta,textShadow:`0 0 14px ${t.cta}88`}}>ทน</span>
          <span style={{color:"rgba(255,255,255,.85)"}}>งาน</span>
        </div>

        <nav style={{display:"flex",gap:2}}>
          {[{id:"dashboard",l:"Dashboard"},{id:"jobs",l:`Jobs (${jobs.length})`},{id:"interviews",l:`Interviews${iCnt?` (${iCnt})`:""}`},{id:"offers",l:`Offers${oCnt?` (${oCnt})`:""}`}].map(({id,l})=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{padding:"5px 13px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Inter',system-ui",background:tab===id?`${t.g1}22`:"transparent",color:tab===id?t.g1:t.txt3,transition:"all .15s",boxShadow:tab===id?`inset 0 0 0 1px ${t.g1}44`:"none"}}
              onMouseEnter={e=>{if(tab!==id){e.target.style.background="rgba(255,255,255,.05)";e.target.style.color=t.txt;}}}
              onMouseLeave={e=>{if(tab!==id){e.target.style.background="transparent";e.target.style.color=t.txt3;}}}>
              {l}
            </button>
          ))}
        </nav>

        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <ThemeSwitcher cur={themeKey} set={changeTheme}/>
          <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,.05)",border:`1px solid ${t.brd}`,borderRadius:20,padding:"4px 12px 4px 4px"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:`linear-gradient(135deg,${uColor(user)},${t.g2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#000",fontFamily:"'Syne',system-ui"}}>{user.slice(0,2).toUpperCase()}</div>
            <span style={{fontSize:12,fontWeight:600,color:t.txt2,fontFamily:"'Inter',system-ui"}}>{user}</span>
          </div>
          <button onClick={handleLogout} style={{background:"transparent",border:`1px solid ${t.brd2}`,color:t.txt3,padding:"6px 12px",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'Inter',system-ui",transition:"all .15s"}}
            onMouseEnter={e=>{e.target.style.borderColor="#F87171";e.target.style.color="#F87171";}}
            onMouseLeave={e=>{e.target.style.borderColor=t.brd2;e.target.style.color=t.txt3;}}>
            Logout
          </button>
          <button onClick={openAdd} style={{...ctaBtn(t),padding:"8px 16px",fontSize:13}}
            onMouseEnter={e=>e.target.style.opacity=".85"} onMouseLeave={e=>e.target.style.opacity="1"}>
            + Add Job
          </button>
        </div>
      </header>

      <main style={{padding:"28px 24px 80px",maxWidth:1320,margin:"0 auto",position:"relative",zIndex:1}}>
        {tab==="dashboard"  && <Dashboard    jobs={jobs} t={t}/>}
        {tab==="jobs"       && <JobsTab       jobs={jobs} onEdit={openEdit} onDelete={delJob} sfilt={sfilt} setSfilt={setSfilt} tfilt={tfilt} setTfilt={setTfilt} t={t}/>}
        {tab==="interviews" && <InterviewsTab jobs={jobs.filter(j=>j.stage==="Interview")} onEdit={openEdit} t={t}/>}
        {tab==="offers"     && <OffersTab     jobs={jobs.filter(j=>j.stage==="Offer")} onEdit={openEdit} t={t}/>}
      </main>

      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
          onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div style={{...glassCard(t),width:"100%",maxWidth:640,maxHeight:"92vh",overflowY:"auto",padding:26,boxShadow:`0 32px 80px rgba(0,0,0,.6),0 0 0 1px ${t.brd},inset 0 1px 0 rgba(255,255,255,.06)`,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:20,right:20,height:1,background:t.grad,borderRadius:1}}/>
            <Modal form={form} setForm={setForm} editId={editId} onSave={saveJob} onClose={()=>setModal(false)} t={t}/>
          </div>
        </div>
      )}
    </div>
  );
}
