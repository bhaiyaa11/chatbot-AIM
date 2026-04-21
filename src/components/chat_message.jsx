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

const ChatResponse = forwardRef(function ChatResponse({ reply, editable = true, onInput }, ref) {
  const [table, setTable] = useState([]);

  useEffect(() => {
    if (!reply) return;
    setTable(parseMarkdownTable(reply));
  }, [reply]);

  if (table.length === 0) {
    return (
      <div
        className="markdown-container"
        ref={ref}
        contentEditable={editable}
        suppressContentEditableWarning={editable}
        spellCheck={false}
        onInput={editable ? onInput : undefined}
        // prevent browser from stripping markdown formatting tags while editing
        style={editable ? { outline: "none", caretColor: "rgba(255,255,255,.6)" } : undefined}
      >
        <ReactMarkdown>{reply}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div
      className="table-editor"
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning={editable}
      spellCheck={false}
      onInput={editable ? onInput : undefined}
      style={editable ? { outline: "none", caretColor: "rgba(255,255,255,.6)" } : undefined}
    >
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
                <td key={cIdx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ChatResponse;