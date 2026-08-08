import { useState } from "react";
import CanvasSidebar from "./CanvasSidebar.jsx";
import CanvasAccessGate from "./CanvasAccessGate.jsx";
import ToastHost from "./ToastHost.jsx";
import "./Canvas.css";

/*
 * Drop this in wherever <Canvas /> is currently rendered (e.g. App.jsx).
 * No router needed — "which canvas is open" is just local state here.
 * If you add React Router later, swap selectedCanvasId for a route
 * param and onSelect/onCreated for navigate() — CanvasSidebar and
 * CanvasAccessGate don't need to change either way.
 */
function CanvasWorkspace() {
  const [selectedCanvasId, setSelectedCanvasId] = useState(null);

  return (
    <div className="canvas-workspace">
      <CanvasSidebar
        activeCanvasId={selectedCanvasId}
        onSelect={setSelectedCanvasId}
        onCreated={setSelectedCanvasId}
        onDeleted={(id) => {
          if (id === selectedCanvasId) setSelectedCanvasId(null);
        }}
      />

      <div className="canvas-workspace-main">
        {selectedCanvasId ? (
          <CanvasAccessGate canvasId={selectedCanvasId} />
        ) : (
          <div className="canvas-workspace-empty">
            <p>Select a canvas from the sidebar, or create a new one.</p>
          </div>
        )}
      </div>

      <ToastHost />
    </div>
  );
}

export default CanvasWorkspace;