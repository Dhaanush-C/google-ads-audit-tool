import { useState } from "react";

// ─── Load PapaParse ────────────────────────────────────────────────────────────
const loadPapa = () => new Promise(res => {
  if (window.Papa) return res(window.Papa);
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js";
  s.onload = () => res(window.Papa);
  document.head.appendChild(s);
});
const parseCSV = async file => {
  const Papa = await loadPapa();
  return new Promise((res, rej) =>
    Papa.parse(file, { header: true, skipEmptyLines: true, complete: r => res(r.data), error: rej })
  );
};

// ─── HTML Escape ───────────────────────────────────────────────────────────────
const esc = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

// ─── Sample Data ───────────────────────────────────────────────────────────────
const SAMPLE = {
  campaigns: [
    { Campaign:"Brand - Search", Status:"Enabled", "Daily budget":"50", Impressions:"8234", Clicks:"1205", Cost:"1523.45", Conversions:"87", CTR:"14.64%", "Avg. CPC":"1.26" },
    { Campaign:"Non-Brand - Search", Status:"Enabled", "Daily budget":"150", Impressions:"45231", Clicks:"892", Cost:"3245.67", Conversions:"23", CTR:"1.97%", "Avg. CPC":"3.64" },
    { Campaign:"Competitor - Search", Status:"Enabled", "Daily budget":"50", Impressions:"12455", Clicks:"234", Cost:"892.10", Conversions:"8", CTR:"1.88%", "Avg. CPC":"3.81" },
    { Campaign:"Display - Remarketing", Status:"Enabled", "Daily budget":"30", Impressions:"245678", Clicks:"1245", Cost:"623.45", Conversions:"12", CTR:"0.51%", "Avg. CPC":"0.50" },
  ],
  keywords: [
    { Keyword:"[buy running shoes]", "Match type":"Exact", Campaign:"Non-Brand - Search", "Quality Score":"8", Impressions:"1234", Clicks:"145", Cost:"523.45", Conversions:"12", CTR:"11.75%" },
    { Keyword:"shoes", "Match type":"Broad", Campaign:"Non-Brand - Search", "Quality Score":"3", Impressions:"23456", Clicks:"234", Cost:"892.10", Conversions:"4", CTR:"1.00%" },
    { Keyword:"running shoes online", "Match type":"Broad", Campaign:"Non-Brand - Search", "Quality Score":"4", Impressions:"8901", Clicks:"123", Cost:"445.60", Conversions:"2", CTR:"1.38%" },
    { Keyword:"cheap footwear", "Match type":"Phrase", Campaign:"Non-Brand - Search", "Quality Score":"2", Impressions:"4523", Clicks:"89", Cost:"312.45", Conversions:"0", CTR:"1.97%" },
    { Keyword:"free shoes", "Match type":"Broad", Campaign:"Non-Brand - Search", "Quality Score":"2", Impressions:"5234", Clicks:"104", Cost:"375.20", Conversions:"0", CTR:"1.99%" },
    { Keyword:"shoe store near me", "Match type":"Broad", Campaign:"Non-Brand - Search", "Quality Score":"3", Impressions:"8901", Clicks:"167", Cost:"602.30", Conversions:"1", CTR:"1.88%" },
  ],
  ads: [
    { "Ad type":"Responsive search ad", Campaign:"Non-Brand - Search", "Ad group":"Running Shoes", "Ad strength":"Poor", Impressions:"23456", Clicks:"456", CTR:"1.94%", Conversions:"15" },
    { "Ad type":"Responsive search ad", Campaign:"Brand - Search", "Ad group":"Brand", "Ad strength":"Good", Impressions:"8234", Clicks:"1205", CTR:"14.64%", Conversions:"87" },
    { "Ad type":"Expanded text ad", Campaign:"Non-Brand - Search", "Ad group":"Running Shoes", "Ad strength":"N/A", Impressions:"12000", Clicks:"220", CTR:"1.83%", Conversions:"8" },
  ],
  searchTerms: [
    { "Search term":"buy running shoes online", Campaign:"Non-Brand - Search", Impressions:"1234", Clicks:"45", Cost:"162.45", Conversions:"5" },
    { "Search term":"free shoes", Campaign:"Non-Brand - Search", Impressions:"3456", Clicks:"89", Cost:"312.45", Conversions:"0" },
    { "Search term":"shoe repair near me", Campaign:"Non-Brand - Search", Impressions:"2341", Clicks:"67", Cost:"241.60", Conversions:"0" },
    { "Search term":"kids shoes size 5", Campaign:"Non-Brand - Search", Impressions:"4521", Clicks:"102", Cost:"367.50", Conversions:"1" },
    { "Search term":"wholesale shoes bulk", Campaign:"Non-Brand - Search", Impressions:"1876", Clicks:"54", Cost:"194.40", Conversions:"0" },
  ],
};

