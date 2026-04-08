

// import { createContext, useContext, useEffect, useState } from "react";

// const ChatContext = createContext();
// const API_BASE_URL = "http://localhost:8000";
// // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export const ChatProvider = ({ children }) => {
//   const [messages, setMessages] = useState([]);
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [conversationId, setConversationId] = useState(
//     localStorage.getItem("conversation_id") || null
//   );

//   const loadConversations = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/conversations`);
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         setConversations(data);
//       } else if (data.conversations && Array.isArray(data.conversations)) {
//         setConversations(data.conversations);
//       }
//     } catch (err) {
//       console.error("Failed to load conversations:", err);
//     }
//   };

//   useEffect(() => {
//     loadConversations();
//   }, []);

//   // When conversationId changes, persist it to localStorage
//   useEffect(() => {
//     if (conversationId) {
//       localStorage.setItem("conversation_id", conversationId);
//     } else {
//       localStorage.removeItem("conversation_id");
//     }
//   }, [conversationId]);

//   /* -------- ADD MESSAGE (LOCAL ONLY) -------- */
//   const addMessage = (id, message) => {
//     // Note: 'id' was traditionally chatId, now we use it as conversationId if needed
//     // But backend is the single source of truth, so we only update local state for UI responsiveness
//     setMessages((prev) => [
//       ...prev,
//       {
//         sender: message.role === "assistant" ? "bot" : "user",
//         text: message.content ?? message,
//         content: message.content ?? message,
//         prompt: message.prompt ?? "",
//         files: message.files ?? [],
//       },
//     ]);
//   };

//   /* -------- STREAMING UPDATE -------- */
//   const updateLastMessage = (id, content, prompt) => {
//     setMessages((prev) =>
//       prev.map((m, i) =>
//         i === prev.length - 1
//           ? { ...m, content, text: content, prompt: prompt ?? m.prompt ?? "" }
//           : m
//       )
//     );
//   };

//   /* -------- CREATE NEW CHAT (RESET) -------- */
//   const createNewChat = () => {
//     setConversationId(null);
//     setMessages([]);
//     localStorage.removeItem("conversation_id");
//   };
// const deleteConversation = async (id) => {
//   try {
//     await fetch(`${API_BASE_URL}/conversations/${id}`, { method: "DELETE" });
//   } catch (err) {
//     console.error("Failed to delete conversation:", err);
//   }

//   // If the deleted conversation is the active one, reset
//   if (conversationId === id) {
//     setConversationId(null);
//     setMessages([]);
//     localStorage.removeItem("conversation_id");
//   }

//   // Remove from local list
//   setConversations((prev) => prev.filter((c) => c.id !== id));
// };


//   return (
//     <ChatContext.Provider
//       value={{
//         messages,
//         setMessages,
//         conversations,
//         setConversations,
//         loadConversations,
//         conversationId,
//         setConversationId,
//         addMessage,
//         updateLastMessage,
//         createNewChat,
//         deleteConversation,
//         loading,
//         setLoading,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChat = () => useContext(ChatContext);


import { createContext, useContext, useEffect, useState } from "react";

const ChatContext = createContext();
// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // FIX 4: lazy initializer so localStorage is read once safely,
  // and won't throw in private browsing / non-browser envs
  const [conversationId, setConversationId] = useState(() => {
    try { return localStorage.getItem("conversation_id") || null; }
    catch { return null; }
  });

  const loadConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/conversations`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
      } else if (data.conversations && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    try {
      if (conversationId) localStorage.setItem("conversation_id", conversationId);
      else localStorage.removeItem("conversation_id");
    } catch { /* private browsing — silently ignore */ }
  }, [conversationId]);

  /* -------- ADD MESSAGE (LOCAL ONLY) --------
   *
   * FIX 1: chat_window.jsx manages its own messages array directly via
   * setMessages() for all research + streaming flows. Calling addMessage()
   * AND setMessages() for the same event causes double-appends.
   *
   * Rule: use addMessage() ONLY for simple direct-send user messages that
   * chat_window doesn't already handle with its own setMessages() call.
   * For the research flow, chat_window should NOT call safeAddMessage()
   * before the research bubble — it manages the bubble itself.
   *
   * This function is kept intentionally lightweight — it does NOT push to
   * setMessages so it won't conflict with chat_window's direct state updates.
   * It's here as a persistence hook (e.g. to save to Supabase) if needed.
   */
  const addMessage = (id, message) => {
    // Only updates local UI state — chat_window is the source of truth
    // for the messages array during active sessions. Avoid calling this
    // alongside a direct setMessages() for the same message.
    setMessages((prev) => [
      ...prev,
      {
        sender: message.role === "assistant" ? "bot" : "user",
        text: message.content ?? message,
        content: message.content ?? message,
        prompt: message.prompt ?? "",
        files: message.files ?? [],
      },
    ]);
  };

  /* -------- STREAMING UPDATE --------
   *
   * Patches the last message in the array with updated streaming content.
   * This works correctly as long as nothing else appends to messages
   * while streaming is in progress (which chat_window guarantees).
   *
   * If you need more robustness, pass a message id and patch by id instead.
   */
  const updateLastMessage = (id, content, prompt) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1
          ? { ...m, content, text: content, prompt: prompt ?? m.prompt ?? "" }
          : m
      )
    );
  };

  /* -------- CREATE NEW CHAT (RESET) -------- */
  const createNewChat = () => {
    setConversationId(null);
    setMessages([]);
    try { localStorage.removeItem("conversation_id"); } catch { /* ignore */ }
  };

  /* -------- DELETE CONVERSATION -------- */
  const deleteConversation = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/conversations/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }

    if (conversationId === id) {
      setConversationId(null);
      setMessages([]);
      try { localStorage.removeItem("conversation_id"); } catch { /* ignore */ }
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        conversations,
        setConversations,
        loadConversations,
        conversationId,
        setConversationId,
        addMessage,
        updateLastMessage,
        createNewChat,
        deleteConversation,
        loading,
        setLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);