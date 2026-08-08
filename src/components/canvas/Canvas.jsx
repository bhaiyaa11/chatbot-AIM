import { useState, useEffect, useRef } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";

import { useAuth } from "../../contexts/AuthContext.jsx";
import CommentMark from "./CommentMark.js";
import SharePanel from "./SharePanel.jsx";
import CommentsPanel from "./CommentsPanel.jsx";
import { showToast } from "./toast.js";

import "./Canvas.css";

// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ─────────────────────────────────────────────
   MARKDOWN TABLE PARSER
───────────────────────────────────────────── */

function parseMarkdownTable(text) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  const isTableRow = (line) =>
    line.startsWith("|") && line.endsWith("|") && line.split("|").length >= 3;

  if (!isTableRow(lines[0]) || !isTableRow(lines[1])) return null;

  const separatorCells = lines[1]
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

  const isSeparator = separatorCells.every((cell) => /^:?-{3,}:?$/.test(cell));
  if (!isSeparator) return null;

  const rows = [];
  const dataLines = [lines[0], ...lines.slice(2)];

  for (const line of dataLines) {
    if (!isTableRow(line)) continue;
    rows.push(line.split("|").slice(1, -1).map((cell) => cell.trim()));
  }

  if (rows.length === 0) return null;

  const columnCount = rows[0].length;

  return rows.map((row) => {
    const normalized = [...row];
    while (normalized.length < columnCount) normalized.push("");
    return normalized.slice(0, columnCount);
  });
}

function markdownTableToTiptap(text) {
  const rows = parseMarkdownTable(text);
  if (!rows) return null;

  return {
    type: "table",
    attrs: { class: null },
    content: rows.map((row, rowIndex) => ({
      type: "tableRow",
      content: row.map((cell) => ({
        type: rowIndex === 0 ? "tableHeader" : "tableCell",
        content: [
          {
            type: "paragraph",
            content: cell ? [{ type: "text", text: cell }] : [],
          },
        ],
      })),
    })),
  };
}

/* ─────────────────────────────────────────────
   TOOLBAR BUTTON
───────────────────────────────────────────── */

