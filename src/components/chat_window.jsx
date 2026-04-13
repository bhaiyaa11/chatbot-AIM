// import { useState, useRef, useEffect } from "react";
// import "./chatWindow.css";
// import { useChat } from "../contexts/ChatContext";
// import ChatResponse from "./chat_message.jsx";
// import FloatingEditMenu from "./floatingEdit.jsx";
// import Clients from "./dropdown/clients.jsx";
// import Business_Unit from "./dropdown/BU.jsx";
// import Videotype from "./dropdown/videoType.jsx";
// import VideoTone from "./dropdown/video_tone.jsx";
// import DURATION_OPTIONS from "./dropdown/duration.jsx";

// const API_BASE_URL = "http://localhost:8000";
// // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // ── Copy Button ────────────────────────────────────────────────
// const CopyButton = ({ editableRef }) => {
//   const [copied, setCopied] = useState(false);
//   const handleCopy = async () => {
//     const text = editableRef.current?.innerText ?? "";
//     await navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };
//   return (
//     <button
//       onClick={handleCopy}
//       title="Copy response"
//       style={{
//         backgroundColor: "#1f1f1f",
//         border: "1px solid rgba(255,255,255,0.07)",
//         borderRadius: "9999px",
//         color: copied ? "#6fcf97" : "rgba(255,255,255,0.5)",
//         cursor: "pointer",
//         fontSize: "12px",
//         fontFamily: "'Inter', sans-serif",
//         fontWeight: 500,
//         padding: "5px 14px",
//         transition: "color 0.2s, background 0.2s",
//       }}
//     >
//       {copied ? "✓ Copied" : "⧉ Copy"}
//     </button>
//   );
// };

// // ── Bot Message ────────────────────────────────────────────────
// const BotMessage = ({ msg, onFeedback }) => {
//   const editableRef = useRef(null);
//   return (
//     <div className="feedback-row-rating">
//       <button
//   style={{
//     backgroundColor: "#1f1f1f",
//     color: "#fff",
//     border: "none",
//     padding: "8px 12px",
//     borderRadius: "8px",
//     cursor: "pointer",
//     transition: "all 0.15s ease",
//   }}
//   onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.3)")}
//   onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
//   onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//   onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6fcf97")}
//   onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1f1f1f")}
//   onClick={() => onFeedback(1, msg.prompt, msg.content)}
// >
//   👍
// </button>
//       <CopyButton editableRef={editableRef} />
//       <ChatResponse ref={editableRef} reply={msg.content} />
//     </div>
//   );
// };

// // ── File Icon Helper ───────────────────────────────────────────
// const getFileIcon = (file) => {
//   if (file.type?.startsWith("image/")) return "🖼️";
//   if (file.type === "application/pdf") return "📕";
//   if (file.name?.endsWith(".docx")) return "📝";
//   if (file.name?.endsWith(".xlsx")) return "📊";
//   if (file.name?.endsWith(".pptx")) return "📋";
//   if (file.name?.endsWith(".csv")) return "📊";
//   return "📄";
// };

// // ── Format list helper ─────────────────────────────────────────
// const formatList = (value) => {
//   if (!value || value.length === 0) return "";
//   if (Array.isArray(value)) return value.join(", ");
//   return value;
// };

// // ── Editable Tag ───────────────────────────────────────────────
// const EditableTag = ({ value, color, borderColor, textColor, onChange, onDelete }) => {
//   const [editing, setEditing] = useState(false);
//   const [draft, setDraft] = useState(value);
//   const inputRef = useRef(null);
//   useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
//   const commit = () => {
//     setEditing(false);
//     if (draft.trim()) onChange(draft.trim());
//     else onDelete();
//   };
//   if (editing) {
//     return (
//       <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
//         <input
//           ref={inputRef} value={draft}
//           onChange={(e) => setDraft(e.target.value)}
//           onBlur={commit}
//           onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
//           style={{ flex: 1, background: "#000000", border: `1px solid ${borderColor}`, borderRadius: "9999px", color, fontSize: "12px", fontFamily: "'Inter', sans-serif", padding: "4px 12px", outline: "none" }}
//         />
//       </div>
//     );
//   }
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
//       <span
//         onClick={() => setEditing(true)}
//         title="Click to edit"
//         style={{ fontSize: "12px", color: textColor, lineHeight: 1.5, cursor: "text", flex: 1, fontFamily: "'Inter', sans-serif" }}
//       >
//         • {value}
//       </span>
//       <button
//         onClick={onDelete}
//         title="Remove"
//         style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "11px", padding: "0 2px", lineHeight: 1 }}
//       >✕</button>
//     </div>
//   );
// };

// // ── Editable List ──────────────────────────────────────────────
// const EditableList = ({ items, setItems, label, color, bgColor, borderColor, textColor }) => {
//   const [newItem, setNewItem] = useState("");
//   const [adding, setAdding] = useState(false);
//   const addRef = useRef(null);
//   useEffect(() => { if (adding) addRef.current?.focus(); }, [adding]);
//   const commitAdd = () => {
//     if (newItem.trim()) setItems([...items, newItem.trim()]);
//     setNewItem("");
//     setAdding(false);
//   };
//   return (
//     <div style={{ background: bgColor, borderRadius: "14px", padding: "12px 14px", border: `1px solid ${borderColor}` }}>
//       <div style={{ fontSize: "10px", fontWeight: 700, color, marginBottom: "8px", letterSpacing: "1.2px", textTransform: "uppercase", fontFamily: "'Manrope', sans-serif" }}>
//         {label}
//       </div>
//       {items.map((item, i) => (
//         <EditableTag
//           key={i} value={item} color={color} borderColor={borderColor} textColor={textColor}
//           onChange={(v) => setItems(items.map((x, j) => j === i ? v : x))}
//           onDelete={() => setItems(items.filter((_, j) => j !== i))}
//         />
//       ))}
//       {adding ? (
//         <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
//           <input
//             ref={addRef} value={newItem}
//             onChange={(e) => setNewItem(e.target.value)}
//             onBlur={commitAdd}
//             onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") setAdding(false); }}
//             placeholder="Type and press Enter…"
//             style={{ flex: 1, background: "#000", border: `1px solid ${borderColor}`, borderRadius: "9999px", color: textColor, fontSize: "12px", fontFamily: "'Inter', sans-serif", padding: "4px 12px", outline: "none" }}
//           />
//         </div>
//       ) : (
//         <button
//           onClick={() => setAdding(true)}
//           style={{ background: "none", border: `1px dashed ${borderColor}`, borderRadius: "9999px", color, fontSize: "11px", fontFamily: "'Inter', sans-serif", cursor: "pointer", padding: "4px 12px", marginTop: "6px", opacity: 0.6, width: "100%" }}
//         >
//           + Add
//         </button>
//       )}
//     </div>
//   );
// };

// // ── Inline Research Pill + Expandable Panel ────────────────────
// const InlineResearchPanel = ({ research, onResearchChange, transcriptCount }) => {
//   const [open, setOpen] = useState(false);

//   const [projIntel, setProjIntel] = useState(research.project_intelligence ?? "");
//   const [summary, setSummary]     = useState(research.niche_summary ?? research.niche_summary_title ?? "");
//   const [hooks, setHooks]         = useState(research.winning_hooks ?? []);
//   const [pains, setPains]         = useState(research.top_pain_points ?? []);
//   const [angle, setAngle]         = useState(research.recommended_angle ?? "");

//   useEffect(() => {
//     onResearchChange({
//       ...research,
//       project_intelligence: projIntel,
//       niche_summary: summary,
//       winning_hooks: hooks,
//       top_pain_points: pains,
//       recommended_angle: angle,
//     });
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [projIntel, summary, hooks, pains, angle]);

//   const sectionStyle = {
//     background: "#0a0a0a",
//     borderRadius: "14px",
//     padding: "12px 16px",
//     marginBottom: "10px",
//     border: "1px solid rgba(255,255,255,0.06)",
//   };
//   const labelStyle = {
//     fontSize: "10px",
//     fontWeight: 700,
//     letterSpacing: "1.2px",
//     textTransform: "uppercase",
//     marginBottom: "8px",
//     fontFamily: "'Manrope', sans-serif",
//   };
//   const textareaBase = {
//     width: "100%",
//     background: "transparent",
//     border: "none",
//     fontSize: "13px",
//     fontFamily: "'Inter', sans-serif",
//     lineHeight: 1.6,
//     resize: "vertical",
//     outline: "none",
//     padding: 0,
//     boxSizing: "border-box",
//     color: "rgba(255,255,255,0.72)",
//   };

//   return (
//     <div style={{ marginTop: "8px", maxWidth: "520px" }}>
//       <button
//         onClick={() => setOpen((v) => !v)}
//         style={{
//           display: "inline-flex",
//           alignItems: "center",
//           gap: "7px",
//           background: open ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.10)",
//           border: "1px solid rgba(139,92,246,0.35)",
//           borderRadius: "9999px",
//           padding: "5px 13px 5px 10px",
//           cursor: "pointer",
//           fontFamily: "'Inter', sans-serif",
//           fontSize: "12px",
//           color: "rgba(200,180,255,0.9)",
//           transition: "background 0.15s",
//         }}
//       >
//         <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
//           <circle cx="5.5" cy="5.5" r="4" stroke="rgba(180,150,255,0.8)" strokeWidth="1.3"/>
//           <line x1="8.8" y1="8.8" x2="11.5" y2="11.5" stroke="rgba(180,150,255,0.8)" strokeWidth="1.3" strokeLinecap="round"/>
//         </svg>
//         Research — {transcriptCount ?? 0} sources analyzed
//         <svg
//           width="10" height="10" viewBox="0 0 10 10" fill="none"
//           style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
//         >
//           <path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(180,150,255,0.7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
//         </svg>
//       </button>

//       {open && (
//         <div
//           style={{
//             marginTop: "8px",
//             background: "rgba(19,19,19,0.95)",
//             border: "1px solid rgba(139,92,246,0.25)",
//             borderRadius: "1.1rem",
//             padding: "16px 18px",
//             maxHeight: "420px",
//             overflowY: "auto",
//           }}
//         >
//           <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", marginBottom: "14px" }}>
//             Edit anything below — changes are picked up when you hit Generate Script.
//           </div>

//           {projIntel !== undefined && (
//             <div style={{ ...sectionStyle, borderLeft: "2px solid rgba(255,255,255,0.18)" }}>
//               <div style={{ ...labelStyle, color: "rgba(255,255,255,0.4)" }}>Project Intelligence</div>
//               <textarea
//                 value={projIntel}
//                 onChange={(e) => setProjIntel(e.target.value)}
//                 rows={Math.min(10, (projIntel.match(/\n/g) || []).length + 3)}
//                 style={textareaBase}
//               />
//             </div>
//           )}

//           {summary !== undefined && (
//             <div style={{ ...sectionStyle, borderLeft: "2px solid rgba(255,255,255,0.10)" }}>
//               <div style={{ ...labelStyle, color: "rgba(255,255,255,0.35)" }}>Niche Summary</div>
//               <textarea
//                 value={summary}
//                 onChange={(e) => setSummary(e.target.value)}
//                 rows={3}
//                 style={textareaBase}
//               />
//             </div>
//           )}

//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
//             <EditableList
//               items={hooks} setItems={setHooks}
//               label="Winning Hooks"
//               color="rgba(255,255,255,0.55)" bgColor="#111"
//               borderColor="rgba(255,255,255,0.08)" textColor="rgba(255,255,255,0.75)"
//             />
//             <EditableList
//               items={pains} setItems={setPains}
//               label="Pain Points"
//               color="rgba(255,255,255,0.4)" bgColor="#0e0e0e"
//               borderColor="rgba(255,255,255,0.06)" textColor="rgba(255,255,255,0.6)"
//             />
//           </div>

//           {angle !== undefined && (
//             <div style={{ background: "#111", borderRadius: "14px", padding: "10px 14px", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "2px solid rgba(255,255,255,0.22)" }}>
//               <div style={{ ...labelStyle, color: "rgba(255,255,255,0.45)" }}>Recommended Angle</div>
//               <textarea
//                 value={angle}
//                 onChange={(e) => setAngle(e.target.value)}
//                 rows={2}
//                 style={textareaBase}
//               />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Researching Spinner ────────────────────────────────────────
// const ResearchingIndicator = () => (
//   <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", borderRadius: "9999px", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.07)", maxWidth: "300px", margin: "8px 0", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
//     <span style={{ fontSize: "16px", animation: "spin 1.2s linear infinite", display: "inline-block" }}>🔍</span>
//     <div>
//       <div style={{ fontSize: "13px", color: "#e5e5e5", fontWeight: 600, fontFamily: "'Manrope', sans-serif" }}>Researching…</div>
//       <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px", fontFamily: "'Inter', sans-serif" }}>Searching web + analysing YouTube</div>
//     </div>
//     <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
//   </div>
// );

// // ── Main Component ─────────────────────────────────────────────
// function ChatWindow() {
//   const {
//     messages, setMessages, addMessage, updateLastMessage,
//     conversationId, setConversationId, loadConversations,
//     isGenerating, setIsGenerating,
//   } = useChat();

//   const [input, setInput]                   = useState("");
//   const [files, setFiles]                   = useState([]);
//   const [isDragging, setIsDragging]         = useState(false);
//   const [selectionInfo, setSelectionInfo]   = useState(null);
//   const [pipelineStatus, setPipelineStatus] = useState(null);
//   const [menuPosition, setMenuPosition]     = useState(null);
//   const [selectedText, setSelectedText]     = useState("");
//   const [previewFile, setPreviewFile]       = useState(null);
//   const [selectedClient, setSelectedClient]         = useState("");
//   const [selectedBU, setSelectedBU]                 = useState("");
//   const [selectedVideoType, setSelectedVideoType]   = useState("");
//   const [selectedVideoTone, setSelectedVideoTone]   = useState("");
//   const [selectedDuration, setSelectedDuration]     = useState("");

//   const [isResearching, setIsResearching]   = useState(false);
//   const [editedResearch, setEditedResearch] = useState(null);
//   const [researchId, setResearchId]         = useState(null);
//   const [researchError, setResearchError]   = useState(null);

//   const savedRangeRef   = useRef(null);
//   const lastPromptRef   = useRef("");
//   const lastOutputRef   = useRef("");
//   const chatEndRef      = useRef(null);
//   const fileInputRef    = useRef(null);
//   const activeConvIdRef = useRef(null);

//   // FLICKER FIX A: ref that holds the temp id of the current optimistic bot
//   // bubble. generateScript stamps the bubble with this id so fetchMessages
//   // can find and replace it by id instead of wiping the whole array.
//   const optimisticBotIdRef = useRef(null);

//   const [page, setPage]                     = useState(1);
//   const [hasMore, setHasMore]               = useState(true);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   const chatHistoryRef  = useRef(null);
//   const loadingRef      = useRef(false);

//   const isEmpty = messages.length === 0 && !loadingMessages;

//   // ── fetchMessages ──────────────────────────────────────────────
//   // Accepts an optional `mergeOptimisticId` param (the temp id of the
//   // optimistic bot bubble). When provided (post-stream sync call) it
//   // MERGES the DB records into the existing array instead of replacing it,
//   // swapping the optimistic bubble for the real DB record by matching ids.
//   //
//   // FLICKER FIX B: the page=1 path is now split into two branches:
//   //   • mergeOptimisticId provided  → merge (no flicker, no full replace)
//   //   • mergeOptimisticId absent    → full replace (conversation switch / manual load)
//   const fetchMessages = async (chatIdParam, pageNum, mergeOptimisticId = null) => {
//     if (loadingRef.current) return;
//     loadingRef.current = true;
//     setLoadingMessages(true);
//     try {
//       const res = await fetch(`${API_BASE_URL}/messages?conversation_id=${chatIdParam}&page=${pageNum}&limit=20`);
//       const data = await res.json();
//       const fetched = Array.isArray(data.messages) ? data.messages : Array.isArray(data) ? data : [];
//       if (fetched.length < 20) setHasMore(false);

