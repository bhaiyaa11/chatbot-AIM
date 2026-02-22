// // import { useState, useRef, useEffect } from "react";
// // import "./chatWindow.css";
// // import { useChat } from "../contexts/ChatContext";
// // import ChatResponse from "./chat_message.jsx";
// // import FloatingEditMenu from "./floatingEdit.jsx";
// // import { supabase } from "../supabase";
// // import Clients from "./dropdown/clients.jsx";
// // import Business_Unit from "./dropdown/BU.jsx";
// // import Videotype from "./dropdown/videoType.jsx";
// // import VideoTone from "./dropdown/video_tone.jsx";


// // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // function ChatWindow() {
// //   const { activeChat, addMessage, updateLastMessage } = useChat();
// //   const chatId = activeChat?.id ?? null;
// //   const safeMessages = activeChat?.messages ?? [];
// //   const isEmpty = safeMessages.length === 0;
// //   const [menuPosition, setMenuPosition] = useState(null);
// //   const [selectedText, setSelectedText] = useState("");


// //   const safeAddMessage = (message) => {
// //     return addMessage(chatId, message);
// //   };
// //   const [input, setInput] = useState("");
// //   const [files, setFiles] = useState([]);
// //   const [isDragging, setIsDragging] = useState(false);
// //   const [selectionInfo, setSelectionInfo] = useState(null);
// //   const [pipelineStatus, setPipelineStatus] = useState(null);
// //   const chatEndRef = useRef(null);
// //   const fileInputRef = useRef(null);

// //   useEffect(() => {
// //     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [activeChat?.messages]);

// //   const handleDragOver = (e) => {
// //     e.preventDefault();
// //     setIsDragging(true);
// //   };

// //   const handleDragLeave = () => {
// //     setIsDragging(false);
// //   };

// //   const handleDrop = (e) => {
// //     e.preventDefault();
// //     setIsDragging(false);

// //     const droppedFiles = Array.from(e.dataTransfer.files);
// //     if (droppedFiles.length > 0) {
// //       setFiles((prev) => [...prev, ...droppedFiles]);
// //     }
// //   };

// //   /* ---------- MESSAGE SEND ---------- */
// //   const sendMessage = async () => {
// //     if (!input.trim() && files.length === 0) return;
// //     // Save prompt before clearing input

// //     await safeAddMessage({
// //       role: "user",
// //       content: input,
// //       files,
// //     });

// //     const formData = new FormData();
// //     formData.append("prompt", input);
// //     files.forEach((f) => formData.append("files", f));

// //     setInput("");
// //     setFiles([]);

// //     try {
// //       const { data: inserted } = await supabase
// //         .from("messages")
// //         .insert({
// //           chat_id: chatId,
// //           role: "assistant",
// //           content: "",
// //         })
// //         .select()
// //         .single();
// //       // const res = await fetch("API_BASE_URL/chat", {
// //       //   method: "POST",
// //       //   body: formData,
// //       // });
// //       const res = await fetch("http://127.0.0.1:8000/chat", {
// //         method: "POST",
// //         body: formData,
// //       });

// //       const reader = res.body.getReader();
// //       const decoder = new TextDecoder("utf-8");

// //       let done = false;
// //       let fullText = "";

// //       while (!done) {
// //             const { value, done: doneReading } = await reader.read();
// //             done = doneReading;

// //             const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
// //             const lines = chunk.split("\n");

// //   for (const line of lines) {
// //     // Status updates — show progress, don't add to output
// //     if (line.startsWith("status:") || line.startsWith("<!-- ")) {
// //       const status = line
// //         .replace("status:", "")
// //         .replace("<!--", "")
// //         .replace("-->", "")
// //         .trim();
// //       setPipelineStatus(status);
// //       continue;
// //     }

// //     // Result — this is the markdown table
// //     if (line.startsWith("result:")) {
// //       fullText = line.replace("result:", "").trim();
// //       continue;
// //     }

