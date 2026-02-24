// import { useState, useRef, useEffect } from "react";
// import "./chatWindow.css";
// import { useChat } from "../contexts/ChatContext";
// import ChatResponse from "./chat_message.jsx";
// import FloatingEditMenu from "./floatingEdit.jsx";
// import { supabase } from "../supabase";
// import Clients from "./dropdown/clients.jsx";
// import Business_Unit from "./dropdown/BU.jsx";
// import Videotype from "./dropdown/videoType.jsx";
// import VideoTone from "./dropdown/video_tone.jsx";
// import DURATION_OPTIONS from "./dropdown/duration.jsx";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
//         backgroundColor: "#282a2c",
//         border: "1px solid #3a3a3a",
//         borderRadius: "6px",
//         color: copied ? "#4caf50" : "#aaa",
//         cursor: "pointer",
//         fontSize: "13px",
//         padding: "4px 10px",
//         transition: "color 0.2s",
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
//       <button style={{ backgroundColor: "#282a2c" }} onClick={() => onFeedback(1)}>
//         👍
//       </button>
//       <CopyButton editableRef={editableRef} />
//       <ChatResponse ref={editableRef} reply={msg.text} />
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

// // ── Main Component ─────────────────────────────────────────────
// function ChatWindow() {
//   const { activeChat, addMessage, updateLastMessage } = useChat();
//   const chatId = activeChat?.id ?? null;
//   const safeMessages = activeChat?.messages ?? [];
//   const isEmpty = safeMessages.length === 0;

//   const [input, setInput] = useState("");
//   const [files, setFiles] = useState([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const [selectionInfo, setSelectionInfo] = useState(null);
//   const [pipelineStatus, setPipelineStatus] = useState(null);
//   const [menuPosition, setMenuPosition] = useState(null);
//   const [selectedText, setSelectedText] = useState("");
//   const [previewFile, setPreviewFile] = useState(null);
//   const [selectedClient, setSelectedClient] = useState("");
//   const [selectedBU, setSelectedBU] = useState("");
//   const [selectedVideoType, setSelectedVideoType] = useState("");
//   const [selectedVideoTone, setSelectedVideoTone] = useState("");
//   const [selectedDuration, setSelectedDuration] = useState("");

//   const lastPromptRef = useRef("");
//   const lastOutputRef = useRef("");
//   const chatEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // ── Scroll to bottom on new messages ──────────────────────────
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [activeChat?.messages]);

//   // ── Reset on chat switch ───────────────────────────────────────
//   useEffect(() => {
//     setInput("");
//     setFiles([]);
//     setSelectionInfo(null);
//   }, [activeChat?.id]);

//   // ── Selection change listener ──────────────────────────────────
//   useEffect(() => {
//     const handleSelection = () => {
//       const sel = window.getSelection();
//       if (!sel || sel.isCollapsed) {
//         setSelectionInfo(null);
//         return;
//       }
//       const range = sel.getRangeAt(0);
//       const rect = range.getBoundingClientRect();
//       setSelectionInfo({
//         text: sel.toString(),
//         position: {
//           top: rect.top - 40 + window.scrollY,
//           left: rect.left + rect.width / 2,
//         },
//       });
//     };

//     document.addEventListener("selectionchange", handleSelection);
//     return () => document.removeEventListener("selectionchange", handleSelection);
//   }, []);

//   // ── Mouse up — only show menu inside bot bubbles ───────────────
//   const handleMouseUp = () => {
//     const selection = window.getSelection();
//     const text = selection.toString();

//     if (!text) {
//       setMenuPosition(null);
//       return;
//     }

//     const range = selection.getRangeAt(0);
//     const container = range.commonAncestorContainer;
//     const botBubble = (
//       container.nodeType === Node.TEXT_NODE ? container.parentElement : container
//     ).closest(".chat-bubble.bot");

//     if (!botBubble) {
//       setMenuPosition(null);
//       return;
//     }

//     const rect = range.getBoundingClientRect();
//     setSelectedText(text);
//     setMenuPosition({
//       top: rect.bottom + window.scrollY,
//       left: rect.left + window.scrollX,
//     });
//   };