//       const ordered = [...fetched].map(m => ({
//         id: m.id,
//         sender: m.role === "assistant" ? "bot" : "user",
//         text: m.content,
//         content: m.content,
//         prompt: m.metadata?.prompt ?? m.prompt ?? "",
//         files: [],
//       }));

//       if (pageNum === 1 && mergeOptimisticId) {
//         // ── POST-STREAM MERGE (no flicker) ──────────────────────────
//         // Do NOT replace the whole array. Instead:
//         // 1. Remove the optimistic bubble (identified by its temp id).
//         // 2. Remove any existing messages whose DB id already exists in the
//         //    incoming records (dedup in case of prior page fetches).
//         // 3. Append the fresh DB records at the end in their correct order.
//         // This means the user sees the streamed content the whole time — it
//         // is never wiped. Only the temp bubble is swapped for the real record.
//         setMessages(prev => {
//           // Step 1: strip the optimistic bubble
//           const withoutOptimistic = prev.filter(m => m.id !== mergeOptimisticId);
//           // Step 2: collect all real DB ids already in local state
//           const existingDbIds = new Set(
//             withoutOptimistic.map(m => m.id).filter(id => id && !id.startsWith("optimistic-"))
//           );
//           // Step 3: only take DB records whose ids are NOT already present
//           // (keeps historical messages that were already loaded)
//           const newRecords = ordered.filter(m => !existingDbIds.has(m.id));
//           // Preserve any non-DB messages (research bubbles etc.) that sit
//           // before the first DB record by keeping withoutOptimistic as the base
//           // and only replacing messages that match incoming DB ids.
//           const baseIds = new Set(ordered.map(m => m.id));
//           const preserved = withoutOptimistic.filter(m => !m.id || !baseIds.has(m.id));
//           return [...preserved, ...ordered];
//         });
//         // Don't scroll — content was already visible during streaming
//       } else if (pageNum === 1) {
//         // ── FULL REPLACE (conversation switch / initial load) ────────
//         setMessages(ordered);
//         requestAnimationFrame(() => { requestAnimationFrame(() => { chatEndRef.current?.scrollIntoView({ behavior: "auto" }); }); });
//       } else {
//         // ── PREPEND older page (infinite scroll up) ──────────────────
//         const container = chatHistoryRef.current;
//         const prevScrollHeight = container?.scrollHeight || 0;
//         setMessages(prev => {
//           const existingIds = new Set(prev.map(m => m.id).filter(Boolean));
//           const fresh = ordered.filter(m => !m.id || !existingIds.has(m.id));
//           return [...fresh, ...prev];
//         });
//         requestAnimationFrame(() => { if (container) container.scrollTop = container.scrollHeight - prevScrollHeight; });
//       }
//     } catch (err) { console.error("Failed to fetch messages:", err); }
//     finally { setLoadingMessages(false); loadingRef.current = false; }
//   };

//   useEffect(() => {
//     setInput(""); setFiles([]); setSelectionInfo(null);
//     setEditedResearch(null); setResearchId(null); setResearchError(null);
//     setMessages([]); setPage(1); setHasMore(true); loadingRef.current = false;
//     if (!conversationId) return;
//     fetchMessages(conversationId, 1);   // no mergeOptimisticId → full replace
//   }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => { if (page > 1 && conversationId) fetchMessages(conversationId, page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     const container = chatHistoryRef.current;
//     if (!container || !conversationId) return;
//     const handleScroll = () => { if (container.scrollTop <= 5 && hasMore && !loadingRef.current) setPage(p => p + 1); };
//     container.addEventListener("scroll", handleScroll);
//     return () => container.removeEventListener("scroll", handleScroll);
//   }, [conversationId, hasMore]);

//   useEffect(() => {
//     if (messages.length === 0) return;
//     const container = chatHistoryRef.current;
//     if (!container) return;
//     const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
//     if (isNearBottom) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages.length]);

//   useEffect(() => {
//     const handleSelection = () => {
//       const sel = window.getSelection();
//       if (!sel || sel.isCollapsed) { setSelectionInfo(null); return; }
//       const range = sel.getRangeAt(0);
//       const rect = range.getBoundingClientRect();
//       setSelectionInfo({ text: sel.toString(), position: { top: rect.top - 40 + window.scrollY, left: rect.left + rect.width / 2 } });
//     };
//     document.addEventListener("selectionchange", handleSelection);
//     return () => document.removeEventListener("selectionchange", handleSelection);
//   }, []);

//   const handleMouseUp = (e) => {
//     if (e.target.closest(".floating-menu")) return;
//     const selection = window.getSelection();
//     const text = selection.toString();
//     if (!text) { setMenuPosition(null); return; }
//     const range = selection.getRangeAt(0);
//     const container = range.commonAncestorContainer;
//     const botBubble = (container.nodeType === Node.TEXT_NODE ? container.parentElement : container).closest(".chat-bubble.bot");
//     if (!botBubble) { setMenuPosition(null); return; }
//     savedRangeRef.current = range.cloneRange();
//     const rect = range.getBoundingClientRect();
//     setSelectedText(text);
//     setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
//   };

//   const handleFloatingAction = async (instruction) => {
//     if (!selectedText || !savedRangeRef.current) return;
//     setMenuPosition(null);
//     const formData = new FormData();
//     formData.append("instruction", instruction);
//     formData.append("selected_text", selectedText);
//     try {
//       const res = await fetch(`${API_BASE_URL}/edit`, { method: "POST", body: formData });
//       const data = await res.json();
//       const editedText = data.result;
//       if (!editedText) return;
//       const sel = window.getSelection();
//       sel.removeAllRanges();
//       sel.addRange(savedRangeRef.current);
//       const r = sel.getRangeAt(0);
//       r.deleteContents();
//       r.insertNode(document.createTextNode(editedText));
//       sel.removeAllRanges();
//       savedRangeRef.current = null;
//       setSelectedText("");
//     } catch { console.error("Inline edit failed"); }
//   };

//   const handleAskAI = async (customPrompt) => {
//     const textToEdit = selectedText;
//     const savedRange = savedRangeRef.current;
//     if (!textToEdit || !savedRange) return;
//     setMenuPosition(null);
//     const formData = new FormData();
//     formData.append("instruction", customPrompt);
//     formData.append("selected_text", textToEdit);
//     try {
//       const res = await fetch(`${API_BASE_URL}/edit`, { method: "POST", body: formData });
//       const data = await res.json();
//       const editedText = data.result;
//       if (!editedText) return;
//       const sel = window.getSelection();
//       sel.removeAllRanges();
//       sel.addRange(savedRange);
//       const r = sel.getRangeAt(0);
//       r.deleteContents();
//       r.insertNode(document.createTextNode(editedText));
//       sel.removeAllRanges();
//       savedRangeRef.current = null;
//       setSelectedText("");
//     } catch { console.error("askAI edit failed"); }
//   };

//   const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
//   const handleDragLeave = () => setIsDragging(false);
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFiles = Array.from(e.dataTransfer.files);
//     if (droppedFiles.length > 0) setFiles((prev) => [...prev, ...droppedFiles]);
//   };

//   const openPreview = (file) => {
//     const url = file.url || URL.createObjectURL(file);
//     setPreviewFile({ name: file.name, url, type: file.type });
//   };
//   const closePreview = () => setPreviewFile(null);

//   const safeAddMessage = (message) => addMessage(conversationId, message);

//   const buildFinalPrompt = () => {
//     const clientText   = formatList(selectedClient) || "the client";
//     const buText       = formatList(selectedBU);
//     const typeText     = formatList(selectedVideoType) || "video";
//     const toneText     = formatList(selectedVideoTone) || "professional";
//     const durationText = selectedDuration || "unspecified duration";
//     return `create a ${durationText} ${typeText} video script for ${clientText} ,which oporates in ${buText} sectors, about ${input}, maintain a ${toneText} tone consistently.`.trim();
//   };

//   const sendFeedback = async (rating, prompt, output) => {
//     const formData = new FormData();
//     formData.append("prompt", lastPromptRef.current);
//     formData.append("output", lastOutputRef.current);
//     formData.append("rating", rating);
//     await fetch(`${API_BASE_URL}/feedback`, { method: "POST", body: formData });
//   };

//   // ── Research ───────────────────────────────────────────────────
//   const runResearch = async () => {
//     if (!input.trim()) return;
//     setIsResearching(true);
//     setEditedResearch(null);
//     setResearchId(null);
//     setResearchError(null);

//     const capturedInput = input;
//     const capturedFiles = [...files];
//     const filePreviewData = capturedFiles.map((f) => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }));

//     setInput("");
//     setFiles([]);

//     const bubbleStableId = Date.now();
//     setMessages(prev => [
//       ...prev,
//       {
//         sender: "user",
//         text: capturedInput,
//         content: capturedInput,
//         prompt: "",
//         files: filePreviewData,
//         researchPending: true,
//         researchData: null,
//         _researchId: bubbleStableId,
//       },
//     ]);

//     const formData = new FormData();
//     formData.append("client", formatList(selectedClient));
//     formData.append("business_unit", formatList(selectedBU));
//     formData.append("video_type", formatList(selectedVideoType));
//     formData.append("video_tone", formatList(selectedVideoTone));
//     formData.append("duration", selectedDuration);
//     formData.append("prompt", capturedInput);
//     capturedFiles.forEach((f) => formData.append("files", f));

//     const patchResearchBubble = (patch) =>
//       setMessages(prev => prev.map(m =>
//         m._researchId === bubbleStableId ? { ...m, ...patch } : m
//       ));

//     try {
//       const res  = await fetch(`${API_BASE_URL}/research`, { method: "POST", body: formData });
//       const data = await res.json();
//       if (data.success && data.research) {
//         setEditedResearch(data.research);
//         setResearchId(data.research_id);
//         patchResearchBubble({
//           researchPending: false,
//           researchData: data.research,
//           transcriptCount: data.research.transcript_count ?? 0,
//         });
//       } else {
//         setResearchError(data.error || "Research failed — try again");
//         patchResearchBubble({ researchPending: false });
//       }
//     } catch {
//       setResearchError("Could not reach server");
//       patchResearchBubble({ researchPending: false });
//     } finally {
//       setIsResearching(false);
//     }
//   };

//   // ── Generate Script ────────────────────────────────────────────
//   const generateScript = async () => {
//     if (!input.trim() && files.length === 0 && !editedResearch) return;
//     if (isGenerating) return;

//     const capturedFiles      = [...files];
//     const capturedInput      = input;
//     const capturedResearch   = editedResearch;
//     const capturedResearchId = researchId;
//     const filePreviewData    = capturedFiles.map((f) => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) }));
//     const finalPrompt        = buildFinalPrompt();
//     lastPromptRef.current    = finalPrompt;

//     setInput("");
//     setFiles([]);
//     setEditedResearch(null);
//     setResearchId(null);
//     setIsGenerating(true);
//     activeConvIdRef.current = conversationId || null;

//     // FLICKER FIX A: give the optimistic bot bubble a stable temp id prefixed
//     // with "optimistic-" so fetchMessages can identify and merge it precisely
//     // instead of replacing the entire messages array.
//     const tempBotId = `optimistic-${Date.now()}`;
//     optimisticBotIdRef.current = tempBotId;

//     if (!capturedResearch) {
//       setMessages(prev => [
//         ...prev,
//         { sender: "user", text: capturedInput, content: capturedInput, prompt: finalPrompt, files: filePreviewData },
//         // FLICKER FIX A: id attached here
//         { id: tempBotId, sender: "bot", text: "", content: "", prompt: "", files: [] },
//       ]);
//     } else {
//       setMessages(prev => [
//         ...prev,
//         // FLICKER FIX A: id attached here too (research flow)
//         { id: tempBotId, sender: "bot", text: "", content: "", prompt: "", files: [] },
//       ]);
//     }

//     const formData = new FormData();
//     formData.append("prompt", finalPrompt);
//     formData.append("client", formatList(selectedClient));
//     formData.append("business_unit", formatList(selectedBU));
//     formData.append("video_type", formatList(selectedVideoType));
//     formData.append("video_tone", formatList(selectedVideoTone));
//     if (selectedDuration)    formData.append("duration", selectedDuration);
//     if (capturedResearchId) {
//       formData.append("research_id", capturedResearchId);
//     } else if (capturedResearch) {
//       formData.append("research_brief", JSON.stringify(capturedResearch));
//     }
//     if (conversationId) formData.append("conversation_id", conversationId);
//     capturedFiles.forEach((f) => formData.append("files", f));

//     try {
//       const res     = await fetch(`${API_BASE_URL}/chat`, { method: "POST", body: formData });
//       const reader  = res.body.getReader();
//       const decoder = new TextDecoder("utf-8");

//       let rawBuffer = "";
//       let fullText  = "";
//       let inResult  = false;
//       let done      = false;

//       // FLICKER FIX C: scriptStart marks the exact byte offset in rawBuffer
//       // where the script content begins (right after "result: ").
//       // The inResult path now slices from scriptStart instead of using the
//       // entire rawBuffer, so fullText never contains the control-line prefix.
//       let scriptStart = 0;

//       // Helper: update the bot bubble by its stable temp id — never patches
//       // by index so concurrent state updates cannot hit the wrong message.
//       const patchBotBubble = (content) => {
//         setMessages(prev => prev.map(m =>
//           m.id === tempBotId ? { ...m, content, text: content } : m
//         ));
//         updateLastMessage(activeConvIdRef.current, content);
//       };

//       while (!done) {
//         const { value, done: doneReading } = await reader.read();
//         done = doneReading;
//         rawBuffer += decoder.decode(value || new Uint8Array(), { stream: !done });

//         if (inResult) {
//           // FLICKER FIX C: slice from scriptStart, not from 0.
//           // rawBuffer grows with each chunk but scriptStart is fixed at the
//           // position right after "result:" so fullText is always only the script.
//           fullText = rawBuffer.slice(scriptStart);
//           patchBotBubble(fullText);
//           continue;
//         }

//         // Scan line-by-line for control prefixes; stop when result: is found.
//         let scanFrom = 0;
//         while (true) {
//           const nlIdx   = rawBuffer.indexOf("\n", scanFrom);
//           if (nlIdx === -1 && !done) break;
//           const lineEnd = nlIdx === -1 ? rawBuffer.length : nlIdx;
//           const line    = rawBuffer.slice(scanFrom, lineEnd);

//           if (line.startsWith("result:")) {
//             inResult = true;
//             // FLICKER FIX C: record exactly where the script content starts.
//             // +1 to skip the space separator after "result:" if present.
//             const afterPrefix = scanFrom + "result:".length;
//             scriptStart = rawBuffer[afterPrefix] === " " ? afterPrefix + 1 : afterPrefix;
//             fullText    = rawBuffer.slice(scriptStart);
//             patchBotBubble(fullText);
//             break;
//           }

