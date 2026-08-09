import { useState } from "react";
import "./App.css";

import ChatWindow from "./components/chat_window.jsx";
import Ssidebar from "./components/siderbar.jsx";
import Sheader from "./components/sheader.jsx";
import CanvasWorkspace from "./components/canvas/CanvasWorkspace.jsx";
import PublicCanvas from "./components/canvas/PublicCanvas.jsx";
import CanvasEntry from "./components/canvas/CanvasEntry.jsx";

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