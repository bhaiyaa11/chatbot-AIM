// import { useState, useEffect, useRef, useCallback } from "react";

// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Image from "@tiptap/extension-image";
// import AudioEmbed from "./AudioEmbed.js";
// import { Table } from "@tiptap/extension-table";
// import { TableRow } from "@tiptap/extension-table-row";
// import { TableCell } from "@tiptap/extension-table-cell";
// import { TableHeader } from "@tiptap/extension-table-header";
// import Placeholder from "@tiptap/extension-placeholder";

// import { useAuth } from "../../contexts/AuthContext.jsx";
// import CommentMark from "./CommentMark.js";
// import SharePanel from "./SharePanel.jsx";
// import CommentsPanel from "./CommentsPanel.jsx";
// import { showToast } from "./toast.js";
// import StoryboardCanvas from "./storyboard/StoryboardCanvas.jsx";
// import Underline from "@tiptap/extension-underline";
// import TextAlign from "@tiptap/extension-text-align";
// import Color from "@tiptap/extension-color";
// import Highlight from "@tiptap/extension-highlight";
// import Link from "@tiptap/extension-link";
// import TaskList from "@tiptap/extension-task-list";
// import TaskItem from "@tiptap/extension-task-item";
// import CanvasToolbar from "./CanvasToolbar.jsx";

// import "./Canvas.css";

// const API_BASE_URL = "http://127.0.0.1:8000";
// // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// /* ─────────────────────────────────────────────
//    MARKDOWN TABLE PARSER
// ───────────────────────────────────────────── */

// function parseMarkdownTable(text) {
//   const lines = text
//     .trim()
//     .split(/\r?\n/)
//     .map((line) => line.trim())
//     .filter(Boolean);

//   if (lines.length < 2) return null;

//   const isTableRow = (line) =>
//     line.startsWith("|") && line.endsWith("|") && line.split("|").length >= 3;

//   if (!isTableRow(lines[0]) || !isTableRow(lines[1])) return null;

//   const separatorCells = lines[1]
//     .split("|")
//     .slice(1, -1)
//     .map((cell) => cell.trim());

//   const isSeparator = separatorCells.every((cell) => /^:?-{3,}:?$/.test(cell));
//   if (!isSeparator) return null;

//   const rows = [];
//   const dataLines = [lines[0], ...lines.slice(2)];

//   for (const line of dataLines) {
//     if (!isTableRow(line)) continue;
//     rows.push(line.split("|").slice(1, -1).map((cell) => cell.trim()));
//   }

//   if (rows.length === 0) return null;

//   const columnCount = rows[0].length;

//   return rows.map((row) => {
//     const normalized = [...row];
//     while (normalized.length < columnCount) normalized.push("");
//     return normalized.slice(0, columnCount);
//   });
// }

// function markdownTableToTiptap(text) {
//   const rows = parseMarkdownTable(text);
//   if (!rows) return null;

//   return {
//     type: "table",
//     attrs: { class: null },
//     content: rows.map((row, rowIndex) => ({
//       type: "tableRow",
//       content: row.map((cell) => ({
//         type: rowIndex === 0 ? "tableHeader" : "tableCell",
//         content: [
//           {
//             type: "paragraph",
//             content: cell ? [{ type: "text", text: cell }] : [],
//           },
//         ],
//       })),
//     })),
//   };
// }

// /* ─────────────────────────────────────────────
//    CANVAS
// ───────────────────────────────────────────── */

// /*
//  * Props:
//  * - canvasId: existing canvas id. If omitted, a new canvas is created
//  *   on the backend on mount and this component adopts its id.
//  * - accessLevel: "owner" | "editor" | "commenter" | "viewer".
//  *   Normally supplied by CanvasAccessGate after checking
//  *   GET /canvas/{id}/access-status. Defaults to "owner" for the
//  *   "create a brand-new canvas" path.
//  */
// function Canvas({ canvasId: canvasIdProp = null, accessLevel: accessLevelProp = null }) {
//   const { session } = useAuth();

//   const accessLevel = accessLevelProp || "owner";
//   const editable = accessLevel === "owner" || accessLevel === "editor";
//   const canComment = editable || accessLevel === "commenter";
//   const currentUserId = session?.user?.id || null;

//   const [canvasId, setCanvasId] = useState(canvasIdProp);
//   const [title, setTitle] = useState("Untitled Canvas");
//   const [saveStatus, setSaveStatus] = useState("Loading…");
//   const [loaded, setLoaded] = useState(false);

//   // Comments
//   const [comments, setComments] = useState([]);
//   const [commentsLoaded, setCommentsLoaded] = useState(false);
//   const [commentsOpen, setCommentsOpen] = useState(false);
//   const [selectionRect, setSelectionRect] = useState(null);
//   const [pendingAnchor, setPendingAnchor] = useState(null);
//   const [composerText, setComposerText] = useState("");

//   // Sharing (owner only)
//   const [shareOpen, setShareOpen] = useState(false);
//   const [shareLoading, setShareLoading] = useState(false);
//   const [shareSettings, setShareSettings] = useState(null);
//   const [members, setMembers] = useState([]);
//   const [accessRequests, setAccessRequests] = useState([]);
//   const [pendingInvites, setPendingInvites] = useState([]);
//   const [shareUrl, setShareUrl] = useState(null);
//   const [copyStatus, setCopyStatus] = useState("");

//   const canvasIdRef = useRef(canvasIdProp);
//   const sessionRef = useRef(session);
//   const contentSaveTimer = useRef(null);
//   const titleSaveTimer = useRef(null);
//   const editorContainerRef = useRef(null);

//   const [activeTab, setActiveTab] = useState("script"); // "script" | "storyboard"
//   const [storyboardData, setStoryboardData] = useState(null);
//   const [storyboardComments, setStoryboardComments] = useState([]);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [commentComposerOpen, setCommentComposerOpen] = useState(false);

//   useEffect(() => {
//     canvasIdRef.current = canvasId;
//   }, [canvasId]);

//   useEffect(() => {
//     sessionRef.current = session;
//   }, [session]);

//   // Kept in sync purely so the unmount-flush cleanup below (which runs
//   // once, with an empty dep array, so it fires only on unmount) can
//   // still read the latest editor instance / title instead of whatever
//   // was captured at mount time.
//   const editorRef = useRef(null);
//   const titleRef = useRef(title);

//   useEffect(() => {
//     titleRef.current = title;
//   }, [title]);

//   const authHeaders = () => {
//     const token = sessionRef.current?.access_token;
//     if (!token) return null;
//     return {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     };
//   };

//   /* ─────────────────────────────────────────
//      CONTENT AUTOSAVE
//   ───────────────────────────────────────── */

//   const saveContent = async (json) => {
//     const id = canvasIdRef.current;
//     const headers = authHeaders();
//     if (!id || !headers) return;

//     try {
//       setSaveStatus("Saving…");
//       const res = await fetch(`${API_BASE_URL}/canvas/${id}/content`, {
//         method: "PATCH",
//         headers,
//         body: JSON.stringify({ content: json }),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       setSaveStatus("Saved");
//     } catch (err) {
//       console.error("Failed to save canvas content:", err);
//       setSaveStatus("Failed to save");
//     }
//   };

