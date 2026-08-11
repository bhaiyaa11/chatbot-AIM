import { useState, useRef, useEffect, useCallback } from "react";
import "./chatWindow.css";
import { useChat } from "../contexts/ChatContext";
import ChatResponse from "./chat_message.jsx";
import Clients from "./dropdown/clients.jsx";
import Industrys from "./dropdown/industry.jsx"; 
import ServiceLine from "./dropdown/serviceLine.jsx";
import Videotype from "./dropdown/videoType.jsx";
import VideoTone from "./dropdown/video_tone.jsx";
import Styles from "./dropdown/styles.jsx";
import DURATION_OPTIONS from "./dropdown/duration.jsx";
import ContextDebugBar from "./ContextDebugBar";
import SliderSizes from "./dropdown/slider.jsx";
import EnhancePromptButton from "./dropdown/enhancePrompt.jsx";
import NarrativeReviewPanel from "./NarrativeReviewPanel.jsx";
import FactChecker from "./FactChecker.jsx";
import VoiceInputButton from "./VoiceInputButton.jsx";



// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Storage key for persisting script canvas content per bot message
const scriptKey = (msgId) => `script_content_${msgId}`;

// ─────────────────────────────────────────────────────────────────────────────
// safeWriteClipboard — clipboard helper with execCommand fallback
// ─────────────────────────────────────────────────────────────────────────────
async function safeWriteClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand("copy"); } finally { document.body.removeChild(ta); }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// inlineFormat — bold, italic, inline code
// ─────────────────────────────────────────────────────────────────────────────
function inlineFormat(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, `<code style="background:rgba(255,255,255,.08);border-radius:3px;padding:1px 5px;font-size:.92em;">$1</code>`)
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/___(.+?)___/g, "<strong><em>$1</em></strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}

// ─────────────────────────────────────────────────────────────────────────────
// parseMarkdownTable
// ─────────────────────────────────────────────────────────────────────────────
function parseMarkdownTable(tableLines) {
  const rows = tableLines.filter(l => l.trim().startsWith("|"));
  if (rows.length < 2) return null;

  const parseRow = (line) =>
    line.trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map(cell => cell.trim());

  const headers = parseRow(rows[0]);
  const bodyRows = rows.slice(2);

  const thCells = headers.map(h =>
    `<th style="padding:8px 14px;text-align:left;font-size:12px;font-weight:700;
      color:rgba(255,255,255,.5);letter-spacing:.8px;text-transform:uppercase;
      font-family:'Manrope',sans-serif;border-bottom:1px solid rgba(255,255,255,.08);
      white-space:nowrap;">${inlineFormat(h)}</th>`
  ).join("");

  const trRows = bodyRows.map((line, ri) => {
    const cells = parseRow(line);
    const tdCells = cells.map((cell, ci) => {
  const isLabel = ci === 0;

  const headerName = (headers[ci] || "").trim().toLowerCase();

  const isNarration =
    headerName === "voice over" ||
    headerName === "voiceover" ||
    headerName === "narration" ||
    headerName === "voice";

  return `<td
    data-tts-narration="${isNarration ? "true" : "false"}"
    style="padding:10px 14px;font-size:13px;line-height:1.65;
    vertical-align:top;border-bottom:1px solid rgba(255,255,255,.04);
    color:${isLabel ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.82)"};
    font-weight:${isLabel ? "600" : "400"};
    font-family:'Inter',sans-serif;"
  >${inlineFormat(cell)}</td>`;
}).join("");

    const rowBg = ri % 2 === 0 ? "rgba(255,255,255,.015)" : "transparent";
    return `<tr
  data-tts-scene="${ri}"style="background:${rowBg};">${tdCells}</tr>`;
  }).join("");

  return `
    <div style="overflow-x:auto;margin:12px 0;border-radius:10px;
      border:1px solid rgba(255,255,255,.08);">
      <table style="width:100%;border-collapse:collapse;table-layout:auto;">
        <thead><tr style="background:rgba(255,255,255,.03);">${thCells}</tr></thead>
        <tbody>${trRows}</tbody>
      </table>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// markdownToHtml
// ─────────────────────────────────────────────────────────────────────────────
function markdownToHtml(md) {
  if (!md || typeof md !== "string") return "";

  const lines = md.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trimStart().startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(
          lines[i].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        );
        i++;
      }
      out.push(
        `<pre style="background:rgba(255,255,255,.05);border-radius:6px;padding:12px 16px;overflow-x:auto;font-size:13px;line-height:1.6;margin:8px 0;"><code>${codeLines.join("\n")}</code></pre>`
      );
      i++; continue;
    }

    if (line.trim().startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const tableHtml = parseMarkdownTable(tableLines);
      if (tableHtml) out.push(tableHtml);
      continue;
    }

    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);
    if (h1) { out.push(`<h1 style="font-size:1.3em;font-weight:700;margin:18px 0 6px;color:rgba(255,255,255,.92);font-family:'Manrope',sans-serif;">${inlineFormat(h1[1])}</h1>`); i++; continue; }
    if (h2) { out.push(`<h2 style="font-size:1.12em;font-weight:700;margin:16px 0 5px;color:rgba(255,255,255,.88);font-family:'Manrope',sans-serif;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.07);">${inlineFormat(h2[1])}</h2>`); i++; continue; }
    if (h3) { out.push(`<h3 style="font-size:1.0em;font-weight:600;margin:12px 0 4px;color:rgba(255,255,255,.75);font-family:'Manrope',sans-serif;">${inlineFormat(h3[1])}</h3>`); i++; continue; }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      out.push(`<hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:14px 0;" />`);
      i++; continue;
    }

    if (/^[\*\-]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[\*\-]\s+/.test(lines[i])) {
        items.push(`<li style="margin:4px 0;color:rgba(255,255,255,.8);">${inlineFormat(lines[i].replace(/^[\*\-]\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ul style="padding-left:22px;margin:6px 0;font-family:'Inter',sans-serif;font-size:13px;">${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li style="margin:4px 0;color:rgba(255,255,255,.8);">${inlineFormat(lines[i].replace(/^\d+\.\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ol style="padding-left:22px;margin:6px 0;font-family:'Inter',sans-serif;font-size:13px;">${items.join("")}</ol>`);
      continue;
    }

    if (line.trim() === "") {
      out.push(`<div style="height:0.5em;"></div>`);
      i++; continue;
    }

    out.push(`<p style="margin:0 0 4px;font-family:'Inter',sans-serif;font-size:14px;line-height:1.75;color:rgba(255,255,255,.82);">${inlineFormat(line)}</p>`);
    i++;
  }

  return out.join("");
}



// ─────────────────────────────────────────────────────────────────────────────
// ScriptFloatingMenu
// ─────────────────────────────────────────────────────────────────────────────

const VIDEO_TYPES = [
  { value: "3d_animation",       label: "3D Animation" },
  { value: "2d_animation",       label: "2D Animation" },
  { value: "talking_head",       label: "Talking Head" },
  { value: "live_action_motion", label: "Live Action + Motion Graphics" },
];

