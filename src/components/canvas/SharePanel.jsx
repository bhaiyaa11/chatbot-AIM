import { useState } from "react";

/*
 * Props:
 * - canvasId
 * - shareSettings, members, accessRequests, pendingInvites (state owned by parent Canvas.jsx)
 * - loading, onClose
 * - onCreateOrRegenerateLink(permission)
 * - onToggleLinkAccess(enabled)
 * - onChangeLinkPermission(permission)
 * - onSetVisibility(visibility)
 * - onInviteMember(email, permission)
 * - onChangeMemberPermission(memberId, permission)
 * - onRemoveMember(memberId)
 * - onApproveRequest(requestId, permission)
 * - onDenyRequest(requestId)
 * - onRevokeInvite(inviteId)
 * - shareUrl, copyStatus, onCopyShareUrl
 */
function SharePanel({
  canvasId,
  shareSettings,
  members,
  accessRequests,
  pendingInvites,
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
  onRevokeInvite,
  shareUrl,
  copyStatus,
  onCopyShareUrl,
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState("viewer");
  const [approvePermission, setApprovePermission] = useState({});
  const [restrictedCopyStatus, setRestrictedCopyStatus] = useState("");

  const visibility = shareSettings?.visibility || "restricted";

  // Unlike the "anyone" mode's token link, this URL has nothing secret
  // in it — access is gated by the email-OTP-verify + invite-list
  // check on the backend, not by the URL being hard to guess. So it's
  // just derived locally, no server round-trip needed to "generate" it.
  const restrictedLink = canvasId
    ? `${window.location.origin}/canvas-access/${canvasId}`
    : "";

  const copyRestrictedLink = async () => {
    if (!restrictedLink) return;
    try {
      await navigator.clipboard.writeText(restrictedLink);
      setRestrictedCopyStatus("Copied!");
      setTimeout(() => setRestrictedCopyStatus(""), 1500);
    } catch {
      setRestrictedCopyStatus("Copy failed");
    }
  };

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
              {/* ── Shareable link ────────────────────────────── */}
              <div className="canvas-share-url-row">
                <input
                  type="text"
                  readOnly
                  value={restrictedLink}
                  onFocus={(e) => e.target.select()}
                />
                <button type="button" onClick={copyRestrictedLink}>
                  {restrictedCopyStatus || "Copy"}
                </button>
              </div>
              <p className="canvas-share-hint">
                Anyone can open this link, but they'll need to verify an
                invited email (with a one-time code) before they see anything.
              </p>

              {/* ── Pending invites (not yet redeemed) ───────────── */}
              {pendingInvites && pendingInvites.length > 0 && (
                <div className="canvas-share-section">
                  <div className="canvas-share-section-title">
                    Invited, not yet joined ({pendingInvites.length})
                  </div>
                  {pendingInvites.map((inv) => (
                    <div key={inv.id} className="canvas-share-person-row">
                      <span className="canvas-share-person-name">
                        {inv.email}
                      </span>
                      <span className="canvas-share-invite-permission">
                        {inv.permission}
                      </span>
                      <button
                        type="button"
                        className="canvas-share-deny"
                        onClick={() => onRevokeInvite(inv.id)}
                        disabled={loading}
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
                (!accessRequests || accessRequests.length === 0) &&
                (!pendingInvites || pendingInvites.length === 0) && (
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