//   const editor = useEditor({
//     // IMPORTANT: this is bound to canComment, not editable.
//     // ProseMirror's `editable` flag governs whether mouse-drag
//     // selection + onSelectionUpdate fire reliably — relying on it
//     // to ALSO gate content mutation is fragile across versions/
//     // browsers. So: keep the view interactive for anyone who can
//     // select text to comment (owner/editor/commenter), and block
//     // actual content changes explicitly in editorProps below.
//     // The real security boundary is server-side regardless (see
//     // update_canvas_content in canvas_manager.py) — this is UX,
//     // not the authorization check.
//     extensions: [
//       StarterKit,
//       Table.configure({
//         resizable: true,
//         HTMLAttributes: { class: "canvas-table" },
//       }),
//       TableRow,
//       TableHeader,
//       TableCell,
//       CommentMark,
//       // Image,
//       Image.configure({
//         HTMLAttributes: {
//           class: "canvas-storyboard-image",
//         },
//       }),
//       AudioEmbed,
//       Underline,
//       Color,
//       Highlight.configure({ multicolor: true }),
//       TextAlign.configure({ types: ["heading", "paragraph"] }),
//       Link.configure({
//         openOnClick: false,
//         autolink: true,
//         HTMLAttributes: { class: "canvas-link", rel: "noopener noreferrer" },
//       }),
//       TaskList,
//       TaskItem.configure({ nested: true }),
//       Placeholder.configure({
//         placeholder: "Start writing or paste your script here...",
//       }),
//     ],

//     content: "<p></p>",

//     editorProps: {
//       handleKeyDown(view, event) {
//         if (editable) return false;

//         // Viewer/commenter: allow navigation, selection, and copy —
//         // block anything that would mutate the document.
//         const navigationKeys = new Set([
//           "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
//           "Home", "End", "PageUp", "PageDown", "Tab", "Escape", "Shift",
//         ]);
//         const isCopy = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c";
//         const isSelectAll = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a";

//         if (navigationKeys.has(event.key) || isCopy || isSelectAll) return false;

//         event.preventDefault();
//         return true;
//       },

//       handleTextInput() {
//         return !editable;
//       },

//       handlePaste(view, event) {
//         if (!editable) {
//           event.preventDefault();
//           return true;
//         }

//         const clipboardText = event.clipboardData?.getData("text/plain");
//         if (!clipboardText) return false;

//         const tableJSON = markdownTableToTiptap(clipboardText);
//         if (!tableJSON) return false;

//         event.preventDefault();
//         editor?.chain().focus().insertContent(tableJSON).run();
//         return true;
//       },

//       handleDrop(view, event) {
//         if (!editable) {
//           event.preventDefault();
//           return true;
//         }
//         return false;
//       },


// handleDOMEvents: {
//   // ─────────────────────────────────────────────
//   // IMAGE CLICK
//   // ─────────────────────────────────────────────
//   mousedown(view, event) {
//     const target = event.target;

//     const image = target?.closest?.(
//       "img.canvas-storyboard-image"
//     );

//     if (!image) {
//       return false;
//     }

//     event.preventDefault();
//     event.stopPropagation();

//     setPreviewImage({
//       src: image.getAttribute("src") || "",
//       alt: image.getAttribute("alt") || "",
//     });

//     return true;
//   },

//   // ─────────────────────────────────────────────
//   // FINISHED TEXT SELECTION
//   // ─────────────────────────────────────────────
//   mouseup(view, event) {
//     if (!canComment) {
//       return false;
//     }

//     // Never trigger comments from image clicks.
//     const image = event.target?.closest?.(
//       "img.canvas-storyboard-image"
//     );

//     if (image) {
//       return false;
//     }

//     requestAnimationFrame(() => {
//       const ed = editorRef.current;

//       if (!ed) return;

//       const { from, to, empty } = ed.state.selection;

//       // No text selected.
//       if (empty || from === to) {
//         setSelectionRect(null);
//         setPendingAnchor(null);
//         setCommentComposerOpen(false);
//         return;
//       }

//       const selectedText = ed.state.doc
//         .textBetween(from, to, " ")
//         .trim();

//       // Ignore empty/whitespace selections.
//       if (!selectedText) {
//         setSelectionRect(null);
//         setPendingAnchor(null);
//         setCommentComposerOpen(false);
//         return;
//       }

//       // Ignore accidental tiny selections.
//       if (selectedText.length < 2) {
//         setSelectionRect(null);
//         setPendingAnchor(null);
//         setCommentComposerOpen(false);
//         return;
//       }

//       const containerEl = editorContainerRef.current;

//       if (!containerEl) return;

//       const endCoords = ed.view.coordsAtPos(to);
//       const containerRect =
//         containerEl.getBoundingClientRect();

//       setSelectionRect({
//         top: endCoords.top - containerRect.top + 8,
//         left: Math.min(
//           Math.max(
//             endCoords.left - containerRect.left,
//             0
//           ),
//           Math.max(containerRect.width - 170, 0)
//         ),
//       });

//       setPendingAnchor({
//         from,
//         to,
//         text: selectedText,
//       });

//       // New selection always starts with the small
//       // "Add comment" pill, not the full composer.
//       setCommentComposerOpen(false);
//       setComposerText("");
//     });

//     return false;
//   },

//   // ─────────────────────────────────────────────
//   // CUT
//   // ─────────────────────────────────────────────
//   cut(view, event) {
//     if (!editable) {
//       event.preventDefault();
//       return true;
//     }

//     return false;
//   },

//   // ─────────────────────────────────────────────
//   // BEFORE INPUT
//   // ─────────────────────────────────────────────
//   beforeinput(view, event) {
//     if (!editable) {
//       event.preventDefault();
//       return true;
//     }

//     return false;
//   },
// },
//     },

//     onUpdate({ editor: ed }) {
//       // Non-editors never persist doc mutations (their comment-highlight
//       // marks are re-derived from stored anchors on load instead).
//       // The input handlers above should already prevent this from
//       // firing for real edits, but the save call itself is gated on
//       // `editable` too — belt and suspenders.
//       if (!editable) return;
//       setSaveStatus("Unsaved changes");
//       if (contentSaveTimer.current) clearTimeout(contentSaveTimer.current);
//       contentSaveTimer.current = setTimeout(() => {
//         saveContent(ed.getJSON());
//       }, 800);
//     },

//     onSelectionUpdate({ editor: ed }) {
//   // Do NOT open the comment composer while the user is
//   // actively changing the selection.
//   //
//   // We intentionally keep this handler empty so normal
//   // text selection behaves like a normal text editor.
//   //
//   // The actual comment selection is handled on mouseup.
// },



//     onFocus() {
//   setSaveStatus((s) =>
//     s === "Saving…" ? s : "Editing"
//   );
// },

// onBlur() {
//   setTimeout(() => {
//     const active = document.activeElement;