// ─── Constants ─────────────────────────────────────────────────────────────────
const STEPS = ["Setup", "Upload Data", "AI Analysis", "Results", "Export"];
const CATS = [
  { id:"campaign_structure", label:"Campaign Structure & Settings", icon:"⚙️" },
  { id:"keyword_quality", label:"Keyword Quality & Wasted Spend", icon:"🔑" },
  { id:"ad_copy_ctr", label:"Ad Copy & CTR", icon:"📝" },
  { id:"bidding_budget", label:"Bidding Strategy & Budget", icon:"💰" },
];
const FILE_SLOTS = [
  { id:"campaigns", label:"Campaigns Report", path:"Campaigns → Download as CSV", hint:"Campaign, Status, Budget, Impressions, Clicks, Cost, Conversions, CTR, CPC", req:true, icon:"📊" },
  { id:"keywords", label:"Keywords Report", path:"Keywords → Download as CSV", hint:"Keyword, Match Type, Quality Score, Impressions, Clicks, Cost, Conversions", req:true, icon:"🔑" },
  { id:"ads", label:"Ads Report", path:"Ads & Extensions → Download as CSV", hint:"Ad type, Ad strength, Headlines, Descriptions, Impressions, Clicks, CTR", req:false, icon:"📝" },
  { id:"searchTerms", label:"Search Terms Report", path:"Keywords → Search Terms → Download as CSV", hint:"Search Term, Campaign, Impressions, Clicks, Cost, Conversions", req:false, icon:"🔍" },
];
const PROGRESS_MSGS = [
  "Parsing account data…",
  "Auditing campaign structure…",
  "Evaluating keyword quality…",
  "Reviewing ad copy performance…",
  "Assessing bidding & budget efficiency…",
  "Calculating wasted spend…",
  "Generating recommendations…",
  "Building your report…",
];

const scoreStyle = s =>
  s >= 80 ? { c:"#10b981", bg:"rgba(16,185,129,.08)", label:"Excellent" } :
  s >= 60 ? { c:"#3b82f6", bg:"rgba(59,130,246,.08)", label:"Good" } :
  s >= 40 ? { c:"#f59e0b", bg:"rgba(245,158,11,.08)", label:"Needs Work" } :
            { c:"#ef4444", bg:"rgba(239,68,68,.08)", label:"Critical" };

