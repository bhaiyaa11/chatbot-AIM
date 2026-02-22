// import { useRef } from "react";

// export default function ChatInput({
//   input,
//   setInput,
//   files,
//   setFiles,
//   sendMessage,
//   isDragging,
//   handleDragOver,
//   handleDragLeave,
//   handleDrop,
// }) {
//   const fileInputRef = useRef(null);

//   return (
//     <div
//       className={`chat-input-area ${isDragging ? "drag-active" : ""}`}
//       onDragOver={handleDragOver}
//       onDragLeave={handleDragLeave}
//       onDrop={handleDrop}
//     >
//       <input
//         ref={fileInputRef}
//         type="file"
//         multiple
//         hidden
//         onChange={(e) => setFiles(Array.from(e.target.files))}
//       />

//       <button
//         className="attach-btn"
//         onClick={() => fileInputRef.current.click()}
//       >
//         📎
//       </button>

//       {files.length > 0 && (
//         <div className="file-chip-row">
//           {files.map((f, idx) => (
//             <div key={idx} className="file-chip">
//               {f.name}
//               <button onClick={() => setFiles(files.filter((_, i) => i !== idx))}>
//                 ✕
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       <input
//         type="text"
//         placeholder="Send a message..."
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//       />

//       <button onClick={sendMessage}>Send</button>
//     </div>
//   );
// }

