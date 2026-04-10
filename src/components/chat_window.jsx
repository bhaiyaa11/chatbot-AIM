import { useState, useRef, useEffect } from "react";
import "./chatWindow.css";
import { useChat } from "../contexts/ChatContext";
import ChatResponse from "./chat_message.jsx";
import FloatingEditMenu from "./floatingEdit.jsx";
import Clients from "./dropdown/clients.jsx";
import Business_Unit from "./dropdown/BU.jsx";
import Videotype from "./dropdown/videoType.jsx";
import VideoTone from "./dropdown/video_tone.jsx";
import DURATION_OPTIONS from "./dropdown/duration.jsx";

// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ── Copy Button ────────────────────────────────────────────────
const CopyButton = ({ editableRef }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const text = editableRef.current?.innerText ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy response"
      style={{
        backgroundColor: "#1f1f1f",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "9999px",
        color: copied ? "#6fcf97" : "rgba(255,255,255,0.5)",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        padding: "5px 14px",
        transition: "color 0.2s, background 0.2s",
      }}
    >
      {copied ? "✓ Copied" : "⧉ Copy"}
    </button>
  );
};

// ── Bot Message ────────────────────────────────────────────────
const BotMessage = ({ msg, onFeedback }) => {
  const editableRef = useRef(null);
  return (
    <div className="feedback-row-rating">
      <button
        style={{ backgroundColor: "#1f1f1f" }}
        onClick={() => onFeedback(1, msg.prompt, msg.content)}
      >
        👍
      </button>
      <CopyButton editableRef={editableRef} />
      <ChatResponse ref={editableRef} reply={msg.content} />
    </div>
  );
};

// ── File Icon Helper ───────────────────────────────────────────
const getFileIcon = (file) => {
  if (file.type?.startsWith("image/")) return "🖼️";
  if (file.type === "application/pdf") return "📕";
  if (file.name?.endsWith(".docx")) return "📝";
  if (file.name?.endsWith(".xlsx")) return "📊";
  if (file.name?.endsWith(".pptx")) return "📋";
  if (file.name?.endsWith(".csv")) return "📊";
  return "📄";
};

// ── Format list helper ─────────────────────────────────────────
const formatList = (value) => {
  if (!value || value.length === 0) return "";
  if (Array.isArray(value)) return value.join(", ");
  return value;
};

// ── Editable Tag ───────────────────────────────────────────────
const EditableTag = ({ value, color, borderColor, textColor, onChange, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const commit = () => {
    setEditing(false);
    if (draft.trim()) onChange(draft.trim());
    else onDelete();
  };
  if (editing) {
    return (
      <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
        <input
          ref={inputRef} value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          style={{ flex: 1, background: "#000000", border: `1px solid ${borderColor}`, borderRadius: "9999px", color, fontSize: "12px", fontFamily: "'Inter', sans-serif", padding: "4px 12px", outline: "none" }}
        />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
      <span
        onClick={() => setEditing(true)}
        title="Click to edit"
        style={{ fontSize: "12px", color: textColor, lineHeight: 1.5, cursor: "text", flex: 1, fontFamily: "'Inter', sans-serif" }}
      >
        • {value}
      </span>
      <button
        onClick={onDelete}
        title="Remove"
        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "11px", padding: "0 2px", lineHeight: 1 }}
      >✕</button>
    </div>
  );
};

// ── Editable List ──────────────────────────────────────────────
const EditableList = ({ items, setItems, label, color, bgColor, borderColor, textColor }) => {
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);
  const addRef = useRef(null);
  useEffect(() => { if (adding) addRef.current?.focus(); }, [adding]);
  const commitAdd = () => {
    if (newItem.trim()) setItems([...items, newItem.trim()]);
    setNewItem("");
    setAdding(false);
  };
  return (
    <div style={{ background: bgColor, borderRadius: "14px", padding: "12px 14px", border: `1px solid ${borderColor}` }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color, marginBottom: "8px", letterSpacing: "1.2px", textTransform: "uppercase", fontFamily: "'Manrope', sans-serif" }}>
        {label}
      </div>
      {items.map((item, i) => (
        <EditableTag
          key={i} value={item} color={color} borderColor={borderColor} textColor={textColor}
          onChange={(v) => setItems(items.map((x, j) => j === i ? v : x))}
          onDelete={() => setItems(items.filter((_, j) => j !== i))}
        />
      ))}
      {adding ? (
        <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
          <input
            ref={addRef} value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onBlur={commitAdd}
            onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Type and press Enter…"
            style={{ flex: 1, background: "#000", border: `1px solid ${borderColor}`, borderRadius: "9999px", color: textColor, fontSize: "12px", fontFamily: "'Inter', sans-serif", padding: "4px 12px", outline: "none" }}
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ background: "none", border: `1px dashed ${borderColor}`, borderRadius: "9999px", color, fontSize: "11px", fontFamily: "'Inter', sans-serif", cursor: "pointer", padding: "4px 12px", marginTop: "6px", opacity: 0.6, width: "100%" }}
        >
          + Add
        </button>
      )}
    </div>
  );
};

