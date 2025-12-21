// src/components/Sidebar.jsx
import { useChat } from '../contexts/ChatContext';
import  './side-bar.css'

function Sidebar() {
  const { chats, activeChat, setActiveChatId, createNewChat } = useChat();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
      <h3>Chat with ME</h3>
      <button onClick={createNewChat}>+ New Chat</button>
      </div>
      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${chat.id === activeChat.id ? 'active' : ''}`}
            onClick={() => setActiveChatId(chat.id)}
          >
            {chat.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;












// function siderbar() {
//   return <div className="sidebar">
//      <h2>Chat with ME</h2>
//       <button className="new-chat-btn">+ New Chat</button>
     
//      </div>;
// }

// export default siderbar;