import { useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useChat } from "../contexts/ChatContext";

function Ssidebar() {
  const { chats, activeChatId, setActiveChatId, createNewChat } = useChat();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div style={{ height: "100vh", display: "flex" }}>
  <Sidebar collapsed={collapsed} rootStyles={{
    borderRight: "none",   // removes vertical white line     
    boxShadow: "none",     // removes glow / shadow border
  }} backgroundColor="#000000" style={{ height: "100%"} }>

        {/* --- Top fixed header --- */}{/* ---------- HEADER ---------- */}
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
  <button onClick={() => setCollapsed(!collapsed)}
    style={{
      padding: "6px",
      height: "36px",
      background: "#111", 
      color: "#fff",
      // borderRadius: "50%",
      
    }}
  >
    {collapsed ? "=" : "="}
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

      <div style={{ fontSize: "14px" }}>
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
  <div
    style={{
      overflowY: "auto",
      height: "calc(100% - 110px)",
    }}
  >
    <Menu>
      <p style={{  color: "#fff", fontSize: "24px" }}>Chat History</p>
      {chats?.map((chat) => (
        <MenuItem
          key={chat.id}
          onClick={() => setActiveChatId(chat.id)}
          style={{
            background:
              activeChatId === chat.id ? "#e8eefc" : "transparent",
            fontWeight:
              activeChatId === chat.id ? "600" : "400",
          }}
        >
          {chat.title || "Untitled Chat"}
        </MenuItem>
      ))}
    </Menu>
  </div>
)}
      </Sidebar>
    </div>
  );
}

export default Ssidebar;

