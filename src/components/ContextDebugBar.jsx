// ContextDebugBar.jsx
// Drop this anywhere in ChatWindow — it floats at the top of chat-history
// and only shows after the first context assembly.
//
// Usage inside ChatWindow (just above the scroll-anchor div):
//   <ContextDebugBar conversationId={conversationId} isStreaming={isStreaming} />

import { useState, useEffect, useRef } from "react";

// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ContextDebugBar({ conversationId, isStreaming }) {
  const [log, setLog]     = useState(null);
  const [flash, setFlash] = useState(false);
  const prevTokens        = useRef(null);
  const wasStreaming      = useRef(false);
 
  const fetchLog = async (convId) => {
    try {
      const res  = await fetch(`${API_BASE_URL}/logs`);
      const data = await res.json();
      const match = [...data].reverse().find((l) => l.conversation_id === convId);
      if (!match) return;
      setLog(match);
      if (prevTokens.current !== null && prevTokens.current !== match.tokens) {
        setFlash(true);
        setTimeout(() => setFlash(false), 800);
      }
      prevTokens.current = match.tokens;
    } catch {
      // silently fail
    }
  };
 
  // Trigger 1: conversation changed — fetch once to show existing context stats
  useEffect(() => {
    if (!conversationId) return;
    setLog(null);     
    prevTokens.current = null; // ← reset flash reference too
    fetchLog(conversationId);
  }, [conversationId]);
 
  // Trigger 2: streaming just finished — fetch once to show updated stats
  useEffect(() => {
    if (wasStreaming.current && !isStreaming && conversationId) {
      fetchLog(conversationId);
    }
    wasStreaming.current = isStreaming;
  }, [isStreaming, conversationId]);
 
  if (!log) return null;
 
  const pill = (label, value, accent) => (
    <span
      key={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: "9999px",
        padding: "3px 10px",
        fontSize: "11px",
        fontFamily: "'Inter',sans-serif",
        color: accent || "rgba(255,255,255,.45)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "rgba(255,255,255,.25)", fontSize: "10px" }}>{label}</span>
      {String(value)}
    </span>
  );
 
  const ts = log.log_time
    ? new Date(log.log_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;
 
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "6px",
        padding: "7px 14px",
        margin: "0 0 4px",
        borderRadius: "10px",
        background: flash ? "rgba(139,92,246,.07)" : "rgba(255,255,255,.015)",
        border: `1px solid ${flash ? "rgba(139,92,246,.25)" : "rgba(255,255,255,.05)"}`,
        transition: "background .4s ease, border-color .4s ease",
      }}
    >
      <span
        style={{
          fontSize: "10px",
          fontFamily: "'Manrope',sans-serif",
          fontWeight: 700,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "rgba(255,255,255,.2)",
          marginRight: "4px",
        }}
      >
        ctx
      </span>
 
      {pill("msgs",    log.messages,       log.messages > 10 ? "rgba(250,200,100,.7)" : "rgba(255,255,255,.55)")}
      {pill("tokens",  `≈${log.tokens}`,   log.tokens  > 20000 ? "rgba(255,120,100,.8)" : "rgba(255,255,255,.55)")}
      {pill("vector",  log.vector_matches, log.vector_matches > 0 ? "rgba(111,207,151,.8)" : "rgba(255,255,255,.3)")}
      {pill("summary", log.summary  ? "yes" : "no", log.summary  ? "rgba(111,207,151,.7)" : "rgba(255,255,255,.25)")}
      {pill("script",  log.has_script ? "yes" : "no", log.has_script ? "rgba(139,92,246,.9)" : "rgba(255,255,255,.25)")}
 
      {ts && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: "10px",
            fontFamily: "'Inter',sans-serif",
            color: "rgba(255,255,255,.15)",
          }}
        >
          {ts}
        </span>
      )}
    </div>
  );
}
 