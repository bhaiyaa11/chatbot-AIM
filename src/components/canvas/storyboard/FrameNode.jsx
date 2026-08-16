/*
 * A frame/section that visually groups scene cards (e.g. "Act 1").
 * Child scene nodes reference this frame via node.parentNode in the
 * React Flow node list (set in StoryboardCanvas.jsx) — this
 * component only renders the frame's own background + label bar.
 *
 * data shape: { label, onLabelChange?: (frameId, newLabel) => void, editable }
 */
function FrameNode({ id, data, selected }) {
  const { label, onLabelChange, editable = true } = data || {};

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "14px",
        background: "rgba(255,255,255,.02)",
        border: selected ? "1.5px dashed rgba(255,255,255,.45)" : "1.5px dashed rgba(255,255,255,.14)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="nodrag"
        style={{
          display: "flex", alignItems: "center", padding: "6px 10px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        {editable ? (
          <input
            value={label || ""}
            onChange={(e) => onLabelChange?.(id, e.target.value)}
            placeholder="Untitled section"
            style={{
              background: "none", border: "none", outline: "none",
              color: "rgba(255,255,255,.65)", fontSize: "12px", fontWeight: 600,
              fontFamily: "'Inter',sans-serif", width: "100%",
            }}
          />
        ) : (
          <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,.6)", fontFamily: "'Inter',sans-serif" }}>
            {label || "Untitled section"}
          </span>
        )}
      </div>
    </div>
  );
}

export default FrameNode;