//     if (
//       active?.closest?.(".canvas-comment-composer") ||
//       active?.closest?.(".canvas-add-comment-pill")
//     ) {
//       return;
//     }

//     if (!commentComposerOpen) {
//       setSelectionRect(null);
//       setPendingAnchor(null);
//     }
//   }, 0);
// },
//   });


//   useEffect(() => {
//     editorRef.current = editor;
//   }, [editor]);



  
//   /* ─────────────────────────────────────────
//      LOAD-OR-CREATE ON MOUNT
//   ───────────────────────────────────────── */

//   useEffect(() => {
//     if (!session?.access_token || loaded) return;

//     const applyCanvas = (canvas) => {
//       setCanvasId(canvas.id);
//       canvasIdRef.current = canvas.id;
//       setTitle(canvas.title || "Untitled Canvas");

//       const hasRealContent =
//         canvas.content &&
//         Array.isArray(canvas.content.content) &&
//         canvas.content.content.length > 0;

//       if (editor && hasRealContent) {
//         editor.commands.setContent(canvas.content, false);
//       }

//       setStoryboardData(
//         canvas.storyboard || { version: 1, viewMode: "linear", frames: [], nodes: [] }
//       );
//     };

//     const init = async () => {
//       const headers = authHeaders();
//       if (!headers) return;

//       try {
//         if (canvasIdProp) {
//           const res = await fetch(`${API_BASE_URL}/canvas/${canvasIdProp}`, { headers });
//           const data = await res.json();
//           if (!res.ok) throw new Error(data?.detail || "Failed to load canvas");
//           applyCanvas(data.canvas);
//         } else {
//           const res = await fetch(`${API_BASE_URL}/canvas`, {
//             method: "POST",
//             headers,
//             body: JSON.stringify({ title: "Untitled Canvas" }),
//           });
//           const data = await res.json();
//           if (!res.ok) throw new Error(data?.detail || "Failed to create canvas");
//           applyCanvas(data.canvas);
//         }
//         setSaveStatus(editable ? "Saved" : "");
//       } catch (err) {
//         console.error("Failed to load/create canvas:", err);
//         setSaveStatus("Failed to load canvas");
//       } finally {
//         setLoaded(true);
//       }
//     };

//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [session, editor, loaded]);

//   // Flush any pending debounced content/title save on unmount (e.g.
//   // switching canvases, tab close) instead of just clearing the
//   // timers — otherwise a quick edit-then-navigate-away within the
//   // 800ms debounce window is silently dropped. Cleanup fires once, so
//   // it reaches through refs for the latest editor/title/canvasId.
//   useEffect(() => {
//     return () => {
//       if (contentSaveTimer.current) {
//         clearTimeout(contentSaveTimer.current);
//         const ed = editorRef.current;
//         if (editable && ed) {
//           saveContent(ed.getJSON());
//         }
//       }
//       if (titleSaveTimer.current) {
//         clearTimeout(titleSaveTimer.current);
//         const id = canvasIdRef.current;
//         const headers = authHeaders();
//         if (editable && id && headers) {
//           // Fire-and-forget: an unmounting component can't await this.
//           fetch(`${API_BASE_URL}/canvas/${id}/title`, {
//             method: "PATCH",
//             headers,
//             body: JSON.stringify({ title: titleRef.current.trim() || "Untitled Canvas" }),
//           }).catch(() => {});
//         }
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ─────────────────────────────────────────
//      COMMENTS
//   ───────────────────────────────────────── */

//   const loadComments = async () => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;

//     try {
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/comments`, { headers });
//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data?.detail || `Failed to load comments (HTTP ${res.status})`);
//       }
//       setComments(data.comments || []);
//     } catch (err) {
//       console.error("Failed to load comments:", err);
//       showToast(err.message || "Failed to load comments");
//     } finally {
//       setCommentsLoaded(true);
//     }
//   };

//   useEffect(() => {
//     if (loaded && canvasId) loadComments();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [loaded, canvasId]);

//   // Non-editors don't get marks embedded in saved content (they can't
//   // save), so re-apply comment highlights client-side from the stored
//   // anchors once both the doc and the comment list are ready.
//   useEffect(() => {
//     if (editable || !editor || !commentsLoaded) return;

//     comments.forEach((c) => {
//       if (c.resolved) return;
//       try {
//         editor
//           .chain()
//           .setTextSelection({ from: c.anchor_from, to: c.anchor_to })
//           .setComment(c.id)
//           .run();
//       } catch {
//         // Anchor no longer valid (doc changed upstream) — skip it.
//       }
//     });

//     editor.commands.setTextSelection(0);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [editable, editor, commentsLoaded, comments.length]);

//   // Click a highlighted span in the doc -> open its thread.
//   useEffect(() => {
//     const container = editorContainerRef.current;
//     if (!container) return;

//     const handler = (e) => {
//       const target = e.target.closest?.("[data-comment-id]");
//       if (!target) return;
//       const commentId = target.getAttribute("data-comment-id");
//       const comment = comments.find((c) => c.id === commentId);
//       if (comment) selectCommentInDoc(comment);
//       setCommentsOpen(true);
//     };

//     container.addEventListener("click", handler);
//     return () => container.removeEventListener("click", handler);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [comments]);

//   const selectCommentInDoc = (comment) => {
//     if (!editor) return;
//     try {
//       editor
//         .chain()
//         .focus()
//         .setTextSelection({ from: comment.anchor_from, to: comment.anchor_to })
//         .run();

//       const target = editorContainerRef.current?.querySelector(
//         `[data-comment-id="${comment.id}"]`
//       );
//       target?.scrollIntoView({ behavior: "smooth", block: "center" });
//     } catch {
//       // Anchor no longer valid.
//     }
//   };

//   const handleJumpToScene = useCallback((sceneData) => {
//     setActiveTab("script");

//     // The Tiptap editor's DOM (including the AudioEmbed node's <audio>
//     // tag) only exists while the script tab is mounted — give React a
//     // beat to switch tabs and remount it before querying for the element.
//     setTimeout(() => {
//       const audioEl = editorContainerRef.current?.querySelector("audio");
//       if (!audioEl) {
//         showToast("No voiceover audio found in this script");
//         return;
//       }

//       if (typeof sceneData?.audioStart === "number") {
//         audioEl.currentTime = sceneData.audioStart;
//       }

//       audioEl.scrollIntoView({ behavior: "smooth", block: "center" });
//       audioEl.play().catch(() => {
//         // Autoplay can be blocked by the browser — the seek + scroll
//         // still happened, user just needs to hit play manually.
//       });
//     }, 50);
//   }, []);

//   const openCommentComposer = () => {
//   if (!pendingAnchor) return;

//   setCommentComposerOpen(true);
// };

// const cancelCommentSelection = () => {
//   setSelectionRect(null);
//   setPendingAnchor(null);
//   setComposerText("");
//   setCommentComposerOpen(false);

//   editor?.commands.setTextSelection(0);
// };

//   const submitComment = async () => {
//     const headers = authHeaders();
//     if (!pendingAnchor || !composerText.trim() || !canvasId || !headers) return;

//     try {
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/comments`, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({
//           content: composerText.trim(),
//           anchor_from: pendingAnchor.from,
//           anchor_to: pendingAnchor.to,
//           anchor_text: pendingAnchor.text,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.detail || "Failed to add comment");

//       editor
//         .chain()
//         .setTextSelection({ from: pendingAnchor.from, to: pendingAnchor.to })
//         .setComment(data.comment.id)
//         .run();

//       setComments((prev) => [...prev, data.comment]);
//       setComposerText("");
//       setSelectionRect(null);
//       setPendingAnchor(null);
//       setCommentComposerOpen(false);
//       setCommentsOpen(true);
//     } catch (err) {
//       console.error("Failed to add comment:", err);
//       showToast(err.message || "Failed to add comment");
//     }
//   };

//   const resolveComment = async (commentId, resolved) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;

//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/canvas/${canvasId}/comments/${commentId}/resolve`,
//         { method: "PATCH", headers, body: JSON.stringify({ resolved }) }
//       );
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.detail || "Failed to update comment");
//       setComments((prev) =>
//         prev.map((c) => (c.id === commentId ? data.comment : c))
//       );
//       if (resolved) editor?.chain().setTextSelection(0).unsetComment().run();
//     } catch (err) {
//       console.error("Failed to resolve comment:", err);
//     }
//   };

//   const deleteComment = async (commentId) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     if (!window.confirm("Delete this comment?")) return;

//     try {
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/comments/${commentId}`, {
//         method: "DELETE",
//         headers,
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data?.detail || "Failed to delete comment");
//       }
//       setComments((prev) => prev.filter((c) => c.id !== commentId));
//     } catch (err) {
//       console.error("Failed to delete comment:", err);
//     }
//   };

//   const loadStoryboardComments = async () => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/storyboard-comments`, { headers });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.detail || "Failed to load storyboard comments");
//       setStoryboardComments(data.comments || []);
//     } catch (err) {
//       console.error("Failed to load storyboard comments:", err);
//     }
//   };

