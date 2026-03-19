
// import { useEffect, useState, forwardRef } from "react";

// function parseMarkdownTable(markdown) {
//   if (!markdown) return [];

//   const lines = markdown
//     .split("\n")
//     .map(l => l.trim())
//     .filter(l => l.startsWith("|"));

//   if (lines.length < 2) return [];

//   // Remove header separator row (the |---|---| line at index 1)
//   const rows = lines.filter(
//     (line, i) => !(i === 1 && line.includes("---"))
//   );

//   return rows.map(row =>
//     row
//       .split("|")
//       .map(cell => cell.trim())
//       .filter(Boolean)
//   );
// }

// const ChatResponse = forwardRef(function ChatResponse({ reply }, ref) {
//   const [table, setTable] = useState([]);

//   useEffect(() => {
//     if (!reply) return;
//     setTable(parseMarkdownTable(reply));
//   }, [reply]);

//   if (table.length === 0) {
//     return <div className="markdown-container" ref={ref}>{reply}</div>;
//   }

//   return (
//     <div className="table-editor" ref={ref}>
//       <table>
//         <thead>
//           <tr>
//             {table[0].map((cell, i) => (
//               <th key={i}>{cell}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {table.slice(1).map((row, rIdx) => (
//             <tr key={rIdx}>
//               {row.map((cell, cIdx) => (
//                 <td
//                   key={cIdx}
//                   contentEditable
//                   suppressContentEditableWarning
//                   onBlur={(e) => {
//                     const updated = [...table];
//                     const newText = e.target.innerText;
//                     updated[rIdx + 1][cIdx] = newText;
//                     setTable(updated);
//                   }}
//                   onMouseUp={(e) => {
//                     const selection = window.getSelection();
//                     if (!selection || selection.isCollapsed) return;
//                     const selectedText = selection.toString();
//                     e.currentTarget.dataset.selected = selectedText;
//                   }}
//                 >
//                   {cell}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// });

// export default ChatResponse;








import { useEffect, useState, forwardRef } from "react";
import ReactMarkdown from "react-markdown";

function parseMarkdownTable(markdown) {
  if (!markdown) return [];

  const lines = markdown
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("|"));

  if (lines.length < 2) return [];

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

const ChatResponse = forwardRef(function ChatResponse({ reply }, ref) {
  const [table, setTable] = useState([]);

  useEffect(() => {
    if (!reply) return;
    setTable(parseMarkdownTable(reply));
  }, [reply]);

  if (table.length === 0) {
    return (
      <div className="markdown-container" ref={ref}>
        <ReactMarkdown>{reply}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="table-editor" ref={ref}>
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
                <td key={cIdx}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ChatResponse;