function ToolbarButton({ onClick, active, children, title }) {
  return (
    <button
      type="button"
      className={`canvas-toolbar-button ${active ? "active" : ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   CANVAS
───────────────────────────────────────────── */

/*
 * Props:
 * - canvasId: existing canvas id. If omitted, a new canvas is created
 *   on the backend on mount and this component adopts its id.
 * - accessLevel: "owner" | "editor" | "commenter" | "viewer".
 *   Normally supplied by CanvasAccessGate after checking
 *   GET /canvas/{id}/access-status. Defaults to "owner" for the
 *   "create a brand-new canvas" path.
 */
function Canvas({ canvasId: canvasIdProp = null, accessLevel: accessLevelProp = null }) {
  const { session } = useAuth();

  const accessLevel = accessLevelProp || "owner";
  const editable = accessLevel === "owner" || accessLevel === "editor";
  const canComment = editable || accessLevel === "commenter";
  const currentUserId = session?.user?.id || null;

  const [canvasId, setCanvasId] = useState(canvasIdProp);
  const [title, setTitle] = useState("Untitled Canvas");
  const [saveStatus, setSaveStatus] = useState("Loading…");
  const [loaded, setLoaded] = useState(false);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);
  const [pendingAnchor, setPendingAnchor] = useState(null);
  const [composerText, setComposerText] = useState("");

  // Sharing (owner only)
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSettings, setShareSettings] = useState(null);
  const [members, setMembers] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [shareUrl, setShareUrl] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");

  const canvasIdRef = useRef(canvasIdProp);
  const sessionRef = useRef(session);
  const contentSaveTimer = useRef(null);
  const titleSaveTimer = useRef(null);
  const editorContainerRef = useRef(null);

  useEffect(() => {
    canvasIdRef.current = canvasId;
  }, [canvasId]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const authHeaders = () => {
    const token = sessionRef.current?.access_token;
    if (!token) return null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  /* ─────────────────────────────────────────
     CONTENT AUTOSAVE
  ───────────────────────────────────────── */

  const saveContent = async (json) => {
    const id = canvasIdRef.current;
    const headers = authHeaders();
    if (!id || !headers) return;

    try {
      setSaveStatus("Saving…");
      const res = await fetch(`${API_BASE_URL}/canvas/${id}/content`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ content: json }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("Saved");
    } catch (err) {
      console.error("Failed to save canvas content:", err);
      setSaveStatus("Failed to save");
    }
  };

  const editor = useEditor({
    editable,
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "canvas-table" },
      }),
      TableRow,
      TableHeader,
      TableCell,
      CommentMark,
      Placeholder.configure({
        placeholder: "Start writing or paste your script here...",
      }),
    ],

    content: "<p></p>",

    editorProps: {
      handlePaste(view, event) {
        const clipboardText = event.clipboardData?.getData("text/plain");
        if (!clipboardText) return false;

        const tableJSON = markdownTableToTiptap(clipboardText);
        if (!tableJSON) return false;

        event.preventDefault();
        editor?.chain().focus().insertContent(tableJSON).run();
        return true;
      },
    },

    onUpdate({ editor: ed }) {
      // Non-editors never persist doc mutations (their comment-highlight
      // marks are re-derived from stored anchors on load instead).
      if (!editable) return;
      setSaveStatus("Unsaved changes");
      if (contentSaveTimer.current) clearTimeout(contentSaveTimer.current);
      contentSaveTimer.current = setTimeout(() => {
        saveContent(ed.getJSON());
      }, 800);
    },

    onSelectionUpdate({ editor: ed }) {
      if (!canComment) return;
      const { from, to } = ed.state.selection;

      if (from === to) {
        setSelectionRect(null);
        setPendingAnchor(null);
        return;
      }

      const containerEl = editorContainerRef.current;
      if (!containerEl) return;

      const endCoords = ed.view.coordsAtPos(to);
      const containerRect = containerEl.getBoundingClientRect();

      // editorContainerRef is the ".canvas-document" element itself
      // (position: relative, not the scroll container), so its own
      // padding is already baked into coordsAtPos vs. this rect —
      // no manual scrollTop offset needed.
      setSelectionRect({
        top: endCoords.top - containerRect.top + 8,
        left: Math.min(
          Math.max(endCoords.left - containerRect.left, 0),
          containerRect.width - 170
        ),
      });

      setPendingAnchor({
        from,
        to,
        text: ed.state.doc.textBetween(from, to, " "),
      });
    },

    onFocus() {
      setSaveStatus((s) => (s === "Saving…" ? s : "Editing"));
    },
  });

  /* ─────────────────────────────────────────
     LOAD-OR-CREATE ON MOUNT
  ───────────────────────────────────────── */

  useEffect(() => {
    if (!session?.access_token || loaded) return;

    const applyCanvas = (canvas) => {
      setCanvasId(canvas.id);
      canvasIdRef.current = canvas.id;
      setTitle(canvas.title || "Untitled Canvas");

      const hasRealContent =
        canvas.content &&
        Array.isArray(canvas.content.content) &&
        canvas.content.content.length > 0;

      if (editor && hasRealContent) {
        editor.commands.setContent(canvas.content, false);
      }
    };

    const init = async () => {
      const headers = authHeaders();
      if (!headers) return;

      try {
        if (canvasIdProp) {
          const res = await fetch(`${API_BASE_URL}/canvas/${canvasIdProp}`, { headers });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.detail || "Failed to load canvas");
          applyCanvas(data.canvas);
        } else {
          const res = await fetch(`${API_BASE_URL}/canvas`, {
            method: "POST",
            headers,
            body: JSON.stringify({ title: "Untitled Canvas" }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.detail || "Failed to create canvas");
          applyCanvas(data.canvas);
        }
        setSaveStatus(editable ? "Saved" : "");
      } catch (err) {
        console.error("Failed to load/create canvas:", err);
        setSaveStatus("Failed to load canvas");
      } finally {
        setLoaded(true);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, editor, loaded]);

  useEffect(() => {
    return () => {
      if (contentSaveTimer.current) clearTimeout(contentSaveTimer.current);
      if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
    };
  }, []);

  /* ─────────────────────────────────────────
     COMMENTS
  ───────────────────────────────────────── */

  const loadComments = async () => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;

    try {
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/comments`, { headers });
      const data = await res.json();
      if (res.ok) setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setCommentsLoaded(true);
    }
  };

  useEffect(() => {
    if (loaded && canvasId) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, canvasId]);

  // Non-editors don't get marks embedded in saved content (they can't
  // save), so re-apply comment highlights client-side from the stored
  // anchors once both the doc and the comment list are ready.
  useEffect(() => {
    if (editable || !editor || !commentsLoaded) return;

    comments.forEach((c) => {
      if (c.resolved) return;
      try {
        editor
          .chain()
          .setTextSelection({ from: c.anchor_from, to: c.anchor_to })
          .setComment(c.id)
          .run();
      } catch {
        // Anchor no longer valid (doc changed upstream) — skip it.
      }
    });

    editor.commands.setTextSelection(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable, editor, commentsLoaded, comments.length]);

  // Click a highlighted span in the doc -> open its thread.
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const handler = (e) => {
      const target = e.target.closest?.("[data-comment-id]");
      if (!target) return;
      const commentId = target.getAttribute("data-comment-id");
      const comment = comments.find((c) => c.id === commentId);
      if (comment) selectCommentInDoc(comment);
      setCommentsOpen(true);
    };

    container.addEventListener("click", handler);
    return () => container.removeEventListener("click", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  const selectCommentInDoc = (comment) => {
    if (!editor) return;
    try {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: comment.anchor_from, to: comment.anchor_to })
        .run();

      const target = editorContainerRef.current?.querySelector(
        `[data-comment-id="${comment.id}"]`
      );
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      // Anchor no longer valid.
    }
  };

  const submitComment = async () => {
    const headers = authHeaders();
    if (!pendingAnchor || !composerText.trim() || !canvasId || !headers) return;

    try {
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: composerText.trim(),
          anchor_from: pendingAnchor.from,
          anchor_to: pendingAnchor.to,
          anchor_text: pendingAnchor.text,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to add comment");

      editor
        .chain()
        .setTextSelection({ from: pendingAnchor.from, to: pendingAnchor.to })
        .setComment(data.comment.id)
        .run();

      setComments((prev) => [...prev, data.comment]);
      setComposerText("");
      setSelectionRect(null);
      setPendingAnchor(null);
      setCommentsOpen(true);
    } catch (err) {
      console.error("Failed to add comment:", err);
      showToast(err.message || "Failed to add comment");
    }
  };

  const resolveComment = async (commentId, resolved) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/canvas/${canvasId}/comments/${commentId}/resolve`,
        { method: "PATCH", headers, body: JSON.stringify({ resolved }) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to update comment");
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? data.comment : c))
      );
      if (resolved) editor?.chain().setTextSelection(0).unsetComment().run();
    } catch (err) {
      console.error("Failed to resolve comment:", err);
    }
  };

  const deleteComment = async (commentId) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    if (!window.confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/comments/${commentId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || "Failed to delete comment");
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  /* ─────────────────────────────────────────
     TITLE
  ───────────────────────────────────────── */

  const handleTitleChange = (e) => {
    if (!editable) return;
    const value = e.target.value;
    setTitle(value);
    setSaveStatus("Unsaved changes");

    if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
    titleSaveTimer.current = setTimeout(async () => {
      const headers = authHeaders();
      if (!canvasId || !headers) return;

      try {
        setSaveStatus("Saving…");
        const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/title`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ title: value.trim() || "Untitled Canvas" }),
        });
        if (!res.ok) throw new Error("Save failed");
        setSaveStatus("Saved");
      } catch (err) {
        console.error("Failed to save title:", err);
        setSaveStatus("Failed to save");
      }
    }, 800);
  };

  /* ─────────────────────────────────────────
     SHARING
  ───────────────────────────────────────── */

  const loadShareData = async () => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;

    try {
      setShareLoading(true);

      const settingsRes = await fetch(`${API_BASE_URL}/canvas/${canvasId}/share`, { headers });
      const settingsData = await settingsRes.json();
      if (!settingsRes.ok) {
        throw new Error(settingsData?.detail || "Failed to load share settings");
      }
      setShareSettings(settingsData.share);

      if (settingsData.share.visibility === "restricted") {
        const [membersRes, requestsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/canvas/${canvasId}/members`, { headers }),
          fetch(`${API_BASE_URL}/canvas/${canvasId}/access-requests`, { headers }),
        ]);
        const membersData = await membersRes.json();
        const requestsData = await requestsRes.json();
        if (membersRes.ok) setMembers(membersData.members || []);
        if (requestsRes.ok) setAccessRequests(requestsData.requests || []);
      }
    } catch (err) {
      console.error("Failed to load share data:", err);
    } finally {
      setShareLoading(false);
    }
  };

  const openShare = async () => {
    setShareOpen(true);
    setShareUrl(null);
    setCopyStatus("");
    await loadShareData();
  };

  const handleSetVisibility = async (visibility) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      setShareLoading(true);
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/visibility`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ visibility }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to update visibility");
      setShareUrl(null);
      await loadShareData();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to update visibility");
    } finally {
      setShareLoading(false);
    }
  };

  const createOrRegenerateLink = async () => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;

    const hasLink = shareSettings?.has_active_link;
    const permission = shareSettings?.link_permission || "viewer";
    const endpoint = hasLink
      ? `${API_BASE_URL}/canvas/${canvasId}/share/regenerate`
      : `${API_BASE_URL}/canvas/${canvasId}/share`;

    try {
      setShareLoading(true);
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ permission }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to create share link");
      setShareUrl(data.share_url);
      await loadShareData();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to create share link");
    } finally {
      setShareLoading(false);
    }
  };

  const toggleLinkAccess = async (enabled) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      setShareLoading(true);
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/share`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ link_access_enabled: enabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to update sharing");
      setShareSettings(data.share);
      if (!enabled) setShareUrl(null);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to update sharing");
    } finally {
      setShareLoading(false);
    }
  };

  const changeLinkPermission = async (permission) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      setShareLoading(true);
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/share`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ permission }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to update permission");
      setShareSettings(data.share);
    } catch (err) {
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  };

  const inviteMember = async (email, permission) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      setShareLoading(true);
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/members`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email, permission }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to invite");
      await loadShareData();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to invite that person");
    } finally {
      setShareLoading(false);
    }
  };

  const changeMemberPermission = async (memberId, permission) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      setShareLoading(true);
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/members/${memberId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ permission }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to update member");
      setMembers((prev) => prev.map((m) => (m.id === memberId ? data.member : m)));
    } catch (err) {
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  };

  const removeMember = async (memberId) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      setShareLoading(true);
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/members/${memberId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || "Failed to remove member");
      }
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  };

  const approveRequest = async (requestId, permission) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      setShareLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/canvas/${canvasId}/access-requests/${requestId}/approve`,
        { method: "POST", headers, body: JSON.stringify({ permission }) }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || "Failed to approve request");
      }
      await loadShareData();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to approve request");
    } finally {
      setShareLoading(false);
    }
  };

  const denyRequest = async (requestId) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      setShareLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/canvas/${canvasId}/access-requests/${requestId}/deny`,
        { method: "POST", headers }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || "Failed to deny request");
      }
      await loadShareData();
    } catch (err) {
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(""), 1500);
    } catch {
      setCopyStatus("Copy failed");
    }
  };

  if (!editor) {
    return null;
  }

  const statusLabel = editable
    ? saveStatus
    : canComment
    ? "Can comment"
    : "View only";

  return (
    <main className="canvas-page">
      {/* ───────────────────────── TOP BAR ───────────────────────── */}
      <div className="canvas-toolbar">
        <div className="canvas-title-wrapper">
          <input
            type="text"
            className="canvas-title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Canvas"
            readOnly={!editable}
          />
        </div>

        <div className="canvas-actions">
          <span className="canvas-save-status">{statusLabel}</span>

          <button
            type="button"
            className="canvas-share-btn"
            onClick={() => setCommentsOpen((v) => !v)}
          >
            Comments{comments.length ? ` (${comments.length})` : ""}
          </button>

          {accessLevel === "owner" && (
            <div className="canvas-share-wrapper">
              <button
                type="button"
                className="canvas-share-btn"
                onClick={openShare}
                disabled={!canvasId}
              >
                Share
              </button>

              {shareOpen && (
                <SharePanel
                  shareSettings={shareSettings}
                  members={members}
                  accessRequests={accessRequests}
                  loading={shareLoading}
                  onClose={() => setShareOpen(false)}
                  onCreateOrRegenerateLink={createOrRegenerateLink}
                  onToggleLinkAccess={toggleLinkAccess}
                  onChangeLinkPermission={changeLinkPermission}
                  onSetVisibility={handleSetVisibility}
                  onInviteMember={inviteMember}
                  onChangeMemberPermission={changeMemberPermission}
                  onRemoveMember={removeMember}
                  onApproveRequest={approveRequest}
                  onDenyRequest={denyRequest}
                  shareUrl={shareUrl}
                  copyStatus={copyStatus}
                  onCopyShareUrl={copyShareUrl}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────── FORMATTING TOOLBAR ───────────────────── */}
      {editable && (
        <div className="canvas-format-toolbar">
          <ToolbarButton
            title="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </ToolbarButton>

          <ToolbarButton
            title="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </ToolbarButton>

          <ToolbarButton
            title="Heading 1"
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </ToolbarButton>

          <ToolbarButton
            title="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </ToolbarButton>

          <div className="canvas-toolbar-divider" />

          <ToolbarButton
            title="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • List
          </ToolbarButton>

          <ToolbarButton
            title="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </ToolbarButton>

          <div className="canvas-toolbar-divider" />

          <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
            ↶
          </ToolbarButton>

          <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
            ↷
          </ToolbarButton>
        </div>
      )}

      {/* ───────────────────────── DOCUMENT ───────────────────────── */}
      <div className="canvas-body">
        <div className="canvas-document-area">
          <div className="canvas-document" ref={editorContainerRef}>
            <EditorContent editor={editor} className="canvas-editor" />

            {selectionRect && pendingAnchor && (
              <div
                className="canvas-comment-composer"
                style={{ top: selectionRect.top, left: selectionRect.left }}
              >
                <textarea
                  autoFocus
                  placeholder="Leave a comment…"
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                />
                <div className="canvas-comment-composer-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectionRect(null);
                      setPendingAnchor(null);
                      setComposerText("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="canvas-comment-submit"
                    onClick={submitComment}
                    disabled={!composerText.trim()}
                  >
                    Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {commentsOpen && (
          <CommentsPanel
            comments={comments}
            canComment={canComment}
            onSelectComment={selectCommentInDoc}
            onResolve={resolveComment}
            onDelete={deleteComment}
            onClose={() => setCommentsOpen(false)}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </main>
  );
}

export default Canvas;