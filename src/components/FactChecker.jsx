import { useState, useRef } from "react";

// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const VERDICT_CONFIG = {
  accurate:     { color: "rgba(111,207,151,.9)",  bg: "rgba(111,207,151,.10)", border: "rgba(111,207,151,.25)", icon: "✓", label: "Accurate" },
  inaccurate:   { color: "rgba(235,87,87,.9)",    bg: "rgba(235,87,87,.10)",   border: "rgba(235,87,87,.25)",   icon: "✕", label: "Inaccurate" },
  unverifiable: { color: "rgba(242,201,76,.9)",   bg: "rgba(242,201,76,.10)",  border: "rgba(242,201,76,.25)",  icon: "?", label: "Unverifiable" },
  misleading:   { color: "rgba(247,144,9,.9)",    bg: "rgba(247,144,9,.10)",   border: "rgba(247,144,9,.25)",   icon: "⚠", label: "Misleading" },
};

const FactChecker = ({ getScript }) => {
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);
  const [expanded, setExpanded] = useState({});
  const abortRef = useRef(null);

  const runCheck = async () => {
    const script = getScript?.()?.trim();
    if (!script) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setExpanded({});
    setOpen(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`${API_BASE_URL}/fact-check`, {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      const parsed = await res.json();
      if (parsed.error) throw new Error(parsed.error);
      setResult(parsed);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError("Fact check failed. Please try again.");
      console.error("[FactChecker]", err);
    } finally {
      setLoading(false);
    }
  };

  const close = () => { setOpen(false); setResult(null); setError(null); };
  const toggle = (i) => setExpanded(p => ({ ...p, [i]: !p[i] }));

  const counts = result?.claims?.reduce((acc, c) => {
    acc[c.verdict] = (acc[c.verdict] || 0) + 1;
    return acc;
  }, {}) ?? {};

  const score = result?.score ?? null;
  const scoreColor = score >= 80
    ? "rgba(111,207,151,.9)"
    : score >= 60
      ? "rgba(242,201,76,.9)"
      : "rgba(235,87,87,.9)";

  return (
    <>
      <style>{`
        @keyframes fcSlide { from { opacity:0; transform:translateY(8px) scale(.98) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes fcFade  { from { opacity:0 } to { opacity:1 } }
        .fc-claim-row { cursor:pointer; border-radius:.65rem; padding:9px 12px; transition:background .12s; border:1px solid transparent; }
        .fc-claim-row:hover { background:rgba(255,255,255,.04) !important; }
        .fc-tag { font-size:10px; font-family:'Inter',sans-serif; font-weight:600; letter-spacing:.5px; padding:2px 8px; border-radius:9999px; }
        .fc-btn-run { transition: opacity .15s, transform .12s; }
        .fc-btn-run:hover { opacity:.85 !important; }
        .fc-btn-run:active { transform:scale(.94) !important; }
      `}</style>

      {/* ── Trigger button ── */}
      <button
        className="fc-btn-run"
        onClick={runCheck}
        disabled={loading}
        title="Fact-check this script"
        style={{
          background: "none",
          border: "1px solid rgba(255,255,255,.07)",
          borderRadius: "9999px",
          color: loading ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.55)",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "11px",
          fontFamily: "'Inter',sans-serif",
          padding: "4px 12px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          whiteSpace: "nowrap",
        }}
      >
        {loading ? (
          <>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ animation: "spin .8s linear infinite", flexShrink: 0 }}>
              <circle cx="5" cy="5" r="3.5" stroke="rgba(255,255,255,.15)" strokeWidth="1.2"/>
              <path d="M5 1.5A3.5 3.5 0 0 1 8.5 5" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Checking…
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="5" cy="5" r="4" stroke="rgba(255,255,255,.5)" strokeWidth="1.2"/>
              <path d="M5 3v2.5l1.5 1.5" stroke="rgba(255,255,255,.5)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Fact Check
          </>
        )}
      </button>

      {/* ── Overlay — rendered in a portal-like fixed layer, centered on screen ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={close}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,.55)",
              zIndex: 9998,
              animation: "fcFade .15s ease",
            }}
          />

          {/* Panel — centered in viewport */}
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(540px, 92vw)",
            maxHeight: "72vh",
            background: "#0f0f0f",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: "1.1rem",
            boxShadow: "0 24px 64px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.04)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fcSlide .2s ease",
          }}>
            {/* Header */}
            <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "'Manrope',sans-serif", color: "rgba(255,255,255,.55)", letterSpacing: ".8px", textTransform: "uppercase" }}>
                  Fact Check
                </span>
                {score !== null && (
                  <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: "'Manrope',sans-serif", color: scoreColor }}>
                    {score}/100
                  </span>
                )}
                {Object.entries(counts).map(([v, n]) => {
                  const cfg = VERDICT_CONFIG[v];
                  return cfg ? (
                    <span key={v} className="fc-tag" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      {cfg.icon} {n}
                    </span>
                  ) : null;
                })}
              </div>
              <button
                onClick={close}
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 10px", borderRadius: "9999px" }}
              >
                ✕ Close
              </button>
            </div>

            {/* Body */}
            {loading ? (
              <div style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ animation: "spin .9s linear infinite" }}>
                  <circle cx="14" cy="14" r="11" stroke="rgba(255,255,255,.07)" strokeWidth="2"/>
                  <path d="M14 3A11 11 0 0 1 25 14" stroke="rgba(139,92,246,.85)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontFamily: "'Manrope',sans-serif", fontWeight: 600, color: "rgba(255,255,255,.7)" }}>Analysing claims…</div>
                  <div style={{ fontSize: "11px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.3)", marginTop: "4px" }}>Checking facts against known sources</div>
                </div>
              </div>
            ) : error ? (
              <div style={{ padding: "20px", fontSize: "13px", fontFamily: "'Inter',sans-serif", color: "rgba(235,87,87,.8)" }}>
                ⚠ {error}
              </div>
            ) : (
              <div style={{ overflowY: "auto", flex: 1, padding: "12px 12px 16px" }}>
                {result?.summary && (
                  <div style={{ fontSize: "12px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.38)", padding: "4px 6px 12px", lineHeight: 1.65, borderBottom: "1px solid rgba(255,255,255,.05)", marginBottom: "8px" }}>
                    {result.summary}
                  </div>
                )}

                {(result?.claims ?? []).map((claim, i) => {
                  const cfg = VERDICT_CONFIG[claim.verdict] ?? VERDICT_CONFIG.unverifiable;
                  const isExp = !!expanded[i];
                  return (
                    <div
                      key={i}
                      className="fc-claim-row"
                      onClick={() => toggle(i)}
                      style={{ marginBottom: "4px", borderColor: isExp ? "rgba(255,255,255,.07)" : "transparent", background: isExp ? "rgba(255,255,255,.03)" : "none" }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                        <span style={{ fontSize: "10px", marginTop: "2px", flexShrink: 0, width: "17px", height: "17px", borderRadius: "50%", background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, fontWeight: 700 }}>
                          {cfg.icon}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "12px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.78)", lineHeight: 1.55, fontStyle: "italic" }}>
                            "{claim.claim}"
                          </div>
                          {isExp && (
                            <div style={{ marginTop: "7px", paddingTop: "7px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
                              <div style={{ fontSize: "12px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.5)", lineHeight: 1.65 }}>
                                {claim.explanation}
                              </div>
                              {claim.source_hint && (
                                <div style={{ fontSize: "11px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.22)", marginTop: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <span>🔍</span> {claim.source_hint}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0, marginTop: "2px" }}>
                          <span style={{ fontSize: "10px", fontFamily: "'Manrope',sans-serif", fontWeight: 700, color: cfg.color }}>
                            {cfg.label}
                          </span>
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ transition: "transform .15s", transform: isExp ? "rotate(180deg)" : "rotate(0deg)" }}>
                            <path d="M1.5 2.5L4 5L6.5 2.5" stroke="rgba(255,255,255,.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {result?.claims?.length === 0 && (
                  <div style={{ fontSize: "12px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.3)", padding: "12px 6px", textAlign: "center" }}>
                    No verifiable factual claims found in this script.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default FactChecker;