const VideoTypeModal = ({ onSelect, onClose }) => (
  <div
    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}
    onClick={onClose}
  >
    <div
      style={{ background: "#141414", border: "1px solid rgba(255,255,255,.1)", borderRadius: "1.2rem", padding: "22px", width: "320px", boxShadow: "0 24px 80px rgba(0,0,0,.8)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,.85)", fontFamily: "'Manrope',sans-serif", marginBottom: "14px" }}>
        What kind of video is this?
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {VIDEO_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => onSelect(t.value)}
            style={{
              background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "10px", color: "rgba(255,255,255,.85)", cursor: "pointer",
              fontSize: "13px", fontFamily: "'Inter',sans-serif", padding: "10px 14px",
              textAlign: "left", transition: "background .15s, border-color .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168, 85, 247, 0.12)"; e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        style={{ marginTop: "14px", width: "100%", background: "none", border: "1px solid rgba(255,255,255,.07)", borderRadius: "9999px", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "6px 0" }}
      >
        Cancel
      </button>
    </div>
  </div>
);

const ScriptFloatingMenu = ({ position, onAction, onClose, isLoading }) => {
  const [askInput, setAskInput] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    if (!position) return;
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onDown, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onClose);
    };
  }, [position, onClose]);

  if (!position) return null;

  return (
    <>
      <style>{`
        @keyframes sfmIn { from{opacity:0;transform:translateY(4px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .sfm-btn:hover { color:rgba(255,255,255,.95)!important; background:rgba(255,255,255,.07)!important; border-color:rgba(255,255,255,.18)!important; }
        .sfm-ask:focus { border-color:rgba(139,92,246,.6)!important; outline:none; }
      `}</style>
      <div
        ref={menuRef}
        style={{ position: "fixed", top: position.top, left: position.left, zIndex: 9999, background: "#1a1a1a", border: "1px solid rgba(255,255,255,.1)", borderRadius: ".85rem", padding: "6px", display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "4px", alignItems: "center", minWidth: "260px", maxWidth: "340px", boxShadow: "0 8px 32px rgba(0,0,0,.7)", animation: "sfmIn .13s ease" }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px", fontSize: "12px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.45)" }}>
            <span style={{ display: "inline-block", width: "14px", height: "14px", border: "1.5px solid rgba(255,255,255,.15)", borderTopColor: "rgba(139,92,246,.8)", borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />
            Editing…
          </div>
        ) : (
          <>
            {[["✨", "Improve clarity and tone", "Improve"], ["🔄", "Regenerate keeping the same context and tone", "Regenerate"], ["✂️", "Shorten this text", "Shorten"], ["📝", "Expand with more detail", "Expand"]].map(([icon, instruction, label]) => (
              <button key={label} className="sfm-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => onAction(instruction)}
                style={{ background: "none", border: "1px solid rgba(255,255,255,.07)", borderRadius: "9999px", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: "12px", fontFamily: "'Inter',sans-serif", padding: "5px 11px", whiteSpace: "nowrap" }}>
                {icon} {label}
              </button>
            ))}
            <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,.07)", margin: "2px 0" }} />
            <div style={{ width: "100%", display: "flex", gap: "4px", alignItems: "center" }}>
              <input className="sfm-ask" type="text" placeholder="Ask AI…" value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter" && askInput.trim()) { onAction(askInput.trim()); setAskInput(""); } if (e.key === "Escape") onClose(); }}
                autoFocus
                style={{ flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "9999px", color: "rgba(255,255,255,.85)", fontSize: "12px", fontFamily: "'Inter',sans-serif", padding: "5px 12px", outline: "none" }} />
              <button className="sfm-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => { if (askInput.trim()) { onAction(askInput.trim()); setAskInput(""); } }}
                style={{ background: "none", border: "1px solid rgba(255,255,255,.07)", borderRadius: "9999px", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: "14px", padding: "5px 10px" }}>↵</button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AudioPlayer
// ─────────────────────────────────────────────────────────────────────────────
const AudioPlayer = ({ src, onClose, onAudioStarted, wordTimings, sceneSegments, onTimeUpdate, filename }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const animFrameRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  audio.load();

  const startPlayback = async () => {
    try {
      await audio.play();
      setPlaying(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const onLoadedMetadata = () => {
    setDuration(audio.duration || 0);
  };

const onCanPlay = async () => {
  try {
    await startPlayback();

    if (onAudioStarted) {
      onAudioStarted();
    }
  } catch (err) {
    console.error(err);
  }
};

  const onEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
    cancelAnimationFrame(animFrameRef.current);
  };

const onError = (e) => {
  console.error("Audio error", e);

  setLoading(false);

  if (onAudioStarted) {
    onAudioStarted();
  }
};

  audio.addEventListener(
    "loadedmetadata",
    onLoadedMetadata
  );

  audio.addEventListener(
    "canplay",
    onCanPlay
  );

  audio.addEventListener(
    "ended",
    onEnded
  );

  audio.addEventListener(
    "error",
    onError
  );

  return () => {
    audio.pause();

    audio.removeEventListener(
      "loadedmetadata",
      onLoadedMetadata
    );

    audio.removeEventListener(
      "canplay",
      onCanPlay
    );

    audio.removeEventListener(
      "ended",
      onEnded
    );

    audio.removeEventListener(
      "error",
      onError
    );
  };
}, [src]);

  useEffect(() => {
    const tick = () => {
      if (audioRef.current && playing) {
        setCurrentTime(audioRef.current.currentTime);
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };
    if (playing) animFrameRef.current = requestAnimationFrame(tick);
    else cancelAnimationFrame(animFrameRef.current);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [playing]);

  const togglePlay = () => {
    const audio = audioRef.current; if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}); }
  };

const downloadVoiceOver = async () => {
  setDownloading(true);
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || `voiceover_${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Voice-over download failed:", err);
  } finally {
    setDownloading(false);
  }
};

  const handleSeek = (e) => {
    const audio = audioRef.current; if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setCurrentTime(audio.currentTime);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current; if (!audio) return;
    const next = !muted;
    setMuted(next);
    audio.muted = next;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  const seekToScene = (scene) => {
  if (!audioRef.current) return;

  audioRef.current.currentTime = scene.start;
  setCurrentTime(scene.start);
};

  return (
    <>
      <style>{`
        @keyframes apIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .ap-seek:hover .ap-seek-fill { background: rgba(168,85,247,1) !important; }
        .ap-seek:hover .ap-seek-thumb { opacity: 1 !important; }
        .ap-vol-track { -webkit-appearance:none; appearance:none; height:3px; border-radius:9999px; outline:none; cursor:pointer; }
        .ap-vol-track::-webkit-slider-thumb { -webkit-appearance:none; width:11px; height:11px; border-radius:50%; background:rgba(255,255,255,.8); cursor:pointer; margin-top:-4px; }
        .ap-vol-track::-moz-range-thumb { width:11px; height:11px; border-radius:50%; background:rgba(255,255,255,.8); border:none; cursor:pointer; }
        .ap-ctrl-btn { background:none; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:background .15s, transform .1s; padding:6px; }
        .ap-ctrl-btn:hover { background:rgba(255,255,255,.08); }
        .ap-ctrl-btn:active { transform:scale(.9); }
        .ap-close-btn:hover { background:rgba(255,80,80,.12) !important; color:rgba(255,100,100,.8) !important; }
      `}</style>
      <audio
  ref={audioRef}
  src={src}
  preload="metadata"
    onTimeUpdate={() => {onTimeUpdate?.(audioRef.current?.currentTime ?? 0);}}
  controls={false}
/>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "linear-gradient(135deg,rgba(20,20,28,.98),rgba(14,14,20,.98))", border: "1px solid rgba(168,85,247,.25)", borderRadius: "14px", padding: "14px 16px", marginTop: "10px", boxShadow: "0 4px 24px rgba(168,85,247,.12), 0 2px 8px rgba(0,0,0,.5)", animation: "apIn .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>🎙</span>
            <span style={{ fontSize: "11px", fontFamily: "'Inter',sans-serif", fontWeight: 600, color: "rgba(168,85,247,.9)", letterSpacing: ".6px", textTransform: "uppercase" }}>Voice Over</span>
            {loading && <span style={{ display: "inline-block", width: "10px", height: "10px", border: "1.5px solid rgba(168,85,247,.2)", borderTopColor: "rgba(168,85,247,.9)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />}
          </div>
          {/* <button className="ap-ctrl-btn ap-close-btn" onClick={onClose} style={{ color: "rgba(255,255,255,.3)", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 10px", border: "1px solid rgba(255,255,255,.07)", borderRadius: "9999px" }}>✕ Close</button> */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
  <button
    onClick={downloadVoiceOver}
    disabled={downloading}
    title="Download voice over"
    style={{
      background: "none",
      border: "1px solid rgba(168,85,247,.3)",
      borderRadius: "9999px",
      color: "rgba(200,160,255,.9)",
      cursor: downloading ? "not-allowed" : "pointer",
      fontSize: "11px",
      fontFamily: "'Inter',sans-serif",
      padding: "4px 10px",
      opacity: downloading ? 0.5 : 1,
      display: "flex",
      alignItems: "center",
      gap: "5px",
    }}
  >
    {downloading ? (
      <span style={{ width: "10px", height: "10px", border: "1.5px solid rgba(200,160,255,.2)", borderTopColor: "rgba(200,160,255,.9)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    ) : (
      "⬇"
    )}
    {downloading ? "Saving…" : "Download"}
  </button>
  <button className="ap-ctrl-btn ap-close-btn" onClick={onClose} style={{ color: "rgba(255,255,255,.3)", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 10px", border: "1px solid rgba(255,255,255,.07)", borderRadius: "9999px" }}>✕ Close</button>
</div>

        </div>

        <div
  className="ap-seek"
  onClick={handleSeek}
  style={{
    position: "relative",
    height: "24px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
  }}
>
  {/* Base timeline */}
  <div
    style={{
      position: "absolute",
      width: "100%",
      height: "4px",
      background: "rgba(255,255,255,.08)",
      borderRadius: "9999px",
    }}
  />

  {/* Played portion */}
  <div
    className="ap-seek-fill"
    style={{
      position: "absolute",
      height: "4px",
      borderRadius: "9999px",
      background: "rgba(168,85,247,.85)",
      width: `${progress * 100}%`,
      transition: "background .15s",
      pointerEvents: "none",
    }}
  />

  {/* Scene chapter markers */}
  {duration > 0 &&
    sceneSegments?.map((scene) => {
      const position = (scene.start / duration) * 100;

      return (
        <button
          key={scene.scene}
          onClick={(e) => {
            e.stopPropagation();
            seekToScene(scene);}}
          title={`Scene ${scene.scene}`}style={{position: "absolute",left: `${position}%`,top: "50%",transform: "translate(-50%, -50%)",width: "3px",height: "12px",padding: 0,border: "none",borderRadius: "2px",background: "rgba(255,255,255,.75)",cursor: "pointer",zIndex: 3,}}/>);
       })}
        <div
          className="ap-seek-thumb" style={{position: "absolute",left: `calc(${progress * 100}% - 6px)`,width: "12px",height: "12px",borderRadius: "50%",background: "#fff",boxShadow: "0 0 6px rgba(168,85,247,.6)",opacity: playing ? 1 : 0.6,transition: "opacity .15s",pointerEvents: "none",zIndex: 4,}} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className="ap-ctrl-btn" onClick={() => { if (audioRef.current) { audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10); setCurrentTime(audioRef.current.currentTime); } }} title="Rewind 10s" style={{ color: "rgba(255,255,255,.5)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.45" /></svg>
          </button>
          <button className="ap-ctrl-btn" onClick={togglePlay} disabled={loading} style={{ width: "36px", height: "36px", background: "rgba(168,85,247,.18)", border: "1px solid rgba(168,85,247,.4)", color: "rgba(200,160,255,.95)", opacity: loading ? 0.5 : 1 }}>
            {playing ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>}
          </button>
          <button className="ap-ctrl-btn" onClick={() => { if (audioRef.current) { audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10); setCurrentTime(audioRef.current.currentTime); } }} title="Forward 10s" style={{ color: "rgba(255,255,255,.5)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-.49-3.45" /></svg>
          </button>
          <span style={{ fontSize: "11px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.4)", marginLeft: "2px", minWidth: "72px" }}>{fmt(currentTime)} / {fmt(duration)}</span>
          <div style={{ flex: 1 }} />
          <button className="ap-ctrl-btn" onClick={toggleMute} style={{ color: "rgba(255,255,255,.4)" }}>
            {muted || volume === 0
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>}
          </button>
          <input type="range" min="0" max="1" step="0.02" value={muted ? 0 : volume} onChange={handleVolume} className="ap-vol-track" style={{ width: "70px", background: `linear-gradient(to right, rgba(168,85,247,.8) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,.1) ${(muted ? 0 : volume) * 100}%)` }} />
        </div>
      </div>
    </>
  );
};

const StoryboardPanel = ({ images, totalScenes, status, onClose }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    if (expandedIndex === null) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setExpandedIndex(null);
      if (e.key === "ArrowRight") setExpandedIndex((i) => Math.min(i + 1, images.length - 1));
      if (e.key === "ArrowLeft") setExpandedIndex((i) => Math.max(i - 1, 0));
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expandedIndex, images.length]);

  const expanded = expandedIndex !== null ? images[expandedIndex] : null;

  return (
    <>
      <style>{`
        @keyframes sbIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sbLightboxIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        .sb-thumb { cursor:pointer; transition:transform .15s ease, border-color .15s ease; }
        .sb-thumb:hover { transform:scale(1.02); border-color:rgba(96,165,250,.5)!important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "linear-gradient(135deg,rgba(20,20,28,.98),rgba(14,14,20,.98))", border: "1px solid rgba(96,165,250,.25)", borderRadius: "14px", padding: "14px 16px", marginTop: "10px", boxShadow: "0 4px 24px rgba(96,165,250,.12), 0 2px 8px rgba(0,0,0,.5)", animation: "sbIn .2s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>🎬</span>
            <span style={{ fontSize: "11px", fontFamily: "'Inter',sans-serif", fontWeight: 600, color: "rgba(96,165,250,.9)", letterSpacing: ".6px", textTransform: "uppercase" }}>
              Storyboard
              {status && status !== "done" && totalScenes > 0 && (
                <span style={{ marginLeft: "8px", color: "rgba(255,255,255,.4)", fontWeight: 500, textTransform: "none", letterSpacing: "normal" }}>
                  {`${images.length} / ${totalScenes} scenes`}
                </span>
              )}
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid rgba(255,255,255,.07)", borderRadius: "9999px", color: "rgba(255,255,255,.3)", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 10px", cursor: "pointer" }}>✕ Close</button>
        </div>

        {images.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,.35)", fontSize: "12px", fontFamily: "'Inter',sans-serif", padding: "12px 4px" }}>
            {status === "running" ? "Generating scenes…" : "No scenes returned."}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {images.map((img, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <img
                  className="sb-thumb"
                  src={img.url}
                  alt={img.caption || `Scene ${img.scene_number}`}
                  onClick={() => setExpandedIndex(i)}
                  style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "10px", border: "1px solid rgba(255,255,255,.08)" }}
                />
                <span style={{ fontSize: "10px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.4)" }}>
                  {img.scene_number ? `Scene ${img.scene_number}` : `Frame ${i + 1}`}{img.caption ? ` — ${img.caption}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {expanded && (
        <div
          onClick={() => setExpandedIndex(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "min(90vw, 1000px)", width: "100%", display: "flex", flexDirection: "column", gap: "12px", animation: "sbLightboxIn .15s ease" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.6)" }}>
                {expanded.scene_number ? `Scene ${expanded.scene_number}` : `Frame ${expandedIndex + 1}`} of {images.length}
              </span>
              <button onClick={() => setExpandedIndex(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,.15)", borderRadius: "9999px", color: "rgba(255,255,255,.6)", fontSize: "12px", fontFamily: "'Inter',sans-serif", padding: "5px 12px", cursor: "pointer" }}>✕ Close</button>
            </div>

            <div style={{ position: "relative" }}>
              {expandedIndex > 0 && (
                <button
                  onClick={() => setExpandedIndex((i) => i - 1)}
                  style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.15)", borderRadius: "50%", width: "36px", height: "36px", color: "#fff", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >‹</button>
              )}
              <img src={expanded.url} alt={expanded.caption} style={{ width: "100%", borderRadius: "12px", border: "1px solid rgba(255,255,255,.1)", display: "block" }} />
              {expandedIndex < images.length - 1 && (
                <button
                  onClick={() => setExpandedIndex((i) => i + 1)}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.15)", borderRadius: "50%", width: "36px", height: "36px", color: "#fff", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >›</button>
              )}
            </div>

            {expanded.caption && (
              <p style={{ fontSize: "13px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.7)", margin: 0, lineHeight: 1.6 }}>{expanded.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// htmlToMarkdown
// ─────────────────────────────────────────────────────────────────────────────
function htmlToMarkdown(container) {
  if (!container) return "";
  let markdown = "";
  const elements = container.childNodes;
  elements.forEach((node) => {
    if (node.nodeName === "DIV") {
      const table = node.querySelector?.("table");
      if (table) {
        const rows = table.querySelectorAll("tr");
        rows.forEach((row, rowIndex) => {
          const cols = row.querySelectorAll("th, td");
          const values = Array.from(cols).map((cell) => cell.innerText.replace(/\n/g, " ").trim());
          markdown += `| ${values.join(" | ")} |\n`;
          if (rowIndex === 0) markdown += `| ${values.map(() => "---").join(" | ")} |\n`;
        });
        markdown += "\n"; return;
      }
    }
    if (node.nodeName === "H1") { markdown += `# ${node.innerText}\n\n`; return; }
    if (node.nodeName === "H2") { markdown += `## ${node.innerText}\n\n`; return; }
    if (node.nodeName === "H3") { markdown += `### ${node.innerText}\n\n`; return; }
    if (node.nodeName === "P") { markdown += `${node.innerText}\n\n`; return; }
    if (node.nodeName === "UL") {
      const items = node.querySelectorAll("li");
      items.forEach((li) => { markdown += `- ${li.innerText}\n`; });
      markdown += "\n"; return;
    }
    if (node.nodeName === "OL") {
      const items = node.querySelectorAll("li");
      items.forEach((li, index) => { markdown += `${index + 1}. ${li.innerText}\n`; });
      markdown += "\n"; return;
    }
  });
  return markdown.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICES config
// ─────────────────────────────────────────────────────────────────────────────
const VOICES = [
  { value: "british_female",              label: "🇬🇧 Alice",        accent: "british",    tone: ["social_media"], age: "young", gender: "female"},
  { value: "BLONDE_BRITISH_FEMALE",       label: "🇬🇧 Charlotte",    accent: "british",    tone: ["conversational"], age: "young", gender: "female"},
  { value: "EFFIE_BRITISH_ADVERTISEMENT", label: "🇬🇧 Effie",        accent: "british",    tone: ["advertising"], age: "mid", gender: "female"},


 { value: "ASHER_BRITISH_SOCIALMEDIA",   label: "🇬🇧 Asher",        accent: "british",    tone: ["social_media"], age: "young", gender: "male"},
  { value: "british_male",                label: "🇬🇧 Nathan",        accent: "british",    tone: ["conversational", "advertising"], age: "young", gender: "male"},
  { value: "american_female",             label: "🇺🇸 Rita",          accent: "american",   tone: ["conversational"], age: "young", gender: "female" },
  { value: "american_male",               label: "🇺🇸 Dexter",        accent: "american",   tone: ["advertising"], age: "mid", gender:"male" },
  { value: "indian_female",               label: "🇮🇳 Indian Female", accent: "indian",     tone: ["conversational", "social_media"], age: "young", gender: "female" },
  { value: "indian_male",                 label: "🇮🇳 Indian Male",   accent: "indian",     tone: ["conversational", "advertising"], age: "young", gender: "male" },
  { value: "MARK_AMERICAN_MALE",          label: "🇺🇸 Mark",          accent: "american",   tone: ["social_media"], age: "young", gender: "male"},
  { value: "KAIRA_AMERICAN_FEMALE",       label: "🇺🇸 Kaira",         accent: "american",   tone: ["advertising"], age: "mid", gender: "female" },
  { value: "TANYA_AUSSIE_SOCIALMEDIA",    label: "🇦🇺 Tanya",         accent: "australian", tone: ["social_media"], age: "young", gender: "female"},
  { value: "MIKE_AUSSIE_SOCIALMEDIA",     label: "🇦🇺 Mike",          accent: "australian", tone: ["social_media"], age: "mid", gender: "male"},
  { value: "PETTER_AUSSIE_ADVERTISEMENT", label: "🇦🇺 Petter",        accent: "australian", tone: ["advertising"], age: "young", gender: "male" },
  { value: "BECCA_AUSSIE_ADVERTISEMENT",  label: "🇦🇺 Becca",         accent: "australian", tone: ["advertising"], age: "mid", gender: "female" },
  { value: "LILY_AUSSIE_CONVERSATIONAL",  label: "🇦🇺 Lily",          accent: "australian", tone: ["conversational"], age: "young", gender: "female"},
  { value: "SERENA_AMERICAN_SOCIALMEDIA", label: "🇺🇸 Serena",        accent: "american",   tone: ["social_media"], age: "young" ,gender: "female"},
  { value: "MR_DAVID_BRIT_CONVO_MALE_OLD", label: "🇬🇧 MR David",     accent: "british",    tone: ["conversational"], age: "senior", gender: "male"},
  {value: "SAMMY_AEMRICAN_CONVO_NUETRAL_YOUNG", label:"🇺🇸 sammy", accent:"american", tone: ["conversational"], age: "young", gender: "neutral"},
  {value:"ELLIS_BRIT_YOUNG_M_CONVO", label:"🇬🇧 Ellis", accent:"british", tone: ["conversational"], age: "young", gender: "male"},
  {value:"JAMES_BRIT_YOUNG_M_CONVO", label:"🇬🇧 James", accent:"british", tone: ["conversational"], age: "young", gender: "male"},
  {value:"JACK_BRIT_YOUNG_M_CONVO", label:"🇬🇧 Jack", accent:"british", tone: ["conversational"], age: "young", gender: "male"},
  {value:"LLOYD_BRIT_YOUNG_M_SM", label:"🇬🇧 Lloyd", accent:"british", tone: ["social_media"], age:"young",gender:"male"},
  {value:"JOSH_BRIT_YOUNG_M_SM", label:"🇬🇧 Josh", accent:"british", tone: ["social_media"], age:"young",gender:"male"},
  {value:"HARRY_BRIT_YOUNG_M_SM", label:"🇬🇧 Harry", accent:"british", tone: ["social_media"], age:"young",gender:"male"},
  {value:"ALFIE_BRIT_YOUNG_M_AD", label:"🇬🇧 Alfie", accent:"british", tone: ["advertising"], age:"young",gender:"male"},
  {value:"ROCK_BRIT_YOUNG_M_AD", label:"🇬🇧 Rock", accent:"british", tone: ["advertising"], age:"young",gender:"male"},
  {value:"JAMES_BRIT_YOUNG_M_AD", label:"🇬🇧 James", accent:"british", tone: ["advertising"], age:"young",gender:"male"},
  {value:"JAMES_BRIT_MID_M_CONVO", label:"🇬🇧 James", accent:"british", tone: ["conversational"], age:"mid",gender:"male"},
  {value:"FINN_BRIT_MID_M_CONVO", label:"🇬🇧 Finn", accent:"british", tone: ["conversational"], age:"mid",gender:"male"},
  {value:"MARTIN_BRIT_MID_M_CONVO", label:"🇬🇧 Martin", accent:"british", tone: ["conversational"], age:"mid",gender:"male"},
  {value:"DANIEL_BRIT_MID_M_SM", label:"🇬🇧 Daniel", accent:"british", tone: ["social_media"], age:"mid",gender:"male"},
  {value:"MYSTERIOUS_BRIT_MID_M_SM", label:"🇬🇧 Mysterious", accent:"british", tone: ["social_media"], age:"mid",gender:"male"},
  {value:"EDMUND_BRIT_MID_M_SM",label:"🇬🇧 Edmund", accent:"british", tone: ["social_media"], age:"mid",gender:"male"},
  {value:"RUSS_BRIT_MID_AD",label:"🇬🇧 Russ", accent:"british", tone: ["advertising"], age:"mid",gender:"male"},
  {value:"CONOR_BRIT_MID_AD", label:"🇬🇧 Conor", accent:"british", tone: ["advertising"], age:"mid",gender:"male"},
  {value:"CHRIS_BRIT_MID_AD", label:"🇬🇧 Chris", accent:"british",tone: ["advertising"], age:"mid",gender:"male"},
  {value:"grandpa_brit_ad", label:"🇬🇧 Grandpa", accent:"british", tone: ["advertising"], age:"senior",gender:"male"},
  {value:"JOE_brit_old_sm", label:"🇬🇧 Joe", accent:"british", tone: ["social_media"], age:"senior",gender:"male"},
  {value:"DAN_brit_old_sm", label:"🇬🇧 Dan", accent:"british", tone: ["social_media"], age:"senior",gender:"male"},
  {value:"sam_brit_ad", label:"🇬🇧 Sam", accent:"british", tone: ["advertising"], age:"senior",gender:"male"},
  {value:"Charlotte_BRIT_YOUNG_F_CONVO", label:"🇬🇧 Amelia", accent:"british", tone: ["conversational"], age:"young",gender:"female"},
  {value:"ABIGAIL_BRIT_YOUNG_F_CONVO", label:"🇬🇧 Abigail", accent:"british", tone: ["conversational"], age:"young",gender:"female"},
  {value:"KATRINA_BRIT_YOUNG_F_CONVO",label:"🇬🇧 Katrina", accent:"british", tone: ["conversational"], age:"young",gender:"female"},
  {value:"KRISTY_BRIT_YOUNG_F_SM",label:"🇬🇧 Kristy", accent:"british", tone: ["social_media"], age:"young",gender:"female"},
  {value:"PEACH_BRIT_YOUNG_F_SM",label:"🇬🇧 Peach", accent:"british", tone: ["social_media"], age:"young",gender:"female"},
  {value:"EFFY_BRIT_YOUNG_F_AD", label:"🇬🇧 Effy", accent:"british", tone: ["advertising"], age:"young",gender:"female"},
  {value:"PEPPER_BRIT_YOUNG_F_AD", label:"🇬🇧 Pepper", accent:"british", tone: ["advertising"], age:"young",gender:"female"},
  {value:"SERENA_BRIT_YOUNG_F_AD", label:"🇬🇧 Serena", accent:"british", tone: ["advertising"], age:"young",gender:"female"},
  {value:"PIA_BRIT_MID_F_CONVO", label:"🇬🇧 Pia", accent:"british", tone: ["conversational"], age:"mid",gender:"female"},
  {value:"VALORY_BRIT_MID_F_CONVO", label:"🇬🇧 Valory", accent:"british", tone:["conversational"], age:"mid",gender:"female"},
  {value:"KATIE_BRIT_MID_F_CONVO", label:"🇬🇧 Kattie", accent:"british", tone: ["conversational"], age:"mid",gender:"female"},
  {value:"AIR_BRIT_MID_F_SM", label:"🇬🇧 Air", accent:"british", tone: ["social_media"], age:"mid",gender:"female"},
  {value:"SAMARA_BRIT_MID_F_SM", label :"🇬🇧 Samara", accent:"british", tone: ["social_media"], age:"mid",gender:"female"},
  {value:"IMOGEN_BRIT_MID_F_SM", label:"🇬🇧 Imogen", accent:"british", tone: ["social_media"], age:"mid",gender:"female"},
  {value:"VELVET_BRIT_MID_F_AD", label:"🇬🇧 Velvet", accent:"british", tone: ["advertising"], age:"mid",gender:"female"},
  {value:"EMILY_BRIT_MID_F_AD", label:"🇬🇧 Emily", accent:"british", tone: ["advertising"], age:"mid",gender:"female"},
  {value:"BEATRICE_BRIT_OLD_CONVO", label:"🇬🇧 Beatrice", accent:"british", tone: ["conversational"], age:"senior",gender:"female"},
  {value:"JANE_BRIT_OLD_SM", label:"🇬🇧 Jane", accent:"british", tone: ["social_media"], age:"senior",gender:"female"},
  {value:"ELEANOR_BRIT_OLD_AD", label:"🇬🇧 Eleanor", accent:"british", tone: ["advertising", "conversational"], age:"senior",gender:"female"},
  {value:"DARCY_BRIT_MID_N_SM", label:"🇬🇧 Darcy", accent:"british", tone: ["social_media","advertising"], age:"mid",gender:"neutral"},
  {value:"MARSHAL_BRIT_MID_N_CONVO", label:"🇬🇧 Marshal", accent:"british", tone: ["conversational", "social_media"], age:"mid",gender:"neutral"},
  {value:"EVELYN_BRIT_YOUNG_N_CONVO", label:"🇬🇧 Evelyn", accent:"british", tone:["conversational","social_media"], age:"young",gender:"neutral"},

];

const DEFAULT_accent = "british";
const DEFAULT_TONE   = "conversational";
const DEFAULT_AGE    = "young";
const DEFAULT_GENDER = "female";
const DEFAULT_VOICE  = VOICES.find(v => v.accent === DEFAULT_accent && v.tone.includes(DEFAULT_TONE) && v.age === DEFAULT_AGE && v.gender === DEFAULT_GENDER)?.value ?? VOICES[0].value;

// ─────────────────────────────────────────────────────────────────────────────
// ScriptCanvas
// ─────────────────────────────────────────────────────────────────────────────
const ScriptCanvas = ({ content, msgId }) => {
  const canvasRef         = useRef(null);
  const savedRange        = useRef(null);
  const undoStack         = useRef([]);
  const redoStack         = useRef([]);
  const snapshotTimer     = useRef(null);
  const persistTimer      = useRef(null);
  const skipSnap          = useRef(false);
  const isUserEditing     = useRef(false);
  const lastPersistedHtml = useRef(null);
  const aiHighlightTimer  = useRef(null);
  const rawMarkdownRef    = useRef(content ?? "");

  const [menuPos,         setMenuPos]         = useState(null);
  const [selText,         setSelText]         = useState("");
  const [loading,         setLoading]         = useState(false);
  const [copied,          setCopied]          = useState(false);
  const [wordCount,       setWordCount]       = useState(0);
  const [canUndo,         setCanUndo]         = useState(false);
  const [canRedo,         setCanRedo]         = useState(false);
  const [selectedVoice,   setSelectedVoice]   = useState(DEFAULT_VOICE);
  const[gender,          setGender]          = useState(DEFAULT_GENDER);
  const [age,             setAge]             = useState(DEFAULT_AGE);
  const [accent,          setaccent]          = useState(DEFAULT_accent);
  const [tone,            setTone]            = useState(DEFAULT_TONE);
  const [voiceGenerating, setVoiceGenerating] = useState(false);
  const [audioSrc,        setAudioSrc]        = useState(null);
  const [showPlayer,      setShowPlayer]      = useState(false);
  const [visualizing,      setVisualizing]      = useState(false);
  const [storyboardImages, setStoryboardImages] = useState([]);
  const [showStoryboard,   setShowStoryboard]   = useState(false);
  // const [finalStoryboardVideo, setFinalStoryboardVideo] = useState(null);
  const [storyboardStatus, setStoryboardStatus] = useState(null);
  const [storyboardTotal, setStoryboardTotal] = useState(0);
  const [wordTimings, setWordTimings] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [activeNarrationWordIndex, setActiveNarrationWordIndex] = useState(-1);
  const [sceneSegments, setSceneSegments] = useState([]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(-1);

  

  const refreshBtns = () => {
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  };


  const buildVoiceoverFilename = () => {
  const voiceMeta = VOICES.find(v => v.value === selectedVoice);
  const voiceLabel = voiceMeta
    ? voiceMeta.label.replace(/[^\w\s]/g, "").trim().replace(/\s+/g, "_")
    : "voiceover";

  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
  const shortId = msgId ? String(msgId).slice(0, 8) : "script";

  return `${voiceLabel}_${dateStr}_${shortId}.mp3`;
};


useEffect(() => {
  if (!wordTimings.length) {
    setActiveWordIndex(-1);
    setActiveNarrationWordIndex(-1);
    return;
  }

  const index = wordTimings.findIndex(
    ({ start, end }) =>
      currentTime >= start && currentTime < end
  );

  setActiveWordIndex(index);
  setActiveNarrationWordIndex(index);
}, [currentTime, wordTimings]);

useEffect(() => {
  if (!sceneSegments.length) {
    setActiveSceneIndex(-1);
    return;
  }

  const sceneIndex = sceneSegments.findIndex(
    (segment) =>
      currentTime >= segment.start &&
      currentTime < segment.end
  );

  setActiveSceneIndex(sceneIndex);
}, [currentTime, sceneSegments]);

useEffect(() => {
  if (!canvasRef.current) return;

  const rows = canvasRef.current.querySelectorAll(
    "tr[data-tts-scene]"
  );

  rows.forEach((row, index) => {
    const isActive = index === activeSceneIndex;

    row.style.transition = "background 0.15s ease";

    row.style.background = isActive
      ? "rgba(168, 85, 247, 0.16)"
      : index % 2 === 0
        ? "rgba(255,255,255,.015)"
        : "transparent";

    row.style.boxShadow = isActive
      ? "inset 3px 0 0 rgba(168,85,247,.8)"
      : "none";
  });
}, [activeSceneIndex]);


const buildSceneSegments = useCallback((timings) => {

  if (!canvasRef.current) {
    console.log("❌ STOP: canvasRef.current missing");
    return [];
  }

  if (!timings?.length) {
    console.log("❌ STOP: timings empty");
    return [];
  }

  const rows = canvasRef.current.querySelectorAll(
    "tr[data-tts-scene]"
  );

  const narrationCells = canvasRef.current.querySelectorAll(
    'td[data-tts-narration="true"]'
  );

  const segments = [];
  let globalWordIndex = 0;

  rows.forEach((row, rowIndex) => {
    const narrationCell = row.querySelector(
      '[data-tts-narration="true"]'
    );

    if (!narrationCell) {
      console.log("❌ No narration cell");
      return;
    }

    const rowText = narrationCell.textContent || "";


    const rowWords = rowText.match(/\S+/g) || [];

    if (!rowWords.length) {
      console.log("❌ No words in row");
      return;
    }

    const startTiming = timings[globalWordIndex];

    const endTiming =
      timings[
        globalWordIndex + rowWords.length - 1
      ];

    if (!startTiming || !endTiming) {
      globalWordIndex += rowWords.length;
      return;
    }

    const segment = {
      scene: rowIndex + 1,
      start: startTiming.start,
      end: endTiming.end,
      duration: endTiming.end - startTiming.start,
      wordStartIndex: globalWordIndex,
      wordEndIndex:
        globalWordIndex + rowWords.length - 1,
    };

    segments.push(segment);

    globalWordIndex += rowWords.length;
  });

  return segments;
}, []);

const generateVoiceOver = async () => {
  try {
    setVoiceGenerating(true);

    const currentScript = htmlToMarkdown(canvasRef.current).trim();
    rawMarkdownRef.current = currentScript;

    if (!currentScript) {
      setVoiceGenerating(false);
      return;
    }

    const params = new URLSearchParams({
      script: currentScript,
      voice_type: selectedVoice,
    });

    const response = await fetch(
  `${API_BASE_URL}/generate-voice`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      script: currentScript,
      voice_type: selectedVoice
    })
  }
);


const data = await response.json();

const timings = data.word_timings || [];



setWordTimings(timings);

// Build scene segmentation using the timings
// returned directly from the backend.
const segments = buildSceneSegments(timings);

setSceneSegments(segments);

setAudioSrc(`${API_BASE_URL}${data.audio_url}`);

setShowPlayer(true);
setVoiceGenerating(false);

setAudioSrc(
  `${API_BASE_URL}${data.audio_url}`
);
    setShowPlayer(true);

  } catch (err) {
    console.error(err);
    setVoiceGenerating(false);
  }
};

