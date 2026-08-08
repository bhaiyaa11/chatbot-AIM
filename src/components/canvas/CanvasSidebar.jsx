import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";
import { showToast } from "./toast.js";
import "./Canvas.css";

// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


/*
 * Props:
 * - activeCanvasId: string|null
 * - onSelect(canvasId): called when the user clicks a canvas
 * - onCreated(canvasId): called after a new canvas is created, so the
 *   parent can navigate to it
 * - onDeleted(canvasId): called after a canvas is deleted, so the
 *   parent can clear the selection if it was the active one
 *
 * This is deliberately router-agnostic — wire onSelect/onCreated to
 * your router's navigate() if you're using react-router.
 */
function CanvasSidebar({ activeCanvasId, onSelect, onCreated, onDeleted }) {
  const { session } = useAuth();
  const currentUserId = session?.user?.id || null;

  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const authHeaders = () => {
    const token = session?.access_token;
    if (!token) return null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const loadCanvases = async () => {
    const headers = authHeaders();
    if (!headers) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/canvas`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to load canvases");
      setCanvases(data.canvases || []);
    } catch (err) {
      console.error("Failed to load canvases:", err);
      showToast(err.message || "Failed to load canvases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) loadCanvases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const createCanvas = async () => {
    const headers = authHeaders();
    if (!headers) return;

    try {
      setCreating(true);
      const res = await fetch(`${API_BASE_URL}/canvas`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title: "Untitled Canvas" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to create canvas");
      setCanvases((prev) => [data.canvas, ...prev]);
      onCreated?.(data.canvas.id);
    } catch (err) {
      console.error("Failed to create canvas:", err);
      showToast(err.message || "Failed to create canvas");
    } finally {
      setCreating(false);
    }
  };


  const handleDeleteClick = (e, canvasId) => {
  e.stopPropagation();
  setConfirmDeleteId(canvasId);
};

const handleConfirmDelete = async (e, canvas) => {
  e.stopPropagation();

  const headers = authHeaders();
  if (!headers) return;

  try {
    setDeletingId(canvas.id);

    const res = await fetch(`${API_BASE_URL}/canvas/${canvas.id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(
        data?.detail || "Failed to delete canvas"
      );
    }

    setCanvases((prev) =>
      prev.filter((c) => c.id !== canvas.id)
    );

    setConfirmDeleteId(null);

    onDeleted?.(canvas.id);
  } catch (err) {
    console.error("Failed to delete canvas:", err);
    showToast(err.message || "Failed to delete canvas");
  } finally {
    setDeletingId(null);
  }
};

const handleCancelDelete = (e) => {
  e.stopPropagation();
  setConfirmDeleteId(null);
};

  return (
  <aside
    className={`canvas-sidebar ${
      collapsed ? "collapsed" : ""
    }`}
  >
    {/* Collapse / Expand */}
    <button
      type="button"
      className="sidebar-toggle canvas-sidebar-toggle"
      onClick={() => setCollapsed((prev) => !prev)}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? "→" : "←"}
    </button>

    {!collapsed && (
      <>
        {/* Header */}
        <div className="canvas-sidebar-header">
          <span className="canvas-sidebar-title">
            Canvas
          </span>

          <NotificationBell />
        </div>

        {/* New Canvas */}
        <button
          type="button"
          className="canvas-sidebar-new-btn"
          onClick={createCanvas}
          disabled={creating}
        >
          {creating ? "Creating…" : "+ New Canvas"}
        </button>

        {/* Canvas List */}
        <div className="canvas-sidebar-list">
          {loading && (
            <p className="canvas-share-hint">
              Loading…
            </p>
          )}

          {!loading && canvases.length === 0 && (
            <p className="canvas-share-hint">
              No canvases yet.
            </p>
          )}

          {canvases.map((c) => (
            <div
              key={c.id}
              className={`canvas-sidebar-item ${
                c.id === activeCanvasId ? "active" : ""
              }`}
              onClick={() => onSelect?.(c.id)}
            >
              <div className="canvas-sidebar-item-main">
                <span className="canvas-sidebar-item-title">
                  {c.title || "Untitled Canvas"}
                </span>

                <span className="canvas-sidebar-item-date">
                  {new Date(c.updated_at).toLocaleDateString()}
                </span>
              </div>

              {c.owner_id === currentUserId && (
                <>
                  {confirmDeleteId === c.id ? (
                    <div className="canvas-confirm-delete-bar">
                      <span>Delete canvas?</span>

                      <button
                        type="button"
                        className="confirm-delete-btn"
                        onClick={(e) =>
                          handleConfirmDelete(e, c)
                        }
                        disabled={deletingId === c.id}
                      >
                        {deletingId === c.id
                          ? "…"
                          : "Delete"}
                      </button>

                      <button
                        type="button"
                        className="confirm-cancel-btn"
                        onClick={handleCancelDelete}
                        disabled={deletingId === c.id}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="canvas-sidebar-item-delete"
                      title="Delete canvas"
                      onClick={(e) =>
                        handleDeleteClick(e, c.id)
                      }
                      disabled={deletingId === c.id}
                    >
                      🗑
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </>
    )}
  </aside>
);
}

export default CanvasSidebar;