// //     // Error from backend
// //     if (line.startsWith("error:")) {
// //       fullText = `⚠️ ${line.replace("error:", "").trim()}`;
// //       continue;
// //     }

// //     // Debug lines — ignore
// //     if (line.startsWith("<!-- debug:")) {
// //       continue;
// //     }

// //     // Anything else that's not empty — append to fullText
// //     // (handles cases where result spans multiple lines)
// //     if (line.trim() && fullText) {
// //       fullText += "\n" + line;
// //     }
// //   }

// //   updateLastMessage(chatId, fullText);
// // }

// //       setPipelineStatus(null);

// //       await supabase
// //         .from("messages")
// //         .update({ content: fullText })
// //         .eq("id", inserted.id);

// //     } catch {
// //       safeAddMessage({
// //         role: "assistant",
// //         content: "⚠️ Server error",
// //       });
// //     }
// //   };

// //   useEffect(() => {
// //     const handleSelection = () => {
// //       const sel = window.getSelection();
// //       if (!sel || sel.isCollapsed) {
// //         setSelectionInfo(null);
// //         return;
// //       }

// //       const range = sel.getRangeAt(0);
// //       const rect = range.getBoundingClientRect();

// //       setSelectionInfo({
// //         text: sel.toString(),
// //         position: {
// //           top: rect.top - 40 + window.scrollY,
// //           left: rect.left + rect.width / 2,
// //         },
// //       });
// //     };

// //     document.addEventListener("selectionchange", handleSelection);
// //     return () =>
// //       document.removeEventListener("selectionchange", handleSelection);
// //   }, []);

// //   useEffect(() => {
// //     setInput("");
// //     setFiles([]);
// //     setSelectionInfo(null);
// //   }, [activeChat?.id]);

// //   return (
// //     <div className="chat-window">
// //     {/* <div className="chat-window" onMouseUp={handleMouseUp}> */}
// //       {/* -------- EMPTY CENTER LAYOUT -------- */}
// //       {isEmpty ? (
// //         <div className="empty-wrapper">
// //           <h2 >How can I help you today?</h2>

// //           <div className="input-row">
// //             <Clients
// //              />
// //             <Business_Unit
// //             />
// //             <Videotype
// //             />
// //             <VideoTone
// //             />


// //       <div
// //         className={`chat-input-area-og ${isDragging ? "drag-active" : ""}`}
// //         onDragOver={handleDragOver}
// //         onDragLeave={handleDragLeave}
// //         onDrop={handleDrop}
// //       >
// //         <input
// //           ref={fileInputRef}
// //           type="file"
// //           multiple
// //           accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
// //           hidden
// //           onChange={(e) => setFiles(Array.from(e.target.files))}
// //         />

// //         <button
// //           className="attach-btn-og"
// //           onClick={() => fileInputRef.current.click()}
// //           title="Attach files"
// //         >
// //           📎
// //         </button>

// //         {files.length > 0 && (
// //           <div className="file-chip-row">
// //             {files.map((f, idx) => (
// //               <div key={idx} className="file-chip">
// //                 {f.name}
// //                 <button
// //                   onClick={() =>
// //                     setFiles(files.filter((_, i) => i !== idx))
// //                   }
// //                 >
// //                   ✕
// //                 </button>
// //               </div>
// //             ))}
// //           </div>
// //         )}

// //         <input
// //         className="chat-input-area-og"
// //           type="text"
// //           placeholder="Start generating..."
// //           value={input}
// //           onChange={(e) => setInput(e.target.value)}
// //           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
// //         />

// //         <button onClick={sendMessage}>Send</button>
// //       </div>

// //           </div>
// //         </div>
// //       ) : (

// //          /* -------- NORMAL CHAT -------- */