//   // ── Drag & Drop ────────────────────────────────────────────────
//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => setIsDragging(false);

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFiles = Array.from(e.dataTransfer.files);
//     if (droppedFiles.length > 0) {
//       setFiles((prev) => [...prev, ...droppedFiles]);
//     }
//   };

//   // ── File Preview ───────────────────────────────────────────────
//   const openPreview = (file) => {
//     const url = file.url || URL.createObjectURL(file);
//     setPreviewFile({ name: file.name, url, type: file.type });
//   };

//   const closePreview = () => setPreviewFile(null);

//   const safeAddMessage = (message) => addMessage(chatId, message);

//   // ── Prompt Builder ─────────────────────────────────────────────
//   const buildFinalPrompt = () => {
//     const clientText = formatList(selectedClient) || "the client";
//     const buText = formatList(selectedBU);
//     const typeText = formatList(selectedVideoType) || "video";
//     const toneText = formatList(selectedVideoTone) || "professional";
//     const durationText = selectedDuration || "unspecified duration";

//     return `create a ${durationText} ${typeText} video script for ${clientText} ,which oporates in ${buText} sectors, about ${input}, maintain a ${toneText} tone consistently.`.trim();
//   };

//   // ── Feedback ───────────────────────────────────────────────────
//   const sendFeedback = async (rating) => {
//     const formData = new FormData();
//     formData.append("prompt", lastPromptRef.current);
//     formData.append("output", lastOutputRef.current);
//     formData.append("rating", rating);

//     await fetch(`${API_BASE_URL}/feedback`, {
//       method: "POST",
//       body: formData,
//     });
//   };

//   // ── Send Message ───────────────────────────────────────────────
//   const sendMessage = async () => {
//     if (!input.trim() && files.length === 0) return;

//     const filePreviewData = files.map((f) => ({
//       name: f.name,
//       type: f.type,
//       url: URL.createObjectURL(f),
//     }));

//     const finalPrompt = buildFinalPrompt();
//     lastPromptRef.current = finalPrompt;

//     await safeAddMessage({
//       role: "user",
//       content: input,
//       client: selectedClient,
//       bu: selectedBU,
//       type: selectedVideoType,
//       tone: selectedVideoTone,
//       files: filePreviewData,
//     });

//     const formData = new FormData();
//     formData.append("prompt", finalPrompt);
//     files.forEach((f) => formData.append("files", f));

//     setInput("");
//     setFiles([]);

//     try {
//       const { data: inserted } = await supabase
//         .from("messages")
//         .insert({ chat_id: chatId, role: "assistant", content: "" })
//         .select()
//         .single();

//       const res = await fetch(`${API_BASE_URL}/chat`, {
//         method: "POST",
//         body: formData,
//       });

//       const reader = res.body.getReader();
//       const decoder = new TextDecoder("utf-8");

//       let done = false;
//       let fullText = "";

//       while (!done) {
//         const { value, done: doneReading } = await reader.read();
//         done = doneReading;

//         const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
//         const lines = chunk.split("\n");

//         for (const line of lines) {
//           if (line.startsWith("status:") || line.startsWith("<!-- ")) {
//             const status = line
//               .replace("status:", "")
//               .replace("<!--", "")
//               .replace("-->", "")
//               .trim();
//             setPipelineStatus(status);
//             continue;
//           }
//           if (line.startsWith("result:")) {
//             fullText = line.replace("result:", "").trim();
//             continue;
//           }
//           if (line.startsWith("error:")) {
//             fullText = `⚠️ ${line.replace("error:", "").trim()}`;
//             continue;
//           }
//           if (line.startsWith("<!-- debug:")) continue;
//           if (line.trim() && fullText) {
//             fullText += "\n" + line;
//           }
//         }

//         updateLastMessage(chatId, fullText);
//       }

//       lastOutputRef.current = fullText;
//       setPipelineStatus(null);

//       await supabase
//         .from("messages")
//         .update({ content: fullText })
//         .eq("id", inserted.id);
//     } catch {
//       safeAddMessage({ role: "assistant", content: "⚠️ Server error" });
//     }
//   };