//   useEffect(() => {
//     if (loaded && canvasId) loadStoryboardComments();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [loaded, canvasId]);

//   const createStoryboardComment = async ({ pin_x, pin_y, content, node_id }) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/storyboard-comments`, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({ pin_x, pin_y, content, node_id: node_id || null }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.detail || "Failed to add comment");
//       setStoryboardComments((prev) => [...prev, data.comment]);
//     } catch (err) {
//       console.error("Failed to create storyboard comment:", err);
//       showToast(err.message || "Failed to add comment");
//     }
//   };

//   useEffect(() => {
//   const handleShortcut = (event) => {
//     const isShortcut =
//       (event.metaKey || event.ctrlKey) &&
//       event.shiftKey &&
//       event.key.toLowerCase() === "m";

//     if (!isShortcut) return;

//     if (!canComment || !pendingAnchor) return;

//     event.preventDefault();

//     setCommentComposerOpen(true);
//   };

//   window.addEventListener("keydown", handleShortcut);

//   return () => {
//     window.removeEventListener("keydown", handleShortcut);
//   };
// }, [canComment, pendingAnchor]);

//   const resolveStoryboardComment = async (commentId, resolved) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/canvas/${canvasId}/storyboard-comments/${commentId}/resolve`,
//         { method: "PATCH", headers, body: JSON.stringify({ resolved }) }
//       );
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.detail || "Failed to update comment");
//       setStoryboardComments((prev) => prev.map((c) => (c.id === commentId ? data.comment : c)));
//     } catch (err) {
//       console.error("Failed to resolve storyboard comment:", err);
//     }
//   };

//   const deleteStoryboardComment = async (commentId) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/storyboard-comments/${commentId}`, {
//         method: "DELETE",
//         headers,
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data?.detail || "Failed to delete comment");
//       }
//       setStoryboardComments((prev) => prev.filter((c) => c.id !== commentId));
//     } catch (err) {
//       console.error("Failed to delete storyboard comment:", err);
//     }
//   };

//   /* ─────────────────────────────────────────
//      TITLE
//   ───────────────────────────────────────── */

//   const handleTitleChange = (e) => {
//     if (!editable) return;
//     const value = e.target.value;
//     setTitle(value);
//     setSaveStatus("Unsaved changes");

//     if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
//     titleSaveTimer.current = setTimeout(async () => {
//       const headers = authHeaders();
//       if (!canvasId || !headers) return;

//       try {
//         setSaveStatus("Saving…");
//         const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/title`, {
//           method: "PATCH",
//           headers,
//           body: JSON.stringify({ title: value.trim() || "Untitled Canvas" }),
//         });
//         if (!res.ok) throw new Error("Save failed");
//         setSaveStatus("Saved");
//       } catch (err) {
//         console.error("Failed to save title:", err);
//         setSaveStatus("Failed to save");
//       }
//     }, 800);
//   };

//   /* ─────────────────────────────────────────
//      SHARING
//   ───────────────────────────────────────── */

//   const loadShareData = async () => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;

//     try {
//       setShareLoading(true);

//       const settingsRes = await fetch(`${API_BASE_URL}/canvas/${canvasId}/share`, { headers });
//       const settingsData = await settingsRes.json();
//       if (!settingsRes.ok) {
//         throw new Error(settingsData?.detail || "Failed to load share settings");
//       }
//       setShareSettings(settingsData.share);

