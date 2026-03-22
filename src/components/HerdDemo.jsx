import { useState, useEffect, useRef, useCallback } from "react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── shared palette ───────────────────────────────────────────────────────────
const g = {
  bg: "#0d1117", surface: "#161b22", border: "#21262d",
  mutedBorder: "#30363d", text: "#e6edf3", dim: "#8b949e",
  green: "#3fb950", greenBg: "rgba(63,185,80,0.12)",
  purple: "#a371f7", purpleBg: "rgba(163,113,247,0.12)",
  blue: "#58a6ff", blueBg: "rgba(88,166,255,0.12)",
  orange: "#e3b341", orangeBg: "rgba(227,179,65,0.12)",
  red: "#f85149", prompt: "#f78166",
};

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const Label = ({ bg, color, border, children }) => (
  <span style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: 12, padding: "0 7px", fontSize: 11, fontWeight: 500 }}>{children}</span>
);

const CountBadge = ({ n, active }) => !n ? null : (
  <span style={{ background: active ? "rgba(255,255,255,0.12)" : g.border, color: active ? g.text : g.dim, borderRadius: 10, padding: "0 6px", fontSize: 11, fontWeight: 500, minWidth: 18, textAlign: "center" }}>{n}</span>
);

function IssueIcon({ status }) {
  if (status === "closed") return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={g.purple} style={{ flexShrink: 0 }}>
      <path d="M11.28 6.78a.75.75 0 00-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l3.5-3.5z" />
      <path fillRule="evenodd" d="M16 8A8 8 0 110 8a8 8 0 0116 0zm-1.5 0a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
    </svg>
  );
  const color = status === "in-progress" ? g.orange : g.green;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={color} style={{ flexShrink: 0 }}>
      <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
    </svg>
  );
}

function Spinner({ color = g.orange }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: "herd-spin 0.8s linear infinite", flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5.5" fill="none" stroke={color} strokeWidth="2" strokeDasharray="24" strokeDashoffset="8" strokeLinecap="round" />
    </svg>
  );
}

// ─── typewriter ───────────────────────────────────────────────────────────────
async function typeInto(setText, text, wpm = 280) {
  const delay = 60000 / (wpm * 5);
  for (let i = 0; i <= text.length; i++) {
    setText(text.slice(0, i));
    await sleep(delay + (Math.random() * delay * 0.4));
  }
}

// ─── PHASE 1 — terminal ───────────────────────────────────────────────────────
const PLAN = {
  feature: "dark mode",
  tasks: [
    { id: "T-1", tier: 1, title: "Add CSS variable tokens for theme switching", branch: "herd/t1-css-tokens" },
    { id: "T-2", tier: 1, title: "Implement ThemeProvider component", branch: "herd/t2-theme-provider" },
    { id: "T-3", tier: 2, title: "Add toggle button + localStorage persistence", branch: "herd/t3-toggle" },
    { id: "T-4", tier: 2, title: "Update Storybook stories for dark mode", branch: "herd/t4-storybook" },
  ],
};