//   // ── File Preview Modal ─────────────────────────────────────────
//   const FilePreviewModal = () => {
//     if (!previewFile) return null;

//     const isImage = previewFile.type?.startsWith("image/");
//     const isPDF = previewFile.type === "application/pdf";

//     return (
//       <div
//         style={{
//           position: "fixed", inset: 0,
//           background: "rgba(0,0,0,0.85)",
//           zIndex: 1000,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           padding: "24px",
//         }}
//         onClick={closePreview}
//       >
//         <div
//           style={{
//             background: "#1a1a2e",
//             borderRadius: "12px",
//             padding: "24px",
//             maxWidth: "90vw",
//             maxHeight: "85vh",
//             width: "100%",
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: "column",
//             gap: "16px",
//             border: "1px solid #2a2a4a",
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//             <span style={{ fontWeight: 600, fontSize: "14px", color: "#e0e0e0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//               {getFileIcon({ name: previewFile.name, type: previewFile.type })} {previewFile.name}
//             </span>
//             <button
//               onClick={closePreview}
//               style={{
//                 background: "none", border: "1px solid #444",
//                 color: "#aaa", borderRadius: "6px",
//                 padding: "4px 12px", cursor: "pointer",
//                 fontSize: "13px", flexShrink: 0, marginLeft: "16px",
//               }}
//             >
//               ✕ Close
//             </button>
//           </div>

//           <div style={{ overflow: "auto", flex: 1, borderRadius: "8px" }}>
//             {isImage && (
//               <img
//                 src={previewFile.url}
//                 alt={previewFile.name}
//                 style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", display: "block", margin: "0 auto" }}
//               />
//             )}
//             {isPDF && (
//               <iframe
//                 src={previewFile.url}
//                 title={previewFile.name}
//                 style={{ width: "100%", height: "70vh", border: "none", borderRadius: "8px" }}
//               />
//             )}
//             {!isImage && !isPDF && (
//               <div style={{ color: "#aaa", textAlign: "center", padding: "48px", fontSize: "14px" }}>
//                 <div style={{ fontSize: "48px", marginBottom: "12px" }}>
//                   {getFileIcon({ name: previewFile.name, type: previewFile.type })}
//                 </div>
//                 <div>{previewFile.name}</div>
//                 <div style={{ fontSize: "12px", marginTop: "8px", color: "#666" }}>
//                   Preview not available for this file type
//                 </div>
//                 <a
//                   href={previewFile.url}
//                   download={previewFile.name}
//                   style={{ display: "inline-block", marginTop: "16px", color: "#7b7bf7", fontSize: "13px" }}
//                 >
//                   ↓ Download to view
//                 </a>
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
//           <span
//             onClick={() => openPreview(f)}
//             style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
//             title="Click to preview"
//           >
//             {getFileIcon(f)} {f.name}
//           </span>
//           {onRemove && (
//             <button onClick={() => onRemove(idx)}>✕</button>
//           )}
//         </div>
//       ))}
//     </div>
//   );

//   const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

//   // ── Render ─────────────────────────────────────────────────────
//   return (
//     <div className="chat-window" onMouseUp={handleMouseUp}>
//       <FilePreviewModal />

//       {isEmpty ? (
//         /* ── Empty / Landing State ── */
//         <div className="empty-wrapper">
//           <h2>How can I help you today?</h2>

//           <div className="input-row">
//             <Clients onChange={setSelectedClient} />
//             <Business_Unit onChange={setSelectedBU} />
//             <Videotype onChange={setSelectedVideoType} />
//             <VideoTone onChange={setSelectedVideoTone} />
//             <DURATION_OPTIONS onChange={setSelectedDuration} />

//             <div
//               className={`chat-input-area-og ${isDragging ? "drag-active" : ""}`}
//               onDragOver={handleDragOver}
//               onDragLeave={handleDragLeave}
//               onDrop={handleDrop}
//             >
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 multiple
//                 accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
//                 hidden
//                 onChange={(e) => setFiles(Array.from(e.target.files))}
//               />

