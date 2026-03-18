


import { useState, useRef, useEffect } from "react";
import "./chatWindow.css";
import { useChat } from "../contexts/ChatContext";
import ChatResponse from "./chat_message.jsx";
import FloatingEditMenu from "./floatingEdit.jsx";
import { supabase } from "../supabase";
import Clients from "./dropdown/clients.jsx";
import Business_Unit from "./dropdown/BU.jsx";
import Videotype from "./dropdown/videoType.jsx";
import VideoTone from "./dropdown/video_tone.jsx";
import DURATION_OPTIONS from "./dropdown/duration.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const API_BASE_URL = "http://localhost:8000";
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
        backgroundColor: "#282a2c",
        border: "1px solid #3a3a3a",
        borderRadius: "6px",
        color: copied ? "#4caf50" : "#aaa",
        cursor: "pointer",
        fontSize: "13px",
        padding: "4px 10px",
        transition: "color 0.2s",
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
      <button style={{ backgroundColor: "#282a2c" }} onClick={() => onFeedback(1, msg.prompt, msg.content)}>
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
  const [draft, setDraft]     = useState(value);
  const inputRef              = useRef(null);

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
          style={{ flex: 1, background: "#0a0f1a", border: `1px solid ${borderColor}`, borderRadius: "4px", color, fontSize: "12px", padding: "3px 8px", outline: "none" }}
        />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
      <span onClick={() => setEditing(true)} title="Click to edit" style={{ fontSize: "12px", color: textColor, lineHeight: 1.5, cursor: "text", flex: 1 }}>
        • {value}
      </span>
      <button onClick={onDelete} title="Remove" style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "11px", padding: "0 2px", lineHeight: 1, opacity: 0.6 }}>✕</button>
    </div>
  );
};

// ── Editable List ──────────────────────────────────────────────
const EditableList = ({ items, setItems, label, color, bgColor, borderColor, textColor }) => {
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding]   = useState(false);
  const addRef                = useRef(null);

  useEffect(() => { if (adding) addRef.current?.focus(); }, [adding]);

  const commitAdd = () => {
    if (newItem.trim()) setItems([...items, newItem.trim()]);
    setNewItem("");
    setAdding(false);
  };

  return (
    <div style={{ background: bgColor, borderRadius: "8px", padding: "12px 14px", border: `1px solid ${borderColor}` }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color, marginBottom: "8px", letterSpacing: "1px", textTransform: "uppercase" }}>
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
            style={{ flex: 1, background: "#0a0f1a", border: `1px solid ${borderColor}`, borderRadius: "4px", color: textColor, fontSize: "12px", padding: "3px 8px", outline: "none" }}
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ background: "none", border: `1px dashed ${borderColor}`, borderRadius: "4px", color, fontSize: "11px", cursor: "pointer", padding: "3px 10px", marginTop: "6px", opacity: 0.7, width: "100%" }}
        >
          + Add
        </button>
      )}
    </div>
  );
};