const [showVideoTypePicker, setShowVideoTypePicker] = useState(false);


// const generateStoryboard = async (videoType) => {
//   try {
//     setVisualizing(true);
//     const currentScript = rawMarkdownRef.current?.trim() ?? "";
//     if (!currentScript) { setVisualizing(false); return; }

//     const startRes = await fetch(`${API_BASE_URL}/generate-storyboard`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ script: currentScript, video_type: videoType, quality: "fast" }),
//     });
//     if (!startRes.ok) throw new Error(`Failed to start: ${startRes.status}`);
//     const { job_id } = await startRes.json();

//     const poll = async () => {
//       const res = await fetch(`${API_BASE_URL}/generate-storyboard/${job_id}`);
//       const data = await res.json();

//       const clips = (data.clips || []).map((c) => ({
//         ...c,
//         url: c.url?.startsWith("http") ? c.url : `${API_BASE_URL}${c.url}`,
//       }));
//       setStoryboardImages(clips);
//       setStoryboardStatus(data.status);
//       setStoryboardTotal(data.total_scenes || 0);

//       // Show the panel as soon as the first clip lands — don't wait for the whole job
//       if (clips.length > 0) {
//         setShowStoryboard(true);
//       }

//       if (data.final_video) {
//         setFinalStoryboardVideo(`${API_BASE_URL}${data.final_video.url}`);
//       }

//       if (data.status === "done" || data.status === "error") {
//         setVisualizing(false);
//         if (data.status === "error") console.error("Storyboard job failed:", data.error);
//         return;
//       }
//       setTimeout(poll, 5000);
//     };

