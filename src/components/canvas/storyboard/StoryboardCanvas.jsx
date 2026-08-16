import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import SceneCardNode from "./SceneCardNode.jsx";
import FrameNode from "./FrameNode.jsx";
import StickyCommentNode from "./StickyCommentNode.jsx";

const nodeTypes = {
  sceneCard: SceneCardNode,
  frame: FrameNode,
  stickyComment: StickyCommentNode,
};

// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FILMSTRIP_CARD_WIDTH = 220;
const FILMSTRIP_GAP_X = 32;
const FILMSTRIP_ROW_HEIGHT = 220;
const UNGROUPED_FRAME_KEY = "__ungrouped__";

function computeLinearPositions(storyboard) {
  const frames = storyboard.frames || [];
  const nodes = [...(storyboard.nodes || [])].sort(
    (a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0)
  );

  const frameOrder = [...frames.map((f) => f.id), UNGROUPED_FRAME_KEY];
  const positions = {};
  const framePositions = {};

  let rowY = 0;
  frameOrder.forEach((frameId) => {
    const rowNodes = nodes.filter((n) =>
      frameId === UNGROUPED_FRAME_KEY ? !n.frameId : n.frameId === frameId
    );
    if (rowNodes.length === 0) return;

    rowNodes.forEach((n, i) => {
      positions[n.id] = {
        x: i * (FILMSTRIP_CARD_WIDTH + FILMSTRIP_GAP_X) + 40,
        y: rowY + 50,
      };
    });

    if (frameId !== UNGROUPED_FRAME_KEY) {
      framePositions[frameId] = {
        x: 0,
        y: rowY,
        w: rowNodes.length * (FILMSTRIP_CARD_WIDTH + FILMSTRIP_GAP_X) + 60,
        h: FILMSTRIP_ROW_HEIGHT,
      };
    }

    rowY += FILMSTRIP_ROW_HEIGHT + 20;
  });

  return { positions, framePositions };
}

