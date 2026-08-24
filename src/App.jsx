// import { useState } from "react";
// import "./App.css";

// import ChatWindow from "./components/chat_window.jsx";
// import Ssidebar from "./components/siderbar.jsx";
// import Sheader from "./components/sheader.jsx";
// import CanvasWorkspace from "./components/canvas/CanvasWorkspace.jsx";
// import PublicCanvas from "./components/canvas/PublicCanvas.jsx";
// import CanvasEntry from "./components/canvas/CanvasEntry.jsx";
// import Grainient from "./components/Grainient";

// import { ChatProvider } from "./contexts/ChatContext.jsx";
// import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
// import Login from "./user_login/login.jsx";

// function App() {
//   const { session, loading } = useAuth();

//   const [activeWorkspace, setActiveWorkspace] = useState("chat");
//   const [selectedCanvasId, setSelectedCanvasId] = useState(null);

//   if (window.location.pathname.startsWith("/shared/canvas/")) {
//     const token = window.location.pathname.split("/shared/canvas/")[1];
//     return <PublicCanvas token={token} />;
//   }

//   if (window.location.pathname.startsWith("/canvas-access/")) {
//     const canvasId = window.location.pathname.split("/canvas-access/")[1];
//     return <CanvasEntry canvasId={canvasId} />;
//   }

//   if (!session) {
//     return <Login />;
//   }

//   return (
//     <AuthProvider>
//       <ChatProvider>
//         <Sheader />

//         <div className="app-layout">
//         {/* ONE SHARED BACKGROUND */}
//         <div className="workspace-background">

// <Grainient
//   color1="#12122d"
//   color2="#3c2f5f"
//   color3="#2c1a5d"
//   timeSpeed={0.15}
//   colorBalance={0}
//   warpStrength={0}
//   warpFrequency={0}
//   warpSpeed={0.1}
//   warpAmplitude={5}
//   blendAngle={90}
//   blendSoftness={0.21}
//   rotationAmount={0}
//   noiseScale={0}
//   grainAmount={0.05}
//   grainScale={1.5}
//   grainAnimated={false}
//   contrast={1.3}
//   gamma={1.0}
//   saturation={0.9}
//   centerX={0}
//   centerY={0}
//   zoom={1}
// />


//         </div>

//           <Ssidebar
//             onOpenChat={() => setActiveWorkspace("chat")}
//             onOpenCanvas={() => setActiveWorkspace("canvas")}
//           />

//           {activeWorkspace === "chat" && (
//             <ChatWindow
//               onShareToCanvas={(canvasId) => {
//                 setSelectedCanvasId(canvasId);
//                 setActiveWorkspace("canvas");
//               }}
//             />
//           )}

//           {activeWorkspace === "canvas" && (
//             <CanvasWorkspace
//               activeCanvasId={selectedCanvasId}
//               onSelect={setSelectedCanvasId}
//               onCreated={setSelectedCanvasId}
//               onDeleted={(id) => {
//                 if (id === selectedCanvasId) setSelectedCanvasId(null);
//               }}
//             />
//           )}

//         </div>
//       </ChatProvider>
//     </AuthProvider>
//   );
// }

// export default App;










import { useState } from "react";
import "./App.css";

import ChatWindow from "./components/chat_window.jsx";
import Ssidebar from "./components/siderbar.jsx";
import Sheader from "./components/sheader.jsx";
import CanvasWorkspace from "./components/canvas/CanvasWorkspace.jsx";
import PublicCanvas from "./components/canvas/PublicCanvas.jsx";
import CanvasEntry from "./components/canvas/CanvasEntry.jsx";
import Grainient from "./components/Grainient";

import { ChatProvider } from "./contexts/ChatContext.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import Login from "./user_login/login.jsx";

function App() {
  const { session, loading } = useAuth();

  const [activeWorkspace, setActiveWorkspace] = useState("chat");
  const [selectedCanvasId, setSelectedCanvasId] = useState(null);

  // ------------------------------------------------------------
  // PUBLIC SHARED CANVAS
  // /shared/canvas/{token}
  // ------------------------------------------------------------
  if (window.location.pathname.startsWith("/shared/canvas/")) {
    const token = window.location.pathname.split("/shared/canvas/")[1];

    return <PublicCanvas token={token} />;
  }

  // ------------------------------------------------------------
  // CANVAS ACCESS LINK
  // /canvas-access/{canvasId}
  // ------------------------------------------------------------
  if (window.location.pathname.startsWith("/canvas-access/")) {
    const canvasId = window.location.pathname.split("/canvas-access/")[1];

    return <CanvasEntry canvasId={canvasId} />;
  }

  // ------------------------------------------------------------
  // CANVAS WORKSPACE
  // /canvas
  //
  // Opens the Canvas workspace without selecting a canvas.
  // ------------------------------------------------------------
  if (window.location.pathname === "/canvas") {
    return <CanvasWorkspace />;
  }

  // ------------------------------------------------------------
  // SPECIFIC CANVAS
  // /canvas/{canvasId}
  //
  // Used by "Share to Canvas" so the newly created canvas
  // opens directly in the new tab.
  // ------------------------------------------------------------
  if (window.location.pathname.startsWith("/canvas/")) {
    const canvasId = window.location.pathname.split("/canvas/")[1];

    return (
      <CanvasWorkspace
        initialCanvasId={canvasId}
      />
    );
  }

  // ------------------------------------------------------------
  // AUTHENTICATION
  // ------------------------------------------------------------
  if (!session) {
    return <Login />;
  }

  // ------------------------------------------------------------
  // MAIN APPLICATION
  // ------------------------------------------------------------
  return (
    <AuthProvider>
      <ChatProvider>
        <Sheader />

        <div className="app-layout">

          {/* ONE SHARED BACKGROUND */}
          <div className="workspace-background">
            <Grainient
              color1="#12122d"
              color2="#3c2f5f"
              color3="#2c1a5d"
              timeSpeed={0.15}
              colorBalance={0}
              warpStrength={0}
              warpFrequency={0}
              warpSpeed={0.1}
              warpAmplitude={5}
              blendAngle={90}
              blendSoftness={0.21}
              rotationAmount={0}
              noiseScale={0}
              grainAmount={0.05}
              grainScale={1.5}
              grainAnimated={false}
              contrast={1.3}
              gamma={1.0}
              saturation={0.9}
              centerX={0}
              centerY={0}
              zoom={1}
            />
          </div>

          {/* SIDEBAR */}
          <Ssidebar
            onOpenChat={() => setActiveWorkspace("chat")}
            onOpenCanvas={() => {
              window.open(
                "/canvas",
                "_blank",
                "noopener,noreferrer"
              );
            }}
          />

          {/* CHAT WORKSPACE */}
          {activeWorkspace === "chat" && (
            <ChatWindow
              onShareToCanvas={(canvasId) => {
                window.open(
                  `/canvas/${canvasId}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            />
          )}

          {/* LEGACY SAME-TAB CANVAS WORKSPACE */}
          {activeWorkspace === "canvas" && (
            <CanvasWorkspace
              activeCanvasId={selectedCanvasId}
              onSelect={setSelectedCanvasId}
              onCreated={setSelectedCanvasId}
              onDeleted={(id) => {
                if (id === selectedCanvasId) {
                  setSelectedCanvasId(null);
                }
              }}
            />
          )}

        </div>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;