//     poll(); // fire and forget — poll() manages its own state updates
//   } catch (err) {
//     console.error("Storyboard generation failed:", err);
//     setVisualizing(false);
//   }
// };

const generateStoryboard = async (videoType) => {
  try {
    setVisualizing(true);
    const currentScript = rawMarkdownRef.current?.trim() ?? "";
    if (!currentScript) { setVisualizing(false); return; }

    const startRes = await fetch(`${API_BASE_URL}/generate-storyboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script: currentScript, video_type: videoType, quality: "quality" }),
    });
    if (!startRes.ok) throw new Error(`Failed to start: ${startRes.status}`);
    const { job_id } = await startRes.json();

    const poll = async () => {
      const res = await fetch(`${API_BASE_URL}/generate-storyboard/${job_id}`);
      const data = await res.json();

      const images = (data.images || []).map((img) => ({
        ...img,
        url: img.url?.startsWith("http") ? img.url : `${API_BASE_URL}${img.url}`,
      }));
      setStoryboardImages(images);
      setStoryboardStatus(data.status);
      setStoryboardTotal(data.total_scenes || 0);

      // Show the panel as soon as the first image lands — don't wait for the whole job
      if (images.length > 0) {
        setShowStoryboard(true);
      }

      if (data.status === "done" || data.status === "error") {
        setVisualizing(false);
        if (data.status === "error") console.error("Storyboard job failed:", data.error);
        return;
      }
      setTimeout(poll, 5000);
    };

    poll(); // fire and forget — poll() manages its own state updates
  } catch (err) {
    console.error("Storyboard generation failed:", err);
    setVisualizing(false);
  }
};


  useEffect(() => {
    return () => {
      clearTimeout(snapshotTimer.current);
      clearTimeout(persistTimer.current);
      clearTimeout(aiHighlightTimer.current);
    };
  }, []);

  useEffect(() => { if (content) rawMarkdownRef.current = content; }, [content]);


  const clearWordHighlight = () => {
  if (!canvasRef.current) return;

  const highlighted = canvasRef.current.querySelectorAll(
    '[data-tts-highlight="true"]'
  );

  highlighted.forEach((el) => {
    const parent = el.parentNode;
    if (!parent) return;

    parent.replaceChild(
      document.createTextNode(el.textContent || ""),
      el
    );

    parent.normalize();
  });
};



const ensureTtsMetadata = () => {
  if (!canvasRef.current) return;

  const tables = canvasRef.current.querySelectorAll("table");

  tables.forEach((table) => {
    const headerCells = table.querySelectorAll("thead th");

    let narrationColumnIndex = -1;

    headerCells.forEach((th, index) => {
      const header = (th.textContent || "").trim().toLowerCase();

      if (
        header === "voice over" ||
        header === "voiceover" ||
        header === "narration" ||
        header === "voice"
      ) {
        narrationColumnIndex = index;
      }
    });

    if (narrationColumnIndex === -1) return;

    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((row, rowIndex) => {
      // Mark this as a TTS scene
      row.setAttribute("data-tts-scene", String(rowIndex));

      const cells = row.querySelectorAll("td");

      cells.forEach((cell, cellIndex) => {
        cell.setAttribute(
          "data-tts-narration",
          cellIndex === narrationColumnIndex ? "true" : "false"
        );
      });
    });
  });
};


  const persistContent = useCallback(() => {
    if (!msgId || !canvasRef.current) return;
    clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      const html = canvasRef.current.innerHTML;
      if (html === lastPersistedHtml.current) return;
      try { localStorage.setItem(scriptKey(msgId), html); lastPersistedHtml.current = html; } catch (e) {}
    }, 1500);
  }, [msgId]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (isUserEditing.current) return;
    let saved = null;
    try { saved = msgId ? localStorage.getItem(scriptKey(msgId)) : null; } catch {}
    // if (saved) { canvasRef.current.innerHTML = saved; }
    // else if (content) { canvasRef.current.innerHTML = markdownToHtml(content); }
    // countWords();
    if (saved) {
  canvasRef.current.innerHTML = saved;

  // Restore TTS metadata on previously saved HTML
  ensureTtsMetadata();
}
else if (content) {
  canvasRef.current.innerHTML = markdownToHtml(content);
}

countWords();
  }, [content, msgId]); // eslint-disable-line

useEffect(() => {
  if (!canvasRef.current) return;

  if (activeNarrationWordIndex < 0 || !wordTimings.length) {
    clearWordHighlight();
    return;
  }

  clearWordHighlight();

  const narrationCells = canvasRef.current.querySelectorAll(
    '[data-tts-narration="true"]'
  );

  if (!narrationCells.length) return;

  const walker = document.createTreeWalker(
    canvasRef.current,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return node.parentElement?.closest(
          '[data-tts-narration="true"]'
        )
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    }
  );

  let node;
  let wordIndex = 0;

  while ((node = walker.nextNode())) {
    const text = node.textContent || "";

    /*
     * Match complete words while preserving their
     * exact positions inside the text node.
     */
    const wordRegex = /\S+/g;
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
      const currentIndex = wordIndex;
      wordIndex++;

      if (currentIndex !== activeNarrationWordIndex) {
        continue;
      }

      const range = document.createRange();

      range.setStart(node, match.index);
      range.setEnd(
        node,
        match.index + match[0].length
      );

      const span = document.createElement("span");

      span.dataset.ttsHighlight = "true";
      span.style.background = "rgba(168, 85, 247, 0.35)";
      span.style.borderRadius = "3px";
      span.style.padding = "1px 2px";

      range.surroundContents(span);

      return;
    }
  }
}, [
  activeNarrationWordIndex,
  wordTimings,
]);


  useEffect(() => {
    const el = canvasRef.current; if (!el) return;
    const id = setTimeout(() => {
      if (el.innerHTML.trim()) { undoStack.current = [el.innerHTML]; redoStack.current = []; refreshBtns(); }
    }, 0);
    return () => clearTimeout(id);
  }, [msgId]);

  useEffect(() => {
    const filtered = VOICES.filter(v => v.accent === accent && v.tone.includes(tone) && v.age === age && v.gender === gender);
    const stillValid = filtered.find(v => v.value === selectedVoice);
    if (!stillValid && filtered.length > 0) setSelectedVoice(filtered[0].value);
  }, [accent, tone, age, gender]); // eslint-disable-line



  const countWords = () => {
  const el = canvasRef.current;
  if (!el) return;

  const tables = [...el.querySelectorAll("table")];
  let count = 0;
  let foundVoiceColumn = false;

  tables.forEach((table) => {
    const headers = [...table.querySelectorAll("thead th")];
    const voiceColumnIndex = headers.findIndex(
      (th) => th.innerText.trim().toUpperCase() === "VOICE OVER"
    );
    if (voiceColumnIndex === -1) return;

    foundVoiceColumn = true;
    table.querySelectorAll("tbody tr").forEach((row) => {
      const cell = row.cells[voiceColumnIndex];
      if (!cell) return;
      count += cell.innerText.trim().split(/\s+/).filter(Boolean).length;
    });
  });

  if (!foundVoiceColumn) {
    // no table / no VOICE OVER column anywhere — fall back to full text
    count = el.innerText.trim().split(/\s+/).filter(Boolean).length;
  }

  setWordCount(count);
};

  const pushUndo = () => {
    const el = canvasRef.current; if (!el) return;
    undoStack.current.push(el.innerHTML);
    if (undoStack.current.length > 100) undoStack.current.shift();
    redoStack.current = []; refreshBtns();
  };

  const applyHtml = (html) => {
    const el = canvasRef.current; if (!el) return;
    skipSnap.current = true;
    el.innerHTML = html;
    countWords(); persistContent();
  };

  const undo = useCallback(() => {
    if (!undoStack.current.length) return;
    const el = canvasRef.current; if (!el) return;
    redoStack.current.push(el.innerHTML);
    applyHtml(undoStack.current.pop()); refreshBtns();
  }, []); // eslint-disable-line

  const redo = useCallback(() => {
    if (!redoStack.current.length) return;
    const el = canvasRef.current; if (!el) return;
    undoStack.current.push(el.innerHTML);
    applyHtml(redoStack.current.pop()); refreshBtns();
  }, []); // eslint-disable-line

  const onInput = useCallback(() => {
    isUserEditing.current = true;
    rawMarkdownRef.current = htmlToMarkdown(canvasRef.current);
    if (skipSnap.current) { skipSnap.current = false; return; }
    clearTimeout(snapshotTimer.current);
    snapshotTimer.current = setTimeout(() => { pushUndo(); countWords(); }, 600);
    persistContent();
  }, [persistContent]);

  const onKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    if (e.key === "Escape") setMenuPos(null);
  }, [undo, redo]);



  const onMouseUp = useCallback((e) => {
  if (e.target.closest?.("[data-sfm]")) return;

  // Wait one frame so the browser completes the text selection first
  requestAnimationFrame(() => {
    const canvas = canvasRef.current;
    const selection = window.getSelection();

    if (!canvas || !selection || selection.rangeCount === 0) {
      setMenuPos(null);
      return;
    }

    const selectedText = selection.toString().trim();

    if (!selectedText) {
      setMenuPos(null);
      return;
    }

    const range = selection.getRangeAt(0);

    // More reliable than checking only commonAncestorContainer.
    // Works properly inside table cells, paragraphs, spans, etc.
    const selectionInsideCanvas =
      canvas.contains(range.startContainer) &&
      canvas.contains(range.endContainer);

    if (!selectionInsideCanvas) {
      setMenuPos(null);
      return;
    }
    const saved = range.cloneRange();
    savedRange.current = range.cloneRange();
setSelText(selectedText);

const rects = [...range.getClientRects()];
const rect = rects[rects.length - 1] || range.getBoundingClientRect();

if (!rect || (rect.width === 0 && rect.height === 0)) {
  setMenuPos(null);
  return;
}

const MENU_WIDTH = 350;
const MENU_HEIGHT = 160;
const SAFE_MARGIN = 12;

let left = rect.left;
let top = rect.bottom + 8;

if (left + MENU_WIDTH > window.innerWidth - SAFE_MARGIN) {
  left = window.innerWidth - MENU_WIDTH - SAFE_MARGIN;
}

if (left < SAFE_MARGIN) {
  left = SAFE_MARGIN;
}

if (top + MENU_HEIGHT > window.innerHeight - SAFE_MARGIN) {
  top = rect.top - MENU_HEIGHT - 8;
}

if (top < SAFE_MARGIN) {
  top = SAFE_MARGIN;
}

setMenuPos({ top, left });
// React state updates can cause the native selection to disappear.
// Restore the saved selection after the render completes.
requestAnimationFrame(() => {
  const currentSelection = window.getSelection();

  if (
    savedRange.current &&
    currentSelection &&
    canvasRef.current
  ) {
    currentSelection.removeAllRanges();
    currentSelection.addRange(savedRange.current);
  }
});
  });
}, []);

  const applyEdit = useCallback((edited) => {
    const range = savedRange.current; const el = canvasRef.current;
    if (!range || !el) return;
    pushUndo();
    const sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
    const r = sel.getRangeAt(0);
    r.deleteContents();
    const span = document.createElement("span");
    span.textContent = edited;
    span.style.background = "rgba(111, 207, 151, 0.25)";
    span.style.borderRadius = "4px";
    span.style.padding = "2px 3px";
    span.dataset.aiEdit = "true";
    r.insertNode(span);
    const after = document.createRange();
    after.setStartAfter(span); after.collapse(true);
    sel.removeAllRanges(); sel.addRange(after);
    savedRange.current = null; setMenuPos(null); setSelText(""); isUserEditing.current = true; rawMarkdownRef.current = htmlToMarkdown(canvasRef.current); countWords(); persistContent();
    clearTimeout(aiHighlightTimer.current);
    aiHighlightTimer.current = setTimeout(() => {
      span.classList.add("ai-highlight-fade");
      setTimeout(() => {
        if (span.parentNode) { const text = document.createTextNode(span.textContent); span.parentNode.replaceChild(text, span); persistContent(); }
      }, 700);
    }, 12000);
  }, [persistContent]); // eslint-disable-line

  const handleAction = useCallback(async (instruction) => {
    if (!selText) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("instruction", instruction);
      fd.append("selected_text", selText);
      const res = await fetch(`${API_BASE_URL}/edit`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.result) applyEdit(data.result);
    } catch (err) { console.error("Canvas edit failed:", err); }
    finally { setLoading(false); }
  }, [selText, applyEdit]);

  const copy = useCallback(async () => {
  try {
    const canvas = canvasRef.current;

    if (!canvas) return;

    // Copy the entire latest generated script canvas,
    // including all tables, headings, lists, and text.
    const html = canvas.innerHTML;
    const plainText = htmlToMarkdown(canvas);

    if (navigator.clipboard?.write && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          // Keeps the generated script layout when pasted into Docs, Word, Notion, etc.
          "text/html": new Blob([html], { type: "text/html" }),

          // Gives CSV/Markdown-style readable content for Sheets, Excel, VS Code, etc.
          "text/plain": new Blob([plainText], { type: "text/plain" }),
        }),
      ]);
    } else {
      // Browser fallback
      await safeWriteClipboard(plainText);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.warn("Clipboard write failed:", err);

    // Final fallback
    await safeWriteClipboard(canvasRef.current?.innerText ?? "");
  }
}, []);

  const tbBtn = (dis) => ({
    background: "none", border: "1px solid rgba(255,255,255,.07)", borderRadius: "9999px",
    color: dis ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.5)", cursor: dis ? "not-allowed" : "pointer",
    fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 12px",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", position: "relative", border: "1px solid rgba(255,255,255,.08)", borderRadius: "1rem", overflow: "hidden", background: "#0d0d0d", marginTop: "4px", width: "100%" }}>
      {voiceGenerating && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", overflow: "hidden", zIndex: 20, background: "rgba(168,85,247,.08)" }}>
          <div style={{ position: "relative", top: 0, left: "-35%", width: "35%", height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,1), transparent)", boxShadow: "0 0 18px rgba(168,85,247,.95)", animation: "voiceLoading 1s linear infinite" }} />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderBottom: "1px solid rgba(255,255,255,.06)", background: "#111", gap: "6px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <button style={tbBtn(!canUndo)} disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)">↩ Undo</button>
          <button style={tbBtn(!canRedo)} disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Y)">↪ Redo</button>



          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,.08)", flexShrink: 0 }} />
<span style={{ fontSize: "10px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".04em" }}>accent</span>
<select value={accent} onChange={(e) => setaccent(e.target.value)} style={{ background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: "9999px", color: "rgba(255,255,255,.75)", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 12px", cursor: "pointer", outline: "none" }}>
  {[["british", "🇬🇧 British"], ["american", "🇺🇸 American"], ["australian", "🇦🇺 Australian"], ["indian", "🇮🇳 Indian"], ["canadian", "🇨🇦 Canadian"]].map(([val, label]) => (
    <option key={val} value={val}>{label}</option>
  ))}
</select>

<div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,.08)", flexShrink: 0 }} />
<span style={{ fontSize: "10px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".04em" }}>age</span>
<select value={age} onChange={(e) => setAge(e.target.value)} style={{ background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: "9999px", color: "rgba(255,255,255,.75)", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 12px", cursor: "pointer", outline: "none" }}>
  {[ ["young", "Young"], ["mid", "Middle-aged"], ["senior", "Senior"]].map(([val, label]) => (
    <option key={val} value={val}>{label}</option>
  ))}
</select>

<div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,.08)", flexShrink: 0 }} />
<span style={{ fontSize: "10px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".04em" }}>gender</span>
<select value={gender} onChange={(e) => setGender(e.target.value)} style={{ background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: "9999px", color: "rgba(255,255,255,.75)", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 12px", cursor: "pointer", outline: "none" }}>
  {[ ["male", "Male"], ["female", "Female"], ["neutral", "Neutral"]].map(([val, label]) => (
    <option key={val} value={val}>{label}</option>
  ))}
</select>

<div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,.08)", flexShrink: 0 }} />
<span style={{ fontSize: "10px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".04em" }}>Tone</span>
<select value={tone} onChange={(e) => setTone(e.target.value)} style={{ background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: "9999px", color: "rgba(255,255,255,.75)", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 12px", cursor: "pointer", outline: "none" }}>
  {[["conversational", "Conversational"], ["advertising", "Advertising"], ["social_media", "Social Media"]].map(([val, label]) => (
    <option key={val} value={val}>{label}</option>
  ))}
</select>

<div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,.08)", flexShrink: 0 }} />
<select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} style={{ background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: "9999px", color: "rgba(255,255,255,.75)", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 12px", cursor: "pointer", outline: "none" }}>
  {VOICES.filter(v => v.accent === accent && v.tone.includes(tone) && v.age === age && v.gender === gender).map(v => (
    <option key={v.value} value={v.value}>{v.label}</option>
  ))}
</select>

<button onClick={() => { setaccent(DEFAULT_accent); setTone(DEFAULT_TONE); setSelectedVoice(DEFAULT_VOICE); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,.25)", cursor: "pointer", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 6px", borderRadius: "9999px" }} title="Reset filters">↺ Reset</button>

<button onClick={generateVoiceOver} disabled={voiceGenerating}
  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  style={{ background: "none", border: "1px solid rgba(255,255,255,.07)", borderRadius: "9999px", color: "rgb(255,255,255)", cursor: voiceGenerating ? "not-allowed" : "pointer", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 12px", opacity: voiceGenerating ? 0.5 : 1 }}>
  🎙 {voiceGenerating ? "Generating…" : "Generate Voice"}
</button>


          {audioSrc && !showPlayer && !voiceGenerating && (
            <button onClick={() => setShowPlayer(true)} style={{ background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.3)", borderRadius: "9999px", color: "rgba(200,160,255,.9)", cursor: "pointer", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 12px" }}>▶ Show Player</button>
          )}
          <button onClick={() => setShowVideoTypePicker(true)} disabled={visualizing}
  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  style={{ background: "none", border: "1px solid rgba(255,255,255,.07)", borderRadius: "9999px", color: "rgb(255,255,255)", cursor: visualizing ? "not-allowed" : "pointer", fontSize: "11px", fontFamily: "'Inter',sans-serif", padding: "4px 12px", opacity: visualizing ? 0.5 : 1 }}>
   {visualizing ? "Visualising…" : "Visualise"}
</button>

{showVideoTypePicker && (
  <VideoTypeModal
    onSelect={(videoType) => { setShowVideoTypePicker(false); generateStoryboard(videoType); }}
    onClose={() => setShowVideoTypePicker(false)}
  />
)}

        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,.2)" }}>{wordCount} words</span>
           <FactChecker getScript={() => rawMarkdownRef.current ?? ""} />  
          <button style={{ ...tbBtn(false), color: copied ? "#6fcf97" : "rgba(255,255,255,.5)" }} onClick={copy}>{copied ? "✓ Copied" : "⧉ Copy"}</button>
        </div>
      </div>

      <div ref={canvasRef} contentEditable suppressContentEditableWarning spellCheck={false}
        onMouseUp={onMouseUp} onKeyDown={onKeyDown} onInput={onInput}
        data-placeholder="Your script will appear here. Edit freely, or select text for AI options."
        style={{ minHeight: "300px", padding: "20px 24px", outline: "none", color: "rgba(255,255,255,.87)", fontFamily: "'Inter',sans-serif", fontSize: "14px", lineHeight: 1.8, wordBreak: "break-word", caretColor: "rgba(255,255,255,.6)", overflowY: "auto" }}
      />

      {showPlayer && audioSrc && (
  <div style={{ padding: "0 16px 16px" }}>
    <AudioPlayer
      src={audioSrc}
      filename={buildVoiceoverFilename()}
      wordTimings={wordTimings}
      sceneSegments={sceneSegments}
      onTimeUpdate={setCurrentTime}
      onClose={() => setShowPlayer(false)}
      onAudioStarted={() => {
        setVoiceGenerating(false);
      }}
    />
  </div>
)}
      {showStoryboard && (
  <div style={{ padding: "0 16px 16px" }}>
    <StoryboardPanel
      images={storyboardImages}
      // finalVideo={finalStoryboardVideo}
      totalScenes={storyboardTotal}
      status={storyboardStatus}
      onClose={() => setShowStoryboard(false)}
    />
  </div>
)}


      <ScriptFloatingMenu position={menuPos} onAction={handleAction} onClose={() => setMenuPos(null)} isLoading={loading} />

      <style>{`
        [contenteditable]:empty::before{content:attr(data-placeholder);color:rgba(255,255,255,.18);font-style:italic;pointer-events:none;}
        [contenteditable] ::selection{background:rgba(139,92,246,.3);}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ai-highlight{background:rgba(139,92,246,.28);border-radius:3px;padding:0 2px;box-shadow:0 0 0 1.5px rgba(139,92,246,.5);transition:background .7s ease,box-shadow .7s ease;}
        .ai-highlight-fade{background:transparent!important;box-shadow:none!important;}
        @keyframes aiIn{from{background:rgba(139,92,246,.45)}to{background:rgba(139,92,246,.28)}}
        .ai-highlight{animation:aiIn .3s ease;}
        @keyframes voiceLoading { 0%{left:-35%} 100%{left:100%} }
      `}</style>
    </div>
  );
};

// ── Copy Button ────────────────────────────────────────────────
const CopyButton = ({ editableRef }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await safeWriteClipboard(editableRef.current?.innerText ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.warn("Clipboard write failed:", err); }
  };
  return (
    <button onClick={handleCopy} title="Copy response" style={{ backgroundColor: "#1f1f1f", border: "1px solid rgba(255,255,255,.07)", borderRadius: "9999px", color: copied ? "#6fcf97" : "rgba(255,255,255,.5)", cursor: "pointer", fontSize: "12px", fontFamily: "'Inter',sans-serif", fontWeight: 500, padding: "5px 14px", transition: "color .2s,background .2s" }}>
      {copied ? "✓ Copied" : "⧉ Copy"}
    </button>
  );
};

// ── BotMessage ─────────────────────────────────────────────────
const BotMessage = ({ msg, onFeedback, isLatestBot }) => {
  const editableRef = useRef(null);
  return (
    <div className="feedback-row-rating">
      {/* FIX: scale was 0.3 (extreme); corrected to 0.93 */}
      <button
        style={{ backgroundColor: "#1f1f1f", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", transition: "all .15s ease" }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6fcf97")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1f1f1f")}
        onClick={() => {
          const saved = msg.id ? (() => {
            try {
              const h = localStorage.getItem(scriptKey(msg.id));
              if (h) { const d = document.createElement("div"); d.innerHTML = h; return d.innerText; }
            } catch { }
            return null;
          })() : null;
          const editedText = saved || editableRef.current?.innerText || msg.content;
          onFeedback(1, msg.prompt, editedText);
        }}
      >🛢️</button>
          {/* Every bot message — old or new — gets the full ScriptCanvas UI */}
      <ScriptCanvas content={msg.content} msgId={msg.id} />
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────
const getFileIcon = (file) => {
  if (file.type?.startsWith("image/")) return "🖼️";
  if (file.type === "application/pdf") return "📕";
  if (file.name?.endsWith(".docx")) return "📝";
  if (file.name?.endsWith(".xlsx")) return "📊";
  if (file.name?.endsWith(".pptx")) return "📋";
  if (file.name?.endsWith(".csv")) return "📊";
  return "📄";
};

const formatList = (v) => {
  if (!v || v.length === 0) return "";
  if (Array.isArray(v)) return v.join(", ");
  return v;
};

const EditableTag = ({ value, color, borderColor, textColor, onChange, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const commit = () => { setEditing(false); if (draft.trim()) onChange(draft.trim()); else onDelete(); };
  if (editing) return (
    <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
      <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        style={{ flex: 1, background: "#000", border: `1px solid ${borderColor}`, borderRadius: "9999px", color, fontSize: "12px", fontFamily: "'Inter',sans-serif", padding: "4px 12px", outline: "none" }} />
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
      <span onClick={() => setEditing(true)} title="Click to edit" style={{ fontSize: "12px", color: textColor, lineHeight: 1.5, cursor: "text", flex: 1, fontFamily: "'Inter',sans-serif" }}>• {value}</span>
      <button onClick={onDelete} title="Remove" style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", fontSize: "11px", padding: "0 2px", lineHeight: 1 }}>✕</button>
    </div>
  );
};

const EditableList = ({ items, setItems, label, color, bgColor, borderColor, textColor }) => {
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);
  const addRef = useRef(null);
  useEffect(() => { if (adding) addRef.current?.focus(); }, [adding]);
  const commitAdd = () => { if (newItem.trim()) setItems([...items, newItem.trim()]); setNewItem(""); setAdding(false); };
  return (
    <div style={{ background: bgColor, borderRadius: "14px", padding: "12px 14px", border: `1px solid ${borderColor}` }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color, marginBottom: "8px", letterSpacing: "1.2px", textTransform: "uppercase", fontFamily: "'Manrope',sans-serif" }}>{label}</div>
      {items.map((item, i) => (
        <EditableTag key={i} value={item} color={color} borderColor={borderColor} textColor={textColor}
          onChange={(v) => setItems(items.map((x, j) => j === i ? v : x))}
          onDelete={() => setItems(items.filter((_, j) => j !== i))} />
      ))}
      {adding ? (
        <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
          <input ref={addRef} value={newItem} onChange={(e) => setNewItem(e.target.value)} onBlur={commitAdd}
            onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Type and press Enter…"
            style={{ flex: 1, background: "#000", border: `1px solid ${borderColor}`, borderRadius: "9999px", color: textColor, fontSize: "12px", fontFamily: "'Inter',sans-serif", padding: "4px 12px", outline: "none" }} />
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ background: "none", border: `1px dashed ${borderColor}`, borderRadius: "9999px", color, fontSize: "11px", fontFamily: "'Inter',sans-serif", cursor: "pointer", padding: "4px 12px", marginTop: "6px", opacity: .6, width: "100%" }}>+ Add</button>
      )}
    </div>
  );
};

const InlineNarrativeReviewPanel = ({ reviewData, onGenerate, isGenerating }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: "8px", maxWidth: "520px" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "7px",
          background: open ? "rgba(139,92,246,.18)" : "rgba(139,92,246,.10)",
          border: "1px solid rgba(139,92,246,.35)", borderRadius: "9999px",
          padding: "5px 13px 5px 10px", cursor: "pointer",
          fontFamily: "'Inter',sans-serif", fontSize: "12px",
          color: "rgba(200,180,255,.9)", transition: "background .15s",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="4" stroke="rgba(180,150,255,.8)" strokeWidth="1.3"/>
          <path d="M4 6.5h5M6.5 4v5" stroke="rgba(180,150,255,.8)" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        ◈ Human Review — ready
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(180,150,255,.7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          marginTop: "8px",
          background: "rgba(19,19,19,.95)",
          border: "1px solid rgba(139,92,246,.25)",
          borderRadius: "1.1rem",
          padding: "16px 18px",
          maxHeight: "420px",
          overflowY: "auto",
        }}>
          <NarrativeReviewPanel
            reviewData={reviewData}
            onGenerate={(payload) => onGenerate(payload, reviewData._promptContext)}
            isGenerating={isGenerating}
          />
        </div>
      )}
    </div>
  );
};

const InlineResearchPanel = ({ research, onResearchChange, transcriptCount }) => {
  const [open, setOpen] = useState(false);
  const [projIntel, setProjIntel] = useState(research.project_intelligence ?? "");
  const [summary, setSummary] = useState(research.niche_summary ?? research.niche_summary_title ?? "");
  const [hooks, setHooks] = useState(research.winning_hooks ?? []);
  const [pains, setPains] = useState(research.top_pain_points ?? []);
  const [angle, setAngle] = useState(research.recommended_angle ?? "");

  useEffect(() => {
    onResearchChange({ ...research, project_intelligence: projIntel, niche_summary: summary, winning_hooks: hooks, top_pain_points: pains, recommended_angle: angle });
  }, [projIntel, summary, hooks, pains, angle]); // eslint-disable-line

  const ss = { background: "#0a0a0a", borderRadius: "14px", padding: "12px 16px", marginBottom: "10px", border: "1px solid rgba(255,255,255,.06)" };
  const ls = { fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Manrope',sans-serif" };
  const ta = { width: "100%", background: "transparent", border: "none", fontSize: "13px", fontFamily: "'Inter',sans-serif", lineHeight: 1.6, resize: "vertical", outline: "none", padding: 0, boxSizing: "border-box", color: "rgba(255,255,255,.72)" };

  return (
    <div style={{ marginTop: "8px", maxWidth: "520px" }}>
      <button onClick={() => setOpen(v => !v)} style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: open ? "rgba(139,92,246,.18)" : "rgba(139,92,246,.10)", border: "1px solid rgba(139,92,246,.35)", borderRadius: "9999px", padding: "5px 13px 5px 10px", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "rgba(200,180,255,.9)", transition: "background .15s" }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(180,150,255,.8)" strokeWidth="1.3" /><line x1="8.8" y1="8.8" x2="11.5" y2="11.5" stroke="rgba(180,150,255,.8)" strokeWidth="1.3" strokeLinecap="round" /></svg>
        {/* Research — {transcriptCount ?? 0} sources analyzed */}
        Research Completed: Click to view and edit the research data. You can modify the project intelligence, niche summary, winning hooks, pain points, and recommended angle. Changes will be reflected when you hit Generate Script.
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}><path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(180,150,255,.7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div style={{ marginTop: "8px", background: "rgba(19,19,19,.95)", border: "1px solid rgba(139,92,246,.25)", borderRadius: "1.1rem", padding: "16px 18px", maxHeight: "420px", overflowY: "auto" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,.35)", fontFamily: "'Inter',sans-serif", marginBottom: "14px" }}>Edit anything below — changes are picked up when you hit Generate Script.</div>
          {projIntel !== undefined && <div style={{ ...ss, borderLeft: "2px solid rgba(255,255,255,.18)" }}><div style={{ ...ls, color: "rgba(255,255,255,.4)" }}>Project Intelligence</div><textarea value={projIntel} onChange={(e) => setProjIntel(e.target.value)} rows={Math.min(10, (projIntel.match(/\n/g) || []).length + 3)} style={ta} /></div>}
          {summary !== undefined && <div style={{ ...ss, borderLeft: "2px solid rgba(255,255,255,.10)" }}><div style={{ ...ls, color: "rgba(255,255,255,.35)" }}>Niche Summary</div><textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} style={ta} /></div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <EditableList items={hooks} setItems={setHooks} label="Winning Hooks" color="rgba(255,255,255,.55)" bgColor="#111" borderColor="rgba(255,255,255,.08)" textColor="rgba(255,255,255,.75)" />
            <EditableList items={pains} setItems={setPains} label="Pain Points" color="rgba(255,255,255,.4)" bgColor="#0e0e0e" borderColor="rgba(255,255,255,.06)" textColor="rgba(255,255,255,.6)" />
          </div>
          {angle !== undefined && <div style={{ background: "#111", borderRadius: "14px", padding: "10px 14px", border: "1px solid rgba(255,255,255,.07)", borderLeft: "2px solid rgba(255,255,255,.22)" }}><div style={{ ...ls, color: "rgba(255,255,255,.45)" }}>Recommended Angle</div><textarea value={angle} onChange={(e) => setAngle(e.target.value)} rows={2} style={ta} /></div>}
        </div>
      )}
    </div>
  );
};

// FIX: Replaced spinning emoji with an SVG spinner — emoji rotation renders inconsistently across platforms
const ResearchingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", borderRadius: "9999px", background: "#1A1A1A", border: "1px solid rgba(255,255,255,.07)", maxWidth: "300px", margin: "8px 0", boxShadow: "0 4px 20px rgba(0,0,0,.5)" }}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, animation: "spin 1s linear infinite" }}>
      <circle cx="8" cy="8" r="6.5" stroke="rgba(255,255,255,.1)" strokeWidth="1.5" />
      <path d="M8 1.5A6.5 6.5 0 0 1 14.5 8" stroke="rgba(139,92,246,.9)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <div>
      <div style={{ fontSize: "13px", color: "#e5e5e5", fontWeight: 600, fontFamily: "'Manrope',sans-serif" }}>Researching…</div>
      <div style={{ fontSize: "11px", color: "rgba(255,255,255,.35)", marginTop: "2px", fontFamily: "'Inter',sans-serif" }}>Searching web + analysing YouTube</div>
    </div>
  </div>
);

const ReviewingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", borderRadius: "9999px", background: "#1A1A1A", border: "1px solid rgba(139,92,246,.2)", maxWidth: "300px", margin: "8px 0", boxShadow: "0 4px 20px rgba(0,0,0,.5)" }}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, animation: "spin 1s linear infinite" }}>
      <circle cx="8" cy="8" r="6.5" stroke="rgba(139,92,246,.15)" strokeWidth="1.5" />
      <path d="M8 1.5A6.5 6.5 0 0 1 14.5 8" stroke="rgba(139,92,246,.9)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <div>
      <div style={{ fontSize: "13px", color: "#e5e5e5", fontWeight: 600, fontFamily: "'Manrope',sans-serif" }}>Reviewing…</div>
      <div style={{ fontSize: "11px", color: "rgba(255,255,255,.35)", marginTop: "2px", fontFamily: "'Inter',sans-serif" }}>Extracting narrative essence</div>
    </div>
  </div>
);

const FilePreviewModal = ({ previewFile, onClose }) => {
  if (!previewFile) return null;
  const isImage = previewFile.type?.startsWith("image/");
  const isPDF = previewFile.type === "application/pdf";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={onClose}>
      <div style={{ background: "#0d0d0d", borderRadius: "1.5rem", padding: "24px", maxWidth: "90vw", maxHeight: "85vh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: "16px", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 24px 80px rgba(0,0,0,.9)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: "14px", color: "#e5e5e5", fontFamily: "'Manrope',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getFileIcon({ name: previewFile.name, type: previewFile.type })} {previewFile.name}</span>
          <button onClick={onClose} style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.6)", borderRadius: "9999px", padding: "5px 14px", cursor: "pointer", fontSize: "12px", fontFamily: "'Inter',sans-serif", flexShrink: 0, marginLeft: "16px" }}>✕ Close</button>
        </div>
        <div style={{ overflow: "auto", flex: 1, borderRadius: "12px" }}>
          {isImage && <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", display: "block", margin: "0 auto" }} />}
          {isPDF && <iframe src={previewFile.url} title={previewFile.name} style={{ width: "100%", height: "70vh", border: "none", borderRadius: "12px" }} />}
          {!isImage && !isPDF && (
            <div style={{ color: "rgba(255,255,255,.4)", textAlign: "center", padding: "48px", fontSize: "14px", fontFamily: "'Inter',sans-serif" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>{getFileIcon({ name: previewFile.name, type: previewFile.type })}</div>
              <div style={{ color: "rgba(255,255,255,.7)" }}>{previewFile.name}</div>
              <a href={previewFile.url} download={previewFile.name} style={{ display: "inline-block", marginTop: "16px", color: "rgba(255,255,255,.55)", fontSize: "13px" }}>↓ Download to view</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FileChips = ({ fileList, onRemove, onPreview }) => (
  <div className="file-chip-row">
    {fileList.map((f, idx) => (
      <div key={idx} className="file-chip">
        <span onClick={() => onPreview(f)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }} title="Click to preview">{getFileIcon(f)} {f.name}</span>
        {onRemove && <button onClick={() => onRemove(idx)}>✕</button>}
      </div>
    ))}
  </div>
);

function reconstructMessage(m) {
  const researchId = m.metadata?.research_id ?? null;
  return {
    id: m.id ?? crypto.randomUUID(),
    sender: m.role === "assistant" ? "bot" : "user",
    text: m.content,
    content: m.content,
    rawPrompt: m.raw_prompt ?? m.content,
    prompt: m.prompt ?? "",
    files: [],
    researchPending: false,
    researchData: null,
    transcriptCount: 0,
    // hideText: !!researchId,
    hideText: false,  
    researchLoading: !!researchId,
    researchId,
  };
}

function dedupeById(msgs) {
  const seen = new Map();
  for (const m of msgs) seen.set(m.id, m);
  return Array.from(seen.values());
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline error banner — replaces fixed-positioned error divs
// ─────────────────────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
  <div style={{ color: "rgba(255,100,100,.9)", fontSize: "13px", fontFamily: "'Inter',sans-serif", background: "rgba(255,50,50,.06)", padding: "8px 16px", borderRadius: "9999px", border: "1px solid rgba(255,50,50,.15)", margin: "6px 0" }}>
    ⚠️ {message}
  </div>
);


// ── Main ChatWindow ────────────────────────────────────────────
const isDraftId = (id) => typeof id === "string" && id.startsWith("draft-");



const STAGE_DEFINITIONS = [
  { key: "research",  label: "Research",   match: ["Searching for internal inspirations", "Using approved creative direction"] },
  { key: "distill",   label: "Distilling", match: ["Preparing semantic inspirations"] },
  { key: "voiceover", label: "Voiceover",  match: ["Drafting voiceover script"] },
  { key: "visuals",   label: "Visuals",    match: ["Planning visuals"] },
  {
    key: "polish",
    label: "Polishing",
    match: ["Refining and building table"],
    subMessages: [
      "Refining and building table…",
      "Found a few things to tighten up…",
      "Polishing final touches, please wait…",
    ],
    subInterval: 13000,
  },
];

function computeStageState(log) {
  let activeIndex = -1;
  const completed = new Set();
  for (const line of log) {
    const idx = STAGE_DEFINITIONS.findIndex((s) => s.match.some((m) => line.includes(m)));
    if (idx !== -1) {
      if (activeIndex !== -1 && activeIndex !== idx) completed.add(activeIndex);
      activeIndex = idx;
    }
  }
  return { activeIndex, completed };
}

const ActiveSubMessage = ({ messages, interval }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!messages || messages.length <= 1) return;
    const id = setInterval(() => {
      setIdx((prev) => Math.min(prev + 1, messages.length - 1));
    }, interval);
    return () => clearInterval(id);
  }, [messages, interval]);

  if (!messages?.length) return null;

  return (
    <div
      style={{
        fontSize: "11.5px",
        fontFamily: "'Inter',sans-serif",
        color: "rgba(200,180,255,.7)",
        textAlign: "center",
        marginTop: "10px",
      }}
    >
      {messages[idx]}
    </div>
  );
};

const PipelineStages = ({ isStreaming, log }) => {
  if (!isStreaming && !log?.length) return null;

  const { activeIndex, completed } = computeStageState(log || []);
  const effectiveActive = activeIndex === -1 && isStreaming ? 0 : activeIndex;
  const isDone = !isStreaming && activeIndex === STAGE_DEFINITIONS.length - 1;
  const activeStage = effectiveActive !== -1 ? STAGE_DEFINITIONS[effectiveActive] : null;

  return (
    <div
      style={{
        padding: "14px 18px",
        margin: "8px 0",
        maxWidth: "560px",
        background: "rgba(19,19,19,.9)",
        border: "1px solid rgba(139,92,246,.2)",
        borderRadius: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0" }}>
        {STAGE_DEFINITIONS.map((stage, i) => {
          const isActive = i === effectiveActive && isStreaming;
          const isCompleted = completed.has(i) || i < effectiveActive || isDone;
          const isLast = i === STAGE_DEFINITIONS.length - 1;

          return (
            <div key={stage.key} style={{ display: "flex", alignItems: "center", flex: isLast ? "0 0 auto" : "1 1 auto" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: "54px" }}>
                <div
                  style={{
                    position: "relative",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontFamily: "'Inter',sans-serif",
                    fontWeight: 600,
                    transition: "all .3s ease",
                    background: isCompleted ? "rgba(139,92,246,.9)" : isActive ? "rgba(139,92,246,.18)" : "rgba(255,255,255,.05)",
                    border: isCompleted ? "1px solid rgba(139,92,246,.9)" : isActive ? "1px solid rgba(139,92,246,.8)" : "1px solid rgba(255,255,255,.12)",
                    color: isCompleted ? "#fff" : isActive ? "rgba(200,180,255,.95)" : "rgba(255,255,255,.3)",
                  }}
                >
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        inset: "-4px",
                        borderRadius: "50%",
                        border: "1.5px solid rgba(139,92,246,.6)",
                        animation: "stagePulse 1.4s ease-out infinite",
                      }}
                    />
                  )}
                  {isCompleted ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    fontSize: "10.5px",
                    fontFamily: "'Inter',sans-serif",
                    fontWeight: isActive ? 600 : 500,
                    color: isCompleted ? "rgba(200,180,255,.85)" : isActive ? "rgba(220,200,255,.95)" : "rgba(255,255,255,.3)",
                    whiteSpace: "nowrap",
                    transition: "color .3s ease",
                  }}
                >
                  {stage.label}
                </span>
              </div>
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: "1.5px",
                    marginTop: "-16px",
                    background: isCompleted ? "rgba(139,92,246,.7)" : "rgba(255,255,255,.1)",
                    transition: "background .4s ease",
                    minWidth: "16px",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {isStreaming && activeStage?.subMessages && (
        <ActiveSubMessage key={activeStage.key} messages={activeStage.subMessages} interval={activeStage.subInterval} />
      )}
    </div>
  );
};


const EditReasoning = ({ isStreaming, log, duration }) => {
  const [open, setOpen] = useState(true);
  const wasStreamingRef = useRef(isStreaming);

  useEffect(() => {
    if (isStreaming) {
      setOpen(true);
    } else if (wasStreamingRef.current && !isStreaming) {
      const t = setTimeout(() => setOpen(false), 1000);
      return () => clearTimeout(t);
    }
    wasStreamingRef.current = isStreaming;
  }, [isStreaming]);

  return (
    <div style={{ margin: "8px 0", maxWidth: "520px" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative", overflow: "hidden",
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(139,92,246,.10)",
          border: "1px solid rgba(139,92,246,.3)",
          borderRadius: "9999px", padding: "6px 14px", cursor: "pointer",
          fontFamily: "'Inter',sans-serif", fontSize: "12px",
          color: "rgba(200,180,255,.85)",
        }}
      >
        {isStreaming && (
          <span
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, transparent, rgba(139,92,246,.35), transparent)",
              backgroundSize: "200% 100%",
              animation: "reasoningShimmer 1.6s linear infinite",
            }}
          />
        )}
        <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="4" stroke="rgba(180,150,255,.8)" strokeWidth="1.3" />
            <path d="M4 6.5h5M6.5 4v5" stroke="rgba(180,150,255,.8)" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {isStreaming ? "Thinking…" : `Thought for ${duration ?? 0}s`}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ position: "relative", zIndex: 1, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(180,150,255,.7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && log?.length > 0 && (
        <div
          style={{
            marginTop: "6px", background: "rgba(19,19,19,.9)", border: "1px solid rgba(139,92,246,.2)",
            borderRadius: "12px", padding: "10px 14px", fontSize: "12px", fontFamily: "'Inter',sans-serif",
            color: "rgba(255,255,255,.55)",
          }}
        >
          {log[log.length - 1]}
        </div>
      )}
    </div>
  );
};

const GenerationProgress = ({ isStreaming, log }) => {
  if (isStreaming) {
    return <PipelineStages isStreaming={true} log={log} />;
  }

  if (log?.length > 0) {
    return <PipelineStages isStreaming={false} log={log} />;
  }

  return null;
};

function ChatWindow() {
  const {
    conversationId, setConversationId,
    getMessages, setMessagesForConversation, addMessage, updateLastMessage,
    migrateConversation,
    isGenerating, startGenerating, stopGenerating,
    activeStreamTextByConversation, setStreamText, clearStreamText,
    pipelineStatusByConversation, setPipelineStatus, clearPipelineStatus,   // ← add
    loadConversations, getAuthHeaders,
  } = useChat();

  const messages   = getMessages(conversationId);
  const streaming  = isGenerating(conversationId);
  const activeStreamText = (conversationId && activeStreamTextByConversation[conversationId]) || "";
  const pipelineStatus = (conversationId && pipelineStatusByConversation[conversationId]) || null;  // ← add

  const [input,             setInput]            = useState("");
  const [files,             setFiles]            = useState([]);
  const dragCounterRef    = useRef(0);
  const [isDragging,        setIsDragging]       = useState(false);
  const [previewFile,       setPreviewFile]      = useState(null);
  const [selectedClient,    setSelectedClient]   = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState("");
  const [selectedServiceLines, setSelectedServiceLines] = useState("")
  const [selectedStyles, setSelectedStyles] = useState("")
  const [selectedBU,        setSelectedBU]       = useState("");
  const [selectedVideoType, setSelectedVideoType] = useState("");
  const [selectedVideoTone, setSelectedVideoTone] = useState("");
  const [selectedDuration,  setSelectedDuration] = useState("");
  const [sliderValue,       setSliderValue]      = useState(50);
  const [isResearching,     setIsResearching]    = useState(false);
  const [editedResearch,    setEditedResearch]   = useState(null);
  const [researchId,        setResearchId]       = useState(null);
  const [researchError,     setResearchError]    = useState(null);
  const [researchPrompt,    setResearchPrompt]   = useState("");

  // Creative review state
  const [narrativeReview,   setNarrativeReview]  = useState(null);
  const [narrativeLoading,  setNarrativeLoading] = useState(false);
  const [narrativeError,    setNarrativeError]   = useState(null);
  const [pipelineLogs, setPipelineLogs] = useState({});
  const [pipelineDurations, setPipelineDurations] = useState({});
  const pipelineStartRef = useRef(new Map());
  const pipelineLog = (conversationId && pipelineLogs[conversationId]) || [];
  const pipelineDuration = (conversationId && pipelineDurations[conversationId]) || 0;

  // Per-conversation abort controllers — never a single shared controller,
  // so switching chats doesn't kill background generation.
  const convAbortControllers = useRef(new Map());

  const conversationIdRef  = useRef(conversationId);
  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);

  const lastPromptRef  = useRef("");
  const lastOutputRef  = useRef("");
  const chatEndRef     = useRef(null);
  const fileInputRef   = useRef(null);
  const chatHistoryRef = useRef(null);
  const loadingRef     = useRef(false);

  // Per-conversation pagination bookkeeping (ChatWindow-local, doesn't need context)
  const pageByConv    = useRef(new Map());
  const hasMoreByConv = useRef(new Map());
  const loadedConvs   = useRef(new Set());
  const [loadingMessages, setLoadingMessages] = useState(false);

  const isEmpty   = messages.length === 0 && !loadingMessages;
  const lastBotId = [...messages].reverse().find(m => m.sender === "bot")?.id ?? null;


  // ── Creative Review ────────────────────────────────────────────
  const runCreativeReview = async () => {
    if (!input.trim()) return;

    const rawInput = input;
    const cf = [...files];
    setInput("");
    setFiles([]);

    setNarrativeLoading(true);
    setNarrativeReview(null);
    setNarrativeError(null);

    const fpd = cf.map((f) => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }));

    const isNewChat = !conversationId;
    const targetConvId = conversationId || `draft-${crypto.randomUUID()}`;
    if (isNewChat) setConversationId(targetConvId);

    const uid = crypto.randomUUID();
    addMessage(targetConvId, {
      id: uid, sender: "user", text: rawInput, content: rawInput, rawPrompt: rawInput, prompt: "",
      files: fpd, researchPending: false, reviewPending: true, researchData: null, hideText: false,
      researchLoading: false, researchId: null, _reviewId: uid,
    });

    const fd = new FormData();
    fd.append("prompt", rawInput);
    fd.append("client", formatList(selectedClient));
    fd.append("industries", formatList(selectedIndustries));
    fd.append("serviceLines", formatList(selectedServiceLines));
    fd.append("styles", formatList(selectedStyles));
    fd.append("business_unit", formatList(selectedBU));
    fd.append("video_type", formatList(selectedVideoType));
    fd.append("video_tone", formatList(selectedVideoTone));
    fd.append("duration", selectedDuration);
    fd.append("creativity_ratio", sliderValue / 100);
    // if (!isNewChat) fd.append("conversation_id", targetConvId);
    if (!isDraftId(targetConvId)) fd.append("conversation_id", targetConvId);
    cf.forEach((f) => fd.append("files", f));

    const patch = (p) =>
      setMessagesForConversation(targetConvId, (prev) =>
        dedupeById(prev.map((m) => (m._reviewId === uid ? { ...m, ...p } : m)))
      );

    try {
      const res = await fetch(`${API_BASE_URL}/creative-review`, { method: "POST", body: fd });
      const data = await res.json();

      if (data.review_id) {
        patch({
          reviewPending: false,
          researchPending: false,
          narrativeReviewData: {
            ...data,
            _promptContext: {
              rawInput, cf,
              client:        formatList(selectedClient),
              industries:    formatList(selectedIndustries),
              serviceLines:  formatList(selectedServiceLines),
              business_unit: formatList(selectedBU),
              styles:        formatList(selectedStyles),
              video_type:    formatList(selectedVideoType),
              video_tone:    formatList(selectedVideoTone),
              duration:      selectedDuration,
              sliderValue,
            },
          },
        });
        setNarrativeReview(null);
      } else {
        setNarrativeError(data.error || "Creative review failed");
        patch({ reviewPending: false });
      }
    } catch (err) {
      console.error("[runCreativeReview]", err);
      setNarrativeError("Could not reach server");
      patch({ researchPending: false });
    } finally {
      setNarrativeLoading(false);
    }
  };

  // ── Generate Approved Script (after creative review) ───────────
  const generateApprovedScript = async (approvedPayload, ctx, targetConvIdParam) => {
    if (!ctx) return;
    const { rawInput, cf, styles, serviceLines, industries, client, business_unit, video_type, video_tone, duration, sliderValue: sv } = ctx;

    setNarrativeReview(null);

    let targetConvId = targetConvIdParam || conversationId;
    const isNewChat = !targetConvId;
    if (isNewChat) {
      targetConvId = `draft-${crypto.randomUUID()}`;
      setConversationId(targetConvId);
    }

    const botId = crypto.randomUUID();
    addMessage(targetConvId, { id: botId, sender: "bot", text: "", content: "", prompt: "", files: [] });

    setStreamText(targetConvId, "");
    startGenerating(targetConvId);
    pipelineStartRef.current.set(targetConvId, Date.now());
    setPipelineLogs(prev => ({ ...prev, [targetConvId]: [] }));

    convAbortControllers.current.get(targetConvId)?.abort();
    const ctrl = new AbortController();
    convAbortControllers.current.set(targetConvId, ctrl);

    const fd = new FormData();
    fd.append("prompt",                    rawInput);
    fd.append("review_id",                 approvedPayload.review_id || "");
    fd.append("approved_retrievals",       JSON.stringify(approvedPayload.approved_retrievals || []));
    fd.append("approved_essences",         JSON.stringify(approvedPayload.approved_essences || []));
    fd.append("approved_interpretations",  JSON.stringify(approvedPayload.approved_interpretations || []));
    fd.append("creative_summary", approvedPayload.approved_creative_summary || "");
    fd.append("industries",                industries);
    fd.append("serviceLines",            serviceLines);
    fd.append("client",          client);
    fd.append("business_unit",   business_unit);
    fd.append("video_type",      video_type);
    fd.append("styles",          styles);
    fd.append("video_tone",      video_tone);
    fd.append("duration",        duration);
    fd.append("creativity_ratio", sv / 100);
    // if (!isNewChat) fd.append("conversation_id", targetConvId);
    if (!isDraftId(targetConvId)) fd.append("conversation_id", targetConvId);
    (cf || []).forEach((f) => fd.append("files", f));

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, { method: "POST", body: fd, signal: ctrl.signal, headers: getAuthHeaders() });
      const reader  = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false, fullText = "";

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (ctrl.signal.aborted) break;
        for (const line of decoder.decode(value || new Uint8Array(), { stream: true }).split("\n")) {
          if (line.startsWith("conversation_id:")) {
            const realId = line.replace("conversation_id:", "").trim();
            if (realId && realId !== targetConvId) {
              migrateConversation(targetConvId, realId);
              const c = convAbortControllers.current.get(targetConvId);
              if (c) { convAbortControllers.current.set(realId, c); convAbortControllers.current.delete(targetConvId); }
              targetConvId = realId;
              if (isNewChat) loadConversations();
            }
            continue;
          }
          // if (line.startsWith("status:")) { setPipelineStatus(targetConvId, line.replace("status:", "").trim()); continue; }
          if (line.startsWith("status:")) {
            const s = line.replace("status:", "").trim();
            setPipelineStatus(targetConvId, s);
            setPipelineLogs(prev => ({ ...prev, [targetConvId]: [...(prev[targetConvId] || []), s] }));
            continue;
          }
          if (line.startsWith("result:")) { fullText = line.replace("result:", "").trim(); continue; }
          if (line.startsWith("error:"))  { fullText = `⚠️ ${line.replace("error:", "").trim()}`; continue; }
          if (line.trim() && fullText)    fullText += "\n" + line;
        }
        setStreamText(targetConvId, fullText);
      }

      fullText = fullText.replace(/\\n/g, "\n");
      lastOutputRef.current = fullText;

stopGenerating(targetConvId);
      const started = pipelineStartRef.current.get(targetConvId);
      if (started) {
        setPipelineDurations(prev => ({ ...prev, [targetConvId]: Math.round((Date.now() - started) / 1000) }));
        pipelineStartRef.current.delete(targetConvId);
      }
      clearStreamText(targetConvId);
      // setPipelineStatus(null);
      clearPipelineStatus(targetConvId);

      updateLastMessage(targetConvId, fullText, rawInput);
      setMessagesForConversation(targetConvId, (prev) =>
        dedupeById(prev.map((m) => m.id === botId ? { ...m, content: fullText, text: fullText, prompt: rawInput } : m))
      );
      try { localStorage.setItem(scriptKey(botId), fullText ? markdownToHtml(fullText) : ""); } catch {}
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("[generateApprovedScript]", err);
      stopGenerating(targetConvId);
      clearStreamText(targetConvId);
      setMessagesForConversation(targetConvId, (prev) =>
        dedupeById(prev.map((m) => m.id === botId ? { ...m, content: "⚠️ Server error", text: "⚠️ Server error" } : m))
      );
    }
  };

  // ── Hydrate research from previous sessions ────────────────────
  const hydrateResearchMessages = useCallback(async (convId, msgList) => {
    const toH = msgList.filter(m => m.researchLoading && m.researchId);
    if (!toH.length) return;
    await Promise.all(toH.map(async (msg) => {
      try {
        const res = await fetch(`${API_BASE_URL}/research/${msg.researchId}`);
        const data = await res.json();
        setMessagesForConversation(convId, (prev) => dedupeById(prev.map(m => m.id === msg.id
          ? (data.success && data.research
            ? { ...m, researchLoading: false, researchData: data.research, transcriptCount: data.research.transcript_count ?? 0 }
            : { ...m, researchLoading: false })
          : m)));
      } catch {
        setMessagesForConversation(convId, (prev) => dedupeById(prev.map(m => m.id === msg.id ? { ...m, researchLoading: false } : m)));
      }
    }));
  }, [setMessagesForConversation]);

  const fetchMessages = useCallback(async (convId, pageNum) => {
    if (!convId || isDraftId(convId)) return;
    if (loadingRef.current) return;
    loadingRef.current = true; setLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE_URL}/messages?conversation_id=${convId}&page=${pageNum}&limit=20`);
      const data = await res.json();
      const fetched = Array.isArray(data.messages) ? data.messages : Array.isArray(data) ? data : [];
      hasMoreByConv.current.set(convId, fetched.length >= 20);
      const ordered = fetched.map(m => reconstructMessage(m));
      const isViewing = convId === conversationIdRef.current;

      if (pageNum === 1) {
        setMessagesForConversation(convId, dedupeById(ordered));
        loadedConvs.current.add(convId);
        pageByConv.current.set(convId, 1);
        if (isViewing) {
          requestAnimationFrame(() => requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: "auto" })));
        }
      } else {
        const c = isViewing ? chatHistoryRef.current : null;
        const ph = c?.scrollHeight || 0;
        setMessagesForConversation(convId, (prev) => dedupeById([...ordered, ...prev]));
        pageByConv.current.set(convId, pageNum);
        if (c) requestAnimationFrame(() => { c.scrollTop = c.scrollHeight - ph; });
      }
      hydrateResearchMessages(convId, ordered);
    } catch (err) { console.error("Failed to fetch messages:", err); }
    finally { setLoadingMessages(false); loadingRef.current = false; }
  }, [hydrateResearchMessages, setMessagesForConversation]);


  useEffect(() => {
  setInput(""); setFiles([]); setEditedResearch(null); setResearchId(null); setResearchError(null);
  if (!conversationId || isDraftId(conversationId)) return;
  if (loadedConvs.current.has(conversationId)) {
    requestAnimationFrame(() => requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: "auto" })));
    return;
  }
  // If this conversation is actively streaming (e.g. we just migrated from a
  // draft id mid-generation), local state already has the full picture —
  // fetching now would overwrite the in-progress bot message with a stale,
  // partial DB snapshot (assistant message isn't saved until the pipeline finishes).
  if (isGenerating(conversationId)) {
    loadedConvs.current.add(conversationId);
    return;
  }
  fetchMessages(conversationId, 1);
}, [conversationId, isGenerating]); // eslint-disable-line

  useEffect(() => {
    const c = chatHistoryRef.current;
    if (!c || !conversationId || isDraftId(conversationId)) return;
    const h = () => {
      const hasMore = hasMoreByConv.current.get(conversationId) ?? true;
      if (c.scrollTop <= 5 && hasMore && !loadingRef.current) {
        const nextPage = (pageByConv.current.get(conversationId) || 1) + 1;
        fetchMessages(conversationId, nextPage);
      }
    };
    c.addEventListener("scroll", h); return () => c.removeEventListener("scroll", h);
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (!messages.length) return; const c = chatHistoryRef.current; if (!c) return;
    if (c.scrollHeight - c.scrollTop - c.clientHeight < 150) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleDragEnter = (e) => { e.preventDefault(); dragCounterRef.current += 1; if (dragCounterRef.current === 1) setIsDragging(true); };
  const handleDragOver  = (e) => e.preventDefault();
  const handleDragLeave = (e) => { e.preventDefault(); dragCounterRef.current -= 1; if (dragCounterRef.current === 0) setIsDragging(false); };
  const handleDrop      = (e) => { e.preventDefault(); dragCounterRef.current = 0; setIsDragging(false); const d = Array.from(e.dataTransfer.files); if (d.length) setFiles(p => [...p, ...d]); };

  const openPreview  = (file) => { const url = file.url || URL.createObjectURL(file); setPreviewFile({ name: file.name, url, type: file.type }); };
  const closePreview = () => setPreviewFile(null);

  const sendFeedback = async (rating, prompt, output) => {
    const fd = new FormData();
    fd.append("prompt", prompt || lastPromptRef.current);
    fd.append("output", output || lastOutputRef.current);
    fd.append("rating", rating);
    await fetch(`${API_BASE_URL}/feedback`, { method: "POST", body: fd });
  };

  // ── Research ───────────────────────────────────────────────────
  const runResearch = async () => {
    if (!input.trim()) return;
    setIsResearching(true); setEditedResearch(null); setResearchId(null); setResearchError(null);

    const rawInput = input;
    setResearchPrompt(rawInput);
    const cf = [...files];
    const fpd = cf.map(f => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }));

    setInput(""); setFiles([]);

    const isNewChat = !conversationId;
    const targetConvId = conversationId || `draft-${crypto.randomUUID()}`;
    if (isNewChat) setConversationId(targetConvId);

    const bid = crypto.randomUUID();
    addMessage(targetConvId, {
      id: bid, sender: "user", text: rawInput, content: rawInput, rawPrompt: rawInput, prompt: "",
      files: fpd, researchPending: true, researchData: null, hideText: false, researchLoading: false,
      researchId: null, _researchId: bid,
    });

    const fd = new FormData();
    fd.append("creativity_ratio", sliderValue / 100);
    fd.append("client",           formatList(selectedClient));
    fd.append("serviceLines",    formatList(selectedServiceLines));
    fd.append("industries",       formatList(selectedIndustries));
    fd.append("business_unit",    formatList(selectedBU));
    fd.append("video_type",       formatList(selectedVideoType));
    fd.append("styles",           formatList(selectedStyles));
    fd.append("video_tone",       formatList(selectedVideoTone));
    fd.append("duration",         selectedDuration);
    fd.append("prompt",           rawInput);
    cf.forEach(f => fd.append("files", f));

    const patch = (p) => setMessagesForConversation(targetConvId, (prev) => dedupeById(prev.map(m => m._researchId === bid ? { ...m, ...p } : m)));

    try {
      const res  = await fetch(`${API_BASE_URL}/research`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.research) {
        setEditedResearch(data.research);
        setResearchId(data.research_id);
        patch({ researchPending: false, researchData: data.research, transcriptCount: data.research.transcript_count ?? 0 });
      } else {
        setResearchError(data.error || "Research failed");
        patch({ researchPending: false });
      }
    } catch {
      setResearchError("Could not reach server");
      patch({ researchPending: false });
    } finally {
      setIsResearching(false);
    }
  };

  // ── Generate Script ────────────────────────────────────────────
  const generateScript = async () => {
    if (!input.trim() && !files.length && !editedResearch) return;

    const cf       = [...files];
    const rawInput = editedResearch ? (researchPrompt || input) : input;
    const trainingPrompt =
      `Create a ${selectedDuration || "unspecified duration"} ` +
      `${formatList(selectedVideoType) || "video"} video script for ` +
      `${formatList(selectedClient) || "the client"}, operating in ` +
      `${formatList(selectedIndustries) || "the specified"} industry, ` +
      `focused on ${formatList(selectedServiceLines) || "its services"}, ` +
      `about ${rawInput}. ` +
      `Use a ${formatList(selectedStyles) || "professional"} style and ` +
      `${formatList(selectedVideoTone) || "professional"} tone. ` +
        `creative freedom ${sliderValue}, `;

    const cr  = editedResearch;
    const cri = researchId;
    const fpd = cf.map(f => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }));

    lastPromptRef.current = trainingPrompt;

    setInput(""); setFiles([]); setEditedResearch(null); setResearchId(null); setResearchPrompt("");

    const isNewChat = !conversationId;
    let targetConvId = conversationId || `draft-${crypto.randomUUID()}`;
    if (isNewChat) setConversationId(targetConvId);

    const botId = crypto.randomUUID();

    if (!cr) {
      const uid = crypto.randomUUID();
      addMessage(targetConvId, { id: uid, sender: "user", text: rawInput, content: rawInput, rawPrompt: rawInput, prompt: "", files: fpd, hideText: false, researchLoading: false });
    }

