// import './App.css'
// import ChatWindow from './components/chat_window.jsx'
// import Ssidebar from './components/siderbar.jsx'
// import Sheader from './components/sheader.jsx'
// import { ChatProvider } from './contexts/ChatContext.jsx'
// import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
// import Login from './user_login/login.jsx'

// function App() {
//   const { session, loading } = useAuth();

//   // if (loading) {
//   //   return <div style={{ padding: "2rem" }}>Loading...</div>;
//   // }

//   // 🔒 NOT LOGGED IN
//   if (!session) {
//     return <Login />;
//   }

//   // ✅ LOGGED IN
//   return (
//     <AuthProvider>
//       <ChatProvider>
//         <Sheader />
//         <div className="app-layout">
//           <Ssidebar />
//           <ChatWindow />
//         </div>
//       </ChatProvider>
//     </AuthProvider>
//   );
// }

// export default App;
























// import { useState } from "react";
// import "./App.css";

// import ChatWindow from "./components/chat_window.jsx";
// import Ssidebar from "./components/siderbar.jsx";
// import Sheader from "./components/sheader.jsx";
// import Canvas from "./components/canvas/Canvas.jsx";

// import { ChatProvider } from "./contexts/ChatContext.jsx";
// import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
// import Login from "./user_login/login.jsx";

// function App() {
//   const { session, loading } = useAuth();

//   const [activeWorkspace, setActiveWorkspace] = useState("chat");

//   if (!session) {
//     return <Login />;
//   }

//   return (
//     <AuthProvider>
//       <ChatProvider>
//         <Sheader />

//         <div className="app-layout">

//           <Ssidebar
//             onOpenChat={() => setActiveWorkspace("chat")}
//             onOpenCanvas={() => setActiveWorkspace("canvas")}
//           />

//           {activeWorkspace === "chat" && (
//             <ChatWindow />
//           )}

//           {activeWorkspace === "canvas" && (
//             <Canvas />
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