//           if (line.startsWith("conversation_id:")) {
//             const id    = line.replace("conversation_id:", "").trim();
//             const isNew = !activeConvIdRef.current;
//             activeConvIdRef.current = id;
//             setConversationId(id);
//             if (isNew) loadConversations();
//           } else if (line.startsWith("status:")) {
//             setPipelineStatus(line.replace("status:", "").trim());
//           } else if (line.startsWith("error:")) {
//             fullText = `⚠️ ${line.replace("error:", "").trim()}`;
//             patchBotBubble(fullText);
//           }

//           if (nlIdx === -1) break;
//           scanFrom = nlIdx + 1;
//         }
//       }

//       // Normalise escaped newlines
//       fullText = fullText.replace(/\\n/g, "\n");
//       lastOutputRef.current = fullText;
//       setPipelineStatus(null);

//       // Final state patch with prompt (triggers sidebar reload in ChatContext)
//       setMessages(prev => prev.map(m =>
//         m.id === tempBotId ? { ...m, content: fullText, text: fullText, prompt: finalPrompt } : m
//       ));
//       updateLastMessage(activeConvIdRef.current, fullText, finalPrompt);

//       // FLICKER FIX B: pass the temp bot id to fetchMessages so it merges
//       // instead of replacing. The user sees the streamed content the entire
//       // time — only the temp bubble is swapped out for the real DB record.
//       if (activeConvIdRef.current) {
//         await fetchMessages(activeConvIdRef.current, 1, tempBotId);
//       }

//     } catch (err) {
//       console.error("generateScript error:", err);
//       setMessages(prev => prev.map(m =>
//         m.id === tempBotId ? { ...m, content: "⚠️ Server error", text: "⚠️ Server error" } : m
//       ));
//     } finally {
//       setIsGenerating(false);
//       optimisticBotIdRef.current = null;
//     }
//   };

//   // ── File Preview Modal ─────────────────────────────────────────
//   const FilePreviewModal = () => {
//     if (!previewFile) return null;
//     const isImage = previewFile.type?.startsWith("image/");
//     const isPDF   = previewFile.type === "application/pdf";
//     return (
//       <div
//         style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
//         onClick={closePreview}
//       >
//         <div
//           style={{ background: "#0d0d0d", borderRadius: "1.5rem", padding: "24px", maxWidth: "90vw", maxHeight: "85vh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: "16px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 80px rgba(0,0,0,0.9)" }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//             <span style={{ fontWeight: 600, fontSize: "14px", color: "#e5e5e5", fontFamily: "'Manrope', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//               {getFileIcon({ name: previewFile.name, type: previewFile.type })} {previewFile.name}
//             </span>
//             <button
//               onClick={closePreview}
//               style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: "9999px", padding: "5px 14px", cursor: "pointer", fontSize: "12px", fontFamily: "'Inter', sans-serif", flexShrink: 0, marginLeft: "16px" }}
//             >
//               ✕ Close
//             </button>
//           </div>
//           <div style={{ overflow: "auto", flex: 1, borderRadius: "12px" }}>
//             {isImage && <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", display: "block", margin: "0 auto" }} />}
//             {isPDF   && <iframe src={previewFile.url} title={previewFile.name} style={{ width: "100%", height: "70vh", border: "none", borderRadius: "12px" }} />}
//             {!isImage && !isPDF && (
//               <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "48px", fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
//                 <div style={{ fontSize: "48px", marginBottom: "12px" }}>{getFileIcon({ name: previewFile.name, type: previewFile.type })}</div>
//                 <div style={{ color: "rgba(255,255,255,0.7)" }}>{previewFile.name}</div>
//                 <div style={{ fontSize: "12px", marginTop: "8px", color: "rgba(255,255,255,0.3)" }}>Preview not available for this file type</div>
//                 <a href={previewFile.url} download={previewFile.name} style={{ display: "inline-block", marginTop: "16px", color: "rgba(255,255,255,0.55)", fontSize: "13px" }}>↓ Download to view</a>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ── File Chips ─────────────────────────────────────────────────
//   const FileChips = ({ fileList, onRemove }) => (
//     <div className="file-chip-row">
//       {fileList.map((f, idx) => (
//         <div key={idx} className="file-chip">
//           <span onClick={() => openPreview(f)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }} title="Click to preview">
//             {getFileIcon(f)} {f.name}
//           </span>
//           {onRemove && <button onClick={() => onRemove(idx)}>✕</button>}
//         </div>
//       ))}
//     </div>
//   );

//   const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

//   const sendDisabled     = isGenerating || (!input.trim() && files.length === 0 && !editedResearch);
//   const researchDisabled = isGenerating || isResearching || !input.trim();

//   // ── Render ─────────────────────────────────────────────────────
//   return (
//     <div className="chat-window" onMouseUp={(e) => handleMouseUp(e)}>
//       <FilePreviewModal />

//       {isEmpty ? (
//         <>
//           <div className="empty-wrapper">
//             <h2>How can I help you <span>today?</span></h2>
//             <p className="subtitle">Your creative partner for scriptwriting, asset generation, and video planning.</p>
//           </div>

//           <div className="bottom-control-bar">
//             <div className="glass-panel">
//               <div className="dropdown-row">
//                 <Clients onChange={setSelectedClient} />
//                 <Business_Unit onChange={setSelectedBU} />
//                 <Videotype onChange={setSelectedVideoType} />
//                 <VideoTone onChange={setSelectedVideoTone} />
//                 <DURATION_OPTIONS onChange={setSelectedDuration} />
//               </div>

//               <div
//                 className={`chat-input-area-og ${isDragging ? "drag-active" : ""}`}
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//                 onDrop={handleDrop}
//               >
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   multiple
//                   accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
//                   hidden
//                   onChange={(e) => setFiles(Array.from(e.target.files))}
//                 />

//                 {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} />}

//                 <textarea
//                   placeholder="Start generating..."
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   rows={4}
//                   cols={50}
//                   disabled={isGenerating}
//                 />

//                 <div className="og-bottom-row">
//                   <div className="og-bottom-left">
//                     <button className="attach-btn-og" onClick={() => fileInputRef.current.click()} title="Attach files" disabled={isGenerating}>📎</button>
//                   </div>
//                   <div className="og-bottom-right">
//                     <button
//                       className="btn-research"
//                       onClick={runResearch}
//                       disabled={researchDisabled}
//                       style={{ opacity: researchDisabled ? 0.4 : 1 }}
//                     >
//                       🔍 {isResearching ? "Researching…" : "Research"}
//                     </button>
//                     <button
//                       className="btn-send"
//                       onClick={generateScript}
//                       disabled={sendDisabled}
//                       style={{ opacity: sendDisabled ? 0.4 : 1 }}
//                     >
//                       {isGenerating ? "Generating…" : editedResearch ? "✦ Generate Script →" : "Send →"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {researchError && (
//             <div style={{ position: "fixed", bottom: "340px", left: "50%", transform: "translateX(-50%)", zIndex: 20, color: "rgba(255,100,100,0.9)", fontSize: "13px", fontFamily: "'Inter', sans-serif", background: "rgba(255,50,50,0.06)", padding: "8px 18px", borderRadius: "9999px", border: "1px solid rgba(255,50,50,0.15)" }}>
//               ⚠️ {researchError}
//             </div>
//           )}
//         </>

//       ) : (
//         <div className="chat-container">
//           <div className="chat-history" ref={chatHistoryRef}>
//             {loadingMessages && (
//               <div style={{ textAlign: "center", padding: "12px", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "'Inter', sans-serif" }}>
//                 Loading older messages…
//               </div>
//             )}

//             {messages.map((msg, i) => (
//               // Use real DB id when available, temp id during streaming, index as last resort
//               <div key={msg.id ?? i} className={`chat-bubble ${msg.sender}`}>
//                 {msg.sender === "bot" ? (
//                   <BotMessage msg={msg} onFeedback={sendFeedback} />
//                 ) : (
//                   <div>
//                     {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}
//                     {msg.files?.length > 0 && <FileChips fileList={msg.files} />}

//                     {msg.researchPending && <ResearchingIndicator />}

//                     {msg.researchData && (
//                       <InlineResearchPanel
//                         research={msg.researchData}
//                         transcriptCount={msg.transcriptCount}
//                         onResearchChange={setEditedResearch}
//                       />
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}

//             {pipelineStatus && (
//               <div className="pipeline-status">⚙️ {pipelineStatus}</div>
//             )}

//             <div ref={chatEndRef} />
//           </div>

//           {researchError && (
//             <div style={{ color: "rgba(255,100,100,0.9)", fontSize: "13px", margin: "8px 16px", fontFamily: "'Inter', sans-serif", background: "rgba(255,50,50,0.06)", padding: "8px 16px", borderRadius: "9999px", border: "1px solid rgba(255,50,50,0.15)" }}>
//               ⚠️ {researchError}
//             </div>
//           )}

//           <div
//             className={`chat-input-area ${isDragging ? "drag-active" : ""}`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           >
//             <div className="chat-input-inner">
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 multiple
//                 accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
//                 hidden
//                 onChange={(e) => setFiles(Array.from(e.target.files))}
//               />

//               <button className="attach-btn" onClick={() => fileInputRef.current.click()} title="Attach files" disabled={isGenerating}>📎</button>

//               {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} />}

//               <textarea
//                 placeholder="Start generating..."
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 rows={4}
//                 cols={50}
//                 disabled={isGenerating}
//               />

//               <button
//                 onClick={runResearch}
//                 disabled={researchDisabled}
//                 style={{ opacity: researchDisabled ? 0.4 : 1 }}
//               >
//                 🔍 {isResearching ? "Researching…" : "Research"}
//               </button>

//               <button
//                 onClick={generateScript}
//                 disabled={sendDisabled}
//                 style={{ opacity: sendDisabled ? 0.4 : 1 }}
//               >
//                 {isGenerating ? "Generating…" : editedResearch ? "✦ Generate Script →" : "Send →"}
//               </button>
//             </div>
//           </div>

//           <FloatingEditMenu
//             position={menuPosition}
//             onAction={handleFloatingAction}
//             onAskAI={handleAskAI}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default ChatWindow;












// import { useState, useRef, useEffect, useCallback } from "react";
// import "./chatWindow.css";
// import { useChat } from "../contexts/ChatContext";
// import ChatResponse from "./chat_message.jsx";
// import FloatingEditMenu from "./floatingEdit.jsx";
// import Clients from "./dropdown/clients.jsx";
// import Business_Unit from "./dropdown/BU.jsx";
// import Videotype from "./dropdown/videoType.jsx";
// import VideoTone from "./dropdown/video_tone.jsx";
// import DURATION_OPTIONS from "./dropdown/duration.jsx";


// const API_BASE_URL = "http://localhost:8000";
// // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // ── Copy Button ────────────────────────────────────────────────
// const CopyButton = ({ editableRef }) => {
//   const [copied, setCopied] = useState(false);
//   const handleCopy = async () => {
//     const text = editableRef.current?.innerText ?? "";
//     await navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };
//   return (
//     <button
//       onClick={handleCopy}
//       title="Copy response"
//       style={{
//         backgroundColor: "#1f1f1f",
//         border: "1px solid rgba(255,255,255,0.07)",
//         borderRadius: "9999px",
//         color: copied ? "#6fcf97" : "rgba(255,255,255,0.5)",
//         cursor: "pointer",
//         fontSize: "12px",
//         fontFamily: "'Inter', sans-serif",
//         fontWeight: 500,
//         padding: "5px 14px",
//         transition: "color 0.2s, background 0.2s",
//       }}
//     >
//       {copied ? "✓ Copied" : "⧉ Copy"}
//     </button>
//   );
// };

// // ── Bot Message ────────────────────────────────────────────────
// const BotMessage = ({ msg, onFeedback }) => {
//   const editableRef = useRef(null);
//   return (
//     <div className="feedback-row-rating">
//       <button
//   style={{
//     backgroundColor: "#1f1f1f",
//     color: "#fff",
//     border: "none",
//     padding: "8px 12px",
//     borderRadius: "8px",
//     cursor: "pointer",
//     transition: "all 0.15s ease",
//   }}
//   onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.3)")}
//   onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
//   onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//   onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6fcf97")}
//   onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1f1f1f")}
//   onClick={() => onFeedback(1, msg.prompt, msg.content)}
// >
//   👍
// </button>
//       <CopyButton editableRef={editableRef} />
//       <ChatResponse ref={editableRef} reply={msg.content} />
//     </div>
//   );
// };

// // ── File Icon Helper ───────────────────────────────────────────
// const getFileIcon = (file) => {
//   if (file.type?.startsWith("image/")) return "🖼️";
//   if (file.type === "application/pdf") return "📕";
//   if (file.name?.endsWith(".docx")) return "📝";
//   if (file.name?.endsWith(".xlsx")) return "📊";
//   if (file.name?.endsWith(".pptx")) return "📋";
//   if (file.name?.endsWith(".csv")) return "📊";
//   return "📄";
// };

// // ── Format list helper ─────────────────────────────────────────
// const formatList = (value) => {
//   if (!value || value.length === 0) return "";
//   if (Array.isArray(value)) return value.join(", ");
//   return value;
// };

// // ── Editable Tag ───────────────────────────────────────────────
// const EditableTag = ({ value, color, borderColor, textColor, onChange, onDelete }) => {
//   const [editing, setEditing] = useState(false);
//   const [draft, setDraft] = useState(value);
//   const inputRef = useRef(null);
//   useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
//   const commit = () => {
//     setEditing(false);
//     if (draft.trim()) onChange(draft.trim());
//     else onDelete();
//   };
//   if (editing) {
//     return (
//       <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
//         <input
//           ref={inputRef} value={draft}
//           onChange={(e) => setDraft(e.target.value)}
//           onBlur={commit}
//           onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
//           style={{ flex: 1, background: "#000000", border: `1px solid ${borderColor}`, borderRadius: "9999px", color, fontSize: "12px", fontFamily: "'Inter', sans-serif", padding: "4px 12px", outline: "none" }}
//         />
//       </div>
//     );
//   }
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
//       <span
//         onClick={() => setEditing(true)}
//         title="Click to edit"
//         style={{ fontSize: "12px", color: textColor, lineHeight: 1.5, cursor: "text", flex: 1, fontFamily: "'Inter', sans-serif" }}
//       >
//         • {value}
//       </span>
//       <button
//         onClick={onDelete}
//         title="Remove"
//         style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "11px", padding: "0 2px", lineHeight: 1 }}
//       >✕</button>
//     </div>
//   );
// };

// // ── Editable List ──────────────────────────────────────────────
// const EditableList = ({ items, setItems, label, color, bgColor, borderColor, textColor }) => {
//   const [newItem, setNewItem] = useState("");
//   const [adding, setAdding] = useState(false);
//   const addRef = useRef(null);
//   useEffect(() => { if (adding) addRef.current?.focus(); }, [adding]);
//   const commitAdd = () => {
//     if (newItem.trim()) setItems([...items, newItem.trim()]);
//     setNewItem("");
//     setAdding(false);
//   };
//   return (
//     <div style={{ background: bgColor, borderRadius: "14px", padding: "12px 14px", border: `1px solid ${borderColor}` }}>
//       <div style={{ fontSize: "10px", fontWeight: 700, color, marginBottom: "8px", letterSpacing: "1.2px", textTransform: "uppercase", fontFamily: "'Manrope', sans-serif" }}>
//         {label}
//       </div>
//       {items.map((item, i) => (
//         <EditableTag
//           key={i} value={item} color={color} borderColor={borderColor} textColor={textColor}
//           onChange={(v) => setItems(items.map((x, j) => j === i ? v : x))}
//           onDelete={() => setItems(items.filter((_, j) => j !== i))}
//         />
//       ))}
//       {adding ? (
//         <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
//           <input
//             ref={addRef} value={newItem}
//             onChange={(e) => setNewItem(e.target.value)}
//             onBlur={commitAdd}
//             onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") setAdding(false); }}
//             placeholder="Type and press Enter…"
//             style={{ flex: 1, background: "#000", border: `1px solid ${borderColor}`, borderRadius: "9999px", color: textColor, fontSize: "12px", fontFamily: "'Inter', sans-serif", padding: "4px 12px", outline: "none" }}
//           />
//         </div>
//       ) : (
//         <button
//           onClick={() => setAdding(true)}
//           style={{ background: "none", border: `1px dashed ${borderColor}`, borderRadius: "9999px", color, fontSize: "11px", fontFamily: "'Inter', sans-serif", cursor: "pointer", padding: "4px 12px", marginTop: "6px", opacity: 0.6, width: "100%" }}
//         >
//           + Add
//         </button>
//       )}
//     </div>
//   );
// };