//       if (settingsData.share.visibility === "restricted") {
//         const [membersRes, requestsRes, invitesRes] = await Promise.all([
//           fetch(`${API_BASE_URL}/canvas/${canvasId}/members`, { headers }),
//           fetch(`${API_BASE_URL}/canvas/${canvasId}/access-requests`, { headers }),
//           fetch(`${API_BASE_URL}/canvas/${canvasId}/invites`, { headers }),
//         ]);
//         const membersData = await membersRes.json();
//         const requestsData = await requestsRes.json();
//         const invitesData = await invitesRes.json();
//         if (membersRes.ok) setMembers(membersData.members || []);
//         if (requestsRes.ok) setAccessRequests(requestsData.requests || []);
//         if (invitesRes.ok) setPendingInvites(invitesData.invites || []);
//       }
//     } catch (err) {
//       console.error("Failed to load share data:", err);
//       showToast(err.message || "Failed to load share settings");
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const openShare = async () => {
//     setShareOpen(true);
//     setShareUrl(null);
//     setCopyStatus("");
//     await loadShareData();
//   };

//   const handleSetVisibility = async (visibility) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       setShareLoading(true);
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/visibility`, {
//         method: "PATCH",
//         headers,
//         body: JSON.stringify({ visibility }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.detail || "Failed to update visibility");
//       setShareUrl(null);
//       await loadShareData();
//     } catch (err) {
//       console.error(err);
//       showToast(err.message || "Failed to update visibility");
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const createOrRegenerateLink = async () => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;

//     const hasLink = shareSettings?.has_active_link;
//     const permission = shareSettings?.link_permission || "viewer";
//     const endpoint = hasLink
//       ? `${API_BASE_URL}/canvas/${canvasId}/share/regenerate`
//       : `${API_BASE_URL}/canvas/${canvasId}/share`;

//     try {
//       setShareLoading(true);
//       const res = await fetch(endpoint, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({ permission }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.detail || "Failed to create share link");
//       setShareUrl(data.share_url);
//       await loadShareData();
//     } catch (err) {
//       console.error(err);
//       showToast(err.message || "Failed to create share link");
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const toggleLinkAccess = async (enabled) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       setShareLoading(true);
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/share`, {
//         method: "PATCH",
//         headers,
//         body: JSON.stringify({ link_access_enabled: enabled }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.detail || "Failed to update sharing");
//       setShareSettings(data.share);
//       if (!enabled) setShareUrl(null);
//     } catch (err) {
//       console.error(err);
//       showToast(err.message || "Failed to update sharing");
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const changeLinkPermission = async (permission) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       setShareLoading(true);
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/share`, {
//         method: "PATCH",
//         headers,
//         body: JSON.stringify({ permission }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.detail || "Failed to update permission");
//       setShareSettings(data.share);
//     } catch (err) {
//       console.error(err);
//       showToast(err.message || "Failed to update permission");
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const inviteMember = async (email, permission) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       setShareLoading(true);
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/members`, {
//         method: "POST",
//         headers,
//         body: JSON.stringify({ email, permission }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.detail || "Failed to invite");
//       await loadShareData();
//     } catch (err) {
//       console.error(err);
//       showToast(err.message || "Failed to invite that person");
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const changeMemberPermission = async (memberId, permission) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       setShareLoading(true);
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/members/${memberId}`, {
//         method: "PATCH",
//         headers,
//         body: JSON.stringify({ permission }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.detail || "Failed to update member");
//       setMembers((prev) => prev.map((m) => (m.id === memberId ? data.member : m)));
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const removeMember = async (memberId) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       setShareLoading(true);
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/members/${memberId}`, {
//         method: "DELETE",
//         headers,
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data?.detail || "Failed to remove member");
//       }
//       setMembers((prev) => prev.filter((m) => m.id !== memberId));
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const approveRequest = async (requestId, permission) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       setShareLoading(true);
//       const res = await fetch(
//         `${API_BASE_URL}/canvas/${canvasId}/access-requests/${requestId}/approve`,
//         { method: "POST", headers, body: JSON.stringify({ permission }) }
//       );
//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data?.detail || "Failed to approve request");
//       }
//       await loadShareData();
//     } catch (err) {
//       console.error(err);
//       showToast(err.message || "Failed to approve request");
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const denyRequest = async (requestId) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       setShareLoading(true);
//       const res = await fetch(
//         `${API_BASE_URL}/canvas/${canvasId}/access-requests/${requestId}/deny`,
//         { method: "POST", headers }
//       );
//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data?.detail || "Failed to deny request");
//       }
//       await loadShareData();
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const revokeInvite = async (inviteId) => {
//     const headers = authHeaders();
//     if (!canvasId || !headers) return;
//     try {
//       setShareLoading(true);
//       const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/invites/${inviteId}`, {
//         method: "DELETE",
//         headers,
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data?.detail || "Failed to revoke invite");
//       }
//       setPendingInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
//     } catch (err) {
//       console.error(err);
//       showToast(err.message || "Failed to revoke invite");
//     } finally {
//       setShareLoading(false);
//     }
//   };

//   const copyShareUrl = async () => {
//     if (!shareUrl) return;
//     try {
//       await navigator.clipboard.writeText(shareUrl);
//       setCopyStatus("Copied!");
//       setTimeout(() => setCopyStatus(""), 1500);
//     } catch {
//       setCopyStatus("Copy failed");
//     }
//   };

//   if (!editor) {
//     return null;
//   }

//   const statusLabel = editable
//     ? saveStatus
//     : canComment
//     ? "Can comment"
//     : "View only";

//   return (
//     <main className="canvas-page">
//       {/* ───────────────────────── TOP BAR ───────────────────────── */}
//       <div className="canvas-toolbar">
//         <div className="canvas-title-wrapper">
//           <input
//             type="text"
//             className="canvas-title"
//             value={title}
//             onChange={handleTitleChange}
//             placeholder="Untitled Canvas"
//             readOnly={!editable}
//           />
//         </div>

//         <div className="canvas-actions">
//           <div style={{ display: "flex", gap: "4px", marginRight: "8px" }}>
//             {["script", "storyboard"].map((tab) => (
//               <button
//                 key={tab}
//                 type="button"
//                 onClick={() => setActiveTab(tab)}
//                 style={{
//                   background: activeTab === tab ? "rgba(255,255,255,.1)" : "transparent",
//                   border: "1px solid rgba(255,255,255,.1)",
//                   borderRadius: "9999px",
//                   color: activeTab === tab ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.5)",
//                   fontSize: "11px",
//                   fontFamily: "'Inter',sans-serif",
//                   padding: "5px 14px",
//                   cursor: "pointer",
//                 }}
//               >
//                 {tab === "script" ? "Script" : "Storyboard"}
//               </button>
//             ))}
//           </div>

//           <span className="canvas-save-status">{statusLabel}</span>

//           <button
//             type="button"
//             className="canvas-share-btn"
//             onClick={() => setCommentsOpen((v) => !v)}
//           >
//             Comments{comments.length ? ` (${comments.length})` : ""}
//           </button>

//           {accessLevel === "owner" && (
//             <div className="canvas-share-wrapper">
//               <button
//                 type="button"
//                 className="canvas-share-btn"
//                 onClick={openShare}
//                 disabled={!canvasId}
//               >
//                 Share
//               </button>

//               {shareOpen && (
//                 <SharePanel
//                   canvasId={canvasId}
//                   shareSettings={shareSettings}
//                   members={members}
//                   accessRequests={accessRequests}
//                   pendingInvites={pendingInvites}
//                   loading={shareLoading}
//                   onClose={() => setShareOpen(false)}
//                   onCreateOrRegenerateLink={createOrRegenerateLink}
//                   onToggleLinkAccess={toggleLinkAccess}
//                   onChangeLinkPermission={changeLinkPermission}
//                   onSetVisibility={handleSetVisibility}
//                   onInviteMember={inviteMember}
//                   onChangeMemberPermission={changeMemberPermission}
//                   onRemoveMember={removeMember}
//                   onApproveRequest={approveRequest}
//                   onDenyRequest={denyRequest}
//                   onRevokeInvite={revokeInvite}
//                   shareUrl={shareUrl}
//                   copyStatus={copyStatus}
//                   onCopyShareUrl={copyShareUrl}
//                 />
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {activeTab === "script" && editable && <CanvasToolbar editor={editor} />}

//       {/* ───────────────────────── BODY (document/storyboard + comments) ───────────────────────── */}
//       <div className="canvas-body">
//         {activeTab === "script" && (
//           <div className="canvas-document-area">
//             <div className="canvas-document" ref={editorContainerRef}>
//               <EditorContent editor={editor} className="canvas-editor" />
//               {selectionRect && pendingAnchor && (
//   <>
//     {!commentComposerOpen ? (
//       // =====================================================
//       // ADD COMMENT PILL
//       // =====================================================
//       <button
//         type="button"
//         className="canvas-add-comment-pill"
//         onMouseDown={(e) => {
//           // Prevent the click from destroying the text selection.
//           e.preventDefault();
//         }}
//         onClick={openCommentComposer}
//         style={{
//           top: selectionRect.top,
//           left: selectionRect.left,
//         }}
//       >
//         <span className="canvas-add-comment-icon">💬</span>
//         <span>Add comment</span>
//       </button>
//     ) : (
//       // =====================================================
//       // COMMENT COMPOSER
//       // =====================================================
//       <div
//         className="canvas-comment-composer"
//         style={{
//           top: selectionRect.top,
//           left: selectionRect.left,
//         }}
//         onMouseDown={(e) => {
//           // Keep the stored text selection alive.
//           e.stopPropagation();
//         }}
//       >
//         <div className="canvas-comment-composer-header">
//           <span>Comment on selection</span>

//           <button
//             type="button"
//             className="canvas-comment-composer-close"
//             onMouseDown={(e) => e.preventDefault()}
//             onClick={cancelCommentSelection}
//             aria-label="Close comment composer"
//           >
//             ×
//           </button>
//         </div>

//         <div className="canvas-comment-selection-preview">
//           “{pendingAnchor.text}”
//         </div>

//         <textarea
//           autoFocus
//           placeholder="Write a comment…"
//           value={composerText}
//           onChange={(e) => setComposerText(e.target.value)}
//           onKeyDown={(e) => {
//             if (
//               (e.metaKey || e.ctrlKey) &&
//               e.key === "Enter"
//             ) {
//               e.preventDefault();

//               if (composerText.trim()) {
//                 submitComment();
//               }
//             }

//             if (e.key === "Escape") {
//               e.preventDefault();
//               cancelCommentSelection();
//             }
//           }}
//         />

//         <div className="canvas-comment-composer-actions">
//           <button
//             type="button"
//             onMouseDown={(e) => e.preventDefault()}
//             onClick={cancelCommentSelection}
//           >
//             Cancel
//           </button>

//           <button
//             type="button"
//             className="canvas-comment-submit"
//             onMouseDown={(e) => e.preventDefault()}
//             onClick={submitComment}
//             disabled={!composerText.trim()}
//           >
//             Comment
//           </button>
//         </div>

//         <div className="canvas-comment-shortcut">
//           ⌘↵ to comment · Esc to cancel
//         </div>
//       </div>
//     )}
//   </>
// )}
//             </div>
//           </div>
//         )}

//         {activeTab === "storyboard" && loaded && (
//           <div style={{ height: "100%", width: "100%" }}>
//             <StoryboardCanvas
//               canvasId={canvasId}
//               authHeaders={authHeaders}
//               initialStoryboard={storyboardData}
//               editable={editable}
//               comments={storyboardComments}
//               currentUserId={currentUserId}
//               onCreateComment={createStoryboardComment}
//               onResolveComment={resolveStoryboardComment}
//               onDeleteComment={deleteStoryboardComment}
//               onJumpToScene={handleJumpToScene}
//             />
//           </div>
//         )}

//         {commentsOpen && (
//           <CommentsPanel
//             comments={comments}
//             canComment={canComment}
//             onSelectComment={selectCommentInDoc}
//             onResolve={resolveComment}
//             onDelete={deleteComment}
//             onClose={() => setCommentsOpen(false)}
//             currentUserId={currentUserId}
//           />
//         )}
//       </div>
//       {/* =========================================================
//     IMAGE PREVIEW
//    ========================================================= */}

// {previewImage && (
//   <div
//     className="canvas-image-preview-overlay"
//     onMouseDown={() => setPreviewImage(null)}
//   >
//     <div
//       className="canvas-image-preview-container"
//       onMouseDown={(e) => e.stopPropagation()}
//     >
//       <button
//         type="button"
//         className="canvas-image-preview-close"
//         onClick={() => setPreviewImage(null)}
//         aria-label="Close image preview"
//       >
//         ×
//       </button>

//       <img
//         src={previewImage.src}
//         alt={previewImage.alt}
//         className="canvas-image-preview"
//       />
//     </div>
//   </div>
// )}
//     </main>
//   );
// }

// export default Canvas;
























import { useState, useEffect, useRef, useCallback } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import AudioEmbed from "./AudioEmbed.js";
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
import StoryboardCanvas from "./storyboard/StoryboardCanvas.jsx";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CanvasToolbar from "./CanvasToolbar.jsx";

import FontSize from "./extensions/FontSize.js";
import LineHeight from "./extensions/LineHeight.js";
import VideoEmbed from "./extensions/VideoEmbed.js";
import { uploadCanvasMedia, classifyFile } from "./mediaUpload.js";

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
  const [pendingInvites, setPendingInvites] = useState([]);
  const [shareUrl, setShareUrl] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");

  const canvasIdRef = useRef(canvasIdProp);
  const sessionRef = useRef(session);
  const contentSaveTimer = useRef(null);
  const titleSaveTimer = useRef(null);
  const editorContainerRef = useRef(null);

  const [activeTab, setActiveTab] = useState("script"); // "script" | "storyboard"
  const [storyboardData, setStoryboardData] = useState(null);
  const [storyboardComments, setStoryboardComments] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [commentComposerOpen, setCommentComposerOpen] = useState(false);

  useEffect(() => {
    canvasIdRef.current = canvasId;
  }, [canvasId]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const editorRef = useRef(null);
  const titleRef = useRef(title);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

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
      Image.configure({
        HTMLAttributes: {
          class: "canvas-storyboard-image",
        },
      }),
      AudioEmbed,
      VideoEmbed,
      FontSize,
      LineHeight,
      Underline,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "canvas-link", rel: "noopener noreferrer" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: "Start writing or paste your script here...",
      }),
    ],

    content: "<p></p>",

    editorProps: {
      handleKeyDown(view, event) {
        if (editable) return false;

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
        return !editable;
      },

      handlePaste(view, event) {
        if (!editable) {
          event.preventDefault();
          return true;
        }

        const files = Array.from(event.clipboardData?.files || []);
        const imageFile = files.find((f) => f.type.startsWith("image/"));
        if (imageFile) {
          event.preventDefault();
          uploadCanvasMedia(canvasIdRef.current, authHeaders, imageFile)
            .then((media) => {
              editor?.chain().focus().setImage({ src: media.url }).run();
            })
            .catch((err) => showToast(err.message || "Failed to upload pasted image"));
          return true;
        }

        const clipboardText = event.clipboardData?.getData("text/plain");
        if (!clipboardText) return false;

        const tableJSON = markdownTableToTiptap(clipboardText);
        if (!tableJSON) return false;

        event.preventDefault();
        editor?.chain().focus().insertContent(tableJSON).run();
        return true;
      },

      handleDrop(view, event) {
        if (!editable) {
          event.preventDefault();
          return true;
        }

        const files = Array.from(event.dataTransfer?.files || []);
        if (files.length === 0) return false;

        event.preventDefault();
        const file = files[0];
        const kind = classifyFile(file);
        if (!kind) {
          showToast("That file type isn't supported here.");
          return true;
        }

        const coords = { left: event.clientX, top: event.clientY };
        const dropPos = view.posAtCoords(coords)?.pos ?? view.state.selection.from;

        uploadCanvasMedia(canvasIdRef.current, authHeaders, file)
          .then((media) => {
            const nodeType = kind === "image" ? "image" : kind === "video" ? "videoEmbed" : "audioEmbed";
            const attrs = { src: media.url };
            editor?.chain().focus().insertContentAt(dropPos, { type: nodeType, attrs }).run();
          })
          .catch((err) => showToast(err.message || "Failed to upload dropped file"));

        return true;
      },


handleDOMEvents: {
  // ─────────────────────────────────────────────
  // IMAGE CLICK
  // ─────────────────────────────────────────────
  mousedown(view, event) {
    const target = event.target;

    const image = target?.closest?.(
      "img.canvas-storyboard-image"
    );

    if (!image) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();

    setPreviewImage({
      src: image.getAttribute("src") || "",
      alt: image.getAttribute("alt") || "",
    });

    return true;
  },

  // ─────────────────────────────────────────────
  // FINISHED TEXT SELECTION
  // ─────────────────────────────────────────────
  mouseup(view, event) {
    if (!canComment) {
      return false;
    }

    // Never trigger comments from image clicks.
    const image = event.target?.closest?.(
      "img.canvas-storyboard-image"
    );

    if (image) {
      return false;
    }

    requestAnimationFrame(() => {
      const ed = editorRef.current;

      if (!ed) return;

      const { from, to, empty } = ed.state.selection;

      // No text selected.
      if (empty || from === to) {
        setSelectionRect(null);
        setPendingAnchor(null);
        setCommentComposerOpen(false);
        return;
      }

      const selectedText = ed.state.doc
        .textBetween(from, to, " ")
        .trim();

      // Ignore empty/whitespace selections.
      if (!selectedText) {
        setSelectionRect(null);
        setPendingAnchor(null);
        setCommentComposerOpen(false);
        return;
      }

      // Ignore accidental tiny selections.
      if (selectedText.length < 2) {
        setSelectionRect(null);
        setPendingAnchor(null);
        setCommentComposerOpen(false);
        return;
      }

      const containerEl = editorContainerRef.current;

      if (!containerEl) return;

      const endCoords = ed.view.coordsAtPos(to);
      const containerRect =
        containerEl.getBoundingClientRect();

      const COMPOSER_HEIGHT = 190; // approx composer height incl. padding

      setSelectionRect({
        top: Math.min(
          Math.max(endCoords.top - containerRect.top + 8, 0),
          Math.max(containerRect.height - COMPOSER_HEIGHT, 0)
        ),
        left: Math.min(
          Math.max(
            endCoords.left - containerRect.left,
            0
          ),
          Math.max(containerRect.width - 170, 0)
        ),
      });

      setPendingAnchor({
        from,
        to,
        text: selectedText,
      });

      // New selection always starts with the small
      // "Add comment" pill, not the full composer.
      setCommentComposerOpen(false);
      setComposerText("");
    });

    return false;
  },

  // ─────────────────────────────────────────────
  // CUT
  // ─────────────────────────────────────────────
  cut(view, event) {
    if (!editable) {
      event.preventDefault();
      return true;
    }

    return false;
  },

  // ─────────────────────────────────────────────
  // BEFORE INPUT
  // ─────────────────────────────────────────────
  beforeinput(view, event) {
    if (!editable) {
      event.preventDefault();
      return true;
    }

    return false;
  },
},
    },

    onUpdate({ editor: ed }) {
      if (!editable) return;
      setSaveStatus("Unsaved changes");
      if (contentSaveTimer.current) clearTimeout(contentSaveTimer.current);
      contentSaveTimer.current = setTimeout(() => {
        saveContent(ed.getJSON());
      }, 800);
    },

    onSelectionUpdate({ editor: ed }) {
  // Do NOT open the comment composer while the user is
  // actively changing the selection.
  //
  // We intentionally keep this handler empty so normal
  // text selection behaves like a normal text editor.
  //
  // The actual comment selection is handled on mouseup.
},



    onFocus() {
  setSaveStatus((s) =>
    s === "Saving…" ? s : "Editing"
  );
},

onBlur() {
  setTimeout(() => {
    const active = document.activeElement;

    if (
      active?.closest?.(".canvas-comment-composer") ||
      active?.closest?.(".canvas-add-comment-pill")
    ) {
      return;
    }

    if (!commentComposerOpen) {
      setSelectionRect(null);
      setPendingAnchor(null);
    }
  }, 0);
},
  });


  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);



  
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

      setStoryboardData(
        canvas.storyboard || { version: 1, viewMode: "linear", frames: [], nodes: [] }
      );
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
      if (contentSaveTimer.current) {
        clearTimeout(contentSaveTimer.current);
        const ed = editorRef.current;
        if (editable && ed) {
          saveContent(ed.getJSON());
        }
      }
      if (titleSaveTimer.current) {
        clearTimeout(titleSaveTimer.current);
        const id = canvasIdRef.current;
        const headers = authHeaders();
        if (editable && id && headers) {
          fetch(`${API_BASE_URL}/canvas/${id}/title`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ title: titleRef.current.trim() || "Untitled Canvas" }),
          }).catch(() => {});
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (loaded && canvasId) loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, canvasId]);

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

  const handleJumpToScene = useCallback((sceneData) => {
    setActiveTab("script");

    setTimeout(() => {
      const audioEl = editorContainerRef.current?.querySelector("audio");
      if (!audioEl) {
        showToast("No voiceover audio found in this script");
        return;
      }

      if (typeof sceneData?.audioStart === "number") {
        audioEl.currentTime = sceneData.audioStart;
      }

      audioEl.scrollIntoView({ behavior: "smooth", block: "center" });
      audioEl.play().catch(() => {
        // Autoplay can be blocked by the browser — the seek + scroll
        // still happened, user just needs to hit play manually.
      });
    }, 50);
  }, []);

  const openCommentComposer = () => {
  if (!pendingAnchor) return;

  setCommentComposerOpen(true);
};