// //             <div className="chat-container">
// //       <div className="chat-history">
// //         {activeChat?.messages?.map((msg, i) => (
// //           <div key={i} className={`chat-bubble ${msg.sender}`}>
// //             {msg.sender === "bot" ? (
// //                 <ChatResponse reply={msg.text} />
// //             ) : (
// //               <div>
// //                 {msg.text && <p>{msg.text}</p>}
// //                 {msg.files?.length > 0 && (
// //                   <div className="file-chip-row">
// //                     {msg.files.map((f, idx) => (
// //                       <div key={idx} className="file-chip">
// //                         📄 {f.name}
// //                       </div>
// //                     ))}
// //                   </div>
// //                 )}
// //               </div>
// //             )}
// //           </div>
// //         ))}

// //         {pipelineStatus && (
// //           <div className="pipeline-status">
// //             ⚙️ {pipelineStatus}
// //           </div>
// //         )}

// //         <div ref={chatEndRef} />
// //       </div>

// //       <div
// //         className={`chat-input-area ${isDragging ? "drag-active" : ""}`}
// //         onDragOver={handleDragOver}
// //         onDragLeave={handleDragLeave}
// //         onDrop={handleDrop}
// //       >
// //         <input
// //           ref={fileInputRef}
// //           type="file"
// //           multiple
// //           accept=".pdf,.png,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
// //           hidden
// //           onChange={(e) => setFiles(Array.from(e.target.files))}
// //         />

// //         <button
// //           className="attach-btn"
// //           onClick={() => fileInputRef.current.click()}
// //           title="Attach files"
// //         >
// //           📎
// //         </button>

// //         {files.length > 0 && (
// //           <div className="file-chip-row">
// //             {files.map((f, idx) => (
// //               <div key={idx} className="file-chip">
// //                 {f.name}
// //                 <button
// //                   onClick={() =>
// //                     setFiles(files.filter((_, i) => i !== idx))
// //                   }
// //                 >
// //                   ✕
// //                 </button>
// //               </div>
// //             ))}
// //           </div>
// //         )}

// //         <input
// //           type="text"
// //           placeholder="Start generating..."
// //           value={input}
// //           onChange={(e) => setInput(e.target.value)}
// //           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
// //         />

// //         <button onClick={sendMessage}>Send</button>
// //       </div>
// //           {/*----floating AI MENU-----*/}
// //             {/* <FloatingEditMenu
// //         position={selectionInfo?.position}
// //         onAction={() => {}}
// //         onAskAI={() => {}}
// //       /> */}
// //     </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default ChatWindow;

// // og code before drop and selection changes:





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
      <button style={{backgroundColor:"#282a2c"}} onClick={() => onFeedback(1)}>👍</button>
      <CopyButton editableRef={editableRef} />
      <ChatResponse ref={editableRef} reply={msg.text} />
    </div>
  );
};