// ── Research Card ──────────────────────────────────────────────
const ResearchCard = ({ research, onGenerate, onDiscard }) => {
  if (!research) return null;

  const [projIntel, setProjIntel] = useState(research.project_intelligence ?? "");
  const [summary,   setSummary]   = useState(research.niche_summary ?? research.niche_summary_title ?? "");
  const [hooks,     setHooks]     = useState(research.winning_hooks     ?? []);
  const [pains,     setPains]     = useState(research.top_pain_points   ?? []);
  const [angle,     setAngle]     = useState(research.recommended_angle ?? "");

  const buildEditedResearch = () => ({
    ...research,
    project_intelligence: projIntel,
    niche_summary:        summary,
    winning_hooks:        hooks,
    top_pain_points:      pains,
    recommended_angle:    angle,
  });

  const sectionStyle = { background: "#0d1520", borderRadius: "8px", padding: "12px 16px", marginBottom: "14px" };
  const labelStyle   = { fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" };
  const textareaBase = { width: "100%", background: "transparent", border: "none", fontSize: "13px", lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", padding: 0, boxSizing: "border-box" };

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a1f2e 0%, #12151f 100%)",
      border: "1px solid #2a3050", borderRadius: "12px",
      padding: "20px 24px", margin: "12px 0", maxWidth: "760px",
      maxHeight: "70vh", overflowY: "auto",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <span style={{ fontSize: "18px" }}>🔬</span>
        <span style={{ fontWeight: 700, fontSize: "15px", color: "#e0e8ff" }}>
          Research Complete — edit anything before generating
        </span>
        <span style={{ marginLeft: "auto", fontSize: "11px", color: "#5a7a9a", background: "#0d1420", padding: "2px 8px", borderRadius: "20px", border: "1px solid #1e3050", whiteSpace: "nowrap" }}>
          {research.transcript_count ?? 0} transcripts
        </span>
      </div>

      {/* Project Intelligence */}
      {projIntel !== undefined && (
        <div style={{ ...sectionStyle, borderLeft: "3px solid #4f7cff" }}>
          <div style={{ ...labelStyle, color: "#4f7cff" }}>Project Intelligence</div>
          <textarea
            value={projIntel}
            onChange={(e) => setProjIntel(e.target.value)}
            rows={Math.min(14, (projIntel.match(/\n/g) || []).length + 3)}
            style={{ ...textareaBase, color: "#b0c4de" }}
          />
        </div>
      )}

      {/* Niche Summary */}
      {summary !== undefined && (
        <div style={{ ...sectionStyle, borderLeft: "3px solid #7b8fcc" }}>
          <div style={{ ...labelStyle, color: "#7b8fcc" }}>Niche Summary</div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            style={{ ...textareaBase, color: "#8899bb" }}
          />
        </div>
      )}

      {/* Hooks + Pains */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        <EditableList items={hooks} setItems={setHooks} label="Winning Hooks" color="#4caf50" bgColor="#0d1a10" borderColor="#1a3020" textColor="#a0c8a0" />
        <EditableList items={pains} setItems={setPains} label="Pain Points"   color="#ef5350" bgColor="#1a0d0d" borderColor="#3a1a1a" textColor="#c09090" />
      </div>

      {/* Recommended Angle */}
      {angle !== undefined && (
        <div style={{ background: "#1a1500", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", border: "1px solid #3a2e00" }}>
          <div style={{ ...labelStyle, color: "#ffc107" }}>Recommended Angle</div>
          <textarea value={angle} onChange={(e) => setAngle(e.target.value)} rows={2} style={{ ...textareaBase, color: "#d4b060" }} />
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "10px", position: "sticky", bottom: 0, background: "linear-gradient(0deg, #12151f 80%, transparent)", paddingTop: "12px" }}>
        <button
          onClick={() => onGenerate(buildEditedResearch())}
          style={{ flex: 1, padding: "10px 0", borderRadius: "8px", background: "linear-gradient(135deg, #3a5fff, #2a47cc)", border: "none", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
        >
          ✦ Generate Script
        </button>
        <button
          onClick={onDiscard}
          style={{ padding: "10px 16px", borderRadius: "8px", background: "transparent", border: "1px solid #2a3050", color: "#5a7a9a", fontSize: "13px", cursor: "pointer" }}
        >
          Discard
        </button>
      </div>
    </div>
  );
};

// ── Researching Spinner ────────────────────────────────────────
const ResearchingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", background: "#0d1520", border: "1px solid #2a3050", maxWidth: "320px", margin: "8px 0" }}>
    <span style={{ fontSize: "18px", animation: "spin 1.2s linear infinite", display: "inline-block" }}>🔍</span>
    <div>
      <div style={{ fontSize: "13px", color: "#7b9fff", fontWeight: 600 }}>Researching…</div>
      <div style={{ fontSize: "11px", color: "#4a6080", marginTop: "2px" }}>Searching web + analysing YouTube</div>
    </div>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Main Component ─────────────────────────────────────────────
function ChatWindow() {
  const { activeChat, addMessage, updateLastMessage } = useChat();
  const chatId = activeChat?.id ?? null;
  const safeMessages = activeChat?.messages ?? [];
  const isEmpty = safeMessages.length === 0;

  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedBU, setSelectedBU] = useState("");
  const [selectedVideoType, setSelectedVideoType] = useState("");
  const [selectedVideoTone, setSelectedVideoTone] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  const [isResearching, setIsResearching] = useState(false);
  const [researchData,  setResearchData]  = useState(null);
  const [researchId,    setResearchId]    = useState(null);
  const [researchError, setResearchError] = useState(null);

  const savedRangeRef = useRef(null);
  const lastPromptRef = useRef("");
  const lastOutputRef = useRef("");
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Scroll to bottom on new messages ──────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  // ── Reset on chat switch ───────────────────────────────────────
  useEffect(() => {
    setInput("");
    setFiles([]);
    setSelectionInfo(null);
    setResearchData(null);
    setResearchId(null);
    setResearchError(null);
  }, [activeChat?.id]);

  // ── Selection change listener ──────────────────────────────────
  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelectionInfo(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionInfo({
        text: sel.toString(),
        position: {
          top: rect.top - 40 + window.scrollY,
          left: rect.left + rect.width / 2,
        },
      });
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  // ── Mouse up — only show menu inside bot bubbles ───────────────
  const handleMouseUp = (e) => {
    if (e.target.closest(".floating-menu")) return;
    const selection = window.getSelection();
    const text = selection.toString();

    if (!text) {
      setMenuPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const botBubble = (
      container.nodeType === Node.TEXT_NODE ? container.parentElement : container
    ).closest(".chat-bubble.bot");

    if (!botBubble) {
      setMenuPosition(null);
      return;
    }

    savedRangeRef.current = range.cloneRange();

    const rect = range.getBoundingClientRect();
    setSelectedText(text);
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  // ── Floating menu — edit selected text inline via /edit ────────
  const handleFloatingAction = async (instruction) => {
    if (!selectedText || !savedRangeRef.current) return;
    setMenuPosition(null);

    const formData = new FormData();
    formData.append("instruction", instruction);
    formData.append("selected_text", selectedText);

    try {
      const res = await fetch(`${API_BASE_URL}/edit`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const editedText = data.result;
      if (!editedText) return;

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);

      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(editedText));

      selection.removeAllRanges();
      savedRangeRef.current = null;
      setSelectedText("");
    } catch {
      console.error("Inline edit failed");
    }
  };

  // ── Floating menu — Ask AI (custom prompt) ─────────────────────
  const handleAskAI = async (customPrompt) => {
    const textToEdit = selectedText;
    const savedRange = savedRangeRef.current;

    if (!textToEdit || !savedRange) return;
    setMenuPosition(null);

    const formData = new FormData();
    formData.append("instruction", customPrompt);
    formData.append("selected_text", textToEdit);

    try {
      const res = await fetch(`${API_BASE_URL}/edit`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const editedText = data.result;
      if (!editedText) return;

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRange);

      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(editedText));

      selection.removeAllRanges();
      savedRangeRef.current = null;
      setSelectedText("");
    } catch {
      console.error("askAI edit failed");
    }
  };

  // ── Drag & Drop ────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  // ── File Preview ───────────────────────────────────────────────
  const openPreview = (file) => {
    const url = file.url || URL.createObjectURL(file);
    setPreviewFile({ name: file.name, url, type: file.type });
  };

  const closePreview = () => setPreviewFile(null);

  const safeAddMessage = (message) => addMessage(chatId, message);
  const discardResearch = () => { setResearchData(null); setResearchId(null); };

  // ── Prompt Builder ─────────────────────────────────────────────
  const buildFinalPrompt = () => {
    const clientText = formatList(selectedClient) || "the client";
    const buText = formatList(selectedBU);
    const typeText = formatList(selectedVideoType) || "video";
    const toneText = formatList(selectedVideoTone) || "professional";
    const durationText = selectedDuration || "unspecified duration";

    return `create a ${durationText} ${typeText} video script for ${clientText} ,which oporates in ${buText} sectors, about ${input}, maintain a ${toneText} tone consistently.`.trim();
  };

  // ── Feedback ───────────────────────────────────────────────────
  const sendFeedback = async (rating, prompt, output) => {
    const formData = new FormData();
    formData.append("prompt", lastPromptRef.current);
    formData.append("output", lastOutputRef.current);
    formData.append("rating", rating);

    await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      body: formData,
    });
  };

  // ── STEP 1: Research ───────────────────────────────────────────
  const runResearch = async () => {
    if (!input.trim()) return;
    setIsResearching(true);
    setResearchData(null);
    setResearchId(null);
    setResearchError(null);

    const formData = new FormData();
    formData.append("client",        formatList(selectedClient));
    formData.append("business_unit", formatList(selectedBU));
    formData.append("video_type",    formatList(selectedVideoType));
    formData.append("video_tone",    formatList(selectedVideoTone));
    formData.append("duration",      selectedDuration);
    formData.append("prompt",        input);

    try {
      const res  = await fetch(`${API_BASE_URL}/research`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.research) {
        setResearchData(data.research);
        setResearchId(data.research_id);
      } else {
        setResearchError(data.error || "Research failed — try again");
      }
    } catch {
      setResearchError("Could not reach server");
    } finally {
      setIsResearching(false);
    }
  };

  // ── STEP 2: Generate (also used as direct send) ────────────────
  const generateScript = async (editedResearch) => {
    if (!input.trim() && files.length === 0) return;

    const filePreviewData = files.map((f) => ({
      name: f.name,
      type: f.type,
      url: URL.createObjectURL(f),
    }));

    const finalPrompt = buildFinalPrompt();
    lastPromptRef.current = finalPrompt;

    await safeAddMessage({
      role: "user",
      content: input,
      client: selectedClient,
      bu: selectedBU,
      type: selectedVideoType,
      tone: selectedVideoTone,
      files: filePreviewData,
    });

    setResearchData(null);
    setInput("");
    setFiles([]);

    const formData = new FormData();
    formData.append("prompt",        finalPrompt);
    formData.append("client",        formatList(selectedClient));
    formData.append("business_unit", formatList(selectedBU));
    formData.append("video_type",    formatList(selectedVideoType));
    formData.append("video_tone",    formatList(selectedVideoTone));
    formData.append("duration",      selectedDuration);
    if (researchId)     formData.append("research_id",    researchId);
    if (editedResearch) formData.append("research_brief", JSON.stringify(editedResearch));
    files.forEach((f) => formData.append("files", f));

    try {
      const { data: inserted } = await supabase
        .from("messages")
        .insert({ chat_id: chatId, role: "assistant", content: "" })
        .select()
        .single();

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        body: formData,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let fullText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("status:") || line.startsWith("<!-- ")) {
            const status = line
              .replace("status:", "")
              .replace("<!--", "")
              .replace("-->", "")
              .trim();
            setPipelineStatus(status);
            continue;
          }
          if (line.startsWith("result:")) {
            fullText = line.replace("result:", "").trim();
            continue;
          }
          if (line.startsWith("error:")) {
            fullText = `⚠️ ${line.replace("error:", "").trim()}`;
            continue;
          }
          if (line.startsWith("<!-- debug:")) continue;
          if (line.trim() && fullText) {
            fullText += "\n" + line;
          }
        }

        updateLastMessage(chatId, fullText);
      }

      // Fix escaped newlines from backend
      fullText = fullText.replace(/\\n/g, "\n");

      lastOutputRef.current = fullText;
      setPipelineStatus(null);
      setResearchId(null);

      updateLastMessage(chatId, fullText, finalPrompt);

      await supabase
        .from("messages")
        .update({ content: fullText })
        .eq("id", inserted.id);
    } catch (err) {
      console.error("generateScript error:", err);
      safeAddMessage({ role: "assistant", content: "⚠️ Server error" });
    }
  };

  // ── File Preview Modal ─────────────────────────────────────────
  const FilePreviewModal = () => {
    if (!previewFile) return null;

    const isImage = previewFile.type?.startsWith("image/");
    const isPDF = previewFile.type === "application/pdf";

    return (
      <div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
        onClick={closePreview}
      >
        <div
          style={{
            background: "#1a1a2e",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "90vw",
            maxHeight: "85vh",
            width: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            border: "1px solid #2a2a4a",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: "14px", color: "#e0e0e0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {getFileIcon({ name: previewFile.name, type: previewFile.type })} {previewFile.name}
            </span>
            <button
              onClick={closePreview}
              style={{
                background: "none", border: "1px solid #444",
                color: "#aaa", borderRadius: "6px",
                padding: "4px 12px", cursor: "pointer",
                fontSize: "13px", flexShrink: 0, marginLeft: "16px",
              }}
            >
              ✕ Close
            </button>
          </div>

          <div style={{ overflow: "auto", flex: 1, borderRadius: "8px" }}>
            {isImage && (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", display: "block", margin: "0 auto" }}
              />
            )}
            {isPDF && (
              <iframe
                src={previewFile.url}
                title={previewFile.name}
                style={{ width: "100%", height: "70vh", border: "none", borderRadius: "8px" }}
              />
            )}
            {!isImage && !isPDF && (
              <div style={{ color: "#aaa", textAlign: "center", padding: "48px", fontSize: "14px" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                  {getFileIcon({ name: previewFile.name, type: previewFile.type })}
                </div>
                <div>{previewFile.name}</div>
                <div style={{ fontSize: "12px", marginTop: "8px", color: "#666" }}>
                  Preview not available for this file type
                </div>
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  style={{ display: "inline-block", marginTop: "16px", color: "#7b7bf7", fontSize: "13px" }}
                >
                  ↓ Download to view
                </a>
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
          <span
            onClick={() => openPreview(f)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            title="Click to preview"
          >
            {getFileIcon(f)} {f.name}
          </span>
          {onRemove && (
            <button onClick={() => onRemove(idx)}>✕</button>
          )}
        </div>
      ))}
    </div>
  );

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="chat-window" onMouseUp={(e) => handleMouseUp(e)}>
      <FilePreviewModal />

      {isEmpty ? (
        /* ── Empty / Landing State ── */
        <div className="empty-wrapper">
          <h2>How can I help you today?</h2>

          <div className="input-row">
            <Clients onChange={setSelectedClient} />
            <Business_Unit onChange={setSelectedBU} />
            <Videotype onChange={setSelectedVideoType} />
            <VideoTone onChange={setSelectedVideoTone} />
            <DURATION_OPTIONS onChange={setSelectedDuration} />

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

              <button
                className="attach-btn-og"
                onClick={() => fileInputRef.current.click()}
                title="Attach files"
              >
                📎
              </button>

              {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} />}

              <textarea
                placeholder="Start generating..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                cols={50}
              />

              <button
                onClick={runResearch}
                disabled={isResearching || !input.trim()}
                style={{ opacity: isResearching || !input.trim() ? 0.5 : 1 }}
              >
                {isResearching ? "🔍 Researching…" : "🔍 Research & Generate"}
              </button>

              {/* <button
                onClick={() => generateScript(null)}
                disabled={!input.trim() && files.length === 0}
                style={{ opacity: !input.trim() && files.length === 0 ? 0.5 : 1 }}
              >
                Send
              </button> */}
            </div>
          </div>

          {isResearching && <ResearchingIndicator />}

          {researchData && (
            <ResearchCard
              research={researchData}
              onGenerate={(e) => generateScript(e)}
              onDiscard={discardResearch}
            />
          )}

          {researchError && (
            <div style={{ color: "#ef5350", fontSize: "13px", marginTop: "8px" }}>⚠️ {researchError}</div>
          )}
        </div>

      ) : (
        /* ── Active Chat ── */
        <div className="chat-container">
          <div className="chat-history">
            {activeChat?.messages?.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender}`}>
                {msg.sender === "bot" ? (
                  <BotMessage msg={msg} onFeedback={sendFeedback} />
                ) : (
                  <div>
                    {msg.text && <p>{msg.text}</p>}
                    {msg.files?.length > 0 && (
                      <FileChips fileList={msg.files} />
                    )}
                  </div>
                )}
              </div>
            ))}

            {pipelineStatus && (
              <div className="pipeline-status">
                ⚙️ {pipelineStatus}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {isResearching && (
            <div style={{ padding: "0 16px" }}><ResearchingIndicator /></div>
          )}

          {researchData && (
            <div style={{ padding: "0 16px" }}>
              <ResearchCard
                research={researchData}
                onGenerate={(e) => generateScript(e)}
                onDiscard={discardResearch}
              />
            </div>
          )}

          {researchError && (
            <div style={{ color: "#ef5350", fontSize: "13px", margin: "8px 16px" }}>⚠️ {researchError}</div>
          )}

          <div
            className={`chat-input-area ${isDragging ? "drag-active" : ""}`}
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

            <button
              className="attach-btn"
              onClick={() => fileInputRef.current.click()}
              title="Attach files"
            >
              📎
            </button>

            {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} />}

            <textarea
              placeholder="Start generating..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              cols={50}
            />

            <button
              onClick={runResearch}
              disabled={isResearching || !input.trim()}
              style={{ opacity: isResearching || !input.trim() ? 0.5 : 1 }}
            >
              {isResearching ? "🔍 Researching…" : "🔍 Research & Generate"}
            </button>

            {/* <button
              onClick={() => generateScript(null)}
              disabled={!input.trim() && files.length === 0}
              style={{ opacity: !input.trim() && files.length === 0 ? 0.5 : 1 }}
            >
              Send
            </button> */}
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
