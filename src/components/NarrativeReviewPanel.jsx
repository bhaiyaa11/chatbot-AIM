/**
 * NarrativeReviewPanel.jsx
 *
 * Human-in-the-loop Narrative Essence & Interpretation Review Stage.
 *
 * Renders after POST /creative-review returns.
 * The user inspects, edits, reorders, adds, deletes essences/interpretations/summary.
 * "Generate Script →" sends approved data to POST /generate-script.
 *
 * Props:
 *   reviewData     — { review_id, retrievals, essences, interpretations, creative_summary }
 *   onGenerate     — async (approvedPayload) => void   called on Generate click
 *   isGenerating   — bool
 *   metadata       — { client, business_unit, video_type, video_tone, duration }
 */

import { useState, useCallback, useEffect, useRef } from "react";

// ─── tiny uid helper ─────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

// ─── DragHandle SVG ──────────────────────────────────────────────────────────
const DragHandle = () => (
  <svg
    width="12" height="16" viewBox="0 0 12 16" fill="none"
    style={{ flexShrink: 0, cursor: "grab", opacity: 0.35 }}
  >
    {[2, 6, 10].map((x) =>
      [3, 8, 13].map((y) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="currentColor" />
      ))
    )}
  </svg>
);

// ─── inline edit tag ─────────────────────────────────────────────────────────
function EssenceTag({ value, onEdit, onDelete, onDragStart, onDragOver, onDrop, isDragOver }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onEdit(trimmed);
    else if (!trimmed) onDelete();
    else setDraft(value);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "5px 10px 5px 7px",
        borderRadius: "9999px",
        background: isDragOver
          ? "rgba(139,92,246,.22)"
          : "rgba(255,255,255,.05)",
        border: `1px solid ${isDragOver ? "rgba(139,92,246,.5)" : "rgba(255,255,255,.1)"}`,
        transition: "background .15s, border .15s",
        cursor: "default",
        userSelect: "none",
      }}
    >
      <DragHandle />
      {editing ? (
        <input
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") { setEditing(false); setDraft(value); }
          }}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "rgba(255,255,255,.9)",
            fontSize: "12px",
            fontFamily: "'DM Mono', monospace",
            minWidth: "80px",
            maxWidth: "200px",
          }}
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          title="Click to edit"
          style={{
            fontSize: "12px",
            fontFamily: "'DM Mono', monospace",
            color: "rgba(255,255,255,.85)",
            cursor: "text",
          }}
        >
          {value}
        </span>
      )}
      <button
        onClick={onDelete}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,.25)",
          cursor: "pointer",
          fontSize: "10px",
          lineHeight: 1,
          padding: "0 2px",
          marginLeft: "2px",
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── draggable interpretation block ──────────────────────────────────────────
function InterpretationBlock({ value, onEdit, onDelete, onDragStart, onDragOver, onDrop, isDragOver }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    const t = draft.trim();
    if (t && t !== value) onEdit(t);
    else if (!t) onDelete();
    else setDraft(value);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "10px",
        background: isDragOver ? "rgba(139,92,246,.1)" : "rgba(255,255,255,.03)",
        border: `1px solid ${isDragOver ? "rgba(139,92,246,.35)" : "rgba(255,255,255,.07)"}`,
        transition: "all .15s",
        marginBottom: "6px",
      }}
    >
      <div style={{ paddingTop: "3px" }}>
        <DragHandle />
      </div>
      <div style={{ flex: 1 }}>
        {editing ? (
          <textarea
            ref={ref}
            value={draft}
            rows={3}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setEditing(false); setDraft(value); }
            }}
            style={{
              width: "100%",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(139,92,246,.35)",
              borderRadius: "6px",
              color: "rgba(255,255,255,.85)",
              fontSize: "13px",
              fontFamily: "'Lora', Georgia, serif",
              lineHeight: 1.6,
              padding: "8px 10px",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        ) : (
          <p
            onClick={() => setEditing(true)}
            title="Click to edit"
            style={{
              margin: 0,
              fontSize: "13px",
              fontFamily: "'Lora', Georgia, serif",
              fontStyle: "italic",
              color: "rgba(255,255,255,.78)",
              lineHeight: 1.65,
              cursor: "text",
            }}
          >
            "{value}"
          </p>
        )}
      </div>
      <button
        onClick={onDelete}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,.2)",
          cursor: "pointer",
          fontSize: "11px",
          padding: "2px 4px",
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── step indicator ───────────────────────────────────────────────────────────
function StepDot({ n, active, done, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        border: `2px solid ${done ? "#6fcf97" : active ? "rgba(139,92,246,.9)" : "rgba(255,255,255,.12)"}`,
        background: done ? "rgba(111,207,151,.12)" : active ? "rgba(139,92,246,.15)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontFamily: "'DM Mono', monospace",
        color: done ? "#6fcf97" : active ? "rgba(200,160,255,.9)" : "rgba(255,255,255,.3)",
        transition: "all .3s",
        fontWeight: 700,
      }}>
        {done ? "✓" : n}
      </div>
      <span style={{
        fontSize: "9px",
        fontFamily: "'DM Mono', monospace",
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color: active ? "rgba(200,160,255,.8)" : done ? "rgba(111,207,151,.7)" : "rgba(255,255,255,.2)",
      }}>{label}</span>
    </div>
  );
}