function ChatWindow() {
  const { activeChat, addMessage, updateLastMessage } = useChat();
  const chatId = activeChat?.id ?? null;
  const safeMessages = activeChat?.messages ?? [];
  const isEmpty = safeMessages.length === 0;
  const [menuPosition, setMenuPosition] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedBU, setSelectedBU] = useState("");
  const [selectedVideoType, setSelectedVideoType] = useState("");
  const [selectedVideoTone, setSelectedVideoTone] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");



  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection.toString();

    if (!text) {
      setMenuPosition(null);
      return;
    }

      // ── Only show menu if selection is inside a bot bubble ──
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const botBubble = (container.nodeType === Node.TEXT_NODE
    ? container.parentElement
    : container
  ).closest(".chat-bubble.bot");

  if (!botBubble) {
    setMenuPosition(null);
    return;
  }

  const rect = range.getBoundingClientRect();
  setSelectedText(text);
  setMenuPosition({
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
  });
};

  //   const range = selection.getRangeAt(0);
  //   const rect = range.getBoundingClientRect();

  //   setSelectedText(text);

  //   setMenuPosition({
  //     top: rect.bottom + window.scrollY,
  //     left: rect.left + window.scrollX,
  //   });
  // };

  const lastPromptRef = useRef("")
  const lastOutputRef = useRef("")
  const [lastPrompt, setLastPrompt] = useState("")
  const [lastOutput, setLastOutput] = useState("")

  const sendFeedback = async (rating) => {
    const formData = new FormData()
    formData.append("prompt", lastPromptRef.current)
    formData.append("output", lastOutputRef.current)
    formData.append("rating", rating)


//    await fetch("API_BASE_URL/feedback", {
//       method: "POST",
//       body: formData,
//     })

    await fetch("http://127.0.0.1:8000/feedback", {
      method: "POST",
      body: formData,
    })
  }

  // ── File Preview ─────────────────────────────────────────────
  const openPreview = (file) => {
    const url = file.url || URL.createObjectURL(file)
    setPreviewFile({ name: file.name, url, type: file.type })
  }

  const closePreview = () => {
    setPreviewFile(null)
  }

  const getFileIcon = (file) => {
    if (file.type?.startsWith("image/")) return "🖼️"
    if (file.type === "application/pdf") return "📕"
    if (file.name?.endsWith(".docx")) return "📝"
    if (file.name?.endsWith(".xlsx")) return "📊"
    if (file.name?.endsWith(".pptx")) return "📋"
    if (file.name?.endsWith(".csv")) return "📊"
    return "📄"
  }

  const safeAddMessage = (message) => {
    return addMessage(chatId, message);
  };

  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  /* ---------- MESSAGE SEND ---------- */
  const sendMessage = async () => {
    if (!input.trim() && files.length === 0) return;
        console.log("Sending metadata:", {
      client: selectedClient,
      business_unit: selectedBU,
      video_type: selectedVideoType,
      video_tone: selectedVideoTone,
    })

    // Save blob URLs before files are cleared
    const filePreviewData = files.map(f => ({
      name: f.name,
      type: f.type,
      url: URL.createObjectURL(f),
    }))

    // ── Build final prompt BEFORE clearing input state ──
    const finalPrompt = buildFinalPrompt();
    lastPromptRef.current = finalPrompt;

    await safeAddMessage({
      role: "user",
      content: input,
      client: selectedClient,
      bu: selectedBU,             //changes made here- added meta datas
      type: selectedVideoType,
      tone: selectedVideoTone,
      files: filePreviewData,
    });
    console.log("FINAL VALUES:", { selectedClient, selectedBU, selectedVideoType, selectedVideoTone });
    const formData = new FormData();
    formData.append("prompt", finalPrompt);
    // formData.append("client", selectedClient);        // ← is this there?
    // formData.append("business_unit", selectedBU);     // ← is this there?
    // formData.append("video_type", selectedVideoType); // ← is this there?
    // formData.append("video_tone", selectedVideoTone); // ← is this there?
    // const finalPrompt = buildFinalPrompt();
    // formData.append("prompt", finalPrompt);
    files.forEach((f) => formData.append("files", f));

    setInput("");
    setFiles([]);
    console.log("FINAL PROMPT SENT →", finalPrompt);

    try {
      const { data: inserted } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          role: "assistant",
          content: "",
        })
        .select()
        .single();

//       // const res = await fetch("API_BASE_URL/chat", {
//       //   method: "POST",
//       //   body: formData,
      const res = await fetch("http://127.0.0.1:8000/chat", {
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

          if (line.startsWith("<!-- debug:")) {
            continue;
          }

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
      safeAddMessage({
        role: "assistant",
        content: "⚠️ Server error",
      });
    }
  };

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
    return () =>
      document.removeEventListener("selectionchange", handleSelection);
  }, []);

  useEffect(() => {
    setInput("");
    setFiles([]);
    setSelectionInfo(null);
  }, [activeChat?.id]);

