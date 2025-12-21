// function ChatMessage({ message, sender }) {
//   const isUser = sender === 'user';

//   return (
//     <div
//       className={`message ${isUser ? 'user-message' : 'bot-message'}`}
//     >
//       <p>{message}</p>
//     </div>
//   );
// }

// export default ChatMessage;


// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// function ChatResponse({ reply }) {
//   return (
//     <div className="markdown-container">
//       <ReactMarkdown remarkPlugins={[remarkGfm]}>
//         {reply}
//       </ReactMarkdown>
//     </div>
//   );
// }

// export default ChatResponse;


// function ChatMessage({ message, sender, onEnter }) {
//   const isUser = sender === "user";

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && onEnter) {
//       e.preventDefault();
//       onEnter();
//     }
//   };

//   return (
//     <div
//       className={`message ${isUser ? "user-message" : "bot-message"}`}
//       tabIndex={isUser ? 0 : -1}
//       onKeyDown={isUser ? handleKeyDown : undefined}
//     >
//       <p>{message}</p>
//     </div>
//   );
// }

// export default ChatMessage;


import { useEffect, useState } from "react";

/**
 * Parses a markdown table into rows and cells
 */
function parseMarkdownTable(markdown) {
  const lines = markdown
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("|"));

  if (lines.length < 2) return [];

  // Remove header separator row
  const rows = lines.filter(
    (line, i) => !(i === 1 && line.includes("---"))
  );

  return rows.map(row =>
    row
      .split("|")
      .map(cell => cell.trim())
      .filter(Boolean)
  );
}

function ChatResponse({ reply }) {
  const [table, setTable] = useState([]);

  useEffect(() => {
    setTable(parseMarkdownTable(reply));
  }, [reply]);

  if (table.length === 0) {
    return <div className="markdown-container">{reply}</div>;
  }

  return (
    <div className="table-editor">
      <table>
        <thead>
          <tr>
            {table[0].map((cell, i) => (
              <th key={i}>{cell}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {table.slice(1).map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td
                key={cIdx}
                contentEditable
                suppressContentEditableWarning
                onBlur={async (e) => {
                  const updated = [...table];
                  const originalText = cell;
                  const newText = e.target.innerText;

                  // If user manually edited, keep it
                  updated[rIdx + 1][cIdx] = newText;
                  setTable(updated);
                }}
                onMouseUp={(e) => {
                  const selection = window.getSelection();
                  if (!selection || selection.isCollapsed) return;

                  const selectedText = selection.toString();

                  // Store selection context on element
                  e.currentTarget.dataset.selected = selectedText;
                }}
                >
                {cell}
              </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChatResponse;
