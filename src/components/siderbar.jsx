import { useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useChat } from "../contexts/ChatContext";



function Ssidebar() {
  const { chats, activeChatId, setActiveChatId, createNewChat, deleteChat } = useChat();
  const [collapsed, setCollapsed] = useState(true);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation(); // don't switch to this chat when clicking delete
    setConfirmDeleteId(chatId);
  };

  const handleConfirmDelete = (e, chatId) => {
    e.stopPropagation();
    deleteChat(chatId);
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <Sidebar
        collapsed={collapsed}
        rootStyles={{ borderRight: "none", boxShadow: "none" }}
        backgroundColor="#000000"
        style={{ height: "100%" }}
      >
        {/* ---------- HEADER ---------- */}
        <div
          style={{
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {/* Collapse / Expand */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: "6px",
              height: "36px",
              background: "#111",
              color: "#fff",
            }}
          >
            =
          </button>

          {/* Collapsed view */}
          {collapsed ? (
            <>
              <button
                onClick={createNewChat}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  fontSize: "18px",
                  background: "#111",
                  color: "#fff",
                }}
              >
                +
              </button>
              <div style={{ fontSize: "14px", color: "#fff" }}>
                {chats.length} chats
              </div>
            </>
          ) : (
            /* Expanded view */
            <button
              onClick={createNewChat}
              style={{
                width: "100%",
                padding: "8px",
                background: "#111",
                color: "#fff",
                borderRadius: "6px",
              }}
            >
              + New Chat
            </button>
          )}
        </div>

        {/* ---------- CHAT LIST ---------- */}
        {!collapsed && (
          <div style={{ overflowY: "auto", height: "calc(100% - 110px)" }}>
            <Menu>
              <p style={{ color: "#fff", fontSize: "24px", padding: "0 12px" }}>
                Chat History
              </p>

              {chats?.map((chat) => (
                <div
                  key={chat.id}
                  onMouseEnter={() => setHoveredChatId(chat.id)}
                  onMouseLeave={() => {
                    setHoveredChatId(null);
                    // cancel confirm if user moves away
                    if (confirmDeleteId === chat.id) setConfirmDeleteId(null);
                  }}
                  style={{ position: "relative" }}
                >
                  {confirmDeleteId === chat.id ? (
                    /* --- Confirm delete bar --- */
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "#1a1a1a",
                        color: "#fff",
                        fontSize: "13px",
                        gap: "8px",
                      }}
                    >
                      <span style={{ flex: 1, opacity: 0.7 }}>Delete chat?</span>
                      <button
                        onClick={(e) => handleConfirmDelete(e, chat.id)}
                        style={{
                          padding: "3px 10px",
                          background: "#e53935",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        style={{
                          padding: "3px 10px",
                          background: "#333",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    /* --- Normal chat row --- */
                    <MenuItem
                      onClick={() => setActiveChatId(chat.id)}
                      style={{
                        background:
                          activeChatId === chat.id ? "#e8eefc" : "transparent",
                        fontWeight: activeChatId === chat.id ? "600" : "400",
                        paddingRight: "40px", // room for the delete button
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {chat.title || "Untitled Chat"}
                      </span>

                      {/* Delete button — visible on hover */}
                      {hoveredChatId === chat.id && (
                        <button
                          onClick={(e) => handleDeleteClick(e, chat.id)}
                          title="Delete chat"
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color:
                              activeChatId === chat.id ? "#555" : "#aaa",
                            fontSize: "15px",
                            lineHeight: 1,
                            padding: "2px 4px",
                            borderRadius: "4px",
                            transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#e53935")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                              activeChatId === chat.id ? "#555" : "#aaa")
                          }
                        >
                          🗑
                        </button>
                      )}
                    </MenuItem>
                  )}
                </div>
              ))}
            </Menu>
          </div>
        )}
      </Sidebar>
    </div>
  );
}

export default Ssidebar;












