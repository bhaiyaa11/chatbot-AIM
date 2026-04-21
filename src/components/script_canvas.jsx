import { useState, useRef, useEffect, useCallback } from "react";
import "./script_canvas.css";

// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// ─────────────────────────────────────────────────────────────────────────────
// FloatingEditMenu — rendered in a portal OUTSIDE contentEditable so selection
// is never disturbed by React re-renders inside the editable div.
// ─────────────────────────────────────────────────────────────────────────────
function FloatingEditMenu({ position, onAction, onClose, isLoading }) {
  const [askInput, setAskInput] = useState("");
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!position) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    // Use capture so it fires before mouseup on canvas
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [position, onClose]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="floating-menu"
      // position:fixed so it is positioned relative to the viewport,
      // completely independent of any scrolling parent or contentEditable
      style={{ position: "fixed", top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()} // never steal focus / blur selection
    >
      {isLoading ? (
        <div className="floating-menu__loading">
          <span className="floating-menu__spinner" />
          Editing…
        </div>
      ) : (
        <>
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

          <div className="fm-ask-row">
            <input
              className="fm-ask-input"
              type="text"
              placeholder="Ask AI…"
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter" && askInput.trim()) {
                  onAction(askInput.trim());
                  setAskInput("");
                }
                if (e.key === "Escape") onClose();
              }}
              autoFocus
            />
            <button
              className="fm-btn fm-btn--send"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (askInput.trim()) {
                  onAction(askInput.trim());
                  setAskInput("");
                }
              }}
            >
              ↵
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar — undo / redo / copy / word count
// ─────────────────────────────────────────────────────────────────────────────
function Toolbar({ onUndo, onRedo, canUndo, canRedo, onCopy, copied, wordCount }) {
  return (
    <div className="canvas-toolbar">
      <div className="canvas-toolbar__left">
        <button
          className="tb-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ↩ Undo
        </button>
        <button
          className="tb-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          ↪ Redo
        </button>
      </div>
      <div className="canvas-toolbar__right">
        <span className="tb-wordcount">{wordCount} words</span>
        <button className="tb-btn tb-btn--copy" onClick={onCopy}>
          {copied ? "✓ Copied" : "⧉ Copy"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ScriptCanvas
//
// Props:
//   content  (string) — the generated script HTML/text to load into the canvas.
//                       Pass a new value to replace the canvas content.
//   onChange (fn)     — called with the latest plain text whenever content changes.
// ─────────────────────────────────────────────────────────────────────────────
export default function ScriptCanvas({ content = "", onChange }) {
  const canvasRef = useRef(null);

  // ── Selection / menu state ──────────────────────────────────────
  const [menuPosition, setMenuPosition]   = useState(null);
  const [selectedText, setSelectedText]   = useState("");
  const savedRangeRef                     = useRef(null);
  const [isLoading, setIsLoading]         = useState(false);

  // ── Undo / redo stack ───────────────────────────────────────────
  // Each entry is the innerHTML string at that point in time.
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const skipNextSnapshot = useRef(false);

  // ── Copy state ──────────────────────────────────────────────────
  const [copied, setCopied] = useState(false);

  // ── Word count ──────────────────────────────────────────────────
  const [wordCount, setWordCount] = useState(0);

  // ─────────────────────────────────────────────────────────────
  // Load content prop into canvas (only when prop changes)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !content) return;
    // Preserve undo history — save current state before overwrite
    pushUndo();
    el.innerHTML = content;
    updateWordCount();
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────
  // Undo / Redo helpers
  // ─────────────────────────────────────────────────────────────
  function pushUndo() {
    const el = canvasRef.current;
    if (!el) return;
    undoStack.current.push(el.innerHTML);
    if (undoStack.current.length > 100) undoStack.current.shift(); // cap
    redoStack.current = []; // new edit clears redo
  }

  function applySnapshot(html) {
    const el = canvasRef.current;
    if (!el) return;
    skipNextSnapshot.current = true;
    el.innerHTML = html;
    updateWordCount();
    onChange?.(el.innerText);
  }

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const el = canvasRef.current;
    if (!el) return;
    redoStack.current.push(el.innerHTML);
    applySnapshot(undoStack.current.pop());
  }, []);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const el = canvasRef.current;
    if (!el) return;
    undoStack.current.push(el.innerHTML);
    applySnapshot(redoStack.current.pop());
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Keyboard shortcuts
  // ─────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
    }
    // Escape closes menu
    if (e.key === "Escape") setMenuPosition(null);
  }, [handleUndo, handleRedo]);

  // ─────────────────────────────────────────────────────────────
  // Track edits for undo (debounced snapshot on input)
  // ─────────────────────────────────────────────────────────────
  const snapshotTimer = useRef(null);

  const handleInput = useCallback(() => {
    if (skipNextSnapshot.current) { skipNextSnapshot.current = false; return; }
    clearTimeout(snapshotTimer.current);
    snapshotTimer.current = setTimeout(() => {
      pushUndo();
      const el = canvasRef.current;
      if (el) {
        updateWordCount();
        onChange?.(el.innerText);
      }
    }, 600); // snapshot 600ms after user stops typing
  }, [onChange]);

  function updateWordCount() {
    const el = canvasRef.current;
    if (!el) return;
    const words = el.innerText.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }

  // ─────────────────────────────────────────────────────────────
  // Selection → floating menu
  // ─────────────────────────────────────────────────────────────
  const handleMouseUp = useCallback((e) => {
    // Don't re-trigger if click is inside the menu
    if (e.target.closest?.(".floating-menu")) return;

    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text) {
      setMenuPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);

    // Verify selection is actually inside this canvas
    if (!canvasRef.current?.contains(range.commonAncestorContainer)) {
      setMenuPosition(null);
      return;
    }

    savedRangeRef.current = range.cloneRange();
    setSelectedText(text);

    const rect = range.getBoundingClientRect();
    // position:fixed — use viewport coords directly
    setMenuPosition({
      top:  rect.bottom + 8,
      left: Math.min(rect.left, window.innerWidth - 280), // clamp to viewport
    });
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Apply AI edit result back into the canvas at the saved range
  // ─────────────────────────────────────────────────────────────
  const applyAIEdit = useCallback((editedText) => {
    const range = savedRangeRef.current;
    if (!range || !canvasRef.current) return;

    // Save undo snapshot before mutating
    pushUndo();

    // Restore the saved selection and replace it with the edited text
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    const r = sel.getRangeAt(0);
    r.deleteContents();

    // Insert as plain text node so it inherits surrounding styles
    const textNode = document.createTextNode(editedText);
    r.insertNode(textNode);

    // Move cursor to end of inserted text
    r.setStartAfter(textNode);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    savedRangeRef.current = null;
    setMenuPosition(null);
    setSelectedText("");
    updateWordCount();
    onChange?.(canvasRef.current.innerText);
  }, [onChange]);

  // ─────────────────────────────────────────────────────────────
  // Call /edit endpoint with the selected text + instruction
  // ─────────────────────────────────────────────────────────────
  const handleAction = useCallback(async (instruction) => {
    if (!selectedText) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("instruction", instruction);
      formData.append("selected_text", selectedText);

      const res  = await fetch(`${API_BASE_URL}/edit`, { method: "POST", body: formData });
      const data = await res.json();

      if (data.result) applyAIEdit(data.result);
    } catch (err) {
      console.error("ScriptCanvas /edit failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedText, applyAIEdit]);

  // ─────────────────────────────────────────────────────────────
  // Copy full canvas content
  // ─────────────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    const text = canvasRef.current?.innerText ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Close menu on scroll (same fix as chat_window floating menu)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const dismiss = () => setMenuPosition(null);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, []);

  return (
    <div className="script-canvas-wrapper">
      <Toolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.current.length > 0}
        canRedo={redoStack.current.length > 0}
        onCopy={handleCopy}
        copied={copied}
        wordCount={wordCount}
      />

      {/* contentEditable canvas — FloatingEditMenu is OUTSIDE this div */}
      <div
        ref={canvasRef}
        className="script-canvas"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        data-placeholder="Your generated script will appear here. You can edit it directly, or select any text to open the AI edit menu."
      />

      {/* FloatingEditMenu rendered outside contentEditable — no DOM conflicts */}
      <FloatingEditMenu
        position={menuPosition}
        onAction={handleAction}
        onClose={() => setMenuPosition(null)}
        isLoading={isLoading}
      />
    </div>
  );
}