import { useState, useRef, useEffect } from "react";
import "./chatWindow.css";
import { useChat } from "../contexts/ChatContext";
import ChatResponse from "./chat_message.jsx";
import FloatingEditMenu from "./floatingEdit.jsx";
import { supabase } from "../supabase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ChatWindow() {
  const { activeChat, addMessage, updateLastMessage } = useChat();
  const chatId = activeChat?.id ?? null;
    const safeMessages = activeChat?.messages ?? [];
  const isEmpty = safeMessages.length === 0;
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

    await safeAddMessage({
      role: "user",
      content: input,
      files,
    });

    const formData = new FormData();
    formData.append("prompt", input);
    files.forEach((f) => formData.append("files", f));

    setInput("");
    setFiles([]);

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
      // const res = await fetch("API_BASE_URL/chat", {
      //   method: "POST",
      //   body: formData,
      // });
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
          if (line.startsWith("Status:")) {
            setPipelineStatus(line.replace("Status:", "").trim());
            continue;
          }
          fullText += line;
        }

        updateLastMessage(chatId, fullText);
      }

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

  return (
    <div className="chat-window">

      {/* -------- EMPTY CENTER LAYOUT -------- */}
      {isEmpty ? (
        <div className="empty-wrapper">
          <h2>How can I help you today?</h2>

          <div className="input-row">
            <select><option>Clients</option></select>
            <select><option>Business Unit</option></select>
            <select><option>Video Type</option></select>

            <input
              type="text"
              placeholder="Send a message..."
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              onKeyDown={(e)=>e.key==="Enter" && sendMessage()}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      ) : (

         /* -------- NORMAL CHAT -------- */

            <div className="chat-container">
      <div className="chat-history">
        {activeChat?.messages?.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.sender}`}>
            {msg.sender === "bot" ? (
              <ChatResponse reply={msg.text} />
            ) : (
              <div>
                {msg.text && <p>{msg.text}</p>}
                {msg.files?.length > 0 && (
                  <div className="file-chip-row">
                    {msg.files.map((f, idx) => (
                      <div key={idx} className="file-chip">
                        📄 {f.name}
                      </div>
                    ))}
                  </div>
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

        {files.length > 0 && (
          <div className="file-chip-row">
            {files.map((f, idx) => (
              <div key={idx} className="file-chip">
                {f.name}
                <button
                  onClick={() =>
                    setFiles(files.filter((_, i) => i !== idx))
                  }
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
            {/* <FloatingEditMenu
        position={selectionInfo?.position}
        onAction={() => {}}
        onAskAI={() => {}}
      /> */}
    </div>
      )}
    </div>
  );
}

export default ChatWindow;

// og code before drop and selection changes:
