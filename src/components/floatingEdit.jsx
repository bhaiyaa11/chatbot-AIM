import { useState } from "react";
import "./floatingEdit.css";

function FloatingEditMenu({ position, onAction, onAskAI }) {
const [customPrompt, setCustomPrompt] = useState("");
const [askInput, setAskInput] = useState("");

  if (!position) return null;

  return (
    <div
      className="floating-menu"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
    >
      <button onClick={() => onAction("Improve clarity and tone")}>
        ✨ Improve
      </button>

      <button onClick={() => onAction("Regerate response keeping the same context and tone")}>
        🧠 Regenerate
      </button>

      <button onClick={() => onAction("Shorten this text")}>
        ✂️ Shorten
      </button>

      {/* <button onClick={() => onAction("Make this more cinematic")}>
        🎬 Cinematic
      </button> */}

      <div className="ask-ai"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}  // ← add onClick too>
        >
      <input
        type="text"
        placeholder="Ask AI…"
        value={askInput}
        onChange={(e) => setAskInput(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}  // ← add this
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
        // e.stopPropagation(); // 🔒 prevent chat Enter handling

          if (e.key === "Enter" && askInput.trim()) {
            onAskAI(askInput.trim());
            setAskInput("");
          }
        }}
      />
      </div> 
    </div>
  );
}

export default FloatingEditMenu;