setStreamText(targetConvId, "");
    startGenerating(targetConvId);
    pipelineStartRef.current.set(targetConvId, Date.now());
    setPipelineLogs(prev => ({ ...prev, [targetConvId]: [] }));

    convAbortControllers.current.get(targetConvId)?.abort();

    const ctrl = new AbortController();
    convAbortControllers.current.set(targetConvId, ctrl);

    const fd = new FormData();
    fd.append("prompt",           rawInput);
    fd.append("client",           formatList(selectedClient));
    fd.append("serviceLines",    formatList(selectedServiceLines));
    fd.append("styles",           formatList(selectedStyles));
    fd.append("industries",       formatList(selectedIndustries));
    fd.append("business_unit",    formatList(selectedBU));
    fd.append("video_type",       formatList(selectedVideoType));
    fd.append("video_tone",       formatList(selectedVideoTone));
    fd.append("creativity_ratio", sliderValue / 100);
    if (selectedDuration) fd.append("duration",       selectedDuration);
    if (cri)              fd.append("research_id",    cri);
    if (cr)               fd.append("research_brief", JSON.stringify(cr));
    // if (!isNewChat)        fd.append("conversation_id", targetConvId);
    if (!isDraftId(targetConvId)) fd.append("conversation_id", targetConvId);
    cf.forEach(f => fd.append("files", f));

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, { method: "POST", body: fd, signal: ctrl.signal, headers: getAuthHeaders() });
      const reader  = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false, fullText = "";

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d; if (ctrl.signal.aborted) break;
        for (const line of decoder.decode(value || new Uint8Array(), { stream: true }).split("\n")) {
          if (line.startsWith("conversation_id:")) {
            const realId = line.replace("conversation_id:", "").trim();
            if (realId && realId !== targetConvId) {
              migrateConversation(targetConvId, realId);
              const c = convAbortControllers.current.get(targetConvId);
              if (c) { convAbortControllers.current.set(realId, c); convAbortControllers.current.delete(targetConvId); }
              targetConvId = realId;
              if (isNewChat) loadConversations();
            }
            continue;
          }
          // if (line.startsWith("status:") || line.startsWith("<!-- ")) { setPipelineStatus(line.replace("status:", "").replace("<!--", "").replace("-->", "").trim()); continue; }
          // if (line.startsWith("status:") || line.startsWith("<!-- ")) { setPipelineStatus(targetConvId, line.replace("status:", "").replace("<!--", "").replace("-->", "").trim()); continue; }
          if (line.startsWith("status:") || line.startsWith("<!-- ")) {
            const s = line.replace("status:", "").replace("<!--", "").replace("-->", "").trim();
            setPipelineStatus(targetConvId, s);
            setPipelineLogs(prev => ({ ...prev, [targetConvId]: [...(prev[targetConvId] || []), s] }));
            continue;
          }
          if (line.startsWith("result:"))     { fullText = line.replace("result:", "").trim(); continue; }
          if (line.startsWith("error:"))      { fullText = `⚠️ ${line.replace("error:", "").trim()}`; continue; }
          if (line.startsWith("<!-- debug:")) continue;
          if (line.trim() && fullText)        fullText += "\n" + line;
        }
        setStreamText(targetConvId, fullText);
      }

      fullText = fullText.replace(/\\n/g, "\n"); lastOutputRef.current = fullText;