// ── Inline Research Pill + Expandable Panel ────────────────────
const InlineResearchPanel = ({ research, onResearchChange, transcriptCount }) => {
  const [open, setOpen] = useState(false);

  const [projIntel, setProjIntel] = useState(research.project_intelligence ?? "");
  const [summary, setSummary]     = useState(research.niche_summary ?? research.niche_summary_title ?? "");
  const [hooks, setHooks]         = useState(research.winning_hooks ?? []);
  const [pains, setPains]         = useState(research.top_pain_points ?? []);
  const [angle, setAngle]         = useState(research.recommended_angle ?? "");

  useEffect(() => {
    onResearchChange({
      ...research,
      project_intelligence: projIntel,
      niche_summary: summary,
      winning_hooks: hooks,
      top_pain_points: pains,
      recommended_angle: angle,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projIntel, summary, hooks, pains, angle]);

  const sectionStyle = {
    background: "#0a0a0a",
    borderRadius: "14px",
    padding: "12px 16px",
    marginBottom: "10px",
    border: "1px solid rgba(255,255,255,0.06)",
  };
  const labelStyle = {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    marginBottom: "8px",
    fontFamily: "'Manrope', sans-serif",
  };
  const textareaBase = {
    width: "100%",
    background: "transparent",
    border: "none",
    fontSize: "13px",
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.6,
    resize: "vertical",
    outline: "none",
    padding: 0,
    boxSizing: "border-box",
    color: "rgba(255,255,255,0.72)",
  };

  return (
    <div style={{ marginTop: "8px", maxWidth: "520px" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          background: open ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.10)",
          border: "1px solid rgba(139,92,246,0.35)",
          borderRadius: "9999px",
          padding: "5px 13px 5px 10px",
          cursor: "pointer",
          fontFamily: "'Inter', sans-serif",
          fontSize: "12px",
          color: "rgba(200,180,255,0.9)",
          transition: "background 0.15s",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="5.5" cy="5.5" r="4" stroke="rgba(180,150,255,0.8)" strokeWidth="1.3"/>
          <line x1="8.8" y1="8.8" x2="11.5" y2="11.5" stroke="rgba(180,150,255,0.8)" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Research — {transcriptCount ?? 0} sources analyzed
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(180,150,255,0.7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          style={{
            marginTop: "8px",
            background: "rgba(19,19,19,0.95)",
            border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: "1.1rem",
            padding: "16px 18px",
            maxHeight: "420px",
            overflowY: "auto",
          }}
        >
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", marginBottom: "14px" }}>
            Edit anything below — changes are picked up when you hit Generate Script.
          </div>

          {projIntel !== undefined && (
            <div style={{ ...sectionStyle, borderLeft: "2px solid rgba(255,255,255,0.18)" }}>
              <div style={{ ...labelStyle, color: "rgba(255,255,255,0.4)" }}>Project Intelligence</div>
              <textarea
                value={projIntel}
                onChange={(e) => setProjIntel(e.target.value)}
                rows={Math.min(10, (projIntel.match(/\n/g) || []).length + 3)}
                style={textareaBase}
              />
            </div>
          )}

          {summary !== undefined && (
            <div style={{ ...sectionStyle, borderLeft: "2px solid rgba(255,255,255,0.10)" }}>
              <div style={{ ...labelStyle, color: "rgba(255,255,255,0.35)" }}>Niche Summary</div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                style={textareaBase}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <EditableList
              items={hooks} setItems={setHooks}
              label="Winning Hooks"
              color="rgba(255,255,255,0.55)" bgColor="#111"
              borderColor="rgba(255,255,255,0.08)" textColor="rgba(255,255,255,0.75)"
            />
            <EditableList
              items={pains} setItems={setPains}
              label="Pain Points"
              color="rgba(255,255,255,0.4)" bgColor="#0e0e0e"
              borderColor="rgba(255,255,255,0.06)" textColor="rgba(255,255,255,0.6)"
            />
          </div>

          {angle !== undefined && (
            <div style={{ background: "#111", borderRadius: "14px", padding: "10px 14px", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "2px solid rgba(255,255,255,0.22)" }}>
              <div style={{ ...labelStyle, color: "rgba(255,255,255,0.45)" }}>Recommended Angle</div>
              <textarea
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                rows={2}
                style={textareaBase}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Researching Spinner ────────────────────────────────────────
const ResearchingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", borderRadius: "9999px", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.07)", maxWidth: "300px", margin: "8px 0", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
    <span style={{ fontSize: "16px", animation: "spin 1.2s linear infinite", display: "inline-block" }}>🔍</span>
    <div>
      <div style={{ fontSize: "13px", color: "#e5e5e5", fontWeight: 600, fontFamily: "'Manrope', sans-serif" }}>Researching…</div>
      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px", fontFamily: "'Inter', sans-serif" }}>Searching web + analysing YouTube</div>
    </div>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Main Component ─────────────────────────────────────────────
function ChatWindow() {
  const {
    messages, setMessages, addMessage, updateLastMessage,
    conversationId, setConversationId, loadConversations,
    isGenerating, setIsGenerating,
  } = useChat();

  const [input, setInput]                   = useState("");
  const [files, setFiles]                   = useState([]);
  const [isDragging, setIsDragging]         = useState(false);
  const [selectionInfo, setSelectionInfo]   = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [menuPosition, setMenuPosition]     = useState(null);
  const [selectedText, setSelectedText]     = useState("");
  const [previewFile, setPreviewFile]       = useState(null);
  const [selectedClient, setSelectedClient]         = useState("");
  const [selectedBU, setSelectedBU]                 = useState("");
  const [selectedVideoType, setSelectedVideoType]   = useState("");
  const [selectedVideoTone, setSelectedVideoTone]   = useState("");
  const [selectedDuration, setSelectedDuration]     = useState("");

  const [isResearching, setIsResearching]   = useState(false);
  const [editedResearch, setEditedResearch] = useState(null);
  const [researchId, setResearchId]         = useState(null);
  const [researchError, setResearchError]   = useState(null);

  const savedRangeRef   = useRef(null);
  const lastPromptRef   = useRef("");
  const lastOutputRef   = useRef("");
  const chatEndRef      = useRef(null);
  const fileInputRef    = useRef(null);
  const activeConvIdRef = useRef(null);

  // FLICKER FIX A: ref that holds the temp id of the current optimistic bot
  // bubble. generateScript stamps the bubble with this id so fetchMessages
  // can find and replace it by id instead of wiping the whole array.
  const optimisticBotIdRef = useRef(null);

  const [page, setPage]                     = useState(1);
  const [hasMore, setHasMore]               = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatHistoryRef  = useRef(null);
  const loadingRef      = useRef(false);

  const isEmpty = messages.length === 0 && !loadingMessages;

  // ── fetchMessages ──────────────────────────────────────────────
  // Accepts an optional `mergeOptimisticId` param (the temp id of the
  // optimistic bot bubble). When provided (post-stream sync call) it
  // MERGES the DB records into the existing array instead of replacing it,
  // swapping the optimistic bubble for the real DB record by matching ids.
  //
  // FLICKER FIX B: the page=1 path is now split into two branches:
  //   • mergeOptimisticId provided  → merge (no flicker, no full replace)
  //   • mergeOptimisticId absent    → full replace (conversation switch / manual load)
  const fetchMessages = async (chatIdParam, pageNum, mergeOptimisticId = null) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE_URL}/messages?conversation_id=${chatIdParam}&page=${pageNum}&limit=20`);
      const data = await res.json();
      const fetched = Array.isArray(data.messages) ? data.messages : Array.isArray(data) ? data : [];
      if (fetched.length < 20) setHasMore(false);

      const ordered = [...fetched].map(m => ({
        id: m.id,
        sender: m.role === "assistant" ? "bot" : "user",
        text: m.content,
        content: m.content,
        prompt: m.metadata?.prompt ?? m.prompt ?? "",
        files: [],
      }));

      if (pageNum === 1 && mergeOptimisticId) {
        // ── POST-STREAM MERGE (no flicker) ──────────────────────────
        // Do NOT replace the whole array. Instead:
        // 1. Remove the optimistic bubble (identified by its temp id).
        // 2. Remove any existing messages whose DB id already exists in the
        //    incoming records (dedup in case of prior page fetches).
        // 3. Append the fresh DB records at the end in their correct order.
        // This means the user sees the streamed content the whole time — it
        // is never wiped. Only the temp bubble is swapped for the real record.
        setMessages(prev => {
          // Step 1: strip the optimistic bubble
          const withoutOptimistic = prev.filter(m => m.id !== mergeOptimisticId);
          // Step 2: collect all real DB ids already in local state
          const existingDbIds = new Set(
            withoutOptimistic.map(m => m.id).filter(id => id && !id.startsWith("optimistic-"))
          );
          // Step 3: only take DB records whose ids are NOT already present
          // (keeps historical messages that were already loaded)
          const newRecords = ordered.filter(m => !existingDbIds.has(m.id));
          // Preserve any non-DB messages (research bubbles etc.) that sit
          // before the first DB record by keeping withoutOptimistic as the base
          // and only replacing messages that match incoming DB ids.
          const baseIds = new Set(ordered.map(m => m.id));
          const preserved = withoutOptimistic.filter(m => !m.id || !baseIds.has(m.id));
          return [...preserved, ...ordered];
        });
        // Don't scroll — content was already visible during streaming
      } else if (pageNum === 1) {
        // ── FULL REPLACE (conversation switch / initial load) ────────
        setMessages(ordered);
        requestAnimationFrame(() => { requestAnimationFrame(() => { chatEndRef.current?.scrollIntoView({ behavior: "auto" }); }); });
      } else {
        // ── PREPEND older page (infinite scroll up) ──────────────────
        const container = chatHistoryRef.current;
        const prevScrollHeight = container?.scrollHeight || 0;
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id).filter(Boolean));
          const fresh = ordered.filter(m => !m.id || !existingIds.has(m.id));
          return [...fresh, ...prev];
        });
        requestAnimationFrame(() => { if (container) container.scrollTop = container.scrollHeight - prevScrollHeight; });
      }
    } catch (err) { console.error("Failed to fetch messages:", err); }
    finally { setLoadingMessages(false); loadingRef.current = false; }
  };

  useEffect(() => {
    setInput(""); setFiles([]); setSelectionInfo(null);
    setEditedResearch(null); setResearchId(null); setResearchError(null);
    setMessages([]); setPage(1); setHasMore(true); loadingRef.current = false;
    if (!conversationId) return;
    fetchMessages(conversationId, 1);   // no mergeOptimisticId → full replace
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (page > 1 && conversationId) fetchMessages(conversationId, page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const container = chatHistoryRef.current;
    if (!container || !conversationId) return;
    const handleScroll = () => { if (container.scrollTop <= 5 && hasMore && !loadingRef.current) setPage(p => p + 1); };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [conversationId, hasMore]);

  useEffect(() => {
    if (messages.length === 0) return;
    const container = chatHistoryRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) { setSelectionInfo(null); return; }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionInfo({ text: sel.toString(), position: { top: rect.top - 40 + window.scrollY, left: rect.left + rect.width / 2 } });
    };
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  const handleMouseUp = (e) => {
    if (e.target.closest(".floating-menu")) return;
    const selection = window.getSelection();
    const text = selection.toString();
    if (!text) { setMenuPosition(null); return; }
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const botBubble = (container.nodeType === Node.TEXT_NODE ? container.parentElement : container).closest(".chat-bubble.bot");
    if (!botBubble) { setMenuPosition(null); return; }
    savedRangeRef.current = range.cloneRange();
    const rect = range.getBoundingClientRect();
    setSelectedText(text);
    setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
  };

  const handleFloatingAction = async (instruction) => {
    if (!selectedText || !savedRangeRef.current) return;
    setMenuPosition(null);
    const formData = new FormData();
    formData.append("instruction", instruction);
    formData.append("selected_text", selectedText);
    try {
      const res = await fetch(`${API_BASE_URL}/edit`, { method: "POST", body: formData });
      const data = await res.json();
      const editedText = data.result;
      if (!editedText) return;
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
      const r = sel.getRangeAt(0);
      r.deleteContents();
      r.insertNode(document.createTextNode(editedText));
      sel.removeAllRanges();
      savedRangeRef.current = null;
      setSelectedText("");
    } catch { console.error("Inline edit failed"); }
  };

  const handleAskAI = async (customPrompt) => {
    const textToEdit = selectedText;
    const savedRange = savedRangeRef.current;
    if (!textToEdit || !savedRange) return;
    setMenuPosition(null);
    const formData = new FormData();
    formData.append("instruction", customPrompt);
    formData.append("selected_text", textToEdit);
    try {
      const res = await fetch(`${API_BASE_URL}/edit`, { method: "POST", body: formData });
      const data = await res.json();
      const editedText = data.result;
      if (!editedText) return;
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange);
      const r = sel.getRangeAt(0);
      r.deleteContents();
      r.insertNode(document.createTextNode(editedText));
      sel.removeAllRanges();
      savedRangeRef.current = null;
      setSelectedText("");
    } catch { console.error("askAI edit failed"); }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const openPreview = (file) => {
    const url = file.url || URL.createObjectURL(file);
    setPreviewFile({ name: file.name, url, type: file.type });
  };
  const closePreview = () => setPreviewFile(null);

  const safeAddMessage = (message) => addMessage(conversationId, message);

  const buildFinalPrompt = () => {
    const clientText   = formatList(selectedClient) || "the client";
    const buText       = formatList(selectedBU);
    const typeText     = formatList(selectedVideoType) || "video";
    const toneText     = formatList(selectedVideoTone) || "professional";
    const durationText = selectedDuration || "unspecified duration";
    return `create a ${durationText} ${typeText} video script for ${clientText} ,which oporates in ${buText} sectors, about ${input}, maintain a ${toneText} tone consistently.`.trim();
  };

  const sendFeedback = async (rating, prompt, output) => {
    const formData = new FormData();
    formData.append("prompt", lastPromptRef.current);
    formData.append("output", lastOutputRef.current);
    formData.append("rating", rating);
    await fetch(`${API_BASE_URL}/feedback`, { method: "POST", body: formData });
  };

  // ── Research ───────────────────────────────────────────────────
  const runResearch = async () => {
    if (!input.trim()) return;
    setIsResearching(true);
    setEditedResearch(null);
    setResearchId(null);
    setResearchError(null);

    const capturedInput = input;
    const capturedFiles = [...files];
    const filePreviewData = capturedFiles.map((f) => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }));

    setInput("");
    setFiles([]);

    const bubbleStableId = Date.now();
    setMessages(prev => [
      ...prev,
      {
        sender: "user",
        text: capturedInput,
        content: capturedInput,
        prompt: "",
        files: filePreviewData,
        researchPending: true,
        researchData: null,
        _researchId: bubbleStableId,
      },
    ]);

    const formData = new FormData();
    formData.append("client", formatList(selectedClient));
    formData.append("business_unit", formatList(selectedBU));
    formData.append("video_type", formatList(selectedVideoType));
    formData.append("video_tone", formatList(selectedVideoTone));
    formData.append("duration", selectedDuration);
    formData.append("prompt", capturedInput);
    capturedFiles.forEach((f) => formData.append("files", f));

    const patchResearchBubble = (patch) =>
      setMessages(prev => prev.map(m =>
        m._researchId === bubbleStableId ? { ...m, ...patch } : m
      ));

    try {
      const res  = await fetch(`${API_BASE_URL}/research`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.research) {
        setEditedResearch(data.research);
        setResearchId(data.research_id);
        patchResearchBubble({
          researchPending: false,
          researchData: data.research,
          transcriptCount: data.research.transcript_count ?? 0,
        });
      } else {
        setResearchError(data.error || "Research failed — try again");
        patchResearchBubble({ researchPending: false });
      }
    } catch {
      setResearchError("Could not reach server");
      patchResearchBubble({ researchPending: false });
    } finally {
      setIsResearching(false);
    }
  };

  // ── Generate Script ────────────────────────────────────────────
  const generateScript = async () => {
    if (!input.trim() && files.length === 0 && !editedResearch) return;
    if (isGenerating) return;

    const capturedFiles      = [...files];
    const capturedInput      = input;
    const capturedResearch   = editedResearch;
    const capturedResearchId = researchId;
    const filePreviewData    = capturedFiles.map((f) => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }));
    const finalPrompt        = buildFinalPrompt();
    lastPromptRef.current    = finalPrompt;

    setInput("");
    setFiles([]);
    setEditedResearch(null);
    setResearchId(null);
    setIsGenerating(true);
    activeConvIdRef.current = conversationId || null;

    // FLICKER FIX A: give the optimistic bot bubble a stable temp id prefixed
    // with "optimistic-" so fetchMessages can identify and merge it precisely
    // instead of replacing the entire messages array.
    const tempBotId = `optimistic-${Date.now()}`;
    optimisticBotIdRef.current = tempBotId;

    if (!capturedResearch) {
      setMessages(prev => [
        ...prev,
        { sender: "user", text: capturedInput, content: capturedInput, prompt: finalPrompt, files: filePreviewData },
        // FLICKER FIX A: id attached here
        { id: tempBotId, sender: "bot", text: "", content: "", prompt: "", files: [] },
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        // FLICKER FIX A: id attached here too (research flow)
        { id: tempBotId, sender: "bot", text: "", content: "", prompt: "", files: [] },
      ]);
    }

    const formData = new FormData();
    formData.append("prompt", finalPrompt);
    formData.append("client", formatList(selectedClient));
    formData.append("business_unit", formatList(selectedBU));
    formData.append("video_type", formatList(selectedVideoType));
    formData.append("video_tone", formatList(selectedVideoTone));
    if (selectedDuration)    formData.append("duration", selectedDuration);
    if (capturedResearchId) {
      formData.append("research_id", capturedResearchId);
    } else if (capturedResearch) {
      formData.append("research_brief", JSON.stringify(capturedResearch));
    }
    if (conversationId) formData.append("conversation_id", conversationId);
    capturedFiles.forEach((f) => formData.append("files", f));

    try {
      const res     = await fetch(`${API_BASE_URL}/chat`, { method: "POST", body: formData });
      const reader  = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let rawBuffer = "";
      let fullText  = "";
      let inResult  = false;
      let done      = false;

      // FLICKER FIX C: scriptStart marks the exact byte offset in rawBuffer
      // where the script content begins (right after "result: ").
      // The inResult path now slices from scriptStart instead of using the
      // entire rawBuffer, so fullText never contains the control-line prefix.
      let scriptStart = 0;

      // Helper: update the bot bubble by its stable temp id — never patches
      // by index so concurrent state updates cannot hit the wrong message.
      const patchBotBubble = (content) => {
        setMessages(prev => prev.map(m =>
          m.id === tempBotId ? { ...m, content, text: content } : m
        ));
        updateLastMessage(activeConvIdRef.current, content);
      };

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        rawBuffer += decoder.decode(value || new Uint8Array(), { stream: !done });

        if (inResult) {
          // FLICKER FIX C: slice from scriptStart, not from 0.
          // rawBuffer grows with each chunk but scriptStart is fixed at the
          // position right after "result:" so fullText is always only the script.
          fullText = rawBuffer.slice(scriptStart);
          patchBotBubble(fullText);
          continue;
        }

        // Scan line-by-line for control prefixes; stop when result: is found.
        let scanFrom = 0;
        while (true) {
          const nlIdx   = rawBuffer.indexOf("\n", scanFrom);
          if (nlIdx === -1 && !done) break;
          const lineEnd = nlIdx === -1 ? rawBuffer.length : nlIdx;
          const line    = rawBuffer.slice(scanFrom, lineEnd);

          if (line.startsWith("result:")) {
            inResult = true;
            // FLICKER FIX C: record exactly where the script content starts.
            // +1 to skip the space separator after "result:" if present.
            const afterPrefix = scanFrom + "result:".length;
            scriptStart = rawBuffer[afterPrefix] === " " ? afterPrefix + 1 : afterPrefix;
            fullText    = rawBuffer.slice(scriptStart);
            patchBotBubble(fullText);
            break;
          }

          if (line.startsWith("conversation_id:")) {
            const id    = line.replace("conversation_id:", "").trim();
            const isNew = !activeConvIdRef.current;
            activeConvIdRef.current = id;
            setConversationId(id);
            if (isNew) loadConversations();
          } else if (line.startsWith("status:")) {
            setPipelineStatus(line.replace("status:", "").trim());
          } else if (line.startsWith("error:")) {
            fullText = `⚠️ ${line.replace("error:", "").trim()}`;
            patchBotBubble(fullText);
          }

          if (nlIdx === -1) break;
          scanFrom = nlIdx + 1;
        }
      }

      // Normalise escaped newlines
      fullText = fullText.replace(/\\n/g, "\n");
      lastOutputRef.current = fullText;
      setPipelineStatus(null);

      // Final state patch with prompt (triggers sidebar reload in ChatContext)
      setMessages(prev => prev.map(m =>
        m.id === tempBotId ? { ...m, content: fullText, text: fullText, prompt: finalPrompt } : m
      ));
      updateLastMessage(activeConvIdRef.current, fullText, finalPrompt);

      // FLICKER FIX B: pass the temp bot id to fetchMessages so it merges
      // instead of replacing. The user sees the streamed content the entire
      // time — only the temp bubble is swapped out for the real DB record.
      if (activeConvIdRef.current) {
        await fetchMessages(activeConvIdRef.current, 1, tempBotId);
      }

    } catch (err) {
      console.error("generateScript error:", err);
      setMessages(prev => prev.map(m =>
        m.id === tempBotId ? { ...m, content: "⚠️ Server error", text: "⚠️ Server error" } : m
      ));
    } finally {
      setIsGenerating(false);
      optimisticBotIdRef.current = null;
    }
  };

  // ── File Preview Modal ─────────────────────────────────────────
  const FilePreviewModal = () => {
    if (!previewFile) return null;
    const isImage = previewFile.type?.startsWith("image/");
    const isPDF   = previewFile.type === "application/pdf";
    return (
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
        onClick={closePreview}
      >
        <div
          style={{ background: "#0d0d0d", borderRadius: "1.5rem", padding: "24px", maxWidth: "90vw", maxHeight: "85vh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: "16px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 80px rgba(0,0,0,0.9)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: "14px", color: "#e5e5e5", fontFamily: "'Manrope', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {getFileIcon({ name: previewFile.name, type: previewFile.type })} {previewFile.name}
            </span>
            <button
              onClick={closePreview}
              style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: "9999px", padding: "5px 14px", cursor: "pointer", fontSize: "12px", fontFamily: "'Inter', sans-serif", flexShrink: 0, marginLeft: "16px" }}
            >
              ✕ Close
            </button>
          </div>
          <div style={{ overflow: "auto", flex: 1, borderRadius: "12px" }}>
            {isImage && <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", display: "block", margin: "0 auto" }} />}
            {isPDF   && <iframe src={previewFile.url} title={previewFile.name} style={{ width: "100%", height: "70vh", border: "none", borderRadius: "12px" }} />}
            {!isImage && !isPDF && (
              <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "48px", fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>{getFileIcon({ name: previewFile.name, type: previewFile.type })}</div>
                <div style={{ color: "rgba(255,255,255,0.7)" }}>{previewFile.name}</div>
                <div style={{ fontSize: "12px", marginTop: "8px", color: "rgba(255,255,255,0.3)" }}>Preview not available for this file type</div>
                <a href={previewFile.url} download={previewFile.name} style={{ display: "inline-block", marginTop: "16px", color: "rgba(255,255,255,0.55)", fontSize: "13px" }}>↓ Download to view</a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── File Chips ─────────────────────────────────────────────────
  const FileChips = ({ fileList, onRemove }) => (
    <div className="file-chip-row">
      {fileList.map((f, idx) => (
        <div key={idx} className="file-chip">
          <span onClick={() => openPreview(f)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }} title="Click to preview">
            {getFileIcon(f)} {f.name}
          </span>
          {onRemove && <button onClick={() => onRemove(idx)}>✕</button>}
        </div>
      ))}
    </div>
  );

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  const sendDisabled     = isGenerating || (!input.trim() && files.length === 0 && !editedResearch);
  const researchDisabled = isGenerating || isResearching || !input.trim();

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="chat-window" onMouseUp={(e) => handleMouseUp(e)}>
      <FilePreviewModal />

      {isEmpty ? (
        <>
          <div className="empty-wrapper">
            <h2>How can I help you <span>today?</span></h2>
            <p className="subtitle">Your creative partner for scriptwriting, asset generation, and video planning.</p>
          </div>

          <div className="bottom-control-bar">
            <div className="glass-panel">
              <div className="dropdown-row">
                <Clients onChange={setSelectedClient} />
                <Business_Unit onChange={setSelectedBU} />
                <Videotype onChange={setSelectedVideoType} />
                <VideoTone onChange={setSelectedVideoTone} />
                <DURATION_OPTIONS onChange={setSelectedDuration} />
              </div>

              <div
                className={`chat-input-area-og ${isDragging ? "drag-active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
                  hidden
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                />

                {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} />}

                <textarea
                  placeholder="Start generating..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                  cols={50}
                  disabled={isGenerating}
                />

                <div className="og-bottom-row">
                  <div className="og-bottom-left">
                    <button className="attach-btn-og" onClick={() => fileInputRef.current.click()} title="Attach files" disabled={isGenerating}>📎</button>
                  </div>
                  <div className="og-bottom-right">
                    <button
                      className="btn-research"
                      onClick={runResearch}
                      disabled={researchDisabled}
                      style={{ opacity: researchDisabled ? 0.4 : 1 }}
                    >
                      🔍 {isResearching ? "Researching…" : "Research"}
                    </button>
                    <button
                      className="btn-send"
                      onClick={generateScript}
                      disabled={sendDisabled}
                      style={{ opacity: sendDisabled ? 0.4 : 1 }}
                    >
                      {isGenerating ? "Generating…" : editedResearch ? "✦ Generate Script →" : "Send →"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {researchError && (
            <div style={{ position: "fixed", bottom: "340px", left: "50%", transform: "translateX(-50%)", zIndex: 20, color: "rgba(255,100,100,0.9)", fontSize: "13px", fontFamily: "'Inter', sans-serif", background: "rgba(255,50,50,0.06)", padding: "8px 18px", borderRadius: "9999px", border: "1px solid rgba(255,50,50,0.15)" }}>
              ⚠️ {researchError}
            </div>
          )}
        </>

      ) : (
        <div className="chat-container">
          <div className="chat-history" ref={chatHistoryRef}>
            {loadingMessages && (
              <div style={{ textAlign: "center", padding: "12px", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "'Inter', sans-serif" }}>
                Loading older messages…
              </div>
            )}

            {messages.map((msg, i) => (
              // Use real DB id when available, temp id during streaming, index as last resort
              <div key={msg.id ?? i} className={`chat-bubble ${msg.sender}`}>
                {msg.sender === "bot" ? (
                  <BotMessage msg={msg} onFeedback={sendFeedback} />
                ) : (
                  <div>
                    {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}
                    {msg.files?.length > 0 && <FileChips fileList={msg.files} />}

                    {msg.researchPending && <ResearchingIndicator />}

                    {msg.researchData && (
                      <InlineResearchPanel
                        research={msg.researchData}
                        transcriptCount={msg.transcriptCount}
                        onResearchChange={setEditedResearch}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}

            {pipelineStatus && (
              <div className="pipeline-status">⚙️ {pipelineStatus}</div>
            )}

            <div ref={chatEndRef} />
          </div>

          {researchError && (
            <div style={{ color: "rgba(255,100,100,0.9)", fontSize: "13px", margin: "8px 16px", fontFamily: "'Inter', sans-serif", background: "rgba(255,50,50,0.06)", padding: "8px 16px", borderRadius: "9999px", border: "1px solid rgba(255,50,50,0.15)" }}>
              ⚠️ {researchError}
            </div>
          )}

          <div
            className={`chat-input-area ${isDragging ? "drag-active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="chat-input-inner">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
                hidden
                onChange={(e) => setFiles(Array.from(e.target.files))}
              />

              <button className="attach-btn" onClick={() => fileInputRef.current.click()} title="Attach files" disabled={isGenerating}>📎</button>

              {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} />}

              <textarea
                placeholder="Start generating..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                cols={50}
                disabled={isGenerating}
              />

              <button
                onClick={runResearch}
                disabled={researchDisabled}
                style={{ opacity: researchDisabled ? 0.4 : 1 }}
              >
                🔍 {isResearching ? "Researching…" : "Research"}
              </button>

              <button
                onClick={generateScript}
                disabled={sendDisabled}
                style={{ opacity: sendDisabled ? 0.4 : 1 }}
              >
                {isGenerating ? "Generating…" : editedResearch ? "✦ Generate Script →" : "Send →"}
              </button>
            </div>
          </div>

          <FloatingEditMenu
            position={menuPosition}
            onAction={handleFloatingAction}
            onAskAI={handleAskAI}
          />
        </div>
      )}
    </div>
  );
}

export default ChatWindow;