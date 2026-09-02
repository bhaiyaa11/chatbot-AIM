import { useState } from "react";
import CanvasSidebar from "./CanvasSidebar.jsx";
import CanvasAccessGate from "./CanvasAccessGate.jsx";
import ToastHost from "./ToastHost.jsx";
import "./Canvas.css";

// function CanvasWorkspace() {
//   const [selectedCanvasId, setSelectedCanvasId] = useState(null);

function CanvasWorkspace({ initialCanvasId = null }) {
  const [selectedCanvasId, setSelectedCanvasId] = useState(initialCanvasId);

  return (
    <div className="canvas-workspace">
      <CanvasSidebar
        activeCanvasId={selectedCanvasId}
        onSelect={setSelectedCanvasId}
        onCreated={setSelectedCanvasId}
        onDeleted={(id) => {
          if (id === selectedCanvasId) {
            setSelectedCanvasId(null);
          }
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