function TerminalPhase({ onDone, autoStart }) {
  const [stage, setStage] = useState("idle");
  const [cmdText, setCmdText] = useState("");
  const [cursor, setCursor] = useState(true);
  const [ccLines, setCCLines] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [jsonLines, setJsonLines] = useState([]);
  const [showJson, setShowJson] = useState(false);
  const [showProceed, setShowProceed] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (autoStart) run();
  }, [autoStart]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ccLines, jsonLines, showProceed]);

  const addCC = useCallback(async (role, text, delayAfter = 120) => {
    if (role === "claude") {
      setCCLines(l => [...l, { role, text: "" }]);
      await sleep(80);
      for (let i = 1; i <= text.length; i++) {
        const chunk = text.slice(0, i);
        setCCLines(l => [...l.slice(0, -1), { role, text: chunk }]);
        await sleep(12 + Math.random() * 8);
      }
    } else {
      setCCLines(l => [...l, { role, text }]);
    }
    await sleep(delayAfter);
  }, []);

  const run = useCallback(async () => {
    if (stage !== "idle") return;
    setStage("running");

    // type herd plan
    await sleep(400);
    await typeInto(setCmdText, "herd plan", 220);
    await sleep(350);
    setStage("cc-open");
    setCmdText("");
    await sleep(600);

    // Claude Code opens — type user message
    await typeInto(setUserInput, "let's add dark mode to this website", 260);
    await sleep(300);
    setUserInput("");
    await addCC("user", "let's add dark mode to this website", 500);

    // Claude asks Q1
    await addCC("claude", "Happy to help with that. A couple of quick questions to scope it out:", 200);
    await addCC("claude", "1. Should users be able to toggle between light and dark manually, or just follow the system preference automatically?", 600);
    await addCC("user", "Both — default to system preference, but show a toggle to override", 500);
    await addCC("claude", "2. Should the preference persist across sessions (localStorage), or reset on each visit?", 500);
    await addCC("user", "Persist it, yes", 500);
    await addCC("claude", "Got it. Let me break this down into independent tasks...", 800);

    // show plan JSON
    setShowJson(true);
    const jsonStr = JSON.stringify({ feature: "dark-mode", tiers: [
      { tier: 1, tasks: PLAN.tasks.filter(t => t.tier === 1).map(t => ({ id: t.id, title: t.title, branch: t.branch })) },
      { tier: 2, tasks: PLAN.tasks.filter(t => t.tier === 2).map(t => ({ id: t.id, title: t.title, branch: t.branch })) },
    ]}, null, 2).split("\n");
    for (const line of jsonStr) {
      setJsonLines(l => [...l, line]);
      await sleep(38);
    }
    await sleep(500);

    await addCC("claude", "Plan written to .herd/plan.json — 4 tasks across 2 tiers. Tier 2 depends on Tier 1 completing.", 400);
    await addCC("claude", "You can review or edit the plan before dispatching. Press Ctrl+C to exit when ready.", 600);

    setShowProceed(true);
    await sleep(1600);
    onDone();
  }, [stage, addCC, onDone]);

  const jsonColor = (line) => {
    if (line.trim().startsWith('"tier"') || line.trim().startsWith('"feature"')) return g.blue;
    if (line.trim().startsWith('"id"')) return g.orange;
    if (line.trim().startsWith('"branch"')) return g.purple;
    if (line.includes('"T-')) return g.orange;
    if (line.includes('":')) return g.dim;
    return g.dim;
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
    }}>
      {/* terminal title bar */}
      <div style={{ background: "#1c2128", borderBottom: `1px solid ${g.border}`, padding: "9px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#ff5f56", "#ffbd2e", "#27c93f"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
        </div>
        <span style={{ flex: 1, textAlign: "center", color: g.dim, fontSize: 11 }}>
          {stage === "idle" ? "your-repo — zsh" : stage === "cc-open" || stage === "running" ? "Agent — your-repo" : "your-repo — zsh"}
        </span>
        {stage === "cc-open" && <span style={{ fontSize: 10, color: g.dim, fontFamily: "monospace" }}>agent</span>}
      </div>

      <div style={{ flex: 1, padding: "14px 16px", overflowY: "auto", fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.55 }}>

        {/* shell prompt + herd plan */}
        {stage !== "idle" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span style={{ color: g.prompt }}>❯</span>
            <span style={{ color: g.text }}>{cmdText}{stage === "running" && cmdText.length < 9 ? (cursor ? "█" : " ") : ""}</span>
          </div>
        )}

        {stage === "idle" && (
          <div style={{ display: "flex", gap: 8, color: g.dim }}>
            <span style={{ color: g.prompt }}>❯</span>
            <span>{cursor ? "█" : " "}</span>
          </div>
        )}

        {/* Claude Code UI */}
        {stage === "cc-open" && (
          <div style={{ border: `1px solid ${g.border}`, borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
            {/* CC header */}
            <div style={{ background: "#1c2128", borderBottom: `1px solid ${g.border}`, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={g.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
              <span style={{ color: g.text, fontSize: 11, fontWeight: 600 }}>Agent</span>
              <span style={{ color: g.dim, fontSize: 10, marginLeft: "auto" }}>your-repo</span>
            </div>

            {/* conversation */}
            <div ref={scrollRef} style={{ padding: "10px 12px", maxHeight: 240, overflowY: "auto" }}>
              {/* typing indicator before first message */}
              {ccLines.length === 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ color: g.prompt, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>you</div>
                  <div style={{ color: g.text, fontSize: 12, lineHeight: 1.6 }}>{userInput}{cursor ? "█" : " "}</div>
                </div>
              )}

              {ccLines.map((line, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ color: line.role === "claude" ? g.purple : g.prompt, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>
                    {line.role === "claude" ? "agent" : "you"}
                  </div>
                  <div style={{ color: g.text, fontSize: 12, lineHeight: 1.6 }}>
                    {line.text}{i === ccLines.length - 1 && line.role === "claude" && cursor ? "█" : ""}
                  </div>
                </div>
              ))}

              {/* user typing mid-flow */}
              {userInput && ccLines.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ color: g.prompt, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>you</div>
                  <div style={{ color: g.text, fontSize: 12, lineHeight: 1.6 }}>{userInput}{cursor ? "█" : ""}</div>
                </div>
              )}

              {/* JSON output */}
              {showJson && (
                <div style={{ marginTop: 8, marginBottom: 10 }}>
                  <div style={{ color: g.dim, fontSize: 10, marginBottom: 4 }}>writing .herd/plan.json</div>
                  <div style={{ background: "#0d1117", borderRadius: 4, padding: "8px 10px", border: `1px solid ${g.border}`, maxHeight: 140, overflowY: "auto" }}>
                    {jsonLines.map((line, i) => (
                      <div key={i} style={{ color: jsonColor(line), fontSize: 11, lineHeight: 1.5 }}>{line}</div>
                    ))}
                  </div>
                </div>
              )}

              {showProceed && (
                <div style={{ marginTop: 8, padding: "8px 10px", background: g.orangeBg, border: `1px solid rgba(227,179,65,0.3)`, borderRadius: 4, animation: "herd-fade 0.3s ease" }}>
                  <div style={{ color: g.orange, fontSize: 11, fontWeight: 600, marginBottom: 2 }}>herd — proceed with plan?</div>
                  <div style={{ color: g.dim, fontSize: 11 }}>4 tasks · 2 tiers · dispatching workers now</div>
                  <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                    <span style={{ color: g.green, fontSize: 11, fontWeight: 600 }}>▶ yes, dispatch</span>
                    <span style={{ color: g.dim, fontSize: 11 }}>/ n abort</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── PHASE 2 — GitHub ──────────────────────────────────────────────────────────
const ISSUES = [
  { id: 1, num: 42, tier: 1, title: "Add CSS variable tokens for theme switching" },
  { id: 2, num: 43, tier: 1, title: "Implement ThemeProvider component" },
  { id: 3, num: 44, tier: 2, title: "Add toggle button + localStorage persistence" },
  { id: 4, num: 45, tier: 2, title: "Update Storybook stories for dark mode" },
];

function GitHubPhase({ onReplay, autoStart }) {
  const [tab, setTab] = useState("issues");
  const [issueStates, setIssueStates] = useState({});
  const [visibleIds, setVisibleIds] = useState(new Set());
  const [runs, setRuns] = useState([]);
  const [pr, setPr] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!autoStart) return;
    let cancelled = false;
    const go = async () => {
      setStarted(true);
      await sleep(300);
      for (const issue of ISSUES) {
        if (cancelled) return;
        setVisibleIds(s => new Set([...s, issue.id]));
        setIssueStates(s => ({ ...s, [issue.id]: "open" }));
        await sleep(200);
      }
      await sleep(600);
      if (cancelled) return;
      setIssueStates(s => ({ ...s, 1: "in-progress", 2: "in-progress" }));
      await sleep(800);
      setTab("actions");
      await sleep(450);
      setRuns([{ id: "r1", title: "herd-worker", sub: "T-1 · herd/t1-css-tokens", status: "running" }]);
      await sleep(250);
      setRuns(r => [...r, { id: "r2", title: "herd-worker", sub: "T-2 · herd/t2-theme-provider", status: "running" }]);
      await sleep(2400);
      if (cancelled) return;
      setRuns(r => r.map(x => x.id === "r1" ? { ...x, status: "success", dur: "1m 23s" } : x));
      await sleep(350);
      setRuns(r => r.map(x => x.id === "r2" ? { ...x, status: "success", dur: "1m 31s" } : x));
      await sleep(600);
      setTab("issues");
      await sleep(400);
      setIssueStates(s => ({ ...s, 1: "closed" }));
      await sleep(300);
      setIssueStates(s => ({ ...s, 2: "closed" }));
      await sleep(500);
      if (cancelled) return;
      setIssueStates(s => ({ ...s, 3: "in-progress", 4: "in-progress" }));
      await sleep(800);
      setTab("actions");
      await sleep(400);
      setRuns(r => [...r, { id: "r3", title: "herd-worker", sub: "T-3 · herd/t3-toggle", status: "running" }]);
      await sleep(250);
      setRuns(r => [...r, { id: "r4", title: "herd-worker", sub: "T-4 · herd/t4-storybook", status: "running" }]);
      await sleep(2200);
      if (cancelled) return;
      setRuns(r => r.map(x => x.id === "r3" ? { ...x, status: "success", dur: "58s" } : x));
      await sleep(320);
      setRuns(r => r.map(x => x.id === "r4" ? { ...x, status: "success", dur: "1m 12s" } : x));
      await sleep(350);
      setRuns(r => [...r, { id: "r5", title: "herd-integrator", sub: "consolidate · review", status: "running", special: true }]);
      await sleep(1700);
      if (cancelled) return;
      setRuns(r => r.map(x => x.id === "r5" ? { ...x, status: "success", dur: "34s" } : x));
      await sleep(450);
      setTab("issues");
      await sleep(350);
      setIssueStates(s => ({ ...s, 3: "closed" }));
      await sleep(300);
      setIssueStates(s => ({ ...s, 4: "closed" }));
      await sleep(600);
      setTab("prs");
      await sleep(600);
      setPr(true);
      await sleep(1200);
      setReviewed(true);
      await sleep(600);
      setDone(true);
    };
    go();
    return () => { cancelled = true; };
  }, [autoStart]);

  const closedCount = Object.values(issueStates).filter(s => s === "closed").length;
  const runningCount = runs.filter(r => r.status === "running").length;

  const tabBtn = (id, label, badge) => (
    <button onClick={() => setTab(id)} style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "7px 14px", cursor: "pointer", fontSize: 12,
      color: tab === id ? g.text : g.dim,
      background: "none", border: "none",
      borderBottom: tab === id ? `2px solid ${g.prompt}` : "2px solid transparent",
      fontFamily: "inherit", whiteSpace: "nowrap",
    }}>{label}{badge}</button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* repo header */}
      <div style={{ background: g.surface, borderBottom: `1px solid ${g.border}`, padding: "9px 14px", display: "flex", alignItems: "center", gap: 7 }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill={g.dim}><path fillRule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z" /></svg>
        <span style={{ color: g.blue, fontSize: 12 }}>your-repo</span>
        <span style={{ color: g.dim, fontSize: 12 }}>/</span>
        <span style={{ color: g.blue, fontSize: 12, fontWeight: 600 }}>dark-mode-batch-1</span>
        <Label bg={g.orangeBg} color={g.orange} border="rgba(227,179,65,0.3)">milestone</Label>
      </div>

      {/* milestone bar */}
      {started && (
        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${g.border}`, background: g.surface }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: g.text, fontSize: 11, fontWeight: 500 }}>dark-mode-batch-1</span>
            <span style={{ color: g.dim, fontSize: 11 }}>{closedCount}/{ISSUES.length}</span>
          </div>
          <div style={{ height: 6, background: g.border, borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.round((closedCount / ISSUES.length) * 100)}%`,
              background: closedCount === ISSUES.length ? g.green : g.blue,
              borderRadius: 4, transition: "width 0.4s ease, background 0.4s ease",
            }} />
          </div>
        </div>
      )}

      {/* tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${g.border}`, padding: "0 14px", background: g.bg, overflowX: "auto" }}>
        {tabBtn("issues", "Issues", <CountBadge n={ISSUES.length - closedCount} active={tab === "issues"} />)}
        {tabBtn("actions", "Actions", <CountBadge n={runningCount} active={tab === "actions"} />)}
        {tabBtn("prs", "Pull requests", <CountBadge n={pr ? 1 : 0} active={tab === "prs"} />)}
      </div>

      {/* tab content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "issues" && (
          <div>
            {ISSUES.map(issue => {
              if (!visibleIds.has(issue.id)) return null;
              const state = issueStates[issue.id] || "open";
              return (
                <div key={issue.id} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 14px", borderBottom: `1px solid ${g.border}`,
                  opacity: state === "closed" ? 0.6 : 1, transition: "opacity 0.4s",
                  animation: "herd-fade 0.3s ease",
                }}>
                  <div style={{ paddingTop: 1 }}><IssueIcon status={state} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: g.text, fontSize: 12, fontWeight: 500 }}>{issue.title}</div>
                    <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                      <span style={{ color: g.dim, fontSize: 11 }}>#{issue.num}</span>
                      <Label bg={issue.tier === 1 ? "rgba(0,117,202,0.15)" : "rgba(228,230,105,0.1)"} color={issue.tier === 1 ? "#79c0ff" : "#e4e669"} border={issue.tier === 1 ? "rgba(0,117,202,0.35)" : "rgba(228,230,105,0.25)"}>tier:{issue.tier}</Label>
                      {state === "in-progress" && <Label bg={g.orangeBg} color={g.orange} border="rgba(227,179,65,0.3)">herd:in-progress</Label>}
                      {state === "closed" && <Label bg={g.purpleBg} color={g.purple} border="rgba(163,113,247,0.3)">herd:completed</Label>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "actions" && (
          <div>
            {runs.length === 0
              ? <div style={{ padding: "40px 14px", textAlign: "center", color: g.dim, fontSize: 12 }}>Waiting for workers...</div>
              : [...runs].reverse().map(run => (
                <div key={run.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${g.border}`, animation: "herd-fade 0.3s ease" }}>
                  {run.status === "running" ? <Spinner /> : (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill={g.green} style={{ flexShrink: 0 }}>
                      <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z" />
                    </svg>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: run.special ? g.blue : g.text, fontSize: 12, fontWeight: 500 }}>{run.title}</div>
                    <div style={{ color: g.dim, fontSize: 11, marginTop: 1 }}>{run.sub}</div>
                  </div>
                  <span style={{ color: run.status === "running" ? g.orange : g.dim, fontSize: 11 }}>
                    {run.status === "running" ? "running" : run.dur}
                  </span>
                </div>
              ))
            }
          </div>
        )}

        {tab === "prs" && (
          <div style={{ padding: "12px 14px" }}>
            {!pr
              ? <div style={{ textAlign: "center", color: g.dim, fontSize: 12, padding: "40px 0" }}>Waiting for batch to complete...</div>
              : (
                <div style={{ animation: "herd-fade 0.4s ease" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill={g.green} style={{ flexShrink: 0, marginTop: 2 }}>
                      <path fillRule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z" />
                    </svg>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <span style={{ color: g.text, fontWeight: 500, fontSize: 12 }}>feat: Add dark mode support</span>
                        {reviewed && <Label bg={g.greenBg} color={g.green} border="rgba(63,185,80,0.3)">reviewed</Label>}
                      </div>
                      <div style={{ color: g.dim, fontSize: 11, marginTop: 2 }}>#142 · herd/dark-mode-batch-1 → main · 4 tasks · 11 files · +430 −12</div>
                      {reviewed && (
                        <div style={{ marginTop: 10, background: g.surface, border: `1px solid ${g.border}`, borderRadius: 6, padding: "9px 11px", animation: "herd-fade 0.4s ease" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: g.blueBg, border: `1px solid rgba(88,166,255,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: g.blue, fontWeight: 600, flexShrink: 0 }}>H</div>
                            <div>
                              <div style={{ fontSize: 11, marginBottom: 3 }}>
                                <span style={{ color: g.text, fontWeight: 500 }}>herd-reviewer</span>
                                <span style={{ color: g.dim }}> reviewed just now</span>
                              </div>
                              <div style={{ color: g.dim, fontSize: 11, lineHeight: 1.55 }}>
                                All 4 tasks landed cleanly. CSS tokens scoped correctly, ThemeProvider uses context, toggle persists to localStorage, Storybook covers both modes. No issues found. <span style={{ color: g.green, fontWeight: 500 }}>Ready to merge.</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            }
          </div>
        )}
      </div>

      {/* footer */}
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${g.border}`, background: g.surface, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: g.dim, fontSize: 11 }}>
          {done ? "PR #142 is ready. Your turn." : "Workers running..."}
        </span>
        {done && (
          <button onClick={onReplay} style={{ background: "transparent", color: g.text, border: `1px solid ${g.mutedBorder}`, borderRadius: 6, padding: "4px 14px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
            Replay
          </button>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function HerdDemo() {
  const [activeTab, setActiveTab] = useState("terminal");
  const [termKey, setTermKey] = useState(0);
  const [ghKey, setGhKey] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [githubStarted, setGithubStarted] = useState(false);

  const goToGitHub = useCallback(() => {
    setGithubStarted(true);
    setActiveTab("github");
  }, []);

  const replay = useCallback(() => {
    setTermKey(k => k + 1);
    setGhKey(k => k + 1);
    setGithubStarted(false);
    setPlaying(true);
    setActiveTab("terminal");
  }, []);

  const start = useCallback(() => setPlaying(true), []);

  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === "github" && playing && !githubStarted) {
      setGithubStarted(true);
    }
  }, [playing, githubStarted]);

  const TerminalIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );

  const GitHubIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );

  return (
    <div style={{
      position: "relative",
      background: g.bg,
      borderRadius: 8,
      border: `1px solid ${g.border}`,
      overflow: "hidden",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      width: 680,
      maxWidth: "100%",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* app tab bar */}
      <div style={{
        display: "flex", alignItems: "center",
        borderBottom: `1px solid ${g.border}`,
        background: "#010409",
        padding: "0 4px",
        flexShrink: 0,
      }}>
        {[
          { id: "terminal", label: "Terminal", Icon: TerminalIcon },
          { id: "github",   label: "GitHub",   Icon: GitHubIcon },
        ].map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => switchTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px",
                background: active ? g.surface : "transparent",
                color: active ? g.text : g.dim,
                border: "none",
                borderRight: `1px solid ${active ? g.border : "transparent"}`,
                borderLeft: `1px solid ${active ? g.border : "transparent"}`,
                borderBottom: active ? `1px solid ${g.surface}` : "none",
                marginBottom: active ? -1 : 0,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "inherit",
                fontWeight: active ? 500 : 400,
                transition: "color 0.15s",
              }}
            >
              <Icon />
              {label}
            </button>
          );
        })}
      </div>

      {/* both phases always mounted, toggled by display */}
      <div style={{ display: activeTab === "terminal" ? "flex" : "none", flexDirection: "column", height: 460 }}>
        <TerminalPhase key={termKey} onDone={goToGitHub} autoStart={playing} />
      </div>
      <div style={{ display: activeTab === "github" ? "flex" : "none", flexDirection: "column", height: 460 }}>
        <GitHubPhase key={ghKey} onReplay={replay} autoStart={githubStarted} />
      </div>

      {/* play overlay — only on terminal tab, before playing */}
      {!playing && activeTab === "terminal" && (
        <div
          onClick={start}
          style={{
            position: "absolute", inset: 0,
            background: "rgba(13,17,23,0.72)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 16, cursor: "pointer",
            backdropFilter: "blur(2px)",
            animation: "herd-fade 0.3s ease",
          }}
        >
          <div
            style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid #ee7926`, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s ease, background 0.15s ease" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(238,121,38,0.12)"; e.currentTarget.style.transform = "scale(1.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#ee7926" style={{ marginLeft: 3 }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: g.text, fontSize: 13, fontWeight: 500 }}>Watch how it works</div>
            <div style={{ color: g.dim, fontSize: 11, marginTop: 3 }}>herd plan → parallel agents → reviewed PR</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes herd-spin { to { transform: rotate(360deg); } }
        @keyframes herd-fade { from { opacity: 0; transform: translateY(-2px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