//               <button
//                 className="attach-btn-og"
//                 onClick={() => fileInputRef.current.click()}
//                 title="Attach files"
//               >
//                 📎
//               </button>

//               {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} />}

//               <input
//                 className="chat-input-area-og"
//                 type="text"
//                 placeholder="Start generating..."
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//               />

//               <button onClick={sendMessage}>Send</button>
//             </div>
//           </div>
//         </div>
//       ) : (
//         /* ── Active Chat ── */
//         <div className="chat-container">
//           <div className="chat-history">
//             {activeChat?.messages?.map((msg, i) => (
//               <div key={i} className={`chat-bubble ${msg.sender}`}>
//                 {msg.sender === "bot" ? (
//                   <BotMessage msg={msg} onFeedback={sendFeedback} />
//                 ) : (
//                   <div>
//                     {msg.text && <p>{msg.text}</p>}
//                     {msg.files?.length > 0 && (
//                       <FileChips fileList={msg.files} />
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}

//             {pipelineStatus && (
//               <div className="pipeline-status">
//                 ⚙️ {pipelineStatus}
//               </div>
//             )}

//             <div ref={chatEndRef} />
//           </div>

//           <div
//             className={`chat-input-area ${isDragging ? "drag-active" : ""}`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           >
//             <input
//               ref={fileInputRef}
//               type="file"
//               multiple
//               accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
//               hidden
//               onChange={(e) => setFiles(Array.from(e.target.files))}
//             />

//             <button
//               className="attach-btn"
//               onClick={() => fileInputRef.current.click()}
//               title="Attach files"
//             >
//               📎
//             </button>

//             {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} />}

//             <input
//               type="text"
//               placeholder="Start generating..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             />

//             <button onClick={sendMessage}>Send</button>
//           </div>

//           <FloatingEditMenu
//             position={menuPosition}
//             onAction={() => {}}
//             onAskAI={() => {}}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default ChatWindow;






// import { useState, useRef, useEffect } from "react";
// import "./chatWindow.css";
// import { useChat } from "../contexts/ChatContext";
// import ChatResponse from "./chat_message.jsx";
// import FloatingEditMenu from "./floatingEdit.jsx";
// import { supabase } from "../supabase";
// import Clients from "./dropdown/clients.jsx";
// import Business_Unit from "./dropdown/BU.jsx";
// import Videotype from "./dropdown/videoType.jsx";
// import VideoTone from "./dropdown/video_tone.jsx";
// import DURATION_OPTIONS from "./dropdown/duration.jsx";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
//         backgroundColor: "#282a2c",
//         border: "1px solid #3a3a3a",
//         borderRadius: "6px",
//         color: copied ? "#4caf50" : "#aaa",
//         cursor: "pointer",
//         fontSize: "13px",
//         padding: "4px 10px",
//         transition: "color 0.2s",
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
//       <button style={{ backgroundColor: "#282a2c" }} onClick={() => onFeedback(1)}>
//         👍
//       </button>
//       <CopyButton editableRef={editableRef} />
//       <ChatResponse ref={editableRef} reply={msg.text} />
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

// // ── Main Component ─────────────────────────────────────────────
// function ChatWindow() {
//   const { activeChat, addMessage, updateLastMessage } = useChat();
//   const chatId = activeChat?.id ?? null;
//   const safeMessages = activeChat?.messages ?? [];
//   const isEmpty = safeMessages.length === 0;

//   const [input, setInput] = useState("");
//   const [files, setFiles] = useState([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const [selectionInfo, setSelectionInfo] = useState(null);
//   const [pipelineStatus, setPipelineStatus] = useState(null);
//   const [menuPosition, setMenuPosition] = useState(null);
//   const [selectedText, setSelectedText] = useState("");
//   const [previewFile, setPreviewFile] = useState(null);
//   const [selectedClient, setSelectedClient] = useState("");
//   const [selectedBU, setSelectedBU] = useState("");
//   const [selectedVideoType, setSelectedVideoType] = useState("");
//   const [selectedVideoTone, setSelectedVideoTone] = useState("");
//   const [selectedDuration, setSelectedDuration] = useState("");

