import { useState } from "react";
import "./floatingEdit.css";

// FloatingEditMenu is used in two places:
//   1. chat_window.jsx  — above bot message bubbles
//   2. script_canvas.jsx — has its own fully self-contained menu (doesn't use this)
//
// Key fix: position:fixed (not absolute) so the menu is positioned relative
// to the VIEWPORT, not to a scrolling ancestor. The caller passes clientX/Y
// viewport coordinates, which map directly to fixed positioning.

function FloatingEditMenu({ position, onAction, onAskAI }) {
  const [askInput, setAskInput] = useState("");

  if (!position) return null;

  return (
    <div
      className="floating-menu"
      style={{
        position: "fixed",   // ← was "absolute" — this was the root cause
        top:  position.top,
        left: position.left,
        zIndex: 9999,
      }}
      // Never steal focus or dismiss the text selection
      onMouseDown={(e) => e.preventDefault()}
    >
      <button className="fm-btn" onClick={() => onAction("Improve clarity and tone")}>
        ✨ Improve
      </button>

      <button className="fm-btn" onClick={() => onAction("Regenerate keeping the same context and tone")}>
        🔄 Regenerate
      </button>

      <button className="fm-btn" onClick={() => onAction("Shorten this text")}>
        ✂️ Shorten
      </button>

      <button className="fm-btn" onClick={() => onAction("Expand with more detail")}>
        📝 Expand
      </button>

      <div className="fm-divider" />

      <div className="fm-ask-row" onMouseDown={(e) => e.stopPropagation()}>
        <input
          className="fm-ask-input"
          type="text"
          placeholder="Ask AI…"
          value={askInput}
          onChange={(e) => setAskInput(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter" && askInput.trim()) {
              onAskAI(askInput.trim());
              setAskInput("");
            }
          }}
        />
        <button
          className="fm-btn fm-btn--send"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (askInput.trim()) {
              onAskAI(askInput.trim());
              setAskInput("");
            }
          }}
        >
          ↵
        </button>
      </div>
    </div>
  );
}

export default FloatingEditMenu;