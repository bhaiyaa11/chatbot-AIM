import { useState, useEffect, useRef } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import AudioEmbed from "./AudioEmbed.js";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";

import CommentMark from "./CommentMark.js";
import CommentsPanel from "./CommentsPanel.jsx";
import ToastHost from "./ToastHost.jsx";
import { showToast } from "./toast.js";




import "./Canvas.css";

const GUEST_NAME_KEY = "canvas_guest_name";

// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/*
 * Renders /shared/canvas/{token} — no login required.
 *
 * - "viewer" permission: read-only, no comments.
 * - "commenter" permission: read-only doc, but can leave comments —
 *   captures a name once (stored in localStorage) since there's no
 *   account to attach the comment to.
 * - "editor" permission: fully editable + can comment, same as above.
 */
function PublicCanvas({ token }) {
  const [title, setTitle] = useState("");
  const [permission, setPermission] = useState("viewer");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);
  const [pendingAnchor, setPendingAnchor] = useState(null);
  const [composerText, setComposerText] = useState("");

  const saveTimer = useRef(null);
  const editorContainerRef = useRef(null);

  const editable = permission === "editor";
  const canComment = permission === "commenter" || permission === "editor";

  // editorProps handlers (handleKeyDown, handlePaste, etc.) are bound
  // once when the editor is first created and are NOT reactively
  // re-synced by Tiptap on every render the way onUpdate/
  // onSelectionUpdate are — so reading `editable`/`canComment` directly
  // inside them means seeing whatever they were on the very first
  // render (permission's default "viewer"), forever, even after the
  // real permission loads in. Refs sidestep that entirely.
  const editableRef = useRef(editable);
  const canCommentRef = useRef(canComment);

  useEffect(() => {
    editableRef.current = editable;
  }, [editable]);

  useEffect(() => {
    canCommentRef.current = canComment;
  }, [canComment]);

  const editor = useEditor({
    // Same reasoning as Canvas.jsx: bind ProseMirror's editable flag
    // to canComment (not editable) so selection tracking is reliable
    // for commenter-permission links, and block real mutation via
    // input handlers instead. Server is still the actual boundary —
    // see update_public_canvas_content's link_permission check.
    editable: canComment,
    // extensions: [
    //   StarterKit,
    //   Table.configure({ resizable: false, HTMLAttributes: { class: "canvas-table" } }),
    //   TableRow,
    //   TableHeader,
    //   TableCell,
    //   CommentMark,
    //   Placeholder.configure({
        // placeholder: editable
        //   ? "Start writing or paste your script here..."
        //   : "This canvas is empty.",
    //   }),
    // ],
    

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
      Image,
      AudioEmbed,
      Placeholder.configure({
        placeholder: editable
          ? "Start writing or paste your script here..."
          : "This canvas is empty.",
      }),
    ],

    content: "<p></p>",

    editorProps: {
      handleKeyDown(view, event) {
        if (editableRef.current) return false;

        const navigationKeys = new Set([
          "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
          "Home", "End", "PageUp", "PageDown", "Tab", "Escape", "Shift",
        ]);
        const isCopy = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c";
        const isSelectAll = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a";

        if (navigationKeys.has(event.key) || isCopy || isSelectAll) return false;

        event.preventDefault();
        return true;
      },

      handleTextInput() {
        return !editableRef.current;
      },

      handlePaste(view, event) {
        if (!editableRef.current) {
          event.preventDefault();
          return true;
        }
        return false;
      },

      handleDrop(view, event) {
        if (!editableRef.current) {
          event.preventDefault();
          return true;
        }
        return false;
      },

      handleDOMEvents: {
        cut(view, event) {
          if (!editableRef.current) {
            event.preventDefault();
            return true;
          }
          return false;
        },
        beforeinput(view, event) {
          if (!editableRef.current) {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },

    onUpdate({ editor: ed }) {
      if (!editableRef.current) return;
      setSaveStatus("Unsaved changes");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveContent(ed.getJSON()), 800);
    },

    onSelectionUpdate({ editor: ed }) {
      if (!canCommentRef.current) return;
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
  });

  const saveContent = async (json) => {
    try {
      setSaveStatus("Saving…");
      const res = await fetch(`${API_BASE_URL}/shared/canvas/${token}/content`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: json }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("Saved");
    } catch (err) {
      console.error(err);
      setSaveStatus("Failed to save");
    }
  };

  /* ─────────────────────────────────────────
     LOAD CANVAS + COMMENTS
  ───────────────────────────────────────── */

  useEffect(() => {
    if (!token || loaded) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/shared/canvas/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || "This link is no longer valid.");

        setTitle(data.canvas.title || "Untitled Canvas");
        setPermission(data.canvas.permission || "viewer");

        const hasRealContent =
          data.canvas.content &&
          Array.isArray(data.canvas.content.content) &&
          data.canvas.content.content.length > 0;

        if (editor && hasRealContent) {
          editor.commands.setContent(data.canvas.content, false);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "This link is no longer valid.");
      } finally {
        setLoaded(true);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, editor, loaded]);

  const loadComments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/shared/canvas/${token}/comments`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || `Failed to load comments (HTTP ${res.status})`);
      }
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
      showToast(err.message || "Failed to load comments");
    } finally {
      setCommentsLoaded(true);
    }
  };

  useEffect(() => {
    if (loaded && token) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, token]);

  // Guest comment marks are never embedded in saved content (an
  // "editor" link does persist them normally through autosave, same
  // as the authenticated flow — this rehydration is only needed for
  // "commenter" permission, which can never save the doc).
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
        // Anchor no longer valid — skip it.
      }
    });

    editor.commands.setTextSelection(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable, editor, commentsLoaded, comments.length]);

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

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  /* ─────────────────────────────────────────
     GUEST COMMENTS
  ───────────────────────────────────────── */

  const getGuestName = () => {
    let name = window.localStorage.getItem(GUEST_NAME_KEY);
    if (!name) {
      name = window.prompt("Your name, so people know who commented:")?.trim();
      if (name) window.localStorage.setItem(GUEST_NAME_KEY, name);
    }
    return name || "Guest";
  };

  const submitComment = async () => {
    if (!pendingAnchor || !composerText.trim() || !token) return;
    const guestName = getGuestName();

    try {
      const res = await fetch(`${API_BASE_URL}/shared/canvas/${token}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: guestName,
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

  if (error) {
    return (
      <div className="canvas-gate">
        <div className="canvas-gate-card">
          <h2>Link unavailable</h2>
          <p>{error}</p>
        </div>
        <ToastHost />
      </div>
    );
  }

  if (!loaded || !editor) {
    return (
      <div className="canvas-gate">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <main className="canvas-page">
      <div className="canvas-toolbar">
        <div className="canvas-title-wrapper">
          <span className="canvas-title canvas-public-title">{title}</span>
        </div>

        <div className="canvas-actions">
          <span className="canvas-save-status">
            {editable ? saveStatus : canComment ? "Can comment" : "View only"}
          </span>

          {canComment && (
            <button
              type="button"
              className="canvas-share-btn"
              onClick={() => setCommentsOpen((v) => !v)}
            >
              Comments{comments.length ? ` (${comments.length})` : ""}
            </button>
          )}
        </div>
      </div>

      {!canComment && (
        <div className="canvas-public-banner">
          This link is view-only. Ask the canvas owner for comment or edit
          access if you need it.
        </div>
      )}

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
            onResolve={() => {}}
            onDelete={() => {}}
            onClose={() => setCommentsOpen(false)}
            currentUserId={null}
            readOnly
          />
        )}
      </div>

      <ToastHost />
    </main>
  );
}

export default PublicCanvas;