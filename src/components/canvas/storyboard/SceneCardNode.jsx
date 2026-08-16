import { Handle, Position } from "reactflow";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

/*
 * A single storyboard scene: image + caption + scene number.
 * `data` shape (see StoryboardCanvas.jsx for the full node schema):
 *   {
 *     imageUrl, caption, sceneNumber,
 *     onJumpToScene?: (sceneNumber) => void,   // sync script/audio
 *     onOpenComments?: (nodeId) => void,
 *     commentCount?: number,
 *   }
 *
 * Handles are included now (even though connectors are deferred
 * past v1) so adding branching/flow later doesn't require touching
 * this component again — just enabling edge creation in the canvas.
 */
function SceneCardNode({ id, data, selected }) {
  const {
    imageUrl,
    caption,
    sceneNumber,
    onJumpToScene,
    onOpenComments,
    commentCount = 0,
  } = data || {};

  return (
    <div
      style={{
        width: 220,
        borderRadius: "12px",
        overflow: "hidden",
        background: "#111",
        border: selected ? "1px solid rgba(255,255,255,.55)" : "1px solid rgba(255,255,255,.1)",
        boxShadow: selected ? "0 0 0 3px rgba(255,255,255,.08)" : "0 2px 10px rgba(0,0,0,.35)",
        fontFamily: "'Inter',sans-serif",
        cursor: "grab",
        transition: "border-color .12s, box-shadow .12s",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: "rgba(255,255,255,.3)", width: 6, height: 6 }} />
      <Handle type="source" position={Position.Right} style={{ background: "rgba(255,255,255,.3)", width: 6, height: 6 }} />

      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={caption || `Scene ${sceneNumber ?? ""}`}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.25)", fontSize: "11px" }}>
            No image
          </div>
        )}

        <div
          style={{
            position: "absolute", top: 6, left: 6,
            background: "rgba(0,0,0,.65)", border: "1px solid rgba(255,255,255,.15)",
            borderRadius: "9999px", padding: "2px 8px",
            fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,.85)",
          }}
        >
          {sceneNumber != null ? `Scene ${sceneNumber}` : "—"}
        </div>

        {onJumpToScene && (
          <button
            className="nodrag"
            // onClick={(e) => { e.stopPropagation(); onJumpToScene(sceneNumber); }}
            onClick={(e) => { e.stopPropagation(); onJumpToScene(data); }}
            title="Jump to this point in script/audio"
            style={{
              position: "absolute", bottom: 6, right: 6,
              width: 26, height: 26, borderRadius: "50%",
              background: "rgba(0,0,0,.65)", border: "1px solid rgba(255,255,255,.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,.85)", cursor: "pointer",
            }}
          >
            <PlayCircleOutlineRoundedIcon sx={{ fontSize: 15 }} />
          </button>
        )}
      </div>

      <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
        <p
          style={{
            margin: 0, fontSize: "11.5px", lineHeight: 1.4, color: "rgba(255,255,255,.7)",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {caption || "No caption"}
        </p>

        {onOpenComments && (
          <button
            className="nodrag"
            onClick={(e) => { e.stopPropagation(); onOpenComments(id); }}
            style={{
              alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "4px",
              background: "none", border: "none", color: "rgba(255,255,255,.35)",
              fontSize: "10.5px", cursor: "pointer", padding: 0,
            }}
          >
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 12 }} />
            {commentCount > 0 ? commentCount : ""}
          </button>
        )}
      </div>
    </div>
  );
}

export default SceneCardNode;