//   const savedRangeRef = useRef(null); // ← stores selection range for inline replacement
//   const lastPromptRef = useRef("");
//   const lastOutputRef = useRef("");
//   const chatEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // ── Scroll to bottom on new messages ──────────────────────────
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [activeChat?.messages]);

//   // ── Reset on chat switch ───────────────────────────────────────
//   useEffect(() => {
//     setInput("");
//     setFiles([]);
//     setSelectionInfo(null);
//   }, [activeChat?.id]);

//   // ── Selection change listener ──────────────────────────────────
//   useEffect(() => {
//     const handleSelection = () => {
//       const sel = window.getSelection();
//       if (!sel || sel.isCollapsed) {
//         setSelectionInfo(null);
//         return;
//       }
//       const range = sel.getRangeAt(0);
//       const rect = range.getBoundingClientRect();
//       setSelectionInfo({
//         text: sel.toString(),
//         position: {
//           top: rect.top - 40 + window.scrollY,
//           left: rect.left + rect.width / 2,
//         },
//       });
//     };

//     document.addEventListener("selectionchange", handleSelection);
//     return () => document.removeEventListener("selectionchange", handleSelection);
//   }, []);

//   // ── Mouse up — only show menu inside bot bubbles ───────────────
//   const handleMouseUp = () => {
//     const selection = window.getSelection();
//     const text = selection.toString();

//     if (!text) {
//       setMenuPosition(null);
//       return;
//     }

//     const range = selection.getRangeAt(0);
//     const container = range.commonAncestorContainer;
//     const botBubble = (
//       container.nodeType === Node.TEXT_NODE ? container.parentElement : container
//     ).closest(".chat-bubble.bot");

//     if (!botBubble) {
//       setMenuPosition(null);
//       return;
//     }

//     // Save the range so we can use it after menu button click clears selection
//     savedRangeRef.current = range.cloneRange();

//     const rect = range.getBoundingClientRect();
//     setSelectedText(text);
//     setMenuPosition({
//       top: rect.bottom + window.scrollY,
//       left: rect.left + window.scrollX,
//     });
//   };

//   // ── Floating menu — edit selected text inline via /edit ────────
//   const handleFloatingAction = async (instruction) => {
//     if (!selectedText || !savedRangeRef.current) return;
//     setMenuPosition(null);

//     const formData = new FormData();
//     formData.append("instruction", instruction);
//     formData.append("selected_text", selectedText);

//     try {
//       const res = await fetch(`${API_BASE_URL}/edit`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       const editedText = data.result;
//       if (!editedText) return;

//       // Restore saved range and replace selected text in place
//       const selection = window.getSelection();
//       selection.removeAllRanges();
//       selection.addRange(savedRangeRef.current);

//       const range = selection.getRangeAt(0);
//       range.deleteContents();
//       range.insertNode(document.createTextNode(editedText));

//       // Clean up
//       selection.removeAllRanges();
//       savedRangeRef.current = null;
//       setSelectedText("");
//     } catch {
//       console.error("Inline edit failed");
//     }
//   };

//   // ── Floating menu — Ask AI (custom prompt) ─────────────────────
//   const handleAskAI = async (customPrompt) => {
//     if (!selectedText) return;
//     setMenuPosition(null);
//     await handleFloatingAction(customPrompt);
//   };

//   // ── Drag & Drop ────────────────────────────────────────────────
//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => setIsDragging(false);

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFiles = Array.from(e.dataTransfer.files);
//     if (droppedFiles.length > 0) {
//       setFiles((prev) => [...prev, ...droppedFiles]);
//     }
//   };

//   // ── File Preview ───────────────────────────────────────────────
//   const openPreview = (file) => {
//     const url = file.url || URL.createObjectURL(file);
//     setPreviewFile({ name: file.name, url, type: file.type });
//   };

//   const closePreview = () => setPreviewFile(null);

//   const safeAddMessage = (message) => addMessage(chatId, message);