/* ─────────────────────────────────────────────
   Inner component — rendered INSIDE ReactFlowProvider so it can use
   useReactFlow() (needed to convert a click's screen position into
   flow/canvas coordinates for placing a new pinned comment).
───────────────────────────────────────────── */
function StoryboardCanvasInner({
  storyboard,
  viewMode,
  editable,
  onJumpToScene,
  comments,
  currentUserId,
  canManageComment,
  onCreateComment,
  onResolveComment,
  onDeleteComment,
  handleFrameLabelChange,
  updateStoryboard,
}) {
  const { screenToFlowPosition } = useReactFlow();
  const wrapperRef = useRef(null);

  const [commentMode, setCommentMode] = useState(false);
  const [composer, setComposer] = useState(null); // { screenX, screenY, flowX, flowY, text }

  const commentCountByNodeId = useMemo(() => {
    const counts = {};
    comments.forEach((c) => {
      if (c.node_id && !c.resolved) counts[c.node_id] = (counts[c.node_id] || 0) + 1;
    });
    return counts;
  }, [comments]);

  const builtNodes = useMemo(() => {
    const frames = storyboard.frames || [];
    const sceneNodes = storyboard.nodes || [];

    let frameRfNodes, sceneRfNodes;

    if (viewMode === "freeform") {
      frameRfNodes = frames.map((f) => ({
        id: f.id,
        type: "frame",
        position: f.freeformPosition || { x: 0, y: 0 },
        style: { width: f.freeformSize?.w || 640, height: f.freeformSize?.h || 320 },
        data: { label: f.label, editable, onLabelChange: handleFrameLabelChange },
        draggable: editable,
        zIndex: 0,
      }));

      sceneRfNodes = sceneNodes.map((n) => ({
        id: n.id,
        type: "sceneCard",
        position: n.freeformPosition || { x: 0, y: 0 },
        parentNode: n.frameId || undefined,
        extent: n.frameId ? "parent" : undefined,
        draggable: editable,
        zIndex: 1,
        data: {
          ...n.data,
          onJumpToScene,
          onOpenComments: () => {},
          commentCount: commentCountByNodeId[n.id] || 0,
        },
      }));
    } else {
      const { positions, framePositions } = computeLinearPositions(storyboard);

      frameRfNodes = frames
        .filter((f) => framePositions[f.id])
        .map((f) => ({
          id: f.id,
          type: "frame",
          position: { x: framePositions[f.id].x, y: framePositions[f.id].y },
          style: { width: framePositions[f.id].w, height: framePositions[f.id].h },
          data: { label: f.label, editable, onLabelChange: handleFrameLabelChange },
          draggable: false,
          selectable: false,
          zIndex: 0,
        }));

      sceneRfNodes = sceneNodes.map((n) => ({
        id: n.id,
        type: "sceneCard",
        position: positions[n.id] || { x: 0, y: 0 },
        draggable: editable,
        zIndex: 1,
        data: {
          ...n.data,
          onJumpToScene,
          onOpenComments: () => {},
          commentCount: commentCountByNodeId[n.id] || 0,
        },
      }));
    }

    // Pinned comments — always shown at their raw (pin_x, pin_y), in
    // both view modes. In linear mode this means a pin's position is
    // independent of the computed row layout — acceptable for v1;
    // a future pass could re-anchor node-attached pins to their
    // scene card's current computed position instead.
    const commentRfNodes = comments.map((c) => ({
      id: c.id,
      type: "stickyComment",
      position: { x: c.pin_x, y: c.pin_y },
      draggable: false,
      zIndex: 2,
      data: {
        content: c.content,
        authorLabel: c.guest_name || (c.author_id === currentUserId ? "You" : "Team member"),
        resolved: c.resolved,
        canManage: canManageComment(c),
        onResolve: onResolveComment,
        onDelete: onDeleteComment,
      },
    }));

    return [...frameRfNodes, ...sceneRfNodes, ...commentRfNodes];
  }, [
    storyboard, viewMode, editable, onJumpToScene, commentCountByNodeId,
    handleFrameLabelChange, comments, currentUserId, canManageComment,
    onResolveComment, onDeleteComment,
  ]);

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(builtNodes);

  useEffect(() => {
    setRfNodes(builtNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builtNodes]);

  const handleNodeDragStop = useCallback(
    (event, draggedNode) => {
      if (!editable || draggedNode.type !== "sceneCard") return;

      if (viewMode === "freeform") {
        updateStoryboard((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) =>
            n.id === draggedNode.id
              ? {
                  ...n,
                  freeformPosition: { x: draggedNode.position.x, y: draggedNode.position.y },
                  frameId: draggedNode.parentNode || null,
                }
              : n
          ),
        }));
        return;
      }

      updateStoryboard((prev) => {
        const targetFrameId =
          prev.nodes.find((n) => n.id === draggedNode.id)?.frameId || null;

        const rowNodeIds = rfNodes
          .filter((n) => n.type === "sceneCard")
          .filter((n) => {
            const stored = prev.nodes.find((sn) => sn.id === n.id);
            return (stored?.frameId || null) === targetFrameId;
          })
          .map((n) => (n.id === draggedNode.id ? { ...n, position: draggedNode.position } : n))
          .sort((a, b) => a.position.x - b.position.x)
          .map((n) => n.id);

        let cursor = 0;
        const nextNodes = prev.nodes.map((n) => {
          if ((n.frameId || null) !== targetFrameId) return n;
          const idx = rowNodeIds.indexOf(n.id);
          return idx === -1 ? n : { ...n, sortIndex: idx };
        });

        return { ...prev, nodes: nextNodes };
      });
    },
    [editable, viewMode, rfNodes, updateStoryboard]
  );

  const handlePaneClick = useCallback(
    (event) => {
      if (!commentMode || !editable) return;

      const flowPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const wrapperRect = wrapperRef.current?.getBoundingClientRect();

      setComposer({
        screenX: event.clientX - (wrapperRect?.left || 0),
        screenY: event.clientY - (wrapperRect?.top || 0),
        flowX: flowPos.x,
        flowY: flowPos.y,
        text: "",
      });
      setCommentMode(false);
    },
    [commentMode, editable, screenToFlowPosition]
  );

  const submitComposer = () => {
    if (!composer?.text?.trim()) {
      setComposer(null);
      return;
    }
    onCreateComment({ pin_x: composer.flowX, pin_y: composer.flowY, content: composer.text.trim() });
    setComposer(null);
  };

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "500px", background: "#0a0a0a" }}>
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          {["linear", "freeform"].map((mode) => (
            <ViewModeButtonPlaceholder key={mode} mode={mode} />
          ))}
        </div>
      </div>

      <div ref={wrapperRef} style={{ width: "100%", height: "calc(100% - 42px)", position: "relative" }}>
        <ReactFlow
          nodes={rfNodes}
          onNodesChange={editable ? onNodesChange : undefined}
          onNodeDragStop={handleNodeDragStop}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          nodesDraggable={editable}
          nodesConnectable={false}
          elementsSelectable={editable}
          proOptions={{ hideAttribution: true }}
          panOnDrag={!commentMode}
          style={{ cursor: commentMode ? "crosshair" : "default" }}
          fitView
        >
          <Background color="rgba(255,255,255,.06)" gap={24} />
          <Controls showInteractive={false} style={{ filter: "invert(1)" }} />
          <MiniMap
            style={{ background: "#111" }}
            nodeColor={() => "rgba(255,255,255,.2)"}
            maskColor="rgba(0,0,0,.7)"
          />
        </ReactFlow>

        {editable && (
          <button
            onClick={() => setCommentMode((v) => !v)}
            title="Drop a comment on the storyboard"
            style={{
              position: "absolute", top: 10, right: 10, zIndex: 10,
              display: "flex", alignItems: "center", gap: "6px",
              background: commentMode ? "rgba(255,255,255,.16)" : "rgba(17,17,17,.9)",
              border: "1px solid rgba(255,255,255,.15)", borderRadius: "9999px",
              color: "rgba(255,255,255,.85)", fontSize: "11px", fontFamily: "'Inter',sans-serif",
              padding: "6px 14px", cursor: "pointer",
            }}
          >
            💬 {commentMode ? "Click to place…" : "Comment"}
          </button>
        )}

        {composer && (
          <div
            style={{
              position: "absolute", top: composer.screenY, left: composer.screenX, zIndex: 20,
              width: 220, background: "#151515", border: "1px solid rgba(255,255,255,.15)",
              borderRadius: "10px", padding: "10px", boxShadow: "0 8px 24px rgba(0,0,0,.5)",
            }}
          >
            <textarea
              autoFocus
              placeholder="Leave a comment…"
              value={composer.text}
              onChange={(e) => setComposer((c) => ({ ...c, text: e.target.value }))}
              style={{
                width: "100%", minHeight: "60px", background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.1)", borderRadius: "6px",
                color: "rgba(255,255,255,.85)", fontSize: "12px", fontFamily: "'Inter',sans-serif",
                padding: "6px 8px", outline: "none", resize: "vertical", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "6px" }}>
              <button
                onClick={() => setComposer(null)}
                style={{ background: "none", border: "1px solid rgba(255,255,255,.12)", borderRadius: "9999px", color: "rgba(255,255,255,.5)", fontSize: "11px", padding: "4px 10px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={submitComposer}
                style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", borderRadius: "9999px", color: "rgba(255,255,255,.9)", fontSize: "11px", padding: "4px 10px", cursor: "pointer" }}
              >
                Comment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder kept trivial on purpose — real toggle rendered by the
// outer component below, which owns viewMode state.
function ViewModeButtonPlaceholder() {
  return null;
}

/* ─────────────────────────────────────────────
   Outer component — owns storyboard state, autosave, and viewMode;
   wraps everything in ReactFlowProvider.
───────────────────────────────────────────── */
function StoryboardCanvas({
  canvasId,
  authHeaders,
  initialStoryboard,
  editable,
  onJumpToScene,
  comments = [],
  currentUserId = null,
  onCreateComment,
  onResolveComment,
  onDeleteComment,
}) {
  const [storyboard, setStoryboard] = useState(
    initialStoryboard || { version: 1, viewMode: "linear", frames: [], nodes: [] }
  );
  const [viewMode, setViewMode] = useState(storyboard.viewMode || "linear");
  const [saveStatus, setSaveStatus] = useState("");

  const saveTimer = useRef(null);

  const saveStoryboard = useCallback(
    (next) => {
      if (!editable || !canvasId) return;
      const headers = authHeaders();
      if (!headers) return;

      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaveStatus("Saving…");
        try {
          const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/storyboard`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ storyboard: next }),
          });
          if (!res.ok) throw new Error("Save failed");
          setSaveStatus("Saved");
        } catch (err) {
          console.error("Failed to save storyboard:", err);
          setSaveStatus("Failed to save");
        }
      }, 800);
    },
    [canvasId, editable, authHeaders]
  );

  const updateStoryboard = useCallback(
    (updater) => {
      setStoryboard((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        saveStoryboard(next);
        return next;
      });
    },
    [saveStoryboard]
  );

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    updateStoryboard((prev) => ({ ...prev, viewMode: mode }));
  };

  const handleFrameLabelChange = useCallback(
    (frameId, label) => {
      updateStoryboard((prev) => ({
        ...prev,
        frames: prev.frames.map((f) => (f.id === frameId ? { ...f, label } : f)),
      }));
    },
    [updateStoryboard]
  );

  const canManageComment = useCallback(
    (comment) => editable || comment.author_id === currentUserId,
    [editable, currentUserId]
  );

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "500px", background: "#0a0a0a", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,.06)", flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          {["linear", "freeform"].map((mode) => (
            <button
              key={mode}
              onClick={() => handleSetViewMode(mode)}
              style={{
                background: viewMode === mode ? "rgba(255,255,255,.1)" : "transparent",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: "9999px",
                color: viewMode === mode ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.5)",
                fontSize: "11px", fontFamily: "'Inter',sans-serif",
                padding: "5px 14px", cursor: "pointer",
              }}
            >
              {mode === "linear" ? "Filmstrip" : "Freeform"}
            </button>
          ))}
        </div>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,.3)", fontFamily: "'Inter',sans-serif" }}>
          {editable ? saveStatus : "View only"}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ReactFlowProvider>
          <StoryboardCanvasInner
            storyboard={storyboard}
            viewMode={viewMode}
            editable={editable}
            onJumpToScene={onJumpToScene}
            comments={comments}
            currentUserId={currentUserId}
            canManageComment={canManageComment}
            onCreateComment={onCreateComment}
            onResolveComment={onResolveComment}
            onDeleteComment={onDeleteComment}
            handleFrameLabelChange={handleFrameLabelChange}
            updateStoryboard={updateStoryboard}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default StoryboardCanvas;