// // ── Inline Research Panel ──────────────────────────────────────
// const InlineResearchPanel = ({ research, onResearchChange, transcriptCount }) => {
//   const [open, setOpen] = useState(false);

//   const [projIntel, setProjIntel] = useState(research.project_intelligence ?? "");
//   const [summary, setSummary]     = useState(research.niche_summary ?? research.niche_summary_title ?? "");
//   const [hooks, setHooks]         = useState(research.winning_hooks ?? []);
//   const [pains, setPains]         = useState(research.top_pain_points ?? []);
//   const [angle, setAngle]         = useState(research.recommended_angle ?? "");

//   useEffect(() => {
//     onResearchChange({
//       ...research,
//       project_intelligence: projIntel,
//       niche_summary: summary,
//       winning_hooks: hooks,
//       top_pain_points: pains,
//       recommended_angle: angle,
//     });
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [projIntel, summary, hooks, pains, angle]);

//   const sectionStyle = {
//     background: "#0a0a0a", borderRadius: "14px", padding: "12px 16px",
//     marginBottom: "10px", border: "1px solid rgba(255,255,255,0.06)",
//   };
//   const labelStyle = {
//     fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px",
//     textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Manrope', sans-serif",
//   };
//   const textareaBase = {
//     width: "100%", background: "transparent", border: "none", fontSize: "13px",
//     fontFamily: "'Inter', sans-serif", lineHeight: 1.6, resize: "vertical",
//     outline: "none", padding: 0, boxSizing: "border-box", color: "rgba(255,255,255,0.72)",
//   };

//   return (
//     <div style={{ marginTop: "8px", maxWidth: "520px" }}>
//       <button
//         onClick={() => setOpen((v) => !v)}
//         style={{
//           display: "inline-flex", alignItems: "center", gap: "7px",
//           background: open ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.10)",
//           border: "1px solid rgba(139,92,246,0.35)", borderRadius: "9999px",
//           padding: "5px 13px 5px 10px", cursor: "pointer",
//           fontFamily: "'Inter', sans-serif", fontSize: "12px",
//           color: "rgba(200,180,255,0.9)", transition: "background 0.15s",
//         }}
//       >
//         <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
//           <circle cx="5.5" cy="5.5" r="4" stroke="rgba(180,150,255,0.8)" strokeWidth="1.3"/>
//           <line x1="8.8" y1="8.8" x2="11.5" y2="11.5" stroke="rgba(180,150,255,0.8)" strokeWidth="1.3" strokeLinecap="round"/>
//         </svg>
//         Research — {transcriptCount ?? 0} sources analyzed
//         <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
//           style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
//         >
//           <path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(180,150,255,0.7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
//         </svg>
//       </button>

//       {open && (
//         <div style={{
//           marginTop: "8px", background: "rgba(19,19,19,0.95)",
//           border: "1px solid rgba(139,92,246,0.25)", borderRadius: "1.1rem",
//           padding: "16px 18px", maxHeight: "420px", overflowY: "auto",
//         }}>
//           <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", marginBottom: "14px" }}>
//             Edit anything below — changes are picked up when you hit Generate Script.
//           </div>

//           {projIntel !== undefined && (
//             <div style={{ ...sectionStyle, borderLeft: "2px solid rgba(255,255,255,0.18)" }}>
//               <div style={{ ...labelStyle, color: "rgba(255,255,255,0.4)" }}>Project Intelligence</div>
//               <textarea value={projIntel} onChange={(e) => setProjIntel(e.target.value)}
//                 rows={Math.min(10, (projIntel.match(/\n/g) || []).length + 3)} style={textareaBase} />
//             </div>
//           )}

//           {summary !== undefined && (
//             <div style={{ ...sectionStyle, borderLeft: "2px solid rgba(255,255,255,0.10)" }}>
//               <div style={{ ...labelStyle, color: "rgba(255,255,255,0.35)" }}>Niche Summary</div>
//               <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} style={textareaBase} />
//             </div>
//           )}

//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
//             <EditableList items={hooks} setItems={setHooks} label="Winning Hooks"
//               color="rgba(255,255,255,0.55)" bgColor="#111"
//               borderColor="rgba(255,255,255,0.08)" textColor="rgba(255,255,255,0.75)" />
//             <EditableList items={pains} setItems={setPains} label="Pain Points"
//               color="rgba(255,255,255,0.4)" bgColor="#0e0e0e"
//               borderColor="rgba(255,255,255,0.06)" textColor="rgba(255,255,255,0.6)" />
//           </div>

//           {angle !== undefined && (
//             <div style={{ background: "#111", borderRadius: "14px", padding: "10px 14px", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "2px solid rgba(255,255,255,0.22)" }}>
//               <div style={{ ...labelStyle, color: "rgba(255,255,255,0.45)" }}>Recommended Angle</div>
//               <textarea value={angle} onChange={(e) => setAngle(e.target.value)} rows={2} style={textareaBase} />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // ── Researching Spinner ────────────────────────────────────────
// const ResearchingIndicator = () => (
//   <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", borderRadius: "9999px", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.07)", maxWidth: "300px", margin: "8px 0", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
//     <span style={{ fontSize: "16px", animation: "spin 1.2s linear infinite", display: "inline-block" }}>🔍</span>
//     <div>
//       <div style={{ fontSize: "13px", color: "#e5e5e5", fontWeight: 600, fontFamily: "'Manrope', sans-serif" }}>Researching…</div>
//       <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px", fontFamily: "'Inter', sans-serif" }}>Searching web + analysing YouTube</div>
//     </div>
//     <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
//   </div>
// );

// // ── FilePreviewModal (stable — defined outside ChatWindow) ─────
// const FilePreviewModal = ({ previewFile, onClose }) => {
//   if (!previewFile) return null;
//   const isImage = previewFile.type?.startsWith("image/");
//   const isPDF   = previewFile.type === "application/pdf";
//   return (
//     <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
//       onClick={onClose}>
//       <div style={{ background: "#0d0d0d", borderRadius: "1.5rem", padding: "24px", maxWidth: "90vw", maxHeight: "85vh", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: "16px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 80px rgba(0,0,0,0.9)" }}
//         onClick={(e) => e.stopPropagation()}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <span style={{ fontWeight: 600, fontSize: "14px", color: "#e5e5e5", fontFamily: "'Manrope', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//             {getFileIcon({ name: previewFile.name, type: previewFile.type })} {previewFile.name}
//           </span>
//           <button onClick={onClose} style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: "9999px", padding: "5px 14px", cursor: "pointer", fontSize: "12px", fontFamily: "'Inter', sans-serif", flexShrink: 0, marginLeft: "16px" }}>
//             ✕ Close
//           </button>
//         </div>
//         <div style={{ overflow: "auto", flex: 1, borderRadius: "12px" }}>
//           {isImage && <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", display: "block", margin: "0 auto" }} />}
//           {isPDF   && <iframe src={previewFile.url} title={previewFile.name} style={{ width: "100%", height: "70vh", border: "none", borderRadius: "12px" }} />}
//           {!isImage && !isPDF && (
//             <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "48px", fontSize: "14px", fontFamily: "'Inter', sans-serif" }}>
//               <div style={{ fontSize: "48px", marginBottom: "12px" }}>{getFileIcon({ name: previewFile.name, type: previewFile.type })}</div>
//               <div style={{ color: "rgba(255,255,255,0.7)" }}>{previewFile.name}</div>
//               <div style={{ fontSize: "12px", marginTop: "8px", color: "rgba(255,255,255,0.3)" }}>Preview not available for this file type</div>
//               <a href={previewFile.url} download={previewFile.name} style={{ display: "inline-block", marginTop: "16px", color: "rgba(255,255,255,0.55)", fontSize: "13px" }}>↓ Download to view</a>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── FileChips (stable — defined outside ChatWindow) ────────────
// const FileChips = ({ fileList, onRemove, onPreview }) => (
//   <div className="file-chip-row">
//     {fileList.map((f, idx) => (
//       <div key={idx} className="file-chip">
//         <span onClick={() => onPreview(f)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }} title="Click to preview">
//           {getFileIcon(f)} {f.name}
//         </span>
//         {onRemove && <button onClick={() => onRemove(idx)}>✕</button>}
//       </div>
//     ))}
//   </div>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // reconstructMessage
// //
// // Converts a raw DB message row into the shape the renderer expects.
// //
// // For user messages with metadata.research_id we mark them as needing
// // async hydration (researchLoading: true). fetchMessages then fires
// // GET /research/:id for each such message and patches the state once
// // the data arrives — no localStorage involved.
// // ─────────────────────────────────────────────────────────────────────────────
// function reconstructMessage(m) {
//   const researchId = m.metadata?.research_id ?? null;
//   return {
//     id:              m.id ?? crypto.randomUUID(),
//     sender:          m.role === "assistant" ? "bot" : "user",
//     // For research-flow messages the content is the machine prompt — hide it;
//     // the pill is the only user-visible element.
//     text:            m.content,
//     content:         m.content,
//     prompt:          m.prompt ?? "",
//     files:           [],
//     researchPending: false,
//     researchData:    null,
//     transcriptCount: 0,
//     // hideText: true  → suppress raw machine prompt, show only the research pill
//     hideText:        !!researchId,
//     // researchLoading: true → fetchMessages will fetch and attach research data
//     researchLoading: !!researchId,
//     researchId,      // kept so the hydration fetch knows what to call
//   };
// }

// // ── Main Component ─────────────────────────────────────────────
// function ChatWindow() {
//   const {
//     messages, setMessages, addMessage, updateLastMessage,
//     conversationId, setConversationId, loadConversations,
//   } = useChat();

//   const [input, setInput]                   = useState("");
//   const [files, setFiles]                   = useState([]);
//   const dragCounterRef                      = useRef(0);
//   const [isDragging, setIsDragging]         = useState(false);
//   const [selectionInfo, setSelectionInfo]   = useState(null);
//   const [pipelineStatus, setPipelineStatus] = useState(null);
//   const [menuPosition, setMenuPosition]     = useState(null);
//   const [selectedText, setSelectedText]     = useState("");
//   const [previewFile, setPreviewFile]       = useState(null);
//   const [selectedClient, setSelectedClient]         = useState("");
//   const [selectedBU, setSelectedBU]                 = useState("");
//   const [selectedVideoType, setSelectedVideoType]   = useState("");
//   const [selectedVideoTone, setSelectedVideoTone]   = useState("");
//   const [selectedDuration, setSelectedDuration]     = useState("");

//   const [isResearching, setIsResearching]   = useState(false);
//   const [editedResearch, setEditedResearch] = useState(null);
//   const [researchId, setResearchId]         = useState(null);
//   const [researchError, setResearchError]   = useState(null);

//   // Streaming state — lightweight string, avoids O(N) array maps per token
//   const [activeStreamText, setActiveStreamText] = useState("");
//   const [isStreaming, setIsStreaming]            = useState(false);

//   // AbortController ref — kills zombie streams on chat switch
//   const abortControllerRef = useRef(null);

//   // Stable ref that always mirrors conversationId for stale-fetch guard
//   const conversationIdRef = useRef(conversationId);
//   useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);

//   const savedRangeRef   = useRef(null);
//   const lastPromptRef   = useRef("");
//   const lastOutputRef   = useRef("");
//   const chatEndRef      = useRef(null);
//   const fileInputRef    = useRef(null);

//   const [page, setPage]                     = useState(1);
//   const [hasMore, setHasMore]               = useState(true);
//   const [loadingMessages, setLoadingMessages] = useState(false);
//   const chatHistoryRef  = useRef(null);
//   const loadingRef      = useRef(false);

//   const isEmpty = messages.length === 0 && !loadingMessages;

//   // ─────────────────────────────────────────────────────────────
//   // hydrateResearchMessages
//   //
//   // After fetchMessages populates the list, find any user messages
//   // flagged researchLoading:true and fetch their research data from
//   // GET /research/:id, then patch those messages in state.
//   // Runs in parallel — each fetch is independent.
//   // ─────────────────────────────────────────────────────────────
//   const hydrateResearchMessages = useCallback(async (msgList, chatIdParam) => {
//     const toHydrate = msgList.filter(m => m.researchLoading && m.researchId);
//     if (toHydrate.length === 0) return;

//     await Promise.all(
//       toHydrate.map(async (msg) => {
//         try {
//           const res  = await fetch(`${API_BASE_URL}/research/${msg.researchId}`);
//           const data = await res.json();

//           // Stale guard — user may have switched chats while fetching
//           if (chatIdParam !== conversationIdRef.current) return;

//           if (data.success && data.research) {
//             setMessages(prev => prev.map(m =>
//               m.id === msg.id
//                 ? {
//                     ...m,
//                     researchLoading: false,
//                     researchData:    data.research,
//                     transcriptCount: data.research.transcript_count ?? 0,
//                   }
//                 : m
//             ));
//           } else {
//             // Brief not found — just stop the loading state, show nothing
//             setMessages(prev => prev.map(m =>
//               m.id === msg.id ? { ...m, researchLoading: false } : m
//             ));
//           }
//         } catch {
//           setMessages(prev => prev.map(m =>
//             m.id === msg.id ? { ...m, researchLoading: false } : m
//           ));
//         }
//       })
//     );
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   // ─────────────────────────────────────────────────────────────
//   // fetchMessages
//   // ─────────────────────────────────────────────────────────────
//   const fetchMessages = useCallback(async (chatIdParam, pageNum) => {
//     if (loadingRef.current) return;
//     loadingRef.current = true;
//     setLoadingMessages(true);
//     try {
//       const res  = await fetch(
//         `${API_BASE_URL}/messages?conversation_id=${chatIdParam}&page=${pageNum}&limit=20`
//       );
//       const data = await res.json();

//       // Stale-fetch guard
//       if (chatIdParam !== conversationIdRef.current) return;

//       const fetched = Array.isArray(data.messages)
//         ? data.messages
//         : Array.isArray(data) ? data : [];

//       if (fetched.length < 20) setHasMore(false);

//       // Convert raw DB rows → render-ready shapes
//       const ordered = fetched.map(m => reconstructMessage(m));

//       if (pageNum === 1) {
//         setMessages(ordered);
//         requestAnimationFrame(() => {
//           requestAnimationFrame(() => {
//             chatEndRef.current?.scrollIntoView({ behavior: "auto" });
//           });
//         });
//       } else {
//         const container = chatHistoryRef.current;
//         const prevScrollHeight = container?.scrollHeight || 0;
//         setMessages(prev => [...ordered, ...prev]);
//         requestAnimationFrame(() => {
//           if (container) container.scrollTop = container.scrollHeight - prevScrollHeight;
//         });
//       }