// newly added
const formatList = (value) => {
  if (!value || value.length === 0) return "";
  if (Array.isArray(value)) return value.join(", ");
  return value;
};


// ───────── PROMPT BUILDER (MULTI SELECT SAFE) ─────────
const buildFinalPrompt = () => {
  const clientText = formatList(selectedClient) || "the client";
  const buText = formatList(selectedBU);
  const typeText = formatList(selectedVideoType) || "video";
  const toneText = formatList(selectedVideoTone) || "professional";
  const durationText = selectedDuration || "unspecified duration";

  return `

create a ${durationText} ${typeText} video script for ${clientText} ,which oporates in ${buText} sectors, about ${input}, maintain a ${toneText} tone consistently.

`.trim();
};


// const buildFinalPrompt = () => {
//   const client = selectedClient || "the client";
//   const bu = selectedBU ? `(${selectedBU} division)` : "";
//   const videoType = selectedVideoType || "video";
//   const videoTone = selectedVideoTone || "professional";

//   return `
// ### VIDEO GENERATION CONTEXT
// Client: ${client}
// Business Unit: ${selectedBU}
// Video Type: ${videoType}
// Tone: ${videoTone}

// ### USER REQUEST
// ${input}

// ### INSTRUCTIONS
// Create a high-quality ${videoType} video script aligned with the client context.
// Maintain a ${videoTone} tone throughout.
// Ensure clarity, storytelling flow, and corporate professionalism.
// `.trim();
// };

  // ── File Preview Modal ───────────────────────────────────────
  const FilePreviewModal = () => {
    if (!previewFile) return null

    const isImage = previewFile.type?.startsWith("image/")
    const isPDF = previewFile.type === "application/pdf"

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
                fontSize: "13px", flexShrink: 0, marginLeft: "16px"
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
                  &#8595; Download to view
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-window" onMouseUp={handleMouseUp}>

      {/* ── File Preview Modal ── */}
      <FilePreviewModal />

      {/* -------- EMPTY CENTER LAYOUT -------- */}
      {isEmpty ? (
        <div className="empty-wrapper">
          <h2>How can I help you today?</h2>

          <div className="input-row">
            <Clients onChange={setSelectedClient} />
            <Business_Unit onChange={setSelectedBU} />
            <Videotype onChange={setSelectedVideoType}/>
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

              {files.length > 0 && (
                <div className="file-chip-row">
                  {files.map((f, idx) => (
                    <div key={idx} className="file-chip">
                      <span
                        onClick={() => openPreview(f)}
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                        title="Click to preview"
                      >
                        {getFileIcon(f)} {f.name}
                      </span>
                      <button
                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

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

        /* -------- NORMAL CHAT -------- */
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
                      <div className="file-chip-row">
                        {msg.files.map((f, idx) => (
                          <div
                            key={idx}
                            className="file-chip"
                            onClick={() => openPreview(f)}
                            style={{ cursor: "pointer" }}
                            title="Click to preview"
                          >
                            {getFileIcon(f)} {f.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {pipelineStatus && (
              <div className="pipeline-status" 
                styles={{
                  borderRadius: "40px",
                  backgroundColor: "black",
                  color: "white",
                  border: "1px solid #3a3a3a",
                  boxShadow: "0 20px 20px rgb(64, 59, 59)",
              }}
              >
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

            {files.length > 0 && (
              <div className="file-chip-row">
                {files.map((f, idx) => (
                  <div key={idx} className="file-chip">
                    <span
                      onClick={() => openPreview(f)}
                      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                      title="Click to preview"
                    >
                      {getFileIcon(f)} {f.name}
                    </span>
                    <button
                      onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Start generating..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button onClick={sendMessage}>Send</button>
          </div>

          {/*----floating AI MENU-----*/}
          <FloatingEditMenu
            position={menuPosition}
            onAction={() => {}}
            onAskAI={() => {}}
          />
        </div>
      )}
    </div>
  );
}

export default ChatWindow;