//   // ── Prompt Builder ─────────────────────────────────────────────
//   const buildFinalPrompt = () => {
//     const clientText = formatList(selectedClient) || "the client";
//     const buText = formatList(selectedBU);
//     const typeText = formatList(selectedVideoType) || "video";
//     const toneText = formatList(selectedVideoTone) || "professional";
//     const durationText = selectedDuration || "unspecified duration";

//     return `create a ${durationText} ${typeText} video script for ${clientText} ,which oporates in ${buText} sectors, about ${input}, maintain a ${toneText} tone consistently.`.trim();
//   };

//   // ── Feedback ───────────────────────────────────────────────────
//   const sendFeedback = async (rating) => {
//     const formData = new FormData();
//     formData.append("prompt", lastPromptRef.current);
//     formData.append("output", lastOutputRef.current);
//     formData.append("rating", rating);

//     await fetch(`${API_BASE_URL}/feedback`, {
//       method: "POST",
//       body: formData,
//     });
//   };

//   // ── Send Message ───────────────────────────────────────────────
//   const sendMessage = async () => {
//     if (!input.trim() && files.length === 0) return;

//     const filePreviewData = files.map((f) => ({
//       name: f.name,
//       type: f.type,
//       url: URL.createObjectURL(f),
//     }));

//     const finalPrompt = buildFinalPrompt();
//     lastPromptRef.current = finalPrompt;

//     await safeAddMessage({
//       role: "user",
//       content: input,
//       client: selectedClient,
//       bu: selectedBU,
//       type: selectedVideoType,
//       tone: selectedVideoTone,
//       files: filePreviewData,
//     });

//     const formData = new FormData();
//     formData.append("prompt", finalPrompt);
//     files.forEach((f) => formData.append("files", f));

//     setInput("");
//     setFiles([]);

//     try {
//       const { data: inserted } = await supabase
//         .from("messages")
//         .insert({ chat_id: chatId, role: "assistant", content: "" })
//         .select()
//         .single();

//       const res = await fetch(`${API_BASE_URL}/chat`, {
//         method: "POST",
//         body: formData,
//       });

//       const reader = res.body.getReader();
//       const decoder = new TextDecoder("utf-8");

//       let done = false;
//       let fullText = "";

//       while (!done) {
//         const { value, done: doneReading } = await reader.read();
//         done = doneReading;

//         const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
//         const lines = chunk.split("\n");

//         for (const line of lines) {
//           if (line.startsWith("status:") || line.startsWith("<!-- ")) {
//             const status = line
//               .replace("status:", "")
//               .replace("<!--", "")
//               .replace("-->", "")
//               .trim();
//             setPipelineStatus(status);
//             continue;
//           }
//           if (line.startsWith("result:")) {
//             fullText = line.replace("result:", "").trim();
//             continue;
//           }
//           if (line.startsWith("error:")) {
//             fullText = `⚠️ ${line.replace("error:", "").trim()}`;
//             continue;
//           }
//           if (line.startsWith("<!-- debug:")) continue;
//           if (line.trim() && fullText) {
//             fullText += "\n" + line;
//           }
//         }

//         updateLastMessage(chatId, fullText);
//       }

//       lastOutputRef.current = fullText;
//       setPipelineStatus(null);

//       await supabase
//         .from("messages")
//         .update({ content: fullText })
//         .eq("id", inserted.id);
//     } catch {
//       safeAddMessage({ role: "assistant", content: "⚠️ Server error" });
//     }
//   };

//   // ── File Preview Modal ─────────────────────────────────────────
//   const FilePreviewModal = () => {
//     if (!previewFile) return null;

//     const isImage = previewFile.type?.startsWith("image/");
//     const isPDF = previewFile.type === "application/pdf";

