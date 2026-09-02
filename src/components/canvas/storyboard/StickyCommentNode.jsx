// import { useState } from "react";
// import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
// import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
// import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
// import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

// /*
//  * data shape: {
//  *   content, authorLabel, resolved, canManage,
//  *   onResolve?: (commentId, resolved) => void,
//  *   onDelete?: (commentId) => void,
//  * }
//  */
// function StickyCommentNode({ id, data }) {
//   const [expanded, setExpanded] = useState(false);
//   const { content, authorLabel, resolved, canManage, onResolve, onDelete } = data || {};

//   if (!expanded) {
//     return (
//       <button
//         className="nodrag"
//         onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
//         title={content || "Comment"}
//         style={{
//           display: "flex", alignItems: "center", justifyContent: "center",
//           width: 30, height: 30, borderRadius: "50% 50% 50% 4px",
//           background: resolved ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.14)",
//           border: resolved ? "1px solid rgba(255,255,255,.1)" : "1px solid rgba(255,255,255,.3)",
//           color: resolved ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.85)",
//           cursor: "pointer",
//           boxShadow: "0 2px 8px rgba(0,0,0,.4)",
//         }}
//       >
//         <ChatBubbleRoundedIcon sx={{ fontSize: 15 }} />
//       </button>
//     );
//   }

//   return (
//     <div
//       className="nodrag"
//       style={{
//         width: 220, borderRadius: "10px", background: "#151515",
//         border: "1px solid rgba(255,255,255,.15)", boxShadow: "0 8px 24px rgba(0,0,0,.5)",
//         fontFamily: "'Inter',sans-serif", padding: "10px 12px",
//       }}
//     >
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
//         <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,.4)" }}>{authorLabel || "Someone"}</span>
//         <button onClick={() => setExpanded(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: "12px", padding: 0 }}>✕</button>
//       </div>

//       <p style={{ margin: "0 0 8px", fontSize: "12px", lineHeight: 1.5, color: "rgba(255,255,255,.85)" }}>
//         {content}
//       </p>

//       {canManage && (
//         <div style={{ display: "flex", gap: "6px" }}>
//           <button
//             onClick={() => onResolve?.(id, !resolved)}
//             style={{
//               display: "flex", alignItems: "center", gap: "4px",
//               background: "none", border: "1px solid rgba(255,255,255,.12)", borderRadius: "9999px",
//               color: "rgba(255,255,255,.6)", fontSize: "10.5px", padding: "3px 9px", cursor: "pointer",
//             }}
//           >
//             {resolved ? <ReplayRoundedIcon sx={{ fontSize: 12 }} /> : <CheckRoundedIcon sx={{ fontSize: 12 }} />}
//             {resolved ? "Reopen" : "Resolve"}
//           </button>
//           <button
//             onClick={() => onDelete?.(id)}
//             style={{
//               display: "flex", alignItems: "center", gap: "4px",
//               background: "none", border: "1px solid rgba(255,80,80,.2)", borderRadius: "9999px",
//               color: "rgba(255,120,120,.8)", fontSize: "10.5px", padding: "3px 9px", cursor: "pointer",
//             }}
//           >
//             <DeleteOutlineRoundedIcon sx={{ fontSize: 12 }} />
//             Delete
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default StickyCommentNode;












import { useState, useEffect } from "react";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

/*
 * data shape: {
 *   content, authorLabel, resolved, canManage,
 *   onResolve?: (commentId, resolved) => void,
 *   onDelete?: (commentId) => void,
 *   forceExpanded?: bool — set true when this pin was opened via
 *     the scene card's comment-count badge, so it renders expanded
 *     even if the user hasn't clicked it directly yet.
 * }
 */
function StickyCommentNode({ id, data }) {
  const { content, authorLabel, resolved, canManage, onResolve, onDelete, forceExpanded } = data || {};
  const [expanded, setExpanded] = useState(Boolean(forceExpanded));

  useEffect(() => {
    if (forceExpanded) setExpanded(true);
  }, [forceExpanded]);

  if (!expanded) {
    return (
      <button
        className="nodrag"
        onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
        title={content || "Comment"}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 30, height: 30, borderRadius: "50% 50% 50% 4px",
          background: resolved ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.14)",
          border: resolved ? "1px solid rgba(255,255,255,.1)" : "1px solid rgba(255,255,255,.3)",
          color: resolved ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.85)",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,.4)",
        }}
      >
        <ChatBubbleRoundedIcon sx={{ fontSize: 15 }} />
      </button>
    );
  }

  return (
    <div
      className="nodrag"
      style={{
        width: 220, borderRadius: "10px", background: "#151515",
        border: "1px solid rgba(255,255,255,.15)", boxShadow: "0 8px 24px rgba(0,0,0,.5)",
        fontFamily: "'Inter',sans-serif", padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,.4)" }}>{authorLabel || "Someone"}</span>
        <button onClick={() => setExpanded(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: "12px", padding: 0 }}>✕</button>
      </div>

      <p style={{ margin: "0 0 8px", fontSize: "12px", lineHeight: 1.5, color: "rgba(255,255,255,.85)" }}>
        {content}
      </p>

      {canManage && (
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => onResolve?.(id, !resolved)}
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              background: "none", border: "1px solid rgba(255,255,255,.12)", borderRadius: "9999px",
              color: "rgba(255,255,255,.6)", fontSize: "10.5px", padding: "3px 9px", cursor: "pointer",
            }}
          >
            {resolved ? <ReplayRoundedIcon sx={{ fontSize: 12 }} /> : <CheckRoundedIcon sx={{ fontSize: 12 }} />}
            {resolved ? "Reopen" : "Resolve"}
          </button>
          <button
            onClick={() => onDelete?.(id)}
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              background: "none", border: "1px solid rgba(255,80,80,.2)", borderRadius: "9999px",
              color: "rgba(255,120,120,.8)", fontSize: "10.5px", padding: "3px 9px", cursor: "pointer",
            }}
          >
            <DeleteOutlineRoundedIcon sx={{ fontSize: 12 }} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default StickyCommentNode;