stopGenerating(targetConvId);
      const started = pipelineStartRef.current.get(targetConvId);
      if (started) {
        setPipelineDurations(prev => ({ ...prev, [targetConvId]: Math.round((Date.now() - started) / 1000) }));
        pipelineStartRef.current.delete(targetConvId);
      }
      clearStreamText(targetConvId);
      clearPipelineStatus(targetConvId);
      addMessage(targetConvId, { id: botId, sender: "bot", text: "", content: "", prompt: "", files: [] });

      updateLastMessage(targetConvId, fullText, rawInput);
      setMessagesForConversation(targetConvId, (prev) => dedupeById(prev.map(m => m.id === botId ? { ...m, content: fullText, text: fullText, prompt: rawInput } : m)));
      try { localStorage.setItem(scriptKey(botId), fullText ? markdownToHtml(fullText) : ""); } catch {}
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("generateScript error:", err);
      stopGenerating(targetConvId);
      clearStreamText(targetConvId);
      if (conversationIdRef.current === targetConvId) {
        setInput(rawInput); setFiles(cf); setEditedResearch(cr); setResearchId(cri);
      }
      setMessagesForConversation(targetConvId, (prev) => dedupeById(prev.map(m => m.id === botId ? { ...m, content: "⚠️ Server error", text: "⚠️ Server error" } : m)));
    }
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  const handleTranscript = useCallback((text) => {
    setInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
  }, []);

  const researchDisabled = isResearching || !input.trim();
  const creativeReviewDisabled = narrativeLoading || streaming || !input.trim();
  const sendDisabled = !input.trim() && !files.length && !editedResearch;

  const creativeReviewLabel = narrativeLoading
    ? "◈ Reviewing…"
    : narrativeReview
      ? "◈ Review Pending"
      : "◈ Human Review";

  return (
    <div className="chat-window">
      <FilePreviewModal previewFile={previewFile} onClose={closePreview} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}} @keyframes reasoningShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @keyframes stagePulse{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}`}</style>

          {isEmpty ? (
  <>
    <div className="empty-wrapper">
      {/* <WavesBackground /> */}
      <h2 style={{ position: "relative", zIndex: 1 }}>How can I help you <span>today?</span></h2>
      <p className="subtitle" style={{ position: "relative", zIndex: 1 }}>Your creative partner for scriptwriting, asset generation, and video planning.</p>
    </div>
          <div className="bottom-control-bar"><div className="glass-panel">
            <div className="dropdown-row">
              <Clients onChange={setSelectedClient} />
              <Industrys onChange={setSelectedIndustries} />
              <ServiceLine onchange={setSelectedServiceLines} />
              <Videotype onChange={setSelectedVideoType} />
              <Styles onChange={setSelectedStyles} />
              <VideoTone onChange={setSelectedVideoTone} />
              <DURATION_OPTIONS onChange={setSelectedDuration} />
              <SliderSizes value={sliderValue} onChange={setSliderValue} />
            </div>
            <div className={`chat-input-area-og ${isDragging ? "drag-active" : ""}`} onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx" hidden onChange={(e) => setFiles(Array.from(e.target.files))} />
              {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} onPreview={openPreview} />}
              <textarea placeholder="Start generating..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} cols={50} />
              <div className="og-bottom-row">
                <div className="og-bottom-left">
                  <button className="attach-btn-og" onClick={() => fileInputRef.current.click()} title="Attach files">📎</button>
                    <VoiceInputButton onTranscript={handleTranscript} />
                </div>
                <div className="og-bottom-right">
                  <EnhancePromptButton input={input} setInput={setInput} />
                  <button className="btn-research" onClick={runResearch} disabled={researchDisabled} style={{ opacity: researchDisabled ? 0.4 : 1 }}>
                    🔍 {isResearching ? "Researching…" : "Research"}
                  </button>
                  <button
                    onClick={runCreativeReview}
                    disabled={creativeReviewDisabled}
                    style={{
                      opacity: creativeReviewDisabled ? 0.4 : 1,
                      background: "rgba(139,92,246,.12)",
                      border: "1px solid rgba(139,92,246,.35)",
                      borderRadius: "9999px",
                      color: "rgba(200,160,255,.9)",
                      cursor: creativeReviewDisabled ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontFamily: "'Inter', sans-serif",
                      padding: "6px 16px",
                    }}
                  >
                    {creativeReviewLabel}
                  </button>
                  <button className="btn-send" onClick={generateScript} disabled={sendDisabled} style={{ opacity: sendDisabled ? 0.4 : 1 }}>
                    {editedResearch ? "✦ Generate Script →" : "Send →"}
                  </button>
                </div>
              </div>
            </div>
            {researchError && <ErrorBanner message={researchError} />}
            {narrativeError && <ErrorBanner message={narrativeError} />}
          </div></div>
        </>
      ) : (
  <div className="chat-container">
    <div className="chat-history" ref={chatHistoryRef} style={{ position: "relative", zIndex: 1 }}>
            {loadingMessages && (
              <div style={{ textAlign: "center", padding: "12px", color: "rgba(255,255,255,.4)", fontSize: "12px", fontFamily: "'Inter',sans-serif" }}>
                Loading older messages…
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                {msg.sender === "bot" ? (
                  <BotMessage msg={msg} onFeedback={sendFeedback} isLatestBot={msg.id === lastBotId} />
                ) : (
                  <div>
                    {!msg.hideText && (msg.rawPrompt || msg.text) && (
                      <p style={{ margin: 0 }}>{msg.rawPrompt || msg.text}</p>
                    )}
                    {msg.files?.length > 0 && <FileChips fileList={msg.files} onPreview={openPreview} />}
                    {msg.researchPending && <ResearchingIndicator />}
                    {msg.reviewPending && <ReviewingIndicator />}
                    {msg.researchLoading && !msg.researchPending && (
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,.3)", fontFamily: "'Inter',sans-serif", marginTop: "6px" }}>Loading research…</div>
                    )}
                    {msg.researchData && (
                      <InlineResearchPanel research={msg.researchData} transcriptCount={msg.transcriptCount} onResearchChange={setEditedResearch} />
                    )}
                    {msg.narrativeReviewData && (
                      <InlineNarrativeReviewPanel
                        reviewData={msg.narrativeReviewData}
                        onGenerate={(payload) => generateApprovedScript(payload, msg.narrativeReviewData._promptContext, conversationId)}
                        isGenerating={streaming}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
            <GenerationProgress isStreaming={streaming} log={pipelineLog} duration={pipelineDuration} />
            <ContextDebugBar conversationId={conversationId} isStreaming={streaming} />
            <div className="scroll-anchor" ref={chatEndRef} />
          </div>

          {(researchError || narrativeError) && (
            <div style={{ padding: "0 16px" }}>
              {researchError  && <ErrorBanner message={researchError} />}
              {narrativeError && <ErrorBanner message={narrativeError} />}
            </div>
          )}

          <div className={`chat-input-area ${isDragging ? "drag-active" : ""}`} onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div className="chat-input-inner">
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx" hidden onChange={(e) => setFiles(Array.from(e.target.files))} />
              <button className="attach-btn" onClick={() => fileInputRef.current.click()} title="Attach files">📎</button>
              <VoiceInputButton onTranscript={handleTranscript} />
              {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} onPreview={openPreview} />}
              <textarea placeholder="Start generating..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} cols={50} />
              <button onClick={runResearch} disabled={researchDisabled} style={{ opacity: researchDisabled ? 0.4 : 1 }}>
                🔍 {isResearching ? "Researching…" : "Research"}
              </button>
              <button
                onClick={runCreativeReview}
                disabled={creativeReviewDisabled}
                style={{
                  opacity: creativeReviewDisabled ? 0.4 : 1,
                  background: "rgba(139,92,246,.12)",
                  border: "1px solid rgba(139,92,246,.35)",
                  borderRadius: "9999px",
                  color: "rgba(200,160,255,.9)",
                  cursor: creativeReviewDisabled ? "not-allowed" : "pointer",
                  fontSize: "12px",
                  fontFamily: "'Inter', sans-serif",
                  padding: "6px 16px",
                }}
              >
                {creativeReviewLabel}
              </button>
              <button onClick={generateScript} disabled={sendDisabled} style={{ opacity: sendDisabled ? 0.4 : 1 }}>
                {editedResearch ? "✦ Generate Script →" : "Send →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;