// ─── section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, count, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <div>
        <div style={{
          fontSize: "11px",
          fontFamily: "'DM Mono', monospace",
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: accent || "rgba(255,255,255,.55)",
        }}>
          {title}
        </div>
        {count !== undefined && (
          <div style={{
            fontSize: "10px",
            fontFamily: "'DM Mono', monospace",
            color: "rgba(255,255,255,.25)",
            marginTop: "1px",
          }}>
            {count} {count === 1 ? "item" : "items"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function NarrativeReviewPanel({
  reviewData,
  onGenerate,
  isGenerating = false,
  metadata = {},
}) {
  const {
    review_id = "",
    retrievals: initRetrievals = [],
    essences: initEssences = [],
    interpretations: initInterps = [],
    creative_summary: initSummary = "",
  } = reviewData || {};

  // ── state ─────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);   // 0=essences 1=interps 2=summary 3=confirm

  // Essences
  const [essences, setEssences] = useState(() =>
    initEssences.map((v) => ({ id: uid(), value: v }))
  );
  const [newEssence, setNewEssence] = useState("");
  const [addingEssence, setAddingEssence] = useState(false);
  const addEssenceRef = useRef(null);

  // Interpretations
  const [interps, setInterps] = useState(() =>
    initInterps.map((v) => ({ id: uid(), value: v }))
  );
  const [newInterp, setNewInterp] = useState("");
  const [addingInterp, setAddingInterp] = useState(false);
  const addInterpRef = useRef(null);

  // Summary
  const [summary, setSummary] = useState(initSummary);

  // Undo stacks (per section)
  const undoEssences = useRef([]);
  const undoInterps  = useRef([]);
  const undoSummary  = useRef([]);

  // Drag state
  const dragIdx = useRef(null);
  const [dragOverEssence, setDragOverEssence] = useState(null);
  const [dragOverInterp,  setDragOverInterp]  = useState(null);

  // Autosave indicator
  const [saved, setSaved] = useState(false);
  const autosaveTimer = useRef(null);

  // ── focus on add refs ─────────────────────────────────────────────────────
  useEffect(() => { if (addingEssence) addEssenceRef.current?.focus(); }, [addingEssence]);
  useEffect(() => { if (addingInterp)  addInterpRef.current?.focus();  }, [addingInterp]);

  // ── autosave to sessionStorage ────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      try {
        sessionStorage.setItem(`review_${review_id}`, JSON.stringify({
          essences: essences.map((e) => e.value),
          interps:  interps.map((i) => i.value),
          summary,
        }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {}
    }, 1200);
  }, [essences, interps, summary, review_id]);

  // ── undo helpers ──────────────────────────────────────────────────────────
  const pushUndoEssence = () =>
    undoEssences.current.push(essences.map((e) => ({ ...e })));
  const pushUndoInterp  = () =>
    undoInterps.current.push(interps.map((i) => ({ ...i })));
  const pushUndoSummary = () =>
    undoSummary.current.push(summary);

  const undoE = () => {
    const prev = undoEssences.current.pop();
    if (prev) setEssences(prev);
  };
  const undoI = () => {
    const prev = undoInterps.current.pop();
    if (prev) setInterps(prev);
  };
  const undoS = () => {
    const prev = undoSummary.current.pop();
    if (prev !== undefined) setSummary(prev);
  };

  // ── essence mutations ─────────────────────────────────────────────────────
  const editEssence   = (id, v) => { pushUndoEssence(); setEssences((p) => p.map((e) => e.id === id ? { ...e, value: v } : e)); };
  const deleteEssence = (id)    => { pushUndoEssence(); setEssences((p) => p.filter((e) => e.id !== id)); };
  const addEssence    = ()      => {
    const t = newEssence.trim();
    if (!t) return;
    pushUndoEssence();
    setEssences((p) => [...p, { id: uid(), value: t }]);
    setNewEssence(""); setAddingEssence(false);
  };

  // ── interpretation mutations ──────────────────────────────────────────────
  const editInterp   = (id, v) => { pushUndoInterp(); setInterps((p) => p.map((i) => i.id === id ? { ...i, value: v } : i)); };
  const deleteInterp = (id)    => { pushUndoInterp(); setInterps((p) => p.filter((i) => i.id !== id)); };
  const addInterp    = ()      => {
    const t = newInterp.trim();
    if (!t) return;
    pushUndoInterp();
    setInterps((p) => [...p, { id: uid(), value: t }]);
    setNewInterp(""); setAddingInterp(false);
  };

  // ── drag-reorder ──────────────────────────────────────────────────────────
  const reorder = (list, fromIdx, toIdx) => {
    const next = [...list];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    return next;
  };

  const onEssenceDrop = (toIdx) => {
    if (dragIdx.current === null || dragIdx.current === toIdx) return;
    pushUndoEssence();
    setEssences((p) => reorder(p, dragIdx.current, toIdx));
    setDragOverEssence(null);
    dragIdx.current = null;
  };

  const onInterpDrop = (toIdx) => {
    if (dragIdx.current === null || dragIdx.current === toIdx) return;
    pushUndoInterp();
    setInterps((p) => reorder(p, dragIdx.current, toIdx));
    setDragOverInterp(null);
    dragIdx.current = null;
  };

  // ── generate handler ──────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    if (isGenerating) return;
    onGenerate?.({
      review_id,
      approved_retrievals:      initRetrievals,
      approved_essences:        essences.map((e) => e.value),
      approved_interpretations: interps.map((i) => i.value),
      approved_creative_summary: summary,
    });
  }, [review_id, initRetrievals, essences, interps, summary, onGenerate, isGenerating]);

  // ── validation ────────────────────────────────────────────────────────────
  const isValid =
    essences.length >= 2 &&
    interps.length >= 1 &&
    summary.trim().length >= 10;

  // ── shared panel style ────────────────────────────────────────────────────
  const panelStyle = {
    background: "rgba(10,10,14,.98)",
    border: "1px solid rgba(255,255,255,.07)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "14px",
  };

  const undoBtnStyle = {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,.25)",
    cursor: "pointer",
    fontSize: "11px",
    fontFamily: "'DM Mono', monospace",
    padding: "3px 8px",
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;0,700;1,400&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap');

        @keyframes nrp-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nrp-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: .4; }
        }
        @keyframes nrp-spin { to { transform: rotate(360deg); } }

        .nrp-root {
          animation: nrp-in .25s ease;
          font-family: 'DM Mono', monospace;
        }

        .nrp-tab-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 7px 14px;
          border-radius: 9999px;
          transition: all .15s;
        }
        .nrp-tab-btn:hover {
          background: rgba(255,255,255,.06);
        }
        .nrp-tab-btn.active {
          background: rgba(139,92,246,.15);
          color: rgba(200,160,255,.9) !important;
          border: 1px solid rgba(139,92,246,.35);
        }

        .nrp-add-input:focus {
          border-color: rgba(139,92,246,.5) !important;
          outline: none;
        }

        .nrp-generate-btn {
          position: relative;
          overflow: hidden;
          transition: all .2s;
        }
        .nrp-generate-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(139,92,246,.3), rgba(168,85,247,.2));
          opacity: 0;
          transition: opacity .2s;
        }
        .nrp-generate-btn:hover::before { opacity: 1; }
        .nrp-generate-btn:active { transform: scale(.97); }
      `}</style>

      <div className="nrp-root" style={{ maxWidth: "760px", width: "100%" }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "18px",
          flexWrap: "wrap",
          gap: "10px",
        }}>
          <div>
            <div style={{
              fontSize: "10px",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(139,92,246,.8)",
              marginBottom: "4px",
            }}>
              ◈ Creative Review
            </div>
            <h3 style={{
              margin: 0,
              fontSize: "15px",
              fontFamily: "'DM Mono', monospace",
              fontWeight: 700,
              color: "rgba(255,255,255,.88)",
            }}>
              Narrative Essence & Interpretation
            </h3>
            <p style={{
              margin: "4px 0 0",
              fontSize: "12px",
              fontFamily: "'DM Mono', monospace",
              color: "rgba(255,255,255,.3)",
            }}>
              Review and refine the creative DNA before generating your script.
            </p>
          </div>

          {/* Autosave indicator */}
          <div style={{
            fontSize: "10px",
            fontFamily: "'DM Mono', monospace",
            color: saved ? "rgba(111,207,151,.7)" : "rgba(255,255,255,.15)",
            transition: "color .3s",
            paddingTop: "4px",
          }}>
            {saved ? "● saved" : "○ autosave on"}
          </div>
        </div>

        {/* ── Step tabs ────────────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}>
          {[
            [0, "Essences"],
            [1, "Interpretations"],
            [2, "Direction"],
            [3, "Confirm"],
          ].map(([s, label]) => (
            <button
              key={s}
              className={`nrp-tab-btn ${step === s ? "active" : ""}`}
              style={{
                color: step === s
                  ? "rgba(200,160,255,.9)"
                  : s < step
                    ? "rgba(111,207,151,.7)"
                    : "rgba(255,255,255,.3)",
              }}
              onClick={() => setStep(s)}
            >
              {s < step ? "✓ " : `${s + 1}. `}{label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* STEP 0 — NARRATIVE ESSENCES                                 */}
        {/* ════════════════════════════════════════════════════════════ */}
        {step === 0 && (
          <div style={panelStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <SectionHeader
                icon="✦"
                title="Narrative Essences"
                count={essences.length}
                accent="rgba(168,85,247,.8)"
              />
              <button
                style={undoBtnStyle}
                onClick={undoE}
                disabled={!undoEssences.current.length}
              >
                ↩ undo
              </button>
            </div>

            <p style={{
              fontSize: "11px",
              fontFamily: "'DM Mono', monospace",
              color: "rgba(255,255,255,.28)",
              marginBottom: "14px",
              lineHeight: 1.6,
            }}>
              These are the abstract creative concepts extracted from your source material.
              Edit, delete, reorder, or add new ones. They become the emotional DNA of your script.
            </p>

            {/* Essence tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "12px" }}>
              {essences.map((e, i) => (
                <EssenceTag
                  key={e.id}
                  value={e.value}
                  onEdit={(v) => editEssence(e.id, v)}
                  onDelete={() => deleteEssence(e.id)}
                  onDragStart={() => { dragIdx.current = i; }}
                  onDragOver={() => setDragOverEssence(i)}
                  onDrop={() => onEssenceDrop(i)}
                  isDragOver={dragOverEssence === i}
                />
              ))}
            </div>

            {/* Add essence */}
            {addingEssence ? (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  ref={addEssenceRef}
                  className="nrp-add-input"
                  value={newEssence}
                  onChange={(e) => setNewEssence(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addEssence();
                    if (e.key === "Escape") { setAddingEssence(false); setNewEssence(""); }
                  }}
                  onBlur={addEssence}
                  placeholder="e.g. Urban isolation…"
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.15)",
                    borderRadius: "9999px",
                    color: "rgba(255,255,255,.85)",
                    fontSize: "12px",
                    fontFamily: "'DM Mono', monospace",
                    padding: "6px 14px",
                    outline: "none",
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setAddingEssence(true)}
                style={{
                  background: "none",
                  border: "1px dashed rgba(139,92,246,.3)",
                  borderRadius: "9999px",
                  color: "rgba(139,92,246,.6)",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontFamily: "'DM Mono', monospace",
                  padding: "5px 14px",
                }}
              >
                + Add essence
              </button>
            )}

            {/* Validation warning */}
            {essences.length < 2 && (
              <p style={{
                fontSize: "10px",
                fontFamily: "'DM Mono', monospace",
                color: "rgba(255,150,50,.7)",
                marginTop: "10px",
              }}>
                ⚠ At least 2 essences required
              </p>
            )}

            {/* Next */}
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setStep(1)}
                disabled={essences.length < 2}
                style={{
                  background: "rgba(139,92,246,.18)",
                  border: "1px solid rgba(139,92,246,.4)",
                  borderRadius: "9999px",
                  color: "rgba(200,160,255,.9)",
                  cursor: essences.length < 2 ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontFamily: "'DM Mono', monospace",
                  padding: "7px 20px",
                  opacity: essences.length < 2 ? .4 : 1,
                }}
              >
                Next → Interpretations
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* STEP 1 — NARRATIVE INTERPRETATIONS                          */}
        {/* ════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div style={panelStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <SectionHeader
                icon="◎"
                title="Narrative Interpretations"
                count={interps.length}
                accent="rgba(111,207,151,.7)"
              />
              <button style={undoBtnStyle} onClick={undoI} disabled={!undoInterps.current.length}>
                ↩ undo
              </button>
            </div>

            <p style={{
              fontSize: "11px",
              fontFamily: "'DM Mono', monospace",
              color: "rgba(255,255,255,.28)",
              marginBottom: "14px",
              lineHeight: 1.6,
            }}>
              These observations translate essences into narrative language.
              They become the emotional texture the scriptwriter draws from.
            </p>

            {/* Interpretation blocks */}
            <div>
              {interps.map((item, i) => (
                <InterpretationBlock
                  key={item.id}
                  value={item.value}
                  onEdit={(v) => editInterp(item.id, v)}
                  onDelete={() => deleteInterp(item.id)}
                  onDragStart={() => { dragIdx.current = i; }}
                  onDragOver={() => setDragOverInterp(i)}
                  onDrop={() => onInterpDrop(i)}
                  isDragOver={dragOverInterp === i}
                />
              ))}
            </div>

            {/* Add interpretation */}
            {addingInterp ? (
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                <textarea
                  ref={addInterpRef}
                  value={newInterp}
                  onChange={(e) => setNewInterp(e.target.value)}
                  onBlur={addInterp}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setAddingInterp(false); setNewInterp(""); }
                  }}
                  placeholder="e.g. Connection felt increasingly rare."
                  rows={2}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(111,207,151,.3)",
                    borderRadius: "10px",
                    color: "rgba(255,255,255,.85)",
                    fontSize: "13px",
                    fontFamily: "'Lora', Georgia, serif",
                    fontStyle: "italic",
                    lineHeight: 1.6,
                    padding: "8px 12px",
                    resize: "vertical",
                    outline: "none",
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setAddingInterp(true)}
                style={{
                  background: "none",
                  border: "1px dashed rgba(111,207,151,.25)",
                  borderRadius: "10px",
                  color: "rgba(111,207,151,.5)",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontFamily: "'DM Mono', monospace",
                  padding: "8px 14px",
                  width: "100%",
                  marginTop: "6px",
                  textAlign: "left",
                }}
              >
                + Add interpretation
              </button>
            )}

            {interps.length < 1 && (
              <p style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", color: "rgba(255,150,50,.7)", marginTop: "10px" }}>
                ⚠ At least 1 interpretation required
              </p>
            )}

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(0)} style={{ ...undoBtnStyle, color: "rgba(255,255,255,.35)" }}>
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={interps.length < 1}
                style={{
                  background: "rgba(111,207,151,.12)",
                  border: "1px solid rgba(111,207,151,.35)",
                  borderRadius: "9999px",
                  color: "rgba(111,207,151,.9)",
                  cursor: interps.length < 1 ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontFamily: "'DM Mono', monospace",
                  padding: "7px 20px",
                  opacity: interps.length < 1 ? .4 : 1,
                }}
              >
                Next → Creative Direction
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* STEP 2 — CREATIVE DIRECTION SUMMARY                         */}
        {/* ════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div style={panelStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <SectionHeader icon="◇" title="Creative Direction" accent="rgba(250,200,80,.7)" />
              <button style={undoBtnStyle} onClick={undoS} disabled={!undoSummary.current.length}>
                ↩ undo
              </button>
            </div>

            <p style={{
              fontSize: "11px",
              fontFamily: "'DM Mono', monospace",
              color: "rgba(255,255,255,.28)",
              marginBottom: "14px",
              lineHeight: 1.6,
            }}>
              This is the creative director's brief that guides script generation.
              Edit to refine the overall direction, tone, and emotional journey.
            </p>

            <textarea
              value={summary}
              onChange={(e) => { pushUndoSummary(); setSummary(e.target.value); }}
              rows={7}
              placeholder="Describe the emotional journey, narrative tone, and what makes this script unique…"
              style={{
                width: "100%",
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(250,200,80,.2)",
                borderRadius: "12px",
                color: "rgba(255,255,255,.82)",
                fontSize: "13.5px",
                fontFamily: "'Lora', Georgia, serif",
                lineHeight: 1.75,
                padding: "14px 16px",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "8px",
            }}>
              <span style={{
                fontSize: "10px",
                fontFamily: "'DM Mono', monospace",
                color: "rgba(255,255,255,.2)",
              }}>
                {summary.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              {summary.trim().length < 10 && (
                <span style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", color: "rgba(255,150,50,.7)" }}>
                  ⚠ Too short
                </span>
              )}
            </div>

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(1)} style={{ ...undoBtnStyle, color: "rgba(255,255,255,.35)" }}>
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={summary.trim().length < 10}
                style={{
                  background: "rgba(250,200,80,.1)",
                  border: "1px solid rgba(250,200,80,.3)",
                  borderRadius: "9999px",
                  color: "rgba(250,200,80,.9)",
                  cursor: summary.trim().length < 10 ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontFamily: "'DM Mono', monospace",
                  padding: "7px 20px",
                  opacity: summary.trim().length < 10 ? .4 : 1,
                }}
              >
                Next → Confirm
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* STEP 3 — CONFIRM + GENERATE                                 */}
        {/* ════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div style={panelStyle}>
            <SectionHeader icon="◈" title="Confirm & Generate" accent="rgba(139,92,246,.8)" />

            {/* Summary card */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "16px",
            }}>
              {/* Essences summary */}
              <div style={{
                background: "rgba(139,92,246,.07)",
                border: "1px solid rgba(139,92,246,.18)",
                borderRadius: "12px",
                padding: "12px 14px",
              }}>
                <div style={{
                  fontSize: "9px",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "rgba(168,85,247,.7)",
                  marginBottom: "8px",
                }}>
                  {essences.length} Essences
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {essences.slice(0, 8).map((e) => (
                    <span key={e.id} style={{
                      fontSize: "10px",
                      fontFamily: "'DM Mono', monospace",
                      background: "rgba(139,92,246,.12)",
                      borderRadius: "9999px",
                      padding: "2px 8px",
                      color: "rgba(200,160,255,.8)",
                    }}>
                      {e.value}
                    </span>
                  ))}
                  {essences.length > 8 && (
                    <span style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,.3)" }}>
                      +{essences.length - 8} more
                    </span>
                  )}
                </div>
              </div>

              {/* Interpretations summary */}
              <div style={{
                background: "rgba(111,207,151,.05)",
                border: "1px solid rgba(111,207,151,.15)",
                borderRadius: "12px",
                padding: "12px 14px",
              }}>
                <div style={{
                  fontSize: "9px",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "rgba(111,207,151,.6)",
                  marginBottom: "8px",
                }}>
                  {interps.length} Interpretations
                </div>
                <div style={{
                  fontSize: "11px",
                  fontFamily: "'Lora', Georgia, serif",
                  fontStyle: "italic",
                  color: "rgba(255,255,255,.5)",
                  lineHeight: 1.55,
                }}>
                  {interps[0]?.value.slice(0, 120)}
                  {interps[0]?.value.length > 120 ? "…" : ""}
                </div>
              </div>
            </div>

            {/* Creative summary */}
            <div style={{
              background: "rgba(250,200,80,.04)",
              border: "1px solid rgba(250,200,80,.12)",
              borderRadius: "12px",
              padding: "12px 14px",
              marginBottom: "20px",
            }}>
              <div style={{
                fontSize: "9px",
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "rgba(250,200,80,.5)",
                marginBottom: "6px",
              }}>
                Creative Direction
              </div>
              <p style={{
                margin: 0,
                fontSize: "12.5px",
                fontFamily: "'Lora', Georgia, serif",
                color: "rgba(255,255,255,.65)",
                lineHeight: 1.65,
              }}>
                {summary}
              </p>
            </div>

            {/* Edit & generate row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between" }}>
              <button onClick={() => setStep(0)} style={{ ...undoBtnStyle, color: "rgba(255,255,255,.35)", fontSize: "11px" }}>
                ← Edit
              </button>

              <button
                className="nrp-generate-btn"
                onClick={handleGenerate}
                disabled={!isValid || isGenerating}
                style={{
                  background: isValid
                    ? "linear-gradient(135deg, rgba(139,92,246,.35), rgba(168,85,247,.25))"
                    : "rgba(255,255,255,.04)",
                  border: `1px solid ${isValid ? "rgba(139,92,246,.6)" : "rgba(255,255,255,.08)"}`,
                  borderRadius: "9999px",
                  color: isValid ? "rgba(220,190,255,.95)" : "rgba(255,255,255,.2)",
                  cursor: !isValid || isGenerating ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700,
                  padding: "10px 28px",
                  letterSpacing: ".05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: !isValid ? .5 : 1,
                }}
              >
                {isGenerating ? (
                  <>
                    <span style={{
                      width: "13px",
                      height: "13px",
                      border: "1.5px solid rgba(200,160,255,.2)",
                      borderTopColor: "rgba(200,160,255,.9)",
                      borderRadius: "50%",
                      animation: "nrp-spin .7s linear infinite",
                      display: "inline-block",
                    }} />
                    Generating Script…
                  </>
                ) : (
                  "✦ Generate Script →"
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}