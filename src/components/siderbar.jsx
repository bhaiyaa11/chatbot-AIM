import { useState } from "react";
import { useChat } from "../contexts/ChatContext";
import "./side-bar.css";


const HELP_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSew4lijG-WKDv-WNpASi30R2UJD2y6Urzk9vrJLeaS2b8IIhg/viewform?usp=publish-editor";


function Ssidebar() {
  const {
    conversationId,
    setConversationId,
    conversations,
    createNewChat,
    deleteConversation,
  } = useChat();

  const [collapsed, setCollapsed] = useState(true);
  const [hoveredConvId, setHoveredConvId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleSelectConversation = (id) => {
    setConversationId(id);
    localStorage.setItem("conversation_id", id);
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = (e, id) => {
    e.stopPropagation();
    deleteConversation(id);
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
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
          {/* <h1>AllinMotion</h1> */}
          <h1>ALL IN MOTION</h1>
          {/* <p>AI Creative Studio</p> */}
          <p>B2B Creative Solitions</p>
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
                  onMouseEnter={() => setHoveredConvId(conv.id)}
                  onMouseLeave={() => {
                    setHoveredConvId(null);
                    if (confirmDeleteId === conv.id) setConfirmDeleteId(null);
                  }}
                >
                  {confirmDeleteId === conv.id ? (
                    /* Confirm delete bar */
                    <div className="confirm-delete-bar">
                      <span>Delete chat?</span>
                      <button
                        className="confirm-delete-btn"
                        onClick={(e) => handleConfirmDelete(e, conv.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="confirm-cancel-btn"
                        onClick={handleCancelDelete}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    /* Normal chat row */
                    <div
                      className={`history-item ${
                        conv.id === conversationId ? "active-chat" : ""
                      }`}
                      onClick={() => handleSelectConversation(conv.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="history-item-title">
                        {conv.title || "Untitled Conversation"}
                      </span>

                      {hoveredConvId === conv.id && (
                        <button
                          className="history-delete-btn"
                          onClick={(e) => handleDeleteClick(e, conv.id)}
                          title="Delete chat"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Collapsed indicator */}
        {collapsed && (
          <div className="collapsed-count">{conversations.length}</div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && (
          <>
            <a className="nav-item" 
             href={HELP_FORM_URL}
              target="_blank"
              rel="noopener noreferrer">
                
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



