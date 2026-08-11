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

  // Public share links ("anyone with the link") must work for people
  // without an account — this has to be checked before the login gate
  // below, or every shared link just bounces to the login screen.
  if (window.location.pathname.startsWith("/shared/canvas/")) {
    const token = window.location.pathname.split("/shared/canvas/")[1];
    return <PublicCanvas token={token} />;
  }

  // Restricted-canvas invite links: a lightweight email + one-time-code
  // gate instead of the full Login flow — the client may not have (or
  // want) a full account. Also has to be checked before the login gate.
  if (window.location.pathname.startsWith("/canvas-access/")) {
    const canvasId = window.location.pathname.split("/canvas-access/")[1];
    return <CanvasEntry canvasId={canvasId} />;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <AuthProvider>
      <ChatProvider>
        <Sheader />

        <div className="app-layout">
        {/* ONE SHARED BACKGROUND */}
        <div className="workspace-background">
          <Grainient
            color1="#393d4f"
            color2="#6446de"
            color3="#907ba3"
            timeSpeed={0.3}
            colorBalance={-0.1}
            warpStrength={0.65}
            warpFrequency={0}
            warpSpeed={0.2}
            warpAmplitude={5}
            blendAngle={-180}
            blendSoftness={0.18}
            rotationAmount={0}
            noiseScale={0}
            grainAmount={0}
            grainScale={0.3}
            grainAnimated={false}
            contrast={1.8}
            gamma={1.0}
            saturation={1.05}
            centerX={0.38}
            centerY={-0.02}
            zoom={0.8}
          />
        </div>

          <Ssidebar
            onOpenChat={() => setActiveWorkspace("chat")}
            onOpenCanvas={() => setActiveWorkspace("canvas")}
          />

          {activeWorkspace === "chat" && (
            <ChatWindow />
          )}

          {activeWorkspace === "canvas" && (
            <CanvasWorkspace />
          )}

        </div>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;