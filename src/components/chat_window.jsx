

// import { useState, useRef } from "react";
// import "./chatWindow.css";
// import { useChat } from "../contexts/ChatContext";
// import axios from "axios";
// import ChatResponse from "./chat_message.jsx";
// import MyEditor from "./script_canvas.jsx";
// import FloatingEditMenu from "./floatingEdit.jsx";

// async function runAIEdit(selectedText, instruction) {
//   const formData = new FormData();

//   formData.append(
//     "prompt",
//     `
// You are editing existing content.

// TEXT:
// ${selectedText}

// INSTRUCTION:
// ${instruction}

// Rules:
// - Return ONLY the edited text
// - Do NOT add explanations
// - Do NOT change formatting
// `
//   );

//   const res = await axios.post(
//     "http://127.0.0.1:8000/chat",
//     formData,
//     { headers: { "Content-Type": "multipart/form-data" } }
//   );

//   return res.data.reply.trim();
// }

// function ChatWindow() {
//   const { activeChat, addMessage } = useChat();

//   const [input, setInput] = useState("");
//   const [file, setFile] = useState(null);

//   // 🔥 Canvas state
//   const [canvasContent, setCanvasContent] = useState(
//     "Your generated script will appear here..."
//   );

//   const chatEndRef = useRef(null);

//   const sendMessage = async () => {
//     if (!input.trim() && !file) return;

//     // Show user message
//     addMessage(activeChat.id, {
//       sender: "user",
//       text: file ? `${input} 📎 ${file.name}` : input,
//     });

//     const formData = new FormData();
//     formData.append("prompt", input);
//     if (file) formData.append("file", file);

//     setInput("");
//     setFile(null);

//     try {
//       const res = await axios.post(
//         "http://127.0.0.1:8000/chat",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       const botReply = res.data.reply;

//       // Show bot message in chat
//       addMessage(activeChat.id, {
//         sender: "bot",
//         text: botReply,
//       });

//       // 🔥 ALSO load the script into the canvas
//       setCanvasContent(botReply);

//     } catch (err) {
//       addMessage(activeChat.id, {
//         sender: "bot",
//         text: "⚠️ Server error",
//       });
//     }
//   };

//   return (
//     <div className="chat-container">

//       {/* ---------------- CHAT HISTORY ---------------- */}
//       <div className="chat-history">
//         {activeChat?.messages?.map((msg, i) => (
//           <div key={i} className={`chat-bubble ${msg.sender}`}>
//             {msg.sender === "bot" ? (
//               <ChatResponse
//                   reply={msg.text}
//                   onUpdate={(newText) =>
//                     addMessage(activeChat.id, {
//                       ...msg,
//                       text: newText,
//                       replace: true,
//                     })
//                   }
//                 />

//             ) : (
//               <p>{msg.text}</p>
//             )}
//           </div>
//         ))}
//         <div ref={chatEndRef} />
//       </div>


//       {/* ---------------- INPUT AREA ---------------- */}
//       <div className="chat-input-area">
//         <input
//           type="file"
//           accept=".pdf,.png,.mp4,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
//           onChange={(e) => setFile(e.target.files[0])}
//         />

//         <button
//           className="attach-btn"
//           onClick={() =>
//             document.querySelector('input[type="file"]').click()
//           }
//         >
//           📎
//         </button>

//         <input
//           type="text"
//           placeholder="Let's start..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />

//         <button onClick={sendMessage}>Send</button>
//          <FloatingEditMenu
//         position={selectionInfo?.position}
//         onAction={applyAIEdit}
//         onAskAI={applyAIEdit}
//       />
//       </div>
//     </div>
//   );

// }

// export default ChatWindow;




  // changes end here
  // const chatEndRef = useRef(null);

//   const sendMessage = async () => {
//     if (!input.trim() && !file) return;

//     // Show user message in UI
//     addMessage(activeChat.id, {
//       sender: "user",
//       text: file ? `${input} 📎 ${file.name}` : input,
//     });

//     const formData = new FormData();
//     formData.append("prompt", input);
//     if (file) formData.append("file", file);

//     setInput("");
//     setFile(null);

//     try {
//       const res = await axios.post(
//         "http://127.0.0.1:8000/chat",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       addMessage(activeChat.id, {
//         sender: "bot",
//         text: res.data.reply,
//       });

//     } catch (err) {
//       addMessage(activeChat.id, {
//         sender: "bot",
//         text: "⚠️ Server error",
//       });
//     }
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-history">
//         {activeChat?.messages?.map((msg, i) => (
//           <div key={i} className={`chat-bubble ${msg.sender}`}>
//             {msg.sender === "bot" ? (
//               <ChatResponse reply={msg.text} />
//             ) : (
//               <p>{msg.text}</p>
//             )}
//           </div>
//         ))}
//         <div ref={chatEndRef} />
//       </div>

      
//       <div className="chat-input-area">
//         <input
//           type="file"
//           placeholder="Attach file"
//           accept=".pdf,.png, .mp4, .jpeg, .jpg, .csv, .docx, .xlsx, .txt, .pptx"
//           onChange={(e) => setFile(e.target.files[0])}
//           onClick={() => document.querySelector('input[type="file"]').click()}
//         />
//         <button className="attach-btn"
//           onClick={() => document.querySelector('input[type="file"]').click()}
//           >
//           📎
//         </button>

//         <input
//           type="text"
//           placeholder="Lets start ..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />

//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// }

// export default ChatWindow;


import { useState, useRef, useEffect } from "react";
import "./chatWindow.css";
import { useChat } from "../contexts/ChatContext";
import axios from "axios";
import ChatResponse from "./chat_message.jsx";
import FloatingEditMenu from "./floatingEdit.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


/* ---------- AI EDIT HELPER ---------- */
async function runAIEdit(selectedText, instruction) {
  const formData = new FormData();

  formData.append(
    "prompt",
    `
You are editing existing content.

TEXT:
${selectedText}

INSTRUCTION:
${instruction}

Rules:
- Return ONLY the edited text
- Do NOT add explanations
- Do NOT change formatting
`
  );

  // const res = await axios.post(
  //   "chatbot-backend-try2.vercel.app",
  //   formData,
  //   { headers: { "Content-Type": "multipart/form-data" } }
  // );

  axios.post(
  `${API_BASE_URL}/chat`,
  formData,
  { headers: { "Content-Type": "multipart/form-data" } }
);


  return res.data.reply.trim();
}

function ChatWindow() {
  const { activeChat, addMessage } = useChat();

  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);

  /* ---------- FLOATING MENU STATE ---------- */
  const [selectionInfo, setSelectionInfo] = useState(null);

  const chatEndRef = useRef(null);

  /* ---------- MESSAGE SEND ---------- */
  const sendMessage = async () => {
    if (!input.trim() && !file) return;

    addMessage(activeChat.id, {
      sender: "user",
      text: file ? `${input} 📎 ${file.name}` : input,
    });

    const formData = new FormData();
    formData.append("prompt", input);
    // if (file) formData.append("file", file);
       if (file && file.length > 0) {
    file.forEach((f) => formData.append("file", f));
  }

    setInput("");
    setFile(null);

    try {
      const res = await axios.post(
  `${API_BASE_URL}/edit`,
  formData,
  { headers: { "Content-Type": "multipart/form-data" } }
);

      addMessage(activeChat.id, {
        sender: "bot",
        text: res.data.reply,
      });
    } catch {
      addMessage(activeChat.id, {
        sender: "bot",
        text: "⚠️ Server error",
      });
    }
  };

  /* ---------- SELECTION TRACKING ---------- */
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

  /* ---------- APPLY AI EDIT ---------- */
  const applyAIEdit = async (instruction) => {
    if (!selectionInfo?.text) return;

    const aiText = await runAIEdit(
      selectionInfo.text,
      instruction
    );

    document.execCommand("insertText", false, aiText);
    setSelectionInfo(null);
  };

  return (
    <div className="chat-container">
      {/* -------- CHAT HISTORY -------- */}
      <div className="chat-history">
        {activeChat?.messages?.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.sender}`}>
            {msg.sender === "bot" ? (
              <ChatResponse reply={msg.text} />
            ) : (
              <p>{msg.text}</p>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* -------- INPUT AREA -------- */}
      <div className="chat-input-area">
        <input
          type="file"
          multiple
          accept=".pdf,.png,.mp4,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
          // onChange={(e) => setFile(e.target.files[0])}
           onChange={(e) => setFile(Array.from(e.target.files))}
        />

        <button
          className="attach-btn"
          onClick={() =>
            document.querySelector('input[type="file"]').click()
          }
          title="Attach File"
        >
          📎
        </button>
         {/* Selected files preview */}
          {file && file.length > 0 && (
            <div className="file-preview">
              {file.map((f, idx) => (
                <div key={idx} className="file-chip">
                  <span>{f.name}</span>
                  <button
                    onClick={() =>
                      setFile(file.filter((_, i) => i !== idx))
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
          placeholder="Start Generating..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage}>Send</button>
      </div>

      {/* -------- FLOATING AI MENU -------- */}
      <FloatingEditMenu
        position={selectionInfo?.position}
        onAction={applyAIEdit}
        onAskAI={applyAIEdit}
      />
    </div>
  );
}

export default ChatWindow;