//     return (
//       <div
//         style={{
//           position: "fixed", inset: 0,
//           background: "rgba(0,0,0,0.85)",
//           zIndex: 1000,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           padding: "24px",
//         }}
//         onClick={closePreview}
//       >
//         <div
//           style={{
//             background: "#1a1a2e",
//             borderRadius: "12px",
//             padding: "24px",
//             maxWidth: "90vw",
//             maxHeight: "85vh",
//             width: "100%",
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: "column",
//             gap: "16px",
//             border: "1px solid #2a2a4a",
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//             <span style={{ fontWeight: 600, fontSize: "14px", color: "#e0e0e0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//               {getFileIcon({ name: previewFile.name, type: previewFile.type })} {previewFile.name}
//             </span>
//             <button
//               onClick={closePreview}
//               style={{
//                 background: "none", border: "1px solid #444",
//                 color: "#aaa", borderRadius: "6px",
//                 padding: "4px 12px", cursor: "pointer",
//                 fontSize: "13px", flexShrink: 0, marginLeft: "16px",
//               }}
//             >
//               ✕ Close
//             </button>
//           </div>

//           <div style={{ overflow: "auto", flex: 1, borderRadius: "8px" }}>
//             {isImage && (
//               <img
//                 src={previewFile.url}
//                 alt={previewFile.name}
//                 style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", display: "block", margin: "0 auto" }}
//               />
//             )}
//             {isPDF && (
//               <iframe
//                 src={previewFile.url}
//                 title={previewFile.name}
//                 style={{ width: "100%", height: "70vh", border: "none", borderRadius: "8px" }}
//               />
//             )}
//             {!isImage && !isPDF && (
//               <div style={{ color: "#aaa", textAlign: "center", padding: "48px", fontSize: "14px" }}>
//                 <div style={{ fontSize: "48px", marginBottom: "12px" }}>
//                   {getFileIcon({ name: previewFile.name, type: previewFile.type })}
//                 </div>
//                 <div>{previewFile.name}</div>
//                 <div style={{ fontSize: "12px", marginTop: "8px", color: "#666" }}>
//                   Preview not available for this file type
//                 </div>
//                 <a
//                   href={previewFile.url}
//                   download={previewFile.name}
//                   style={{ display: "inline-block", marginTop: "16px", color: "#7b7bf7", fontSize: "13px" }}
//                 >
//                   ↓ Download to view
//                 </a>
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
//           <span
//             onClick={() => openPreview(f)}
//             style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
//             title="Click to preview"
//           >
//             {getFileIcon(f)} {f.name}
//           </span>
//           {onRemove && (
//             <button onClick={() => onRemove(idx)}>✕</button>
//           )}
//         </div>
//       ))}
//     </div>
//   );

//   const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

//   // ── Render ─────────────────────────────────────────────────────
//   return (
//     <div className="chat-window" onMouseUp={handleMouseUp}>
//       <FilePreviewModal />

//       {isEmpty ? (
//         /* ── Empty / Landing State ── */
//         <div className="empty-wrapper">
//           <h2>How can I help you today?</h2>

//           <div className="input-row">
//             <Clients onChange={setSelectedClient} />
//             <Business_Unit onChange={setSelectedBU} />
//             <Videotype onChange={setSelectedVideoType} />
//             <VideoTone onChange={setSelectedVideoTone} />
//             <DURATION_OPTIONS onChange={setSelectedDuration} />

//             <div
//               className={`chat-input-area-og ${isDragging ? "drag-active" : ""}`}
//               onDragOver={handleDragOver}
//               onDragLeave={handleDragLeave}
//               onDrop={handleDrop}
//             >
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 multiple
//                 accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
//                 hidden
//                 onChange={(e) => setFiles(Array.from(e.target.files))}
//               />

//               <button
//                 className="attach-btn-og"
//                 onClick={() => fileInputRef.current.click()}
//                 title="Attach files"
//               >
//                 📎
//               </button>

//               {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} />}

//               <input
//                 className="chat-input-area-og"
//                 type="text"
//                 placeholder="Start generating..."
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//               />