//       // Hydrate any messages that have a research_id in their metadata
//       // (fires GET /research/:id for each, patches state when done)
//       hydrateResearchMessages(ordered, chatIdParam);

//     } catch (err) {
//       console.error("Failed to fetch messages:", err);
//     } finally {
//       setLoadingMessages(false);
//       loadingRef.current = false;
//     }
//   }, [hydrateResearchMessages]); // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     setInput(""); setFiles([]); setSelectionInfo(null);
//     setEditedResearch(null); setResearchId(null); setResearchError(null);
//     setMessages([]); setPage(1); setHasMore(true); loadingRef.current = false;
//     abortControllerRef.current?.abort();
//     if (!conversationId) return;
//     fetchMessages(conversationId, 1);
//   }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     if (page > 1 && conversationId) fetchMessages(conversationId, page);
//   }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     const container = chatHistoryRef.current;
//     if (!container || !conversationId) return;
//     const handleScroll = () => {
//       if (container.scrollTop <= 5 && hasMore && !loadingRef.current) setPage(p => p + 1);
//     };
//     container.addEventListener("scroll", handleScroll);
//     return () => container.removeEventListener("scroll", handleScroll);
//   }, [conversationId, hasMore]);

//   useEffect(() => {
//     if (messages.length === 0) return;
//     const container = chatHistoryRef.current;
//     if (!container) return;
//     const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
//     if (isNearBottom) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages.length]);

//   useEffect(() => {
//     const handleSelection = () => {
//       const sel = window.getSelection();
//       if (!sel || sel.isCollapsed) { setSelectionInfo(null); return; }
//       const range = sel.getRangeAt(0);
//       const rect  = range.getBoundingClientRect();
//       setSelectionInfo({ text: sel.toString(), position: { top: rect.top - 40 + window.scrollY, left: rect.left + rect.width / 2 } });
//     };
//     document.addEventListener("selectionchange", handleSelection);
//     return () => document.removeEventListener("selectionchange", handleSelection);
//   }, []);

//   // Dismiss floating menu on scroll / resize
//   useEffect(() => {
//     const dismissMenu = () => setMenuPosition(null);
//     window.addEventListener("scroll", dismissMenu, true);
//     window.addEventListener("resize", dismissMenu);
//     return () => {
//       window.removeEventListener("scroll", dismissMenu, true);
//       window.removeEventListener("resize", dismissMenu);
//     };
//   }, []);

//   const handleMouseUp = (e) => {
//     if (e.target.closest(".floating-menu")) return;
//     const selection = window.getSelection();
//     const text = selection.toString();
//     if (!text) { setMenuPosition(null); return; }
//     const range = selection.getRangeAt(0);
//     const container = range.commonAncestorContainer;
//     const botBubble = (container.nodeType === Node.TEXT_NODE
//       ? container.parentElement : container
//     ).closest(".chat-bubble.bot");
//     if (!botBubble) { setMenuPosition(null); return; }
//     savedRangeRef.current = range.cloneRange();
//     const rect = range.getBoundingClientRect();
//     setSelectedText(text);
//     setMenuPosition({ top: rect.bottom, left: rect.left });
//   };

//   const handleFloatingAction = async (instruction) => {
//     if (!selectedText || !savedRangeRef.current) return;
//     setMenuPosition(null);
//     const formData = new FormData();
//     formData.append("instruction", instruction);
//     formData.append("selected_text", selectedText);
//     try {
//       const res  = await fetch(`${API_BASE_URL}/edit`, { method: "POST", body: formData });
//       const data = await res.json();
//       if (!data.result) return;
//       const sel = window.getSelection();
//       sel.removeAllRanges();
//       sel.addRange(savedRangeRef.current);
//       const r = sel.getRangeAt(0);
//       r.deleteContents();
//       r.insertNode(document.createTextNode(data.result));
//       sel.removeAllRanges();
//       savedRangeRef.current = null;
//       setSelectedText("");
//     } catch { console.error("Inline edit failed"); }
//   };

//   const handleAskAI = async (customPrompt) => {
//     const textToEdit = selectedText;
//     const savedRange = savedRangeRef.current;
//     if (!textToEdit || !savedRange) return;
//     setMenuPosition(null);
//     const formData = new FormData();
//     formData.append("instruction", customPrompt);
//     formData.append("selected_text", textToEdit);
//     try {
//       const res  = await fetch(`${API_BASE_URL}/edit`, { method: "POST", body: formData });
//       const data = await res.json();
//       if (!data.result) return;
//       const sel = window.getSelection();
//       sel.removeAllRanges();
//       sel.addRange(savedRange);
//       const r = sel.getRangeAt(0);
//       r.deleteContents();
//       r.insertNode(document.createTextNode(data.result));
//       sel.removeAllRanges();
//       savedRangeRef.current = null;
//       setSelectedText("");
//     } catch { console.error("askAI edit failed"); }
//   };

//   // Drag counter — prevents child-hover flicker
//   const handleDragEnter = (e) => {
//     e.preventDefault();
//     dragCounterRef.current += 1;
//     if (dragCounterRef.current === 1) setIsDragging(true);
//   };
//   const handleDragOver  = (e) => { e.preventDefault(); };
//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     dragCounterRef.current -= 1;
//     if (dragCounterRef.current === 0) setIsDragging(false);
//   };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     dragCounterRef.current = 0;
//     setIsDragging(false);
//     const dropped = Array.from(e.dataTransfer.files);
//     if (dropped.length > 0) setFiles(prev => [...prev, ...dropped]);
//   };

//   const openPreview  = (file) => {
//     const url = file.url || URL.createObjectURL(file);
//     setPreviewFile({ name: file.name, url, type: file.type });
//   };
//   const closePreview = () => setPreviewFile(null);
//   const safeAddMessage = (message) => addMessage(conversationId, message);

//   const buildFinalPrompt = () => {
//     const clientText   = formatList(selectedClient) || "the client";
//     const buText       = formatList(selectedBU);
//     const typeText     = formatList(selectedVideoType) || "video";
//     const toneText     = formatList(selectedVideoTone) || "professional";
//     const durationText = selectedDuration || "unspecified duration";
//     return `create a ${durationText} ${typeText} video script for ${clientText} ,which oporates in ${buText} sectors, about ${input}, maintain a ${toneText} tone consistently.`.trim();
//   };

//   const sendFeedback = async (rating) => {
//     const formData = new FormData();
//     formData.append("prompt", lastPromptRef.current);
//     formData.append("output", lastOutputRef.current);
//     formData.append("rating", rating);
//     await fetch(`${API_BASE_URL}/feedback`, { method: "POST", body: formData });
//   };

//   // ── Research ───────────────────────────────────────────────────
//   const runResearch = async () => {
//     if (!input.trim()) return;
//     setIsResearching(true);
//     setEditedResearch(null);
//     setResearchId(null);
//     setResearchError(null);

//     const capturedInput   = input;
//     const capturedFiles   = [...files];
//     const filePreviewData = capturedFiles.map(f => ({
//       name: f.name, type: f.type, url: URL.createObjectURL(f),
//     }));

//     setInput("");
//     setFiles([]);

//     const bubbleStableId = crypto.randomUUID();

//     setMessages(prev => [
//       ...prev,
//       {
//         id:              bubbleStableId,
//         sender:          "user",
//         text:            capturedInput,
//         content:         capturedInput,
//         prompt:          "",
//         files:           filePreviewData,
//         researchPending: true,
//         researchData:    null,
//         hideText:        false,   // show the text while spinner is active
//         researchLoading: false,
//         researchId:      null,
//         _researchId:     bubbleStableId,
//       },
//     ]);

//     const formData = new FormData();
//     formData.append("client",        formatList(selectedClient));
//     formData.append("business_unit", formatList(selectedBU));
//     formData.append("video_type",    formatList(selectedVideoType));
//     formData.append("video_tone",    formatList(selectedVideoTone));
//     formData.append("duration",      selectedDuration);
//     formData.append("prompt",        capturedInput);
//     capturedFiles.forEach(f => formData.append("files", f));

//     const patchBubble = (patch) =>
//       setMessages(prev => prev.map(m =>
//         m._researchId === bubbleStableId ? { ...m, ...patch } : m
//       ));

//     try {
//       const res  = await fetch(`${API_BASE_URL}/research`, { method: "POST", body: formData });
//       const data = await res.json();

//       if (data.success && data.research) {
//         setEditedResearch(data.research);
//         setResearchId(data.research_id);
//         patchBubble({
//           researchPending: false,
//           researchData:    data.research,
//           transcriptCount: data.research.transcript_count ?? 0,
//           // Once generate runs, the backend will save research_id into the user
//           // message metadata. On next reload fetchMessages + hydrateResearchMessages
//           // will reconstruct this pill automatically from the DB.
//           hideText:        true,
//         });
//       } else {
//         setResearchError(data.error || "Research failed — try again");
//         patchBubble({ researchPending: false });
//       }
//     } catch {
//       setResearchError("Could not reach server");
//       patchBubble({ researchPending: false });
//     } finally {
//       setIsResearching(false);
//     }
//   };

//   // ── Generate Script ────────────────────────────────────────────
//   const generateScript = async () => {
//     if (!input.trim() && files.length === 0 && !editedResearch) return;

//     const capturedFiles      = [...files];
//     const capturedInput      = input;
//     const capturedResearch   = editedResearch;
//     const capturedResearchId = researchId;
//     const filePreviewData    = capturedFiles.map(f => ({
//       name: f.name, type: f.type, url: URL.createObjectURL(f),
//     }));
//     const finalPrompt     = buildFinalPrompt();
//     lastPromptRef.current = finalPrompt;

//     setInput("");
//     setFiles([]);
//     setEditedResearch(null);
//     setResearchId(null);

//     const botMessageId = crypto.randomUUID();

//     if (!capturedResearch) {
//       const userMsgId = crypto.randomUUID();
//       await safeAddMessage({ role: "user", content: capturedInput, files: filePreviewData });
//       setMessages(prev => [
//         ...prev,
//         { id: userMsgId, sender: "user", text: capturedInput, content: capturedInput, prompt: "", files: filePreviewData, hideText: false, researchLoading: false },
//         { id: botMessageId, sender: "bot", text: "", content: "", prompt: "", files: [] },
//       ]);
//     } else {
//       // Research flow — research bubble already in the list; append bot placeholder only
//       setMessages(prev => [
//         ...prev,
//         { id: botMessageId, sender: "bot", text: "", content: "", prompt: "", files: [] },
//       ]);
//     }

//     setActiveStreamText("");
//     setIsStreaming(true);

//     abortControllerRef.current?.abort();
//     const controller = new AbortController();
//     abortControllerRef.current = controller;

//     const formData = new FormData();
//     formData.append("prompt",         finalPrompt);
//     formData.append("client",         formatList(selectedClient));
//     formData.append("business_unit",  formatList(selectedBU));
//     formData.append("video_type",     formatList(selectedVideoType));
//     formData.append("video_tone",     formatList(selectedVideoTone));
//     if (selectedDuration)    formData.append("duration",        selectedDuration);
//     if (capturedResearchId)  formData.append("research_id",     capturedResearchId);
//     if (capturedResearch)    formData.append("research_brief",  JSON.stringify(capturedResearch));
//     if (conversationId)      formData.append("conversation_id", conversationId);
//     capturedFiles.forEach(f => formData.append("files", f));

//     try {
//       const res = await fetch(`${API_BASE_URL}/chat`, {
//         method: "POST", body: formData, signal: controller.signal,
//       });

//       const reader  = res.body.getReader();
//       const decoder = new TextDecoder("utf-8");
//       let done = false;
//       let fullText = "";
//       let resolvedConvId = conversationId;

//       while (!done) {
//         const { value, done: doneReading } = await reader.read();
//         done = doneReading;
//         if (controller.signal.aborted) break;

//         const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
//         for (const line of chunk.split("\n")) {
//           if (line.startsWith("conversation_id:")) {
//             resolvedConvId = line.replace("conversation_id:", "").trim();
//             const isNew = !conversationId;
//             setConversationId(resolvedConvId);
//             if (isNew) loadConversations();
//             continue;
//           }
//           if (line.startsWith("status:") || line.startsWith("<!-- ")) {
//             setPipelineStatus(line.replace("status:", "").replace("<!--", "").replace("-->", "").trim());
//             continue;
//           }
//           if (line.startsWith("result:"))     { fullText = line.replace("result:", "").trim(); continue; }
//           if (line.startsWith("error:"))      { fullText = `⚠️ ${line.replace("error:", "").trim()}`; continue; }
//           if (line.startsWith("<!-- debug:")) continue;
//           if (line.trim() && fullText)        fullText += "\n" + line;
//         }
//         setActiveStreamText(fullText);
//       }

//       fullText = fullText.replace(/\\n/g, "\n");
//       lastOutputRef.current = fullText;
//       setIsStreaming(false);
//       setActiveStreamText("");
//       setPipelineStatus(null);

//       updateLastMessage(resolvedConvId, fullText, finalPrompt);
//       setMessages(prev => prev.map(m =>
//         m.id === botMessageId
//           ? { ...m, content: fullText, text: fullText, prompt: finalPrompt }
//           : m
//       ));

//     } catch (err) {
//       if (err.name === "AbortError") return;
//       console.error("generateScript error:", err);
//       setIsStreaming(false);
//       setActiveStreamText("");
//       // Restore input on error so user doesn't lose their work
//       setInput(capturedInput);
//       setFiles(capturedFiles);
//       setEditedResearch(capturedResearch);
//       setResearchId(capturedResearchId);
//       safeAddMessage({ role: "assistant", content: "⚠️ Server error" });
//       setMessages(prev => prev.map(m =>
//         m.id === botMessageId
//           ? { ...m, content: "⚠️ Server error", text: "⚠️ Server error" }
//           : m
//       ));
//     }
//   };

//   const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

//   // ── Render ─────────────────────────────────────────────────────
//   return (
//     <div className="chat-window" onMouseUp={handleMouseUp}>
//       <FilePreviewModal previewFile={previewFile} onClose={closePreview} />

//       {isEmpty ? (
//         /* ── Empty / Landing State ── */
//         <>
//           <div className="empty-wrapper">
//             <h2>How can I help you <span>today?</span></h2>
//             <p className="subtitle">Your creative partner for scriptwriting, asset generation, and video planning.</p>
//           </div>

//           <div className="bottom-control-bar">
//             <div className="glass-panel">
//               <div className="dropdown-row">
//                 <Clients onChange={setSelectedClient} />
//                 <Business_Unit onChange={setSelectedBU} />
//                 <Videotype onChange={setSelectedVideoType} />
//                 <VideoTone onChange={setSelectedVideoTone} />
//                 <DURATION_OPTIONS onChange={setSelectedDuration} />
//               </div>

//               <div
//                 className={`chat-input-area-og ${isDragging ? "drag-active" : ""}`}
//                 onDragEnter={handleDragEnter} onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave} onDrop={handleDrop}
//               >
//                 <input ref={fileInputRef} type="file" multiple
//                   accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx" hidden
//                   onChange={(e) => setFiles(Array.from(e.target.files))} />

//                 {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} onPreview={openPreview} />}

//                 <textarea placeholder="Start generating..." value={input}
//                   onChange={(e) => setInput(e.target.value)} rows={4} cols={50} />