// ─── Print: Audit Report ───────────────────────────────────────────────────────
const printAudit = (cfg, r) => {
  const doc = window.open("","_blank");
  const catsHtml = CATS.map(cat => {
    const c = r.criteria?.[cat.id]; if (!c) return "";
    const col = c.score >= 60 ? "#1d4ed8" : c.score >= 40 ? "#b45309" : "#dc2626";
    const findings = (c.findings||[]).map(f => `
      <div style="margin-bottom:10px;padding-left:14px;border-left:3px solid ${f.type==="critical"?"#dc2626":f.type==="warning"?"#d97706":"#16a34a"}">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${f.type==="critical"?"#dc2626":f.type==="warning"?"#d97706":"#16a34a"};margin-bottom:3px">
          ${esc(f.type)}</div>
        <div style="font-size:14px;font-weight:600;color:#1e293b">${esc(f.title)}</div>
        <div style="font-size:13px;color:#475569;margin-top:2px">${esc(f.detail)}</div>
      </div>`).join("");
    const recs = (c.recommendations||[]).map(rec => `<div style="font-size:13px;color:#334155;margin-bottom:5px;padding-left:12px">→ ${esc(rec)}</div>`).join("");
    return `
      <div style="margin-bottom:32px;page-break-inside:avoid">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-bottom:14px">
          <h2 style="font-size:17px;color:#0f172a;margin:0">${esc(cat.icon)} ${esc(cat.label)}</h2>
          <span style="font-size:20px;font-weight:800;color:${col}">${c.score}/100 · ${esc(c.grade)}</span>
        </div>
        ${findings}
        ${recs ? `<div style="margin-top:14px"><div style="font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:8px">Recommendations</div>${recs}</div>` : ""}
      </div>`;
  }).join("");
  const prios = (r.top_priorities||[]).map(p => `
    <div style="display:flex;gap:16px;margin-bottom:12px;padding:14px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0">
      <div style="font-weight:800;color:#1d4ed8;font-size:18px;min-width:32px">#${esc(p.priority)}</div>
      <div>
        <div style="font-weight:600;color:#1e293b;font-size:14px">${esc(p.action)}</div>
        <div style="color:#64748b;font-size:13px;margin-top:3px">${esc(p.impact)}</div>
      </div>
      <div style="margin-left:auto;padding:4px 10px;background:${p.effort==="Low"?"#dcfce7":p.effort==="Medium"?"#fef9c3":"#fee2e2"};color:${p.effort==="Low"?"#16a34a":p.effort==="Medium"?"#ca8a04":"#dc2626"};border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;align-self:flex-start">${esc(p.effort)} Effort</div>
    </div>`).join("");

  doc.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Google Ads Audit – ${esc(cfg.clientName)}</title>
    <style>
      body{font-family:Georgia,serif;padding:44px;max-width:820px;margin:0 auto;color:#1e293b;font-size:14px;line-height:1.6}
      h1{font-size:30px;margin:8px 0 4px;color:#0f172a}
      @media print{body{padding:20px}@page{margin:1.5cm}}
    </style></head><body>
    <div style="border-bottom:3px solid #1e3a5f;padding-bottom:20px;margin-bottom:28px">
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">Prepared by ${esc(cfg.agencyName)}</div>
      <h1>Google Ads Audit Report</h1>
      <div style="font-size:15px;color:#334155">${esc(cfg.clientName)} · ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:22px;margin-bottom:32px;display:flex;gap:24px;align-items:flex-start">
      <div style="text-align:center;min-width:90px;background:#fff;border:2px solid #e2e8f0;border-radius:8px;padding:16px 12px">
        <div style="font-size:52px;font-weight:800;color:${r.overall_score>=60?"#1d4ed8":"#dc2626"};line-height:1">${esc(r.overall_grade)}</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-top:4px">Overall</div>
        <div style="font-size:18px;font-weight:700;color:${r.overall_score>=60?"#1d4ed8":"#dc2626"};margin-top:4px">${r.overall_score}/100</div>
      </div>
      <div>
        <p style="color:#334155;line-height:1.7;margin:0 0 12px;font-size:15px">${esc(r.executive_summary)}</p>
        ${r.monthly_spend_estimate?`<div style="margin-bottom:6px;color:#334155"><strong>Est. Monthly Spend:</strong> $${Number(r.monthly_spend_estimate).toLocaleString()}</div>`:""}
        ${r.wasted_spend_estimate?`<div style="color:#dc2626;font-weight:700;font-size:15px">⚠ Estimated Monthly Wasted Spend: $${Number(r.wasted_spend_estimate).toLocaleString()}</div>`:""}
      </div>
    </div>
    ${catsHtml}
    ${prios?`<div style="page-break-before:always;padding-top:28px"><h2 style="font-size:20px;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:10px;margin-bottom:20px">🎯 Top Priority Actions</h2>${prios}</div>`:""}
    <div style="margin-top:56px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:11px;color:#94a3b8;text-align:center">
      Confidential · Prepared by ${esc(cfg.agencyName)} · ${new Date().toLocaleDateString()}
    </div>
  </body></html>`);
  doc.document.close();
  setTimeout(() => doc.print(), 600);
};

// ─── Print: Sales Pitch ────────────────────────────────────────────────────────
const printPitch = (cfg, r) => {
  const p = r.sales_pitch; if (!p) return;
  const doc = window.open("","_blank");
  const painPoints = (p.pain_points||[]).map(pt => `
    <div style="display:flex;gap:12px;margin-bottom:10px;padding:13px 16px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 6px 6px 0">
      <span style="color:#dc2626;font-weight:700;margin-top:1px">▲</span>
      <span style="color:#1e293b;font-size:14px">${esc(pt)}</span>
    </div>`).join("");
  const proofPts = (p.proof_points||[]).map(pt => `
    <div style="display:flex;gap:12px;margin-bottom:10px">
      <span style="color:#2563eb;font-weight:700">→</span>
      <span style="color:#334155;font-size:14px">${esc(pt)}</span>
    </div>`).join("");

  doc.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Proposal – ${esc(cfg.clientName)}</title>
    <style>
      body{font-family:Georgia,serif;padding:52px;max-width:820px;margin:0 auto;color:#1e293b;font-size:14px;line-height:1.6}
      @media print{body{padding:24px}@page{margin:1.5cm}}
    </style></head><body>
    <div style="margin-bottom:36px">
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">Prepared exclusively for ${esc(cfg.clientName)}</div>
      <div style="font-size:11px;color:#64748b;margin-bottom:24px">By ${esc(cfg.agencyName)}</div>
      <h1 style="font-size:34px;color:#0f172a;line-height:1.25;margin:0 0 16px;font-weight:800">${esc(p.headline)}</h1>
      <div style="width:64px;height:5px;background:#2563eb;border-radius:3px;margin-bottom:28px"></div>
    </div>
    <p style="font-size:16px;color:#334155;line-height:1.85;margin-bottom:28px">${esc(p.opening)}</p>
    <h2 style="font-size:18px;color:#0f172a;font-weight:700;margin-bottom:14px">What We Found In Your Account</h2>
    ${painPoints}
    <h2 style="font-size:18px;color:#0f172a;font-weight:700;margin:30px 0 12px">How We'll Fix It</h2>
    <p style="font-size:15px;color:#334155;line-height:1.8;margin-bottom:24px">${esc(p.value_proposition)}</p>
    ${proofPts?`<h2 style="font-size:18px;color:#0f172a;font-weight:700;margin:30px 0 12px">The Numbers Don't Lie</h2>${proofPts}`:""}
    <div style="margin:44px 0;padding:30px;background:#eff6ff;border:2px solid #bfdbfe;border-radius:10px;text-align:center">
      <div style="font-size:21px;font-weight:800;color:#1e40af;margin-bottom:10px">${esc(p.cta)}</div>
      <div style="font-size:13px;color:#3b82f6;font-weight:600">${esc(cfg.agencyName)} · ${esc(cfg.agencyService)}</div>
    </div>
    <p style="font-size:14px;color:#475569;line-height:1.8;font-style:italic">${esc(p.closing)}</p>
    <div style="margin-top:52px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:11px;color:#94a3b8">
      ${esc(cfg.agencyName)} · Based on Google Ads Audit conducted ${new Date().toLocaleDateString()}
    </div>
  </body></html>`);
  doc.document.close();
  setTimeout(() => doc.print(), 600);
};

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [cfg, setCfg] = useState({ agencyName:"", agencyService:"Google Ads Management", clientName:"", clientIndustry:"" });
  const [files, setFiles] = useState({ campaigns:null, keywords:null, ads:null, searchTerms:null });
  const [data, setData] = useState({});
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState(null);
  const [err, setErr] = useState("");

  const loadFile = async (id, file) => {
    setFiles(f => ({ ...f, [id]: file }));
    try {
      const parsed = await parseCSV(file);
      setData(d => ({ ...d, [id]: parsed }));
    } catch (e) { setErr("Could not parse " + file.name + ". Please export as CSV from Google Ads."); }
  };

  const loadSample = () => {
    setFiles({ campaigns:{name:"sample_campaigns.csv"}, keywords:{name:"sample_keywords.csv"}, ads:{name:"sample_ads.csv"}, searchTerms:{name:"sample_search_terms.csv"} });
    setData(SAMPLE);
    if (!cfg.clientName) setCfg(c => ({ ...c, clientName:"Demo Client", clientIndustry:"E-commerce (Footwear)" }));
  };

  const runAudit = async () => {
    setStep(2); setBusy(true); setErr("");
    let mi = 0; setProgress(PROGRESS_MSGS[0]);
    const ticker = setInterval(() => { mi = Math.min(mi+1, PROGRESS_MSGS.length-1); setProgress(PROGRESS_MSGS[mi]); }, 2000);

    try {
      const summaries = Object.entries(data).reduce((acc,[k,v]) => {
        if (v?.length) acc[k] = { rowCount:v.length, columns:Object.keys(v[0]), sample:v.slice(0,80) };
        return acc;
      }, {});

      const prompt = `You are a senior Google Ads specialist conducting a thorough account audit.

Client: ${cfg.clientName} (${cfg.clientIndustry||"unspecified"})
Agency: ${cfg.agencyName} — Service: ${cfg.agencyService}

GOOGLE ADS DATA:
${JSON.stringify(summaries, null, 1)}

Audit this account across 4 criteria. Return ONLY valid JSON — no markdown fences, no preamble, no commentary. Be specific with real numbers from the data.

{
  "overall_score": <integer 0-100>,
  "overall_grade": <"A+"|"A"|"A-"|"B+"|"B"|"B-"|"C+"|"C"|"C-"|"D+"|"D"|"F">,
  "executive_summary": "<2-3 sentences. Reference specific data points. Be direct about the biggest issues.>",
  "monthly_spend_estimate": <number or null>,
  "wasted_spend_estimate": <number or null — estimate wasted spend from irrelevant searches, poor QS, no conversions>,
  "criteria": {
    "campaign_structure": {
      "score": <0-100>,
      "grade": <grade>,
      "findings": [
        { "type": "critical"|"warning"|"good", "title": "<short title>", "detail": "<specific finding with data>" }
      ],
      "recommendations": ["<actionable recommendation>"]
    },
    "keyword_quality": {
      "score": <0-100>, "grade": <grade>,
      "findings": [...], "recommendations": [...]
    },
    "ad_copy_ctr": {
      "score": <0-100>, "grade": <grade>,
      "findings": [...], "recommendations": [...]
    },
    "bidding_budget": {
      "score": <0-100>, "grade": <grade>,
      "findings": [...], "recommendations": [...]
    }
  },
  "top_priorities": [
    { "priority": 1, "action": "<specific action>", "impact": "<expected outcome with estimate if possible>", "effort": "Low"|"Medium"|"High" }
  ],
  "sales_pitch": {
    "headline": "<hard-hitting headline about the account's waste or missed opportunity>",
    "opening": "<2-3 sentences establishing urgency based on actual findings>",
    "pain_points": ["<specific problem from data>", "<another specific problem>"],
    "value_proposition": "<what the agency will do differently — 2-3 sentences>",
    "proof_points": ["<specific number or % from the audit>", "<another data-backed point>"],
    "cta": "<clear, action-oriented call to action>",
    "closing": "<confident, forward-looking closing — 1-2 sentences>"
  }
}`;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:4096, messages:[{role:"user",content:prompt}] }),
      });
      const raw = await resp.json();
      const txt = (raw.content||[]).map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(txt);
      clearInterval(ticker);
      setResults(parsed);
      setStep(3);
    } catch(e) {
      clearInterval(ticker);
      setErr("Analysis failed: " + e.message + ". Please try again.");
      setStep(1);
    } finally { setBusy(false); }
  };

  const resetAll = () => {
    setStep(0); setResults(null); setFiles({ campaigns:null, keywords:null, ads:null, searchTerms:null });
    setData({}); setErr("");
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={B.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Barlow+Condensed:wght@600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        input { transition:border-color .2s; }
        input:focus { border-color:#2563eb !important; outline:none; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes barIn { from{width:0} }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        .bar-fill { animation:barIn 1.4s cubic-bezier(.16,1,.3,1) forwards; }
        .fade-up { animation:fadeUp .35s ease forwards; }
        button { transition:filter .15s, transform .1s; }
        button:hover:not(:disabled) { filter:brightness(1.18); }
        button:active:not(:disabled) { transform:scale(.97); }
        .upload-row:hover { border-color:#2563eb !important; }
        .score-card:hover { transform:translateY(-2px); transition:transform .2s; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={B.header}>
        <div style={B.logo}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L13.5 8.5H20.5L14.5 12.5L16.5 19L11 15L5.5 19L7.5 12.5L1.5 8.5H8.5L11 2Z" fill="#3b82f6"/>
          </svg>
          <span>AdScope <span style={{color:"#3b82f6"}}>Audit</span></span>
        </div>
        <nav style={B.nav}>
          {STEPS.map((s,i) => (
            <div key={s} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{
                ...B.navDot,
                background: i < step ? "#2563eb" : i === step ? "#1e3a6e" : "#0e1826",
                border: i === step ? "1px solid #3b82f6" : "1px solid transparent",
                color: i <= step ? "#fff" : "#374151",
                boxShadow: i === step ? "0 0 14px rgba(59,130,246,.35)" : "none",
              }}>
                {i < step ? "✓" : i+1}
              </div>
              <span style={{fontSize:12,fontWeight:i===step?700:500,color:i===step?"#c7d2fe":i<step?"#3b82f6":"#2d3748",letterSpacing:.3}}>
                {s}
              </span>
              {i < STEPS.length-1 && <div style={{width:20,height:1,background:"#0e1826",margin:"0 2px"}}/>}
            </div>
          ))}
        </nav>
      </header>

      <main style={B.main}>
        {err && (
          <div style={B.errBar}>
            ⚠ {err}
            <button onClick={()=>setErr("")} style={{background:"none",border:"none",color:"#fca5a5",cursor:"pointer",marginLeft:"auto",fontSize:16}}>✕</button>
          </div>
        )}

        {/* ── STEP 0: Setup ──────────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="fade-up">
            <div style={B.pageHead}>
              <div>
                <div style={B.stepTag}>Step 01</div>
                <h1 style={B.h1}>Account Details</h1>
                <p style={B.sub}>Context for the audit report and sales pitch document</p>
              </div>
            </div>
            <div style={B.card}>
              <div style={B.grid2}>
                {[
                  {k:"agencyName",l:"Your Agency Name",p:"e.g. Apex Digital"},
                  {k:"agencyService",l:"Core Service Offered",p:"e.g. Google Ads Management"},
                  {k:"clientName",l:"Client / Company Name",p:"e.g. Acme Corp"},
                  {k:"clientIndustry",l:"Client Industry",p:"e.g. E-commerce, Legal, SaaS…"},
                ].map(f => (
                  <div key={f.k}>
                    <label style={B.label}>{f.l}</label>
                    <input style={B.input} placeholder={f.p} value={cfg[f.k]}
                      onChange={e=>setCfg(c=>({...c,[f.k]:e.target.value}))} />
                  </div>
                ))}
              </div>
              <div style={{marginTop:28,display:"flex",justifyContent:"flex-end"}}>
                <button
                  style={{...B.btn, opacity:(cfg.agencyName&&cfg.clientName)?1:.35}}
                  disabled={!cfg.agencyName||!cfg.clientName}
                  onClick={()=>setStep(1)}>
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Upload ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="fade-up">
            <div style={B.pageHead}>
              <div>
                <div style={B.stepTag}>Step 02</div>
                <h1 style={B.h1}>Upload Data</h1>
                <p style={B.sub}>Export reports from Google Ads as CSV, or try the demo</p>
              </div>
            </div>

            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <button style={B.demoBtn} onClick={loadSample}>⚡ Load Sample Data</button>
              <span style={{color:"#374151",fontSize:13}}>— or upload your own CSV exports below</span>
            </div>

            <div style={B.card}>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:8}}>
                {FILE_SLOTS.map(slot => (
                  <label key={slot.id} className="upload-row" style={{
                    ...B.uploadRow,
                    borderColor: data[slot.id] ? "#10b981" : "#0e1826",
                    cursor:"pointer",
                  }}>
                    <span style={{fontSize:24,minWidth:32,textAlign:"center"}}>{slot.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        <span style={{fontWeight:700,fontSize:14,color:"#f0f4ff"}}>{slot.label}</span>
                        {slot.req&&<span style={B.reqBadge}>Required</span>}
                      </div>
                      <div style={{fontSize:12,color:"#3b82f6",marginBottom:2}}>→ {slot.path}</div>
                      <div style={{fontSize:11,color:"#2d3748"}}>Columns needed: {slot.hint}</div>
                    </div>
                    <div style={{
                      padding:"8px 14px",borderRadius:7,fontSize:12,fontWeight:700,whiteSpace:"nowrap",
                      background: data[slot.id]?"rgba(16,185,129,.1)":"rgba(59,130,246,.06)",
                      color: data[slot.id]?"#10b981":"#3b82f6",
                      border:`1px solid ${data[slot.id]?"#10b981":"#1e3a5f"}`,
                    }}>
                      {data[slot.id] ? `✓ ${data[slot.id].length} rows` : files[slot.id] ? files[slot.id].name : "Upload CSV"}
                    </div>
                    <input type="file" accept=".csv" style={{display:"none"}}
                      onChange={e=>e.target.files[0]&&loadFile(slot.id,e.target.files[0])} />
                  </label>
                ))}
              </div>
              {!data.campaigns && !data.keywords && (
                <div style={{fontSize:12,color:"#2d3748",padding:"10px 14px",background:"rgba(245,158,11,.05)",border:"1px solid rgba(245,158,11,.15)",borderRadius:7,marginTop:12}}>
                  💡 Need at least one of the required reports. The more you upload, the deeper the audit.
                </div>
              )}
            </div>

            <div style={B.btnRow}>
              <button style={B.ghostBtn} onClick={()=>setStep(0)}>← Back</button>
              <button
                style={{...B.btn,opacity:(data.campaigns||data.keywords)?1:.35}}
                disabled={!data.campaigns&&!data.keywords}
                onClick={runAudit}>
                Run AI Audit →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Analyzing ──────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="fade-up">
            <div style={{...B.card,textAlign:"center",padding:"72px 40px"}}>
              <div style={{position:"relative",width:60,height:60,margin:"0 auto 32px"}}>
                <div style={{position:"absolute",inset:0,border:"3px solid #0e1826",borderRadius:"50%"}}/>
                <div style={{position:"absolute",inset:0,border:"3px solid transparent",borderTopColor:"#3b82f6",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
                <div style={{position:"absolute",inset:8,border:"2px solid transparent",borderTopColor:"#6366f1",borderRadius:"50%",animation:"spin 1.4s linear infinite reverse"}}/>
              </div>
              <h2 style={{...B.h1,marginBottom:10,fontSize:22}}>Auditing Account</h2>
              <p style={{color:"#6b7a99",fontSize:15,marginBottom:20}}>{progress}</p>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {[0,1,2,3].map(i=>(
                  <div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#3b82f6",animation:`pulse 1.2s ${i*.2}s ease infinite`}}/>
                ))}
              </div>
              <div style={{marginTop:32,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {CATS.map((cat,i) => (
                  <div key={cat.id} style={{padding:"10px 8px",background:"#080c14",border:"1px solid #0e1826",borderRadius:8,fontSize:11,color:"#374151",textAlign:"center"}}>
                    <div style={{fontSize:20,marginBottom:4}}>{cat.icon}</div>
                    {cat.label.split("&")[0].trim()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Results ────────────────────────────────────────────────── */}
        {step === 3 && results && (
          <div className="fade-up">
            {/* Overall Banner */}
            <div style={B.banner}>
              <div style={B.gradeBox}>
                <span style={{fontSize:60,fontWeight:900,color:scoreStyle(results.overall_score).c,lineHeight:1,fontFamily:"'Barlow Condensed',sans-serif"}}>
                  {results.overall_grade}
                </span>
                <span style={{fontSize:11,color:"#4b5563",textTransform:"uppercase",letterSpacing:1.5,marginTop:4}}>Overall Grade</span>
                <div style={{marginTop:8,fontSize:28,fontWeight:800,color:scoreStyle(results.overall_score).c}}>{results.overall_score}<span style={{fontSize:14,color:"#374151",fontWeight:400}}>/100</span></div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:2.5,color:"#3b82f6",marginBottom:10}}>
                  {cfg.clientName} · Google Ads Audit
                </div>
                <p style={{color:"#9ca3af",lineHeight:1.75,margin:"0 0 14px",fontSize:15}}>{results.executive_summary}</p>
                <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                  {results.monthly_spend_estimate && (
                    <div style={{padding:"8px 14px",background:"rgba(59,130,246,.07)",border:"1px solid rgba(59,130,246,.2)",borderRadius:7,fontSize:13,color:"#93c5fd"}}>
                      📊 Monthly Spend: <strong>${Number(results.monthly_spend_estimate).toLocaleString()}</strong>
                    </div>
                  )}
                  {results.wasted_spend_estimate && (
                    <div style={{padding:"8px 14px",background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.2)",borderRadius:7,fontSize:13,color:"#fca5a5"}}>
                      ⚠ Wasted/mo: <strong style={{color:"#ef4444"}}>${Number(results.wasted_spend_estimate).toLocaleString()}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Score Cards */}
            <div style={B.scoreGrid}>
              {CATS.map(cat => {
                const c = results.criteria?.[cat.id]; if(!c) return null;
                const ss = scoreStyle(c.score);
                return (
                  <div key={cat.id} className="score-card" style={{...B.scoreCard,borderColor:ss.c+"28"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <span style={{fontSize:12,color:"#6b7a99",fontWeight:600,flex:1,paddingRight:8}}>{cat.icon} {cat.label}</span>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <span style={{fontSize:26,fontWeight:800,color:ss.c,lineHeight:1,fontFamily:"'Barlow Condensed',sans-serif"}}>{c.score}</span>
                        <span style={{fontSize:11,color:"#374151"}}>/100</span>
                        <div style={{fontSize:11,fontWeight:700,color:ss.c,letterSpacing:.5}}>{ss.label}</div>
                      </div>
                    </div>
                    <div style={{height:3,background:"#0e1826",borderRadius:4,marginBottom:14,overflow:"hidden"}}>
                      <div className="bar-fill" style={{height:"100%",width:`${c.score}%`,background:ss.c,borderRadius:4}}/>
                    </div>
                    {(c.findings||[]).slice(0,3).map((f,i)=>(
                      <div key={i} style={{marginTop:10,paddingTop:10,borderTop:i>0?"1px solid #0e1826":"none"}}>
                        <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,color:f.type==="critical"?"#ef4444":f.type==="warning"?"#f59e0b":"#10b981",marginBottom:3}}>
                          {f.type==="critical"?"● CRITICAL":f.type==="warning"?"◐ WARNING":"● OK"}
                        </div>
                        <div style={{fontSize:13,fontWeight:600,color:"#d1d5db",lineHeight:1.3}}>{f.title}</div>
                        <div style={{fontSize:11,color:"#4b5563",marginTop:2,lineHeight:1.5}}>{f.detail}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Top Priorities */}
            {results.top_priorities?.length > 0 && (
              <div style={B.card}>
                <div style={B.sectionHead}>🎯 Top Priority Actions</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {results.top_priorities.map((p,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",background:"#080c14",border:"1px solid #0e1826",borderRadius:9}}>
                      <div style={{fontSize:20,fontWeight:900,color:"#3b82f6",minWidth:36,fontFamily:"'Barlow Condensed',sans-serif"}}>#{p.priority}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:600,color:"#e5e7eb"}}>{p.action}</div>
                        <div style={{fontSize:12,color:"#4b5563",marginTop:3}}>{p.impact}</div>
                      </div>
                      <div style={{
                        padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap",
                        background:p.effort==="Low"?"rgba(16,185,129,.1)":p.effort==="Medium"?"rgba(245,158,11,.1)":"rgba(239,68,68,.1)",
                        color:p.effort==="Low"?"#10b981":p.effort==="Medium"?"#f59e0b":"#ef4444",
                      }}>{p.effort} Effort</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={B.btnRow}>
              <button style={B.ghostBtn} onClick={()=>setStep(1)}>← Re-upload</button>
              <button style={B.btn} onClick={()=>setStep(4)}>Generate Documents →</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Export ─────────────────────────────────────────────────── */}
        {step === 4 && results && (
          <div className="fade-up">
            <div style={B.pageHead}>
              <div>
                <div style={B.stepTag}>Step 05</div>
                <h1 style={B.h1}>Export Documents</h1>
                <p style={B.sub}>A clean print tab opens — use Ctrl+P / Cmd+P to save as PDF</p>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              {/* Audit Report Card */}
              <div style={{...B.card,display:"flex",flexDirection:"column",gap:12,borderColor:"#1e3a5f"}}>
                <div style={{fontSize:44,marginBottom:4}}>📋</div>
                <div>
                  <div style={{fontSize:18,fontWeight:700,color:"#f0f4ff",marginBottom:6}}>Audit Report</div>
                  <p style={{fontSize:13,color:"#4b5563",lineHeight:1.65,margin:0}}>
                    Full technical audit — scores per category, detailed findings, and prioritized recommendations. Send to client post-review.
                  </p>
                </div>
                <div style={{marginTop:"auto",paddingTop:12,borderTop:"1px solid #0e1826"}}>
                  <div style={{fontSize:11,color:"#2d3748",marginBottom:12}}>
                    ✓ Overall grade · ✓ 4 category scores · ✓ Findings · ✓ Recommendations
                  </div>
                  <button style={B.btn} onClick={()=>printAudit(cfg,results)}>🖨 Print Audit Report</button>
                </div>
              </div>

              {/* Sales Pitch Card */}
              <div style={{...B.card,display:"flex",flexDirection:"column",gap:12,borderColor:"#4c1d95"}}>
                <div style={{fontSize:44,marginBottom:4}}>🎯</div>
                <div>
                  <div style={{fontSize:18,fontWeight:700,color:"#f0f4ff",marginBottom:6}}>Sales Pitch</div>
                  <p style={{fontSize:13,color:"#4b5563",lineHeight:1.65,margin:0}}>
                    Narrative pitch derived from audit findings — designed to convert the client into a managed services engagement.
                  </p>
                </div>
                <div style={{marginTop:"auto",paddingTop:12,borderTop:"1px solid #0e1826"}}>
                  <div style={{fontSize:11,color:"#2d3748",marginBottom:12}}>
                    ✓ Pain-point opener · ✓ Proof points · ✓ Value prop · ✓ CTA
                  </div>
                  <button style={{...B.btn,background:"rgba(124,58,237,.12)",borderColor:"#7c3aed",color:"#c4b5fd"}}
                    onClick={()=>printPitch(cfg,results)}>
                    🖨 Print Sales Pitch
                  </button>
                </div>
              </div>
            </div>

            {/* Pitch Preview */}
            {results.sales_pitch && (
              <div style={B.card}>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 12px",background:"rgba(124,58,237,.1)",border:"1px solid rgba(124,58,237,.3)",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,color:"#a78bfa",marginBottom:20}}>
                  Sales Pitch Preview
                </div>
                <h3 style={{fontSize:21,fontWeight:700,color:"#f0f4ff",margin:"0 0 10px",lineHeight:1.35}}>{results.sales_pitch.headline}</h3>
                <p style={{color:"#6b7a99",lineHeight:1.75,margin:"0 0 14px",fontSize:14}}>{results.sales_pitch.opening}</p>
                <div style={{marginBottom:14}}>
                  {results.sales_pitch.pain_points?.map((pt,i)=>(
                    <div key={i} style={{padding:"10px 14px",background:"rgba(239,68,68,.05)",borderLeft:"3px solid #ef4444",borderRadius:"0 7px 7px 0",color:"#fca5a5",fontSize:13,marginBottom:7,lineHeight:1.5}}>
                      ⚠ {pt}
                    </div>
                  ))}
                </div>
                <p style={{color:"#a78bfa",fontStyle:"italic",fontSize:13,lineHeight:1.75,marginBottom:14}}>{results.sales_pitch.value_proposition}</p>
                <div style={{padding:"13px 18px",background:"rgba(37,99,235,.08)",border:"1px solid rgba(37,99,235,.2)",borderRadius:8,color:"#93c5fd",fontWeight:700,fontSize:14}}>
                  {results.sales_pitch.cta}
                </div>
              </div>
            )}

            <div style={B.btnRow}>
              <button style={B.ghostBtn} onClick={()=>setStep(3)}>← Back to Results</button>
              <button style={{...B.ghostBtn,color:"#374151",borderColor:"#0e1826"}} onClick={resetAll}>↺ New Audit</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const B = {
  app: { minHeight:"100vh", background:"#060b12", fontFamily:"'Barlow',sans-serif", color:"#f0f4ff" },
  heade