//               <button onClick={sendMessage}>Send</button>
//             </div>
//           </div>
//         </div>
//       ) : (
//         /* ── Active Chat ── */
//         <div className="chat-container">
//           <div className="chat-history">
//             {activeChat?.messages?.map((msg, i) => (
//               <div key={i} className={`chat-bubble ${msg.sender}`}>
//                 {msg.sender === "bot" ? (
//                   <BotMessage msg={msg} onFeedback={sendFeedback} />
//                 ) : (
//                   <div>
//                     {msg.text && <p>{msg.text}</p>}
//                     {msg.files?.length > 0 && (
//                       <FileChips fileList={msg.files} />
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}

//             {pipelineStatus && (
//               <div className="pipeline-status">
//                 ⚙️ {pipelineStatus}
//               </div>
//             )}

//             <div ref={chatEndRef} />
//           </div>

//           <div
//             className={`chat-input-area ${isDragging ? "drag-active" : ""}`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           >
//             <input
//               ref={fileInputRef}
//               type="file"
//               multiple
//               accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
//               hidden
//               onChange={(e) => setFiles(Array.from(e.target.files))}
//             />

//             <button
//               className="attach-btn"
//               onClick={() => fileInputRef.current.click()}
//               title="Attach files"
//             >
//               📎
//             </button>

//             {files.length > 0 && <FileChips fileList={files} onRemove={removeFile} />}

//             <input
//               type="text"
//               placeholder="Start generating..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             />

//             <button onClick={sendMessage}>Send</button>
//           </div>

//           {/* ── Floating Edit Menu ── */}
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
      <button style={{ backgroundColor: "#282a2c" }} onClick={() => onFeedback(1)}>
        👍
      </button>
      <CopyButton editableRef={editableRef} />
      <ChatResponse ref={editableRef} reply={msg.text} />
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

  const savedRangeRef = useRef(null); // ← stores selection range for inline replacement
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
    if (e.target.closest(".floating-menu")) return;  // ← add this 
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

    // Save the range so we can use it after menu button click clears selection
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

      // Restore saved range and replace selected text in place
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);

      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(editedText));

      // Clean up
      selection.removeAllRanges();
      savedRangeRef.current = null;
      setSelectedText("");
    } catch {
      console.error("Inline edit failed");
    }
  };

  // ── Floating menu — Ask AI (custom prompt) ─────────────────────
  const handleAskAI = async (customPrompt) => {
    // if (!selectedText || !savedRangeRef.current) return;    
    // setMenuPosition(null);

    // const formData = new FormData();

      const textToEdit = selectedText;           // ← snapshot before clearing
  const savedRange = savedRangeRef.current;  // ← snapshot before clearing
  
  if (!textToEdit || !savedRange) return;
  setMenuPosition(null);

  const formData = new FormData();
  formData.append("instruction", customPrompt);  // ← you forgot this line!
  formData.append("selected_text", textToEdit);
      try {
      const res = await fetch(`${API_BASE_URL}/edit`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const editedText = data.result;
      if (!editedText) return;

      // Restore saved range and replace selected text in place
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);

      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(editedText));

      // Clean up
      selection.removeAllRanges();
      savedRangeRef.current = null;
      setSelectedText("");
    } catch {
      console.error("askAI edit failed");
    }
    
    // if (!selectedText) return;
    // setMenuPosition(null);
    // await handleFloatingAction(customPrompt);
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
  const sendFeedback = async (rating) => {
    const formData = new FormData();
    formData.append("prompt", lastPromptRef.current);
    formData.append("output", lastOutputRef.current);
    formData.append("rating", rating);

    await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      body: formData,
    });
  };

  // ── Send Message ───────────────────────────────────────────────
  const sendMessage = async () => {
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

    const formData = new FormData();
    formData.append("prompt", finalPrompt);
    files.forEach((f) => formData.append("files", f));

    setInput("");
    setFiles([]);

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

      lastOutputRef.current = fullText;
      setPipelineStatus(null);

      await supabase
        .from("messages")
        .update({ content: fullText })
        .eq("id", inserted.id);
    } catch {
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

              <input
                className="chat-input-area-og"
                type="text"
                placeholder="Start generating..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
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

            <input
              type="text"
              placeholder="Start generating..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button onClick={sendMessage}>Send</button>
          </div>

          {/* ── Floating Edit Menu ── */}
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