//                 <div className="og-bottom-row">
//                   <div className="og-bottom-left">
//                     <button className="attach-btn-og" onClick={() => fileInputRef.current.click()} title="Attach files">📎</button>
//                   </div>
//                   <div className="og-bottom-right">
//                     <button className="btn-research" onClick={runResearch}
//                       disabled={isResearching || !input.trim()}
//                       style={{ opacity: isResearching || !input.trim() ? 0.4 : 1 }}>
//                       🔍 {isResearching ? "Researching…" : "Research"}
//                     </button>
//                     <button className="btn-send" onClick={generateScript}
//                       disabled={!input.trim() && files.length === 0 && !editedResearch}
//                       style={{ opacity: (!input.trim() && files.length === 0 && !editedResearch) ? 0.4 : 1 }}>
//                       {editedResearch ? "✦ Generate Script →" : "Send →"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {researchError && (
//             <div style={{ position: "fixed", bottom: "340px", left: "50%", transform: "translateX(-50%)", zIndex: 20, color: "rgba(255,100,100,0.9)", fontSize: "13px", fontFamily: "'Inter', sans-serif", background: "rgba(255,50,50,0.06)", padding: "8px 18px", borderRadius: "9999px", border: "1px solid rgba(255,50,50,0.15)" }}>
//               ⚠️ {researchError}
//             </div>
//           )}
//         </>

//       ) : (
//         /* ── Active Chat ── */
//         <div className="chat-container">
//           <div className="chat-history" ref={chatHistoryRef}>
//             {loadingMessages && (
//               <div style={{ textAlign: "center", padding: "12px", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: "'Inter', sans-serif" }}>
//                 Loading older messages…
//               </div>
//             )}

//             {messages.map((msg) => (
//               <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
//                 {msg.sender === "bot" ? (
//                   <BotMessage msg={msg} onFeedback={sendFeedback} />
//                 ) : (
//                   <div>
//                     {/* hideText is true for research-flow messages — suppress the raw
//                         machine prompt so only the research pill is visible */}
//                     {!msg.hideText && msg.text && (
//                       <p style={{ margin: 0 }}>{msg.text}</p>
//                     )}

//                     {msg.files?.length > 0 && (
//                       <FileChips fileList={msg.files} onPreview={openPreview} />
//                     )}

//                     {/* Spinner shown while actively researching */}
//                     {msg.researchPending && <ResearchingIndicator />}

//                     {/* Spinner shown while hydrating from DB on page load */}
//                     {msg.researchLoading && !msg.researchPending && (
//                       <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", marginTop: "6px" }}>
//                         Loading research…
//                       </div>
//                     )}

//                     {/* Research pill — shown once data is available */}
//                     {msg.researchData && (
//                       <InlineResearchPanel
//                         research={msg.researchData}
//                         transcriptCount={msg.transcriptCount}
//                         onResearchChange={setEditedResearch}
//                       />
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}

//             {/* Active streaming bubble — separate lightweight element */}
//             {isStreaming && (
//               <div className="chat-bubble bot streaming">
//                 <BotMessage
//                   msg={{ content: activeStreamText, prompt: "", text: activeStreamText }}
//                   onFeedback={() => {}}
//                 />
//               </div>
//             )}

//             {pipelineStatus && (
//               <div className="pipeline-status">⚙️ {pipelineStatus}</div>
//             )}

//             <div className="scroll-anchor" ref={chatEndRef} />
//           </div>

//           {researchError && (
//             <div style={{ color: "rgba(255,100,100,0.9)", fontSize: "13px", margin: "8px 16px", fontFamily: "'Inter', sans-serif", background: "rgba(255,50,50,0.06)", padding: "8px 16px", borderRadius: "9999px", border: "1px solid rgba(255,50,50,0.15)" }}>
//               ⚠️ {researchError}
//             </div>
//           )}

//           <div
//             className={`chat-input-area ${isDragging ? "drag-active" : ""}`}
//             onDragEnter={handleDragEnter} onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave} onDrop={handleDrop}
//           >
//             <div className="chat-input-inner">
//               <input ref={fileInputRef} type="file" multiple
//                 accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx" hidden
//                 onChange={(e) => setFiles(Array.from(e.target.files))} />

//               <button className="attach-btn" onClick={() => fileInputRef.current.click()} title="Attach files">📎</button>

//               {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} onPreview={openPreview} />}

//               <textarea placeholder="Start generating..." value={input}
//                 onChange={(e) => setInput(e.target.value)} rows={4} cols={50} />

//               <button onClick={runResearch} disabled={isResearching || !input.trim()}
//                 style={{ opacity: isResearching || !input.trim() ? 0.4 : 1 }}>
//                 🔍 {isResearching ? "Researching…" : "Research"}
//               </button>

//               <button onClick={generateScript}
//                 disabled={!input.trim() && files.length === 0 && !editedResearch}
//                 style={{ opacity: (!input.trim() && files.length === 0 && !editedResearch) ? 0.4 : 1 }}>
//                 {editedResearch ? "✦ Generate Script →" : "Send →"}
//               </button>
//             </div>
//           </div>

//           <FloatingEditMenu
//             position={menuPosition}
//             onAction={handleFloatingAction}
//             onAskAI={handleAskAI}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default ChatWindow;












import { useState, useRef, useEffect, useCallback } from "react";
import "./chatWindow.css";
import { useChat } from "../contexts/ChatContext";
import ChatResponse from "./chat_message.jsx";
import Clients from "./dropdown/clients.jsx";
import Business_Unit from "./dropdown/BU.jsx";
import Videotype from "./dropdown/videoType.jsx";
import VideoTone from "./dropdown/video_tone.jsx";
import DURATION_OPTIONS from "./dropdown/duration.jsx";

// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// ─────────────────────────────────────────────────────────────────────────────
// ScriptFloatingMenu
//
// Rendered as a SIBLING to contentEditable, never inside it.
// position:fixed + viewport coords = never misplaced by scroll.
// onMouseDown:preventDefault on every element = selection never collapses.
// ─────────────────────────────────────────────────────────────────────────────
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
        style={{ position:"fixed", top:position.top, left:position.left, zIndex:9999, background:"#1a1a1a", border:"1px solid rgba(255,255,255,.1)", borderRadius:".85rem", padding:"6px", display:"flex", flexDirection:"row", flexWrap:"wrap", gap:"4px", alignItems:"center", minWidth:"260px", maxWidth:"340px", boxShadow:"0 8px 32px rgba(0,0,0,.7)", animation:"sfmIn .13s ease" }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {isLoading ? (
          <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"6px 10px", fontSize:"12px", fontFamily:"'Inter',sans-serif", color:"rgba(255,255,255,.45)" }}>
            <span style={{ display:"inline-block", width:"14px", height:"14px", border:"1.5px solid rgba(255,255,255,.15)", borderTopColor:"rgba(139,92,246,.8)", borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 }} />
            Editing…
          </div>
        ) : (
          <>
            {[["✨","Improve clarity and tone","Improve"],["🔄","Regenerate keeping the same context and tone","Regenerate"],["✂️","Shorten this text","Shorten"],["📝","Expand with more detail","Expand"]].map(([icon,instruction,label]) => (
              <button key={label} className="sfm-btn" onMouseDown={(e)=>e.preventDefault()} onClick={()=>onAction(instruction)}
                style={{ background:"none", border:"1px solid rgba(255,255,255,.07)", borderRadius:"9999px", color:"rgba(255,255,255,.6)", cursor:"pointer", fontSize:"12px", fontFamily:"'Inter',sans-serif", padding:"5px 11px", whiteSpace:"nowrap" }}>
                {icon} {label}
              </button>
            ))}
            <div style={{ width:"100%", height:"1px", background:"rgba(255,255,255,.07)", margin:"2px 0" }} />
            <div style={{ width:"100%", display:"flex", gap:"4px", alignItems:"center" }}>
              <input className="sfm-ask" type="text" placeholder="Ask AI…" value={askInput}
                onChange={(e)=>setAskInput(e.target.value)}
                onMouseDown={(e)=>e.stopPropagation()}
                onKeyDown={(e)=>{ e.stopPropagation(); if(e.key==="Enter"&&askInput.trim()){onAction(askInput.trim());setAskInput("");} if(e.key==="Escape")onClose(); }}
                autoFocus
                style={{ flex:1, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:"9999px", color:"rgba(255,255,255,.85)", fontSize:"12px", fontFamily:"'Inter',sans-serif", padding:"5px 12px", outline:"none" }} />
              <button className="sfm-btn" onMouseDown={(e)=>e.preventDefault()} onClick={()=>{if(askInput.trim()){onAction(askInput.trim());setAskInput("");}}}
                style={{ background:"none", border:"1px solid rgba(255,255,255,.07)", borderRadius:"9999px", color:"rgba(255,255,255,.6)", cursor:"pointer", fontSize:"14px", padding:"5px 10px" }}>↵</button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ScriptCanvas — contentEditable canvas + floating AI menu
// ─────────────────────────────────────────────────────────────────────────────
const ScriptCanvas = ({ content }) => {
  const canvasRef     = useRef(null);
  const savedRange    = useRef(null);
  const undoStack     = useRef([]);
  const redoStack     = useRef([]);
  const snapshotTimer = useRef(null);
  const skipSnap      = useRef(false);
  const loaded        = useRef(false);

  const [menuPos,   setMenuPos]   = useState(null);
  const [selText,   setSelText]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [canUndo,   setCanUndo]   = useState(false);
  const [canRedo,   setCanRedo]   = useState(false);

  const refreshBtns = () => { setCanUndo(undoStack.current.length>0); setCanRedo(redoStack.current.length>0); };

  // Load content once stream is done
  useEffect(() => {
    if (!content || loaded.current) return;
    loaded.current = true;
    if (canvasRef.current) { canvasRef.current.innerText = content; countWords(); }
  }, [content]);

  const countWords = () => {
    const t = canvasRef.current?.innerText.trim().split(/\s+/).filter(Boolean).length ?? 0;
    setWordCount(t);
  };

  const pushUndo = () => {
    const el = canvasRef.current; if(!el) return;
    undoStack.current.push(el.innerHTML);
    if(undoStack.current.length>100) undoStack.current.shift();
    redoStack.current = [];
    refreshBtns();
  };

  const applyHtml = (html) => {
    const el = canvasRef.current; if(!el) return;
    skipSnap.current = true;
    el.innerHTML = html;
    countWords();
  };

  const undo = useCallback(()=>{ if(!undoStack.current.length) return; const el=canvasRef.current; if(!el)return; redoStack.current.push(el.innerHTML); applyHtml(undoStack.current.pop()); refreshBtns(); },[]);
  const redo = useCallback(()=>{ if(!redoStack.current.length) return; const el=canvasRef.current; if(!el)return; undoStack.current.push(el.innerHTML); applyHtml(redoStack.current.pop()); refreshBtns(); },[]);

  const onInput = useCallback(()=>{
    if(skipSnap.current){skipSnap.current=false;return;}
    clearTimeout(snapshotTimer.current);
    snapshotTimer.current = setTimeout(()=>{ pushUndo(); countWords(); }, 600);
  },[]);

  const onKeyDown = useCallback((e)=>{
    if((e.ctrlKey||e.metaKey)&&e.key==="z"&&!e.shiftKey){e.preventDefault();undo();}
    if((e.ctrlKey||e.metaKey)&&(e.key==="y"||(e.key==="z"&&e.shiftKey))){e.preventDefault();redo();}
    if(e.key==="Escape") setMenuPos(null);
  },[undo,redo]);

  const onMouseUp = useCallback((e)=>{
    if(e.target.closest?.("[data-sfm]")) return;
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if(!text){setMenuPos(null);return;}
    const range = sel.getRangeAt(0);
    if(!canvasRef.current?.contains(range.commonAncestorContainer)){setMenuPos(null);return;}
    savedRange.current = range.cloneRange();
    setSelText(text);
    const rect = range.getBoundingClientRect();
    setMenuPos({ top: rect.bottom+8, left: Math.min(rect.left, window.innerWidth-350) });
  },[]);

  const applyEdit = useCallback((edited)=>{
    const range = savedRange.current; const el = canvasRef.current;
    if(!range||!el) return;
    pushUndo();
    const sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
    const r = sel.getRangeAt(0);
    r.deleteContents();
    const node = document.createTextNode(edited);
    r.insertNode(node); r.setStartAfter(node); r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
    savedRange.current=null; setMenuPos(null); setSelText(""); countWords();
  },[]);

  const handleAction = useCallback(async(instruction)=>{
    if(!selText) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("instruction", instruction); fd.append("selected_text", selText);
      const res  = await fetch(`${API_BASE_URL}/edit`, {method:"POST", body:fd});
      const data = await res.json();
      if(data.result) applyEdit(data.result);
    } catch(err){ console.error("Canvas edit failed:", err); }
    finally{ setLoading(false); }
  },[selText, applyEdit]);

  const copy = useCallback(async()=>{
    await navigator.clipboard.writeText(canvasRef.current?.innerText??"");
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  },[]);

  const tbBtn = (dis) => ({ background:"none", border:"1px solid rgba(255,255,255,.07)", borderRadius:"9999px", color:dis?"rgba(255,255,255,.2)":"rgba(255,255,255,.5)", cursor:dis?"not-allowed":"pointer", fontSize:"11px", fontFamily:"'Inter',sans-serif", padding:"4px 12px" });

  return (
    <div style={{ display:"flex", flexDirection:"column", border:"1px solid rgba(255,255,255,.08)", borderRadius:"1rem", overflow:"hidden", background:"#0d0d0d", marginTop:"4px", width:"100%" }}>
      {/* Toolbar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 12px", borderBottom:"1px solid rgba(255,255,255,.06)", background:"#111", gap:"6px" }}>
        <div style={{display:"flex",gap:"6px"}}>
          <button style={tbBtn(!canUndo)} disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)">↩ Undo</button>
          <button style={tbBtn(!canRedo)} disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Y)">↪ Redo</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{fontSize:"11px",fontFamily:"'Inter',sans-serif",color:"rgba(255,255,255,.2)"}}>{wordCount} words</span>
          <button style={{...tbBtn(false),color:copied?"#6fcf97":"rgba(255,255,255,.5)"}} onClick={copy}>{copied?"✓ Copied":"⧉ Copy"}</button>
        </div>
      </div>

      {/* Editable area — menu is SIBLING below, never inside */}
      <div
        ref={canvasRef}
        contentEditable suppressContentEditableWarning spellCheck={false}
        onMouseUp={onMouseUp} onKeyDown={onKeyDown} onInput={onInput}
        data-placeholder="Your script will appear here. Edit freely, or select text for AI options."
        style={{ minHeight:"300px", padding:"20px 24px", outline:"none", color:"rgba(255,255,255,.87)", fontFamily:"'Inter',sans-serif", fontSize:"14px", lineHeight:1.8, whiteSpace:"pre-wrap", wordBreak:"break-word", caretColor:"rgba(255,255,255,.6)", overflowY:"auto" }}
      />

      {/* Menu rendered outside contentEditable */}
      <ScriptFloatingMenu
        position={menuPos}
        onAction={handleAction}
        onClose={()=>setMenuPos(null)}
        isLoading={loading}
      />

      <style>{`
        [contenteditable]:empty::before{content:attr(data-placeholder);color:rgba(255,255,255,.18);font-style:italic;pointer-events:none;}
        [contenteditable] ::selection{background:rgba(139,92,246,.3);}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
};

// ── Copy Button ────────────────────────────────────────────────
const CopyButton = ({ editableRef }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => { const t=editableRef.current?.innerText??""; await navigator.clipboard.writeText(t); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <button onClick={handleCopy} title="Copy response" style={{ backgroundColor:"#1f1f1f", border:"1px solid rgba(255,255,255,.07)", borderRadius:"9999px", color:copied?"#6fcf97":"rgba(255,255,255,.5)", cursor:"pointer", fontSize:"12px", fontFamily:"'Inter',sans-serif", fontWeight:500, padding:"5px 14px", transition:"color .2s,background .2s" }}>
      {copied?"✓ Copied":"⧉ Copy"}
    </button>
  );
};

// ── BotMessage ─────────────────────────────────────────────────
// isLatestBot=true  → editable ScriptCanvas
// isLatestBot=false → read-only ChatResponse
const BotMessage = ({ msg, onFeedback, isLatestBot }) => {
  const editableRef = useRef(null);
  return (
    <div className="feedback-row-rating">
      <button
        style={{ backgroundColor:"#1f1f1f", color:"#fff", border:"none", padding:"8px 12px", borderRadius:"8px", cursor:"pointer", transition:"all .15s ease" }}
        onMouseDown={(e)=>(e.currentTarget.style.transform="scale(0.3)")}
        onMouseUp={(e)=>(e.currentTarget.style.transform="scale(1)")}
        onMouseLeave={(e)=>(e.currentTarget.style.transform="scale(1)")}
        onMouseEnter={(e)=>(e.currentTarget.style.backgroundColor="#6fcf97")}
        onMouseOut={(e)=>(e.currentTarget.style.backgroundColor="#1f1f1f")}
        onClick={()=>onFeedback(1,msg.prompt,msg.content)}
      >👍</button>
      {!isLatestBot && <CopyButton editableRef={editableRef} />}
      {isLatestBot
        ? <ScriptCanvas content={msg.content} />
        : <ChatResponse ref={editableRef} reply={msg.content} />
      }
    </div>
  );
};

// ── Helpers ────────────────────────────────────────────────────
const getFileIcon = (file) => { if(file.type?.startsWith("image/"))return"🖼️"; if(file.type==="application/pdf")return"📕"; if(file.name?.endsWith(".docx"))return"📝"; if(file.name?.endsWith(".xlsx"))return"📊"; if(file.name?.endsWith(".pptx"))return"📋"; if(file.name?.endsWith(".csv"))return"📊"; return"📄"; };
const formatList = (v) => { if(!v||v.length===0)return""; if(Array.isArray(v))return v.join(", "); return v; };

const EditableTag = ({ value, color, borderColor, textColor, onChange, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);
  useEffect(()=>{ if(editing) inputRef.current?.focus(); },[editing]);
  const commit = () => { setEditing(false); if(draft.trim()) onChange(draft.trim()); else onDelete(); };
  if(editing) return <div style={{display:"flex",gap:"4px",marginBottom:"5px"}}><input ref={inputRef} value={draft} onChange={(e)=>setDraft(e.target.value)} onBlur={commit} onKeyDown={(e)=>{if(e.key==="Enter")commit();if(e.key==="Escape")setEditing(false);}} style={{flex:1,background:"#000",border:`1px solid ${borderColor}`,borderRadius:"9999px",color,fontSize:"12px",fontFamily:"'Inter',sans-serif",padding:"4px 12px",outline:"none"}}/></div>;
  return <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"5px"}}><span onClick={()=>setEditing(true)} title="Click to edit" style={{fontSize:"12px",color:textColor,lineHeight:1.5,cursor:"text",flex:1,fontFamily:"'Inter',sans-serif"}}>• {value}</span><button onClick={onDelete} title="Remove" style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:"11px",padding:"0 2px",lineHeight:1}}>✕</button></div>;
};

const EditableList = ({ items, setItems, label, color, bgColor, borderColor, textColor }) => {
  const [newItem, setNewItem] = useState(""); const [adding, setAdding] = useState(false); const addRef = useRef(null);
  useEffect(()=>{ if(adding) addRef.current?.focus(); },[adding]);
  const commitAdd = () => { if(newItem.trim()) setItems([...items,newItem.trim()]); setNewItem(""); setAdding(false); };
  return (
    <div style={{background:bgColor,borderRadius:"14px",padding:"12px 14px",border:`1px solid ${borderColor}`}}>
      <div style={{fontSize:"10px",fontWeight:700,color,marginBottom:"8px",letterSpacing:"1.2px",textTransform:"uppercase",fontFamily:"'Manrope',sans-serif"}}>{label}</div>
      {items.map((item,i)=>(<EditableTag key={i} value={item} color={color} borderColor={borderColor} textColor={textColor} onChange={(v)=>setItems(items.map((x,j)=>j===i?v:x))} onDelete={()=>setItems(items.filter((_,j)=>j!==i))}/>))}
      {adding?(<div style={{display:"flex",gap:"4px",marginTop:"4px"}}><input ref={addRef} value={newItem} onChange={(e)=>setNewItem(e.target.value)} onBlur={commitAdd} onKeyDown={(e)=>{if(e.key==="Enter")commitAdd();if(e.key==="Escape")setAdding(false);}} placeholder="Type and press Enter…" style={{flex:1,background:"#000",border:`1px solid ${borderColor}`,borderRadius:"9999px",color:textColor,fontSize:"12px",fontFamily:"'Inter',sans-serif",padding:"4px 12px",outline:"none"}}/></div>):(<button onClick={()=>setAdding(true)} style={{background:"none",border:`1px dashed ${borderColor}`,borderRadius:"9999px",color,fontSize:"11px",fontFamily:"'Inter',sans-serif",cursor:"pointer",padding:"4px 12px",marginTop:"6px",opacity:.6,width:"100%"}}>+ Add</button>)}
    </div>
  );
};

const InlineResearchPanel = ({ research, onResearchChange, transcriptCount }) => {
  const [open,setOpen]=useState(false);
  const [projIntel,setProjIntel]=useState(research.project_intelligence??"");
  const [summary,setSummary]=useState(research.niche_summary??research.niche_summary_title??"");
  const [hooks,setHooks]=useState(research.winning_hooks??[]);
  const [pains,setPains]=useState(research.top_pain_points??[]);
  const [angle,setAngle]=useState(research.recommended_angle??"");
  useEffect(()=>{ onResearchChange({...research,project_intelligence:projIntel,niche_summary:summary,winning_hooks:hooks,top_pain_points:pains,recommended_angle:angle}); },[projIntel,summary,hooks,pains,angle]); // eslint-disable-line
  const ss={background:"#0a0a0a",borderRadius:"14px",padding:"12px 16px",marginBottom:"10px",border:"1px solid rgba(255,255,255,.06)"};
  const ls={fontSize:"10px",fontWeight:700,letterSpacing:"1.2px",textTransform:"uppercase",marginBottom:"8px",fontFamily:"'Manrope',sans-serif"};
  const ta={width:"100%",background:"transparent",border:"none",fontSize:"13px",fontFamily:"'Inter',sans-serif",lineHeight:1.6,resize:"vertical",outline:"none",padding:0,boxSizing:"border-box",color:"rgba(255,255,255,.72)"};
  return (
    <div style={{marginTop:"8px",maxWidth:"520px"}}>
      <button onClick={()=>setOpen(v=>!v)} style={{display:"inline-flex",alignItems:"center",gap:"7px",background:open?"rgba(139,92,246,.18)":"rgba(139,92,246,.10)",border:"1px solid rgba(139,92,246,.35)",borderRadius:"9999px",padding:"5px 13px 5px 10px",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"rgba(200,180,255,.9)",transition:"background .15s"}}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(180,150,255,.8)" strokeWidth="1.3"/><line x1="8.8" y1="8.8" x2="11.5" y2="11.5" stroke="rgba(180,150,255,.8)" strokeWidth="1.3" strokeLinecap="round"/></svg>
        Research — {transcriptCount??0} sources analyzed
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{transition:"transform .2s",transform:open?"rotate(180deg)":"rotate(0deg)"}}><path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(180,150,255,.7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open&&(<div style={{marginTop:"8px",background:"rgba(19,19,19,.95)",border:"1px solid rgba(139,92,246,.25)",borderRadius:"1.1rem",padding:"16px 18px",maxHeight:"420px",overflowY:"auto"}}>
        <div style={{fontSize:"11px",color:"rgba(255,255,255,.35)",fontFamily:"'Inter',sans-serif",marginBottom:"14px"}}>Edit anything below — changes are picked up when you hit Generate Script.</div>
        {projIntel!==undefined&&<div style={{...ss,borderLeft:"2px solid rgba(255,255,255,.18)"}}><div style={{...ls,color:"rgba(255,255,255,.4)"}}>Project Intelligence</div><textarea value={projIntel} onChange={(e)=>setProjIntel(e.target.value)} rows={Math.min(10,(projIntel.match(/\n/g)||[]).length+3)} style={ta}/></div>}
        {summary!==undefined&&<div style={{...ss,borderLeft:"2px solid rgba(255,255,255,.10)"}}><div style={{...ls,color:"rgba(255,255,255,.35)"}}>Niche Summary</div><textarea value={summary} onChange={(e)=>setSummary(e.target.value)} rows={3} style={ta}/></div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
          <EditableList items={hooks} setItems={setHooks} label="Winning Hooks" color="rgba(255,255,255,.55)" bgColor="#111" borderColor="rgba(255,255,255,.08)" textColor="rgba(255,255,255,.75)"/>
          <EditableList items={pains} setItems={setPains} label="Pain Points" color="rgba(255,255,255,.4)" bgColor="#0e0e0e" borderColor="rgba(255,255,255,.06)" textColor="rgba(255,255,255,.6)"/>
        </div>
        {angle!==undefined&&<div style={{background:"#111",borderRadius:"14px",padding:"10px 14px",border:"1px solid rgba(255,255,255,.07)",borderLeft:"2px solid rgba(255,255,255,.22)"}}><div style={{...ls,color:"rgba(255,255,255,.45)"}}>Recommended Angle</div><textarea value={angle} onChange={(e)=>setAngle(e.target.value)} rows={2} style={ta}/></div>}
      </div>)}
    </div>
  );
};

const ResearchingIndicator = () => (
  <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 18px",borderRadius:"9999px",background:"#1A1A1A",border:"1px solid rgba(255,255,255,.07)",maxWidth:"300px",margin:"8px 0",boxShadow:"0 4px 20px rgba(0,0,0,.5)"}}>
    <span style={{fontSize:"16px",animation:"spin 1.2s linear infinite",display:"inline-block"}}>🔍</span>
    <div><div style={{fontSize:"13px",color:"#e5e5e5",fontWeight:600,fontFamily:"'Manrope',sans-serif"}}>Researching…</div><div style={{fontSize:"11px",color:"rgba(255,255,255,.35)",marginTop:"2px",fontFamily:"'Inter',sans-serif"}}>Searching web + analysing YouTube</div></div>
  </div>
);

const FilePreviewModal = ({ previewFile, onClose }) => {
  if(!previewFile) return null;
  const isImage=previewFile.type?.startsWith("image/"), isPDF=previewFile.type==="application/pdf";
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}} onClick={onClose}>
      <div style={{background:"#0d0d0d",borderRadius:"1.5rem",padding:"24px",maxWidth:"90vw",maxHeight:"85vh",width:"100%",overflow:"hidden",display:"flex",flexDirection:"column",gap:"16px",border:"1px solid rgba(255,255,255,.08)",boxShadow:"0 24px 80px rgba(0,0,0,.9)"}} onClick={(e)=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:600,fontSize:"14px",color:"#e5e5e5",fontFamily:"'Manrope',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{getFileIcon({name:previewFile.name,type:previewFile.type})} {previewFile.name}</span>
          <button onClick={onClose} style={{background:"#1A1A1A",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",borderRadius:"9999px",padding:"5px 14px",cursor:"pointer",fontSize:"12px",fontFamily:"'Inter',sans-serif",flexShrink:0,marginLeft:"16px"}}>✕ Close</button>
        </div>
        <div style={{overflow:"auto",flex:1,borderRadius:"12px"}}>
          {isImage&&<img src={previewFile.url} alt={previewFile.name} style={{maxWidth:"100%",maxHeight:"70vh",objectFit:"contain",display:"block",margin:"0 auto"}}/>}
          {isPDF&&<iframe src={previewFile.url} title={previewFile.name} style={{width:"100%",height:"70vh",border:"none",borderRadius:"12px"}}/>}
          {!isImage&&!isPDF&&<div style={{color:"rgba(255,255,255,.4)",textAlign:"center",padding:"48px",fontSize:"14px",fontFamily:"'Inter',sans-serif"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>{getFileIcon({name:previewFile.name,type:previewFile.type})}</div><div style={{color:"rgba(255,255,255,.7)"}}>{previewFile.name}</div><a href={previewFile.url} download={previewFile.name} style={{display:"inline-block",marginTop:"16px",color:"rgba(255,255,255,.55)",fontSize:"13px"}}>↓ Download to view</a></div>}
        </div>
      </div>
    </div>
  );
};

const FileChips = ({ fileList, onRemove, onPreview }) => (
  <div className="file-chip-row">
    {fileList.map((f,idx)=>(<div key={idx} className="file-chip"><span onClick={()=>onPreview(f)} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"}} title="Click to preview">{getFileIcon(f)} {f.name}</span>{onRemove&&<button onClick={()=>onRemove(idx)}>✕</button>}</div>))}
  </div>
);

function reconstructMessage(m) {
  const researchId = m.metadata?.research_id??null;
  return { id:m.id??crypto.randomUUID(), sender:m.role==="assistant"?"bot":"user", text:m.content, content:m.content, prompt:m.prompt??"", files:[], researchPending:false, researchData:null, transcriptCount:0, hideText:!!researchId, researchLoading:!!researchId, researchId };
}

// ── Main ChatWindow ────────────────────────────────────────────
function ChatWindow() {
  const { messages,setMessages,addMessage,updateLastMessage,conversationId,setConversationId,loadConversations } = useChat();

  const [input,setInput]=useState(""); const [files,setFiles]=useState([]);
  const dragCounterRef=useRef(0); const [isDragging,setIsDragging]=useState(false);
  const [pipelineStatus,setPipelineStatus]=useState(null);
  const [previewFile,setPreviewFile]=useState(null);
  const [selectedClient,setSelectedClient]=useState(""); const [selectedBU,setSelectedBU]=useState("");
  const [selectedVideoType,setSelectedVideoType]=useState(""); const [selectedVideoTone,setSelectedVideoTone]=useState("");
  const [selectedDuration,setSelectedDuration]=useState("");
  const [isResearching,setIsResearching]=useState(false); const [editedResearch,setEditedResearch]=useState(null);
  const [researchId,setResearchId]=useState(null); const [researchError,setResearchError]=useState(null);
  const [activeStreamText,setActiveStreamText]=useState(""); const [isStreaming,setIsStreaming]=useState(false);
  const abortControllerRef=useRef(null); const conversationIdRef=useRef(conversationId);
  useEffect(()=>{ conversationIdRef.current=conversationId; },[conversationId]);
  const lastPromptRef=useRef(""); const lastOutputRef=useRef("");
  const chatEndRef=useRef(null); const fileInputRef=useRef(null);
  const chatHistoryRef=useRef(null); const loadingRef=useRef(false);
  const [page,setPage]=useState(1); const [hasMore,setHasMore]=useState(true);
  const [loadingMessages,setLoadingMessages]=useState(false);

  const isEmpty = messages.length===0&&!loadingMessages;

  // ID of the last bot message → gets ScriptCanvas
  const lastBotId = [...messages].reverse().find(m=>m.sender==="bot")?.id??null;

  const hydrateResearchMessages = useCallback(async(msgList,chatIdParam)=>{
    const toH=msgList.filter(m=>m.researchLoading&&m.researchId); if(!toH.length)return;
    await Promise.all(toH.map(async(msg)=>{
      try{
        const res=await fetch(`${API_BASE_URL}/research/${msg.researchId}`); const data=await res.json();
        if(chatIdParam!==conversationIdRef.current)return;
        setMessages(prev=>prev.map(m=>m.id===msg.id?(data.success&&data.research?{...m,researchLoading:false,researchData:data.research,transcriptCount:data.research.transcript_count??0}:{...m,researchLoading:false}):m));
      }catch{setMessages(prev=>prev.map(m=>m.id===msg.id?{...m,researchLoading:false}:m));}
    }));
  },[]);

  const fetchMessages = useCallback(async(chatIdParam,pageNum)=>{
    if(loadingRef.current)return; loadingRef.current=true; setLoadingMessages(true);
    try{
      const res=await fetch(`${API_BASE_URL}/messages?conversation_id=${chatIdParam}&page=${pageNum}&limit=20`);
      const data=await res.json();
      if(chatIdParam!==conversationIdRef.current)return;
      const fetched=Array.isArray(data.messages)?data.messages:Array.isArray(data)?data:[];
      if(fetched.length<20)setHasMore(false);
      const ordered=fetched.map(m=>reconstructMessage(m));
      if(pageNum===1){ setMessages(ordered); requestAnimationFrame(()=>requestAnimationFrame(()=>chatEndRef.current?.scrollIntoView({behavior:"auto"})));
      }else{ const c=chatHistoryRef.current; const ph=c?.scrollHeight||0; setMessages(prev=>[...ordered,...prev]); requestAnimationFrame(()=>{if(c)c.scrollTop=c.scrollHeight-ph;}); }
      hydrateResearchMessages(ordered,chatIdParam);
    }catch(err){console.error("Failed to fetch messages:",err);}
    finally{setLoadingMessages(false);loadingRef.current=false;}
  },[hydrateResearchMessages]);

  useEffect(()=>{ setInput("");setFiles([]);setEditedResearch(null);setResearchId(null);setResearchError(null);setMessages([]);setPage(1);setHasMore(true);loadingRef.current=false; abortControllerRef.current?.abort(); if(!conversationId)return; fetchMessages(conversationId,1); },[conversationId]); // eslint-disable-line
  useEffect(()=>{ if(page>1&&conversationId)fetchMessages(conversationId,page); },[page]); // eslint-disable-line

  useEffect(()=>{
    const c=chatHistoryRef.current; if(!c||!conversationId)return;
    const h=()=>{ if(c.scrollTop<=5&&hasMore&&!loadingRef.current)setPage(p=>p+1); };
    c.addEventListener("scroll",h); return()=>c.removeEventListener("scroll",h);
  },[conversationId,hasMore]);

  useEffect(()=>{
    if(!messages.length)return; const c=chatHistoryRef.current; if(!c)return;
    if(c.scrollHeight-c.scrollTop-c.clientHeight<150) chatEndRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages.length]);

  const handleDragEnter=(e)=>{e.preventDefault();dragCounterRef.current+=1;if(dragCounterRef.current===1)setIsDragging(true);};
  const handleDragOver=(e)=>e.preventDefault();
  const handleDragLeave=(e)=>{e.preventDefault();dragCounterRef.current-=1;if(dragCounterRef.current===0)setIsDragging(false);};
  const handleDrop=(e)=>{e.preventDefault();dragCounterRef.current=0;setIsDragging(false);const d=Array.from(e.dataTransfer.files);if(d.length)setFiles(p=>[...p,...d]);};

  const openPreview=(file)=>{const url=file.url||URL.createObjectURL(file);setPreviewFile({name:file.name,url,type:file.type});};
  const closePreview=()=>setPreviewFile(null);
  const safeAddMessage=(msg)=>addMessage(conversationId,msg);
  const buildFinalPrompt=()=>`create a ${selectedDuration||"unspecified duration"} ${formatList(selectedVideoType)||"video"} video script for ${formatList(selectedClient)||"the client"} ,which oporates in ${formatList(selectedBU)} sectors, about ${input}, maintain a ${formatList(selectedVideoTone)||"professional"} tone consistently.`.trim();
  const sendFeedback=async(rating)=>{ const fd=new FormData(); fd.append("prompt",lastPromptRef.current); fd.append("output",lastOutputRef.current); fd.append("rating",rating); await fetch(`${API_BASE_URL}/feedback`,{method:"POST",body:fd}); };

  const runResearch=async()=>{
    if(!input.trim())return;
    setIsResearching(true);setEditedResearch(null);setResearchId(null);setResearchError(null);
    const ci=input,cf=[...files],fpd=cf.map(f=>({name:f.name,type:f.type,url:URL.createObjectURL(f)}));
    setInput("");setFiles([]);
    const bid=crypto.randomUUID();
    setMessages(prev=>[...prev,{id:bid,sender:"user",text:ci,content:ci,prompt:"",files:fpd,researchPending:true,researchData:null,hideText:false,researchLoading:false,researchId:null,_researchId:bid}]);
    const fd=new FormData(); fd.append("client",formatList(selectedClient)); fd.append("business_unit",formatList(selectedBU)); fd.append("video_type",formatList(selectedVideoType)); fd.append("video_tone",formatList(selectedVideoTone)); fd.append("duration",selectedDuration); fd.append("prompt",ci); cf.forEach(f=>fd.append("files",f));
    const patch=(p)=>setMessages(prev=>prev.map(m=>m._researchId===bid?{...m,...p}:m));
    try{
      const res=await fetch(`${API_BASE_URL}/research`,{method:"POST",body:fd}); const data=await res.json();
      if(data.success&&data.research){setEditedResearch(data.research);setResearchId(data.research_id);patch({researchPending:false,researchData:data.research,transcriptCount:data.research.transcript_count??0,hideText:true});}
      else{setResearchError(data.error||"Research failed");patch({researchPending:false});}
    }catch{setResearchError("Could not reach server");patch({researchPending:false});}
    finally{setIsResearching(false);}
  };

  const generateScript=async()=>{
    if(!input.trim()&&!files.length&&!editedResearch)return;
    const cf=[...files],ci=input,cr=editedResearch,cri=researchId;
    const fpd=cf.map(f=>({name:f.name,type:f.type,url:URL.createObjectURL(f)}));
    const fp=buildFinalPrompt(); lastPromptRef.current=fp;
    setInput("");setFiles([]);setEditedResearch(null);setResearchId(null);
    const botId=crypto.randomUUID();
    if(!cr){ const uid=crypto.randomUUID(); await safeAddMessage({role:"user",content:ci,files:fpd}); setMessages(prev=>[...prev,{id:uid,sender:"user",text:ci,content:ci,prompt:"",files:fpd,hideText:false,researchLoading:false},{id:botId,sender:"bot",text:"",content:"",prompt:"",files:[]}]);
    }else{ setMessages(prev=>[...prev,{id:botId,sender:"bot",text:"",content:"",prompt:"",files:[]}]); }
    setActiveStreamText("");setIsStreaming(true);
    abortControllerRef.current?.abort(); const ctrl=new AbortController(); abortControllerRef.current=ctrl;
    const fd=new FormData(); fd.append("prompt",fp); fd.append("client",formatList(selectedClient)); fd.append("business_unit",formatList(selectedBU)); fd.append("video_type",formatList(selectedVideoType)); fd.append("video_tone",formatList(selectedVideoTone));
    if(selectedDuration)fd.append("duration",selectedDuration); if(cri)fd.append("research_id",cri); if(cr)fd.append("research_brief",JSON.stringify(cr)); if(conversationId)fd.append("conversation_id",conversationId); cf.forEach(f=>fd.append("files",f));
    try{
      const res=await fetch(`${API_BASE_URL}/chat`,{method:"POST",body:fd,signal:ctrl.signal});
      const reader=res.body.getReader(),decoder=new TextDecoder("utf-8");
      let done=false,fullText="",rcid=conversationId;
      while(!done){
        const{value,done:d}=await reader.read(); done=d; if(ctrl.signal.aborted)break;
        for(const line of decoder.decode(value||new Uint8Array(),{stream:true}).split("\n")){
          if(line.startsWith("conversation_id:")){rcid=line.replace("conversation_id:","").trim();const isNew=!conversationId;setConversationId(rcid);if(isNew)loadConversations();continue;}
          if(line.startsWith("status:")||line.startsWith("<!-- ")){setPipelineStatus(line.replace("status:","").replace("<!--","").replace("-->","").trim());continue;}
          if(line.startsWith("result:")){fullText=line.replace("result:","").trim();continue;}
          if(line.startsWith("error:")){fullText=`⚠️ ${line.replace("error:","").trim()}`;continue;}
          if(line.startsWith("<!-- debug:"))continue;
          if(line.trim()&&fullText)fullText+="\n"+line;
        }
        setActiveStreamText(fullText);
      }
      fullText=fullText.replace(/\\n/g,"\n"); lastOutputRef.current=fullText;
      setIsStreaming(false);setActiveStreamText("");setPipelineStatus(null);
      updateLastMessage(rcid,fullText,fp);
      setMessages(prev=>prev.map(m=>m.id===botId?{...m,content:fullText,text:fullText,prompt:fp}:m));
    }catch(err){
      if(err.name==="AbortError")return;
      console.error("generateScript error:",err); setIsStreaming(false); setActiveStreamText("");
      setInput(ci);setFiles(cf);setEditedResearch(cr);setResearchId(cri);
      safeAddMessage({role:"assistant",content:"⚠️ Server error"});
      setMessages(prev=>prev.map(m=>m.id===botId?{...m,content:"⚠️ Server error",text:"⚠️ Server error"}:m));
    }
  };

  const removeFile=(idx)=>setFiles(files.filter((_,i)=>i!==idx));

  return (
    <div className="chat-window">
      <FilePreviewModal previewFile={previewFile} onClose={closePreview}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {isEmpty?(
        <>
          <div className="empty-wrapper"><h2>How can I help you <span>today?</span></h2><p className="subtitle">Your creative partner for scriptwriting, asset generation, and video planning.</p></div>
          <div className="bottom-control-bar"><div className="glass-panel">
            <div className="dropdown-row"><Clients onChange={setSelectedClient}/><Business_Unit onChange={setSelectedBU}/><Videotype onChange={setSelectedVideoType}/><VideoTone onChange={setSelectedVideoTone}/><DURATION_OPTIONS onChange={setSelectedDuration}/></div>
            <div className={`chat-input-area-og ${isDragging?"drag-active":""}`} onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx" hidden onChange={(e)=>setFiles(Array.from(e.target.files))}/>
              {files.length>0&&<FileChips fileList={files} onRemove={removeFile} onPreview={openPreview}/>}
              <textarea placeholder="Start generating..." value={input} onChange={(e)=>setInput(e.target.value)} rows={4} cols={50}/>
              <div className="og-bottom-row">
                <div className="og-bottom-left"><button className="attach-btn-og" onClick={()=>fileInputRef.current.click()} title="Attach files">📎</button></div>
                <div className="og-bottom-right">
                  <button className="btn-research" onClick={runResearch} disabled={isResearching||!input.trim()} style={{opacity:isResearching||!input.trim()?.4:1}}>🔍 {isResearching?"Researching…":"Research"}</button>
                  <button className="btn-send" onClick={generateScript} disabled={!input.trim()&&!files.length&&!editedResearch} style={{opacity:(!input.trim()&&!files.length&&!editedResearch)?.4:1}}>{editedResearch?"✦ Generate Script →":"Send →"}</button>
                </div>
              </div>
            </div>
          </div></div>
          {researchError&&<div style={{position:"fixed",bottom:"340px",left:"50%",transform:"translateX(-50%)",zIndex:20,color:"rgba(255,100,100,.9)",fontSize:"13px",fontFamily:"'Inter',sans-serif",background:"rgba(255,50,50,.06)",padding:"8px 18px",borderRadius:"9999px",border:"1px solid rgba(255,50,50,.15)"}}>⚠️ {researchError}</div>}
        </>
      ):(
        <div className="chat-container">
          <div className="chat-history" ref={chatHistoryRef}>
            {loadingMessages&&<div style={{textAlign:"center",padding:"12px",color:"rgba(255,255,255,.4)",fontSize:"12px",fontFamily:"'Inter',sans-serif"}}>Loading older messages…</div>}

            {messages.map((msg)=>(
              <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                {msg.sender==="bot"?(
                  <BotMessage msg={msg} onFeedback={sendFeedback} isLatestBot={msg.id===lastBotId}/>
                ):(
                  <div>
                    {!msg.hideText&&msg.text&&<p style={{margin:0}}>{msg.text}</p>}
                    {msg.files?.length>0&&<FileChips fileList={msg.files} onPreview={openPreview}/>}
                    {msg.researchPending&&<ResearchingIndicator/>}
                    {msg.researchLoading&&!msg.researchPending&&<div style={{fontSize:"12px",color:"rgba(255,255,255,.3)",fontFamily:"'Inter',sans-serif",marginTop:"6px"}}>Loading research…</div>}
                    {msg.researchData&&<InlineResearchPanel research={msg.researchData} transcriptCount={msg.transcriptCount} onResearchChange={setEditedResearch}/>}
                  </div>
                )}
              </div>
            ))}

            {isStreaming&&(
              <div className="chat-bubble bot streaming">
                <div className="feedback-row-rating">
                  <div style={{fontSize:"13px",color:"rgba(255,255,255,.7)",fontFamily:"'Inter',sans-serif",whiteSpace:"pre-wrap",lineHeight:1.7}}>
                    {activeStreamText}
                    <span style={{display:"inline-block",width:"2px",height:"14px",background:"rgba(255,255,255,.4)",marginLeft:"2px",animation:"blink 1s step-end infinite",verticalAlign:"text-bottom"}}/>
                  </div>
                </div>
              </div>
            )}

            {pipelineStatus&&<div className="pipeline-status">⚙️ {pipelineStatus}</div>}
            <div className="scroll-anchor" ref={chatEndRef}/>
          </div>

          {researchError&&<div style={{color:"rgba(255,100,100,.9)",fontSize:"13px",margin:"8px 16px",fontFamily:"'Inter',sans-serif",background:"rgba(255,50,50,.06)",padding:"8px 16px",borderRadius:"9999px",border:"1px solid rgba(255,50,50,.15)"}}>⚠️ {researchError}</div>}

          <div className={`chat-input-area ${isDragging?"drag-active":""}`} onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div className="chat-input-inner">
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx" hidden onChange={(e)=>setFiles(Array.from(e.target.files))}/>
              <button className="attach-btn" onClick={()=>fileInputRef.current.click()} title="Attach files">📎</button>
              {files.length>0&&<FileChips fileList={files} onRemove={removeFile} onPreview={openPreview}/>}
              <textarea placeholder="Start generating..." value={input} onChange={(e)=>setInput(e.target.value)} rows={4} cols={50}/>
              <button onClick={runResearch} disabled={isResearching||!input.trim()} style={{opacity:isResearching||!input.trim()?.4:1}}>🔍 {isResearching?"Researching…":"Research"}</button>
              <button onClick={generateScript} disabled={!input.trim()&&!files.length&&!editedResearch} style={{opacity:(!input.trim()&&!files.length&&!editedResearch)?.4:1}}>{editedResearch?"✦ Generate Script →":"Send →"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;