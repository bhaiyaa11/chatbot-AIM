import { useState } from "react";
import { useChat } from "../contexts/ChatContext";
import "./side-bar.css";

function Ssidebar() {
  const {
    conversationId,
    setConversationId,
    conversations,
    createNewChat,
  } = useChat();

  const [collapsed, setCollapsed] = useState(true);

  const handleSelectConversation = (id) => {
    setConversationId(id);
    localStorage.setItem("conversation_id", id);
  };

  return (
    <div className={`sidebar-root ${collapsed ? "collapsed" : ""}`}>

      {/* Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "→" : "←"}
      </button>

      {!collapsed && (
        <div className="sidebar-brand">
          <h1>AllinMotion</h1>
          <p>AI Creative Studio</p>
        </div>
      )}

      <nav className="sidebar-nav">

        {/* New Chat */}
        <button
          className={`nav-item new-chat ${!conversationId ? "active" : ""}`}
          onClick={createNewChat}
        >
          <span className="nav-icon">✦</span>
          {!collapsed && "New Chat"}
        </button>

        {/* History */}
        {!collapsed && (
          <>
            <div className="sidebar-section-label">History</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {(!conversations || conversations.length === 0) && (
                <div className="history-item">No conversations yet</div>
              )}

              {conversations?.map((conv) => (
                <div
                  key={conv.id}
                  className={`history-item ${
                    conv.id === conversationId ? "active-chat" : ""
                  }`}
                  onClick={() => handleSelectConversation(conv.id)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="history-item-title">
                    {conv.title || "Untitled Conversation"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Collapsed indicator */}
        {collapsed && conversationId && (
          <div className="collapsed-count">1</div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && (
          <>
            <a className="nav-item" href="#">
              <span className="nav-icon">❓</span>
              Help
            </a>
            <a className="nav-item" href="#">
              <span className="nav-icon">⚙️</span>
              Settings
            </a>
          </>
        )}
      </div>

    </div>
  );
}

export default Ssidebar;