const cancelCommentSelection = () => {
  setSelectionRect(null);
  setPendingAnchor(null);
  setComposerText("");
  setCommentComposerOpen(false);

  editor?.commands.setTextSelection(0);
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
      setCommentComposerOpen(false);
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
      showToast(err.message || "Failed to delete comment");
    }
  };

  const loadStoryboardComments = async () => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/storyboard-comments`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to load storyboard comments");
      setStoryboardComments(data.comments || []);
    } catch (err) {
      console.error("Failed to load storyboard comments:", err);
    }
  };

  useEffect(() => {
    if (loaded && canvasId) loadStoryboardComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, canvasId]);

  const createStoryboardComment = async ({ pin_x, pin_y, content, node_id }) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/storyboard-comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ pin_x, pin_y, content, node_id: node_id || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to add comment");
      setStoryboardComments((prev) => [...prev, data.comment]);
    } catch (err) {
      console.error("Failed to create storyboard comment:", err);
      showToast(err.message || "Failed to add comment");
    }
  };

  useEffect(() => {
  const handleShortcut = (event) => {
    const isShortcut =
      (event.metaKey || event.ctrlKey) &&
      event.shiftKey &&
      event.key.toLowerCase() === "m";

    if (!isShortcut) return;

    if (!canComment || !pendingAnchor) return;

    event.preventDefault();

    setCommentComposerOpen(true);
  };

  window.addEventListener("keydown", handleShortcut);

  return () => {
    window.removeEventListener("keydown", handleShortcut);
  };
}, [canComment, pendingAnchor]);

  const resolveStoryboardComment = async (commentId, resolved) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/canvas/${canvasId}/storyboard-comments/${commentId}/resolve`,
        { method: "PATCH", headers, body: JSON.stringify({ resolved }) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to update comment");
      setStoryboardComments((prev) => prev.map((c) => (c.id === commentId ? data.comment : c)));
    } catch (err) {
      console.error("Failed to resolve storyboard comment:", err);
    }
  };

  const deleteStoryboardComment = async (commentId) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/storyboard-comments/${commentId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || "Failed to delete comment");
      }
      setStoryboardComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete storyboard comment:", err);
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
        const [membersRes, requestsRes, invitesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/canvas/${canvasId}/members`, { headers }),
          fetch(`${API_BASE_URL}/canvas/${canvasId}/access-requests`, { headers }),
          fetch(`${API_BASE_URL}/canvas/${canvasId}/invites`, { headers }),
        ]);
        const membersData = await membersRes.json();
        const requestsData = await requestsRes.json();
        const invitesData = await invitesRes.json();
        if (membersRes.ok) setMembers(membersData.members || []);
        if (requestsRes.ok) setAccessRequests(requestsData.requests || []);
        if (invitesRes.ok) setPendingInvites(invitesData.invites || []);
      }
    } catch (err) {
      console.error("Failed to load share data:", err);
      showToast(err.message || "Failed to load share settings");
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
      showToast(err.message || "Failed to update permission");
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

  const revokeInvite = async (inviteId) => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;
    try {
      setShareLoading(true);
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/invites/${inviteId}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || "Failed to revoke invite");
      }
      setPendingInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to revoke invite");
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
          <div style={{ display: "flex", gap: "4px", marginRight: "8px" }}>
            {["script", "storyboard"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? "rgba(255,255,255,.1)" : "transparent",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: "9999px",
                  color: activeTab === tab ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.5)",
                  fontSize: "11px",
                  fontFamily: "'Inter',sans-serif",
                  padding: "5px 14px",
                  cursor: "pointer",
                }}
              >
                {tab === "script" ? "Script" : "Storyboard"}
              </button>
            ))}
          </div>

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
                  canvasId={canvasId}
                  shareSettings={shareSettings}
                  members={members}
                  accessRequests={accessRequests}
                  pendingInvites={pendingInvites}
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
                  onRevokeInvite={revokeInvite}
                  shareUrl={shareUrl}
                  copyStatus={copyStatus}
                  onCopyShareUrl={copyShareUrl}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {activeTab === "script" && editable && (
        <CanvasToolbar editor={editor} canvasId={canvasId} authHeaders={authHeaders} />
      )}

      {/* ───────────────────────── BODY (document/storyboard + comments) ───────────────────────── */}
      <div className="canvas-body">
        {activeTab === "script" && (
          <div className="canvas-document-area">
            <div className="canvas-document" ref={editorContainerRef}>
              <EditorContent editor={editor} className="canvas-editor" />
              {selectionRect && pendingAnchor && (
  <>
    {!commentComposerOpen ? (
      // =====================================================
      // ADD COMMENT PILL
      // =====================================================
      <button
        type="button"
        className="canvas-add-comment-pill"
        onMouseDown={(e) => {
          // Prevent the click from destroying the text selection.
          e.preventDefault();
        }}
        onClick={openCommentComposer}
        style={{
          top: selectionRect.top,
          left: selectionRect.left,
        }}
      >
        <span className="canvas-add-comment-icon">💬</span>
        <span>Add comment</span>
      </button>
    ) : (
      // =====================================================
      // COMMENT COMPOSER
      // =====================================================
      <div
        className="canvas-comment-composer"
        style={{
          top: selectionRect.top,
          left: selectionRect.left,
        }}
        onMouseDown={(e) => {
          // Keep the stored text selection alive.
          e.stopPropagation();
        }}
      >
        <div className="canvas-comment-composer-header">
          <span>Comment on selection</span>

          <button
            type="button"
            className="canvas-comment-composer-close"
            onMouseDown={(e) => e.preventDefault()}
            onClick={cancelCommentSelection}
            aria-label="Close comment composer"
          >
            ×
          </button>
        </div>

        <div className="canvas-comment-selection-preview">
          "{pendingAnchor.text}"
        </div>

        <textarea
          autoFocus
          placeholder="Write a comment…"
          value={composerText}
          onChange={(e) => setComposerText(e.target.value)}
          onKeyDown={(e) => {
            if (
              (e.metaKey || e.ctrlKey) &&
              e.key === "Enter"
            ) {
              e.preventDefault();

              if (composerText.trim()) {
                submitComment();
              }
            }

            if (e.key === "Escape") {
              e.preventDefault();
              cancelCommentSelection();
            }
          }}
        />

        <div className="canvas-comment-composer-actions">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={cancelCommentSelection}
          >
            Cancel
          </button>

          <button
            type="button"
            className="canvas-comment-submit"
            onMouseDown={(e) => e.preventDefault()}
            onClick={submitComment}
            disabled={!composerText.trim()}
          >
            Comment
          </button>
        </div>

        <div className="canvas-comment-shortcut">
          ⌘↵ to comment · Esc to cancel
        </div>
      </div>
    )}
  </>
)}
            </div>
          </div>
        )}

        {activeTab === "storyboard" && loaded && (
          <div style={{ height: "100%", width: "100%" }}>
            <StoryboardCanvas
              canvasId={canvasId}
              authHeaders={authHeaders}
              initialStoryboard={storyboardData}
              editable={editable}
              comments={storyboardComments}
              currentUserId={currentUserId}
              onCreateComment={createStoryboardComment}
              onResolveComment={resolveStoryboardComment}
              onDeleteComment={deleteStoryboardComment}
              onJumpToScene={handleJumpToScene}
            />
          </div>
        )}

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
      {/* =========================================================
    IMAGE PREVIEW
   ========================================================= */}

{previewImage && (
  <div
    className="canvas-image-preview-overlay"
    onMouseDown={() => setPreviewImage(null)}
  >
    <div
      className="canvas-image-preview-container"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="canvas-image-preview-close"
        onClick={() => setPreviewImage(null)}
        aria-label="Close image preview"
      >
        ×
      </button>

      <img
        src={previewImage.src}
        alt={previewImage.alt}
        className="canvas-image-preview"
      />
    </div>
  </div>
)}
    </main>
  );
}

export default Canvas;