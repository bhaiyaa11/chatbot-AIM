// /*
//  * Props:
//  * - comments: array of { id, author_id, guest_name, content, anchor_text, resolved, created_at }
//  * - canComment: bool
//  * - onSelectComment(comment) — scroll/select the anchored range in the doc
//  * - onResolve(commentId, resolved)
//  * - onDelete(commentId)
//  * - onClose
//  * - currentUserId: string|null — null for anonymous/public visitors
//  * - readOnly: bool — hides resolve/delete entirely (public link view,
//  *   where thread management stays with the authenticated owner)
//  */
// function CommentsPanel({
//   comments,
//   canComment,
//   onSelectComment,
//   onResolve,
//   onDelete,
//   onClose,
//   currentUserId,
//   readOnly = false,
// }) {
//   const open = (comments || []).filter((c) => !c.resolved);
//   const resolved = (comments || []).filter((c) => c.resolved);

//   const renderComment = (comment) => {
//     // currentUserId is null for anonymous visitors, and guest comments
//     // also have author_id === null — without the currentUserId check
//     // that would falsely match (null === null) and show Delete to
//     // every visitor on every guest comment.
//     const isOwnComment = Boolean(currentUserId) && comment.author_id === currentUserId;

//     return (
//       <div key={comment.id} className="canvas-comment-card">
//         <button
//           type="button"
//           className="canvas-comment-anchor"
//           onClick={() => onSelectComment(comment)}
//           title="Jump to this line"
//         >
//           “{comment.anchor_text || "…"}”
//         </button>

//         <p className="canvas-comment-body">{comment.content}</p>

//         <div className="canvas-comment-footer">
//           <span className="canvas-comment-meta">
//             {comment.guest_name ? `${comment.guest_name} · ` : ""}
//             {new Date(comment.created_at).toLocaleDateString()}
//           </span>

//           {!readOnly && (
//             <div className="canvas-comment-actions">
//               {!comment.resolved ? (
//                 <button type="button" onClick={() => onResolve(comment.id, true)}>
//                   Resolve
//                 </button>
//               ) : (
//                 <button type="button" onClick={() => onResolve(comment.id, false)}>
//                   Reopen
//                 </button>
//               )}
//               {isOwnComment && (
//                 <button type="button" onClick={() => onDelete(comment.id)}>
//                   Delete
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="canvas-comments-panel">
//       <div className="canvas-comments-panel-header">
//         <span>Comments</span>
//         <button type="button" className="canvas-share-close" onClick={onClose}>
//           ×
//         </button>
//       </div>

//       {!canComment && (
//         <p className="canvas-share-hint">
//           You have view-only access — you can read comments here but not add
//           new ones.
//         </p>
//       )}

//       {open.length === 0 && resolved.length === 0 && (
//         <p className="canvas-share-hint">
//           No comments yet. Select any text in the document to leave one.
//         </p>
//       )}

//       {open.length > 0 && (
//         <div className="canvas-comments-group">{open.map(renderComment)}</div>
//       )}

//       {resolved.length > 0 && (
//         <details className="canvas-comments-resolved">
//           <summary>{resolved.length} resolved</summary>
//           <div className="canvas-comments-group">
//             {resolved.map(renderComment)}
//           </div>
//         </details>
//       )}
//     </div>
//   );
// }

// export default CommentsPanel;
















import { useState } from "react";

/*
 * Props:
 * - comments: array of { id, author_id, guest_name, content, anchor_text, resolved, created_at }
 * - canComment: bool
 * - onSelectComment(comment) — scroll/select the anchored range in the doc
 * - onResolve(commentId, resolved)
 * - onDelete(commentId)
 * - onClose
 * - currentUserId: string|null — null for anonymous/public visitors
 * - readOnly: bool — hides resolve/delete entirely (public link view,
 *   where thread management stays with the authenticated owner)
 */
function CommentsPanel({
  comments,
  canComment,
  onSelectComment,
  onResolve,
  onDelete,
  onClose,
  currentUserId,
  readOnly = false,
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const open = (comments || []).filter((c) => !c.resolved);
  const resolved = (comments || []).filter((c) => c.resolved);

  const renderComment = (comment) => {
    // currentUserId is null for anonymous visitors, and guest comments
    // also have author_id === null — without the currentUserId check
    // that would falsely match (null === null) and show Delete to
    // every visitor on every guest comment.
    const isOwnComment = Boolean(currentUserId) && comment.author_id === currentUserId;

    return (
      <div key={comment.id} className="canvas-comment-card">
        <button
          type="button"
          className="canvas-comment-anchor"
          onClick={() => onSelectComment(comment)}
          title="Jump to this line"
        >
          "{comment.anchor_text || "…"}"
        </button>

        <p className="canvas-comment-body">{comment.content}</p>

        <div className="canvas-comment-footer">
          <span className="canvas-comment-meta">
            {comment.guest_name ? `${comment.guest_name} · ` : ""}
            {new Date(comment.created_at).toLocaleDateString()}
          </span>

          {!readOnly && (
            confirmDeleteId === comment.id ? (
              <div className="canvas-confirm-delete-bar">
                <span>Delete?</span>
                <button
                  type="button"
                  className="canvas-confirm-delete-btn"
                  onClick={() => {
                    onDelete(comment.id);
                    setConfirmDeleteId(null);
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="canvas-confirm-cancel-btn"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="canvas-comment-actions">
                {!comment.resolved ? (
                  <button type="button" onClick={() => onResolve(comment.id, true)}>
                    Resolve
                  </button>
                ) : (
                  <button type="button" onClick={() => onResolve(comment.id, false)}>
                    Reopen
                  </button>
                )}
                {isOwnComment && (
                  <button type="button" onClick={() => setConfirmDeleteId(comment.id)}>
                    Delete
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="canvas-comments-panel">
      <div className="canvas-comments-panel-header">
        <span>Comments</span>
        <button type="button" className="canvas-share-close" onClick={onClose}>
          ×
        </button>
      </div>

      {!canComment && (
        <p className="canvas-share-hint">
          You have view-only access — you can read comments here but not add
          new ones.
        </p>
      )}

      {open.length === 0 && resolved.length === 0 && (
        <p className="canvas-share-hint">
          No comments yet. Select any text in the document to leave one.
        </p>
      )}

      {open.length > 0 && (
        <div className="canvas-comments-group">{open.map(renderComment)}</div>
      )}

      {resolved.length > 0 && (
        <details className="canvas-comments-resolved">
          <summary>{resolved.length} resolved</summary>
          <div className="canvas-comments-group">
            {resolved.map(renderComment)}
          </div>
        </details>
      )}
    </div>
  );
}

export default CommentsPanel;