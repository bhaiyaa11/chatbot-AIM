import { useState } from "react";

/*
 * Props:
 * - canvasId, authHeaders (fn -> headers|null), apiBase
 * - shareSettings, members, accessRequests (state owned by parent Canvas.jsx)
 * - loading, onClose
 * - onRefreshShare, onRefreshMembers, onRefreshRequests (refetchers)
 * - onCreateOrRegenerateLink(permission)
 * - onToggleLinkAccess(enabled)
 * - onChangeLinkPermission(permission)
 * - onSetVisibility(visibility)
 * - onInviteMember(email, permission)
 * - onChangeMemberPermission(memberId, permission)
 * - onRemoveMember(memberId)
 * - onApproveRequest(requestId, permission)
 * - onDenyRequest(requestId)
 * - shareUrl, copyStatus, onCopyShareUrl
 */
function SharePanel({
  shareSettings,
  members,
  accessRequests,
  loading,
  onClose,
  onCreateOrRegenerateLink,
  onToggleLinkAccess,
  onChangeLinkPermission,
  onSetVisibility,
  onInviteMember,
  onChangeMemberPermission,
  onRemoveMember,
  onApproveRequest,
  onDenyRequest,
  shareUrl,
  copyStatus,
  onCopyShareUrl,
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState("viewer");
  const [approvePermission, setApprovePermission] = useState({});

  const visibility = shareSettings?.visibility || "restricted";

  const submitInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    onInviteMember(inviteEmail.trim(), invitePermission);
    setInviteEmail("");
  };

  return (
    <div className="canvas-share-panel">
      <div className="canvas-share-panel-header">
        <span>Share this canvas</span>
        <button type="button" className="canvas-share-close" onClick={onClose}>
          ×
        </button>
      </div>

      {loading && !shareSettings ? (
        <p className="canvas-share-hint">Loading…</p>
      ) : (
        <>
          {/* ── Restricted vs Anyone ───────────────────────── */}
          <div className="canvas-share-row">
            <span>Who can access</span>
            <select
              value={visibility}
              onChange={(e) => onSetVisibility(e.target.value)}
              disabled={loading}
            >
              <option value="restricted">Restricted</option>
              <option value="anyone">Anyone with the link</option>
            </select>
          </div>

          {visibility === "anyone" ? (
            <>
              <div className="canvas-share-row">
                <span>Link access</span>
                <input
                  type="checkbox"
                  checked={Boolean(shareSettings?.link_access_enabled)}
                  onChange={(e) => onToggleLinkAccess(e.target.checked)}
                  disabled={loading || !shareSettings?.has_active_link}
                />
              </div>

              <div className="canvas-share-row">
                <span>Permission</span>
                <select
                  value={shareSettings?.link_permission || "viewer"}
                  onChange={(e) => onChangeLinkPermission(e.target.value)}
                  disabled={loading}
                >
                  <option value="viewer">Viewer</option>
                  <option value="commenter">Commenter</option>
                  <option value="editor">Editor</option>
                </select>
              </div>

              <button
                type="button"
                className="canvas-share-generate"
                onClick={onCreateOrRegenerateLink}
                disabled={loading}
              >
                {shareSettings?.has_active_link
                  ? "Generate new link"
                  : "Create share link"}
              </button>

              {shareUrl && (
                <div className="canvas-share-url-row">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    onFocus={(e) => e.target.select()}
                  />
                  <button type="button" onClick={onCopyShareUrl}>
                    {copyStatus || "Copy"}
                  </button>
                </div>
              )}

              {!shareUrl && shareSettings?.has_active_link && (
                <p className="canvas-share-hint">
                  A link already exists. Generate a new one to see the URL
                  again — the old one stops working.
                </p>
              )}
            </>
          ) : (
            <>
              {/* ── Pending requests ─────────────────────────── */}
              {accessRequests && accessRequests.length > 0 && (
                <div className="canvas-share-section">
                  <div className="canvas-share-section-title">
                    Requests ({accessRequests.length})
                  </div>
                  {accessRequests.map((req) => (
                    <div key={req.id} className="canvas-share-person-row">
                      <span className="canvas-share-person-name">
                        {req.email || req.requester_id}
                      </span>
                      <select
                        value={approvePermission[req.id] || "viewer"}
                        onChange={(e) =>
                          setApprovePermission((prev) => ({
                            ...prev,
                            [req.id]: e.target.value,
                          }))
                        }
                        disabled={loading}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="commenter">Commenter</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button
                        type="button"
                        className="canvas-share-approve"
                        onClick={() =>
                          onApproveRequest(
                            req.id,
                            approvePermission[req.id] || "viewer"
                          )
                        }
                        disabled={loading}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="canvas-share-deny"
                        onClick={() => onDenyRequest(req.id)}
                        disabled={loading}
                      >
                        Deny
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Invite by email ──────────────────────────── */}
              <form className="canvas-share-invite-form" onSubmit={submitInvite}>
                <input
                  type="email"
                  placeholder="Add people by email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={loading}
                />
                <select
                  value={invitePermission}
                  onChange={(e) => setInvitePermission(e.target.value)}
                  disabled={loading}
                >
                  <option value="viewer">Viewer</option>
                  <option value="commenter">Commenter</option>
                  <option value="editor">Editor</option>
                </select>
                <button type="submit" disabled={loading || !inviteEmail.trim()}>
                  Invite
                </button>
              </form>

              {/* ── Members with access ──────────────────────── */}
              {members && members.length > 0 && (
                <div className="canvas-share-section">
                  <div className="canvas-share-section-title">
                    People with access
                  </div>
                  {members.map((m) => (
                    <div key={m.id} className="canvas-share-person-row">
                      <span className="canvas-share-person-name">
                        {m.email || m.user_id}
                      </span>
                      <select
                        value={m.permission}
                        onChange={(e) =>
                          onChangeMemberPermission(m.id, e.target.value)
                        }
                        disabled={loading}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="commenter">Commenter</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button
                        type="button"
                        className="canvas-share-deny"
                        onClick={() => onRemoveMember(m.id)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {(!members || members.length === 0) &&
                (!accessRequests || accessRequests.length === 0) && (
                  <p className="canvas-share-hint">
                    Only you can access this canvas right now. Invite people
                    by email, or switch to "Anyone with the link".
                  </p>
                )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default SharePanel;