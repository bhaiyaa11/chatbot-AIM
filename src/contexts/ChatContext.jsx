

import { createContext, useContext, useEffect, useState } from "react";

const ChatContext = createContext();
// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(
    localStorage.getItem("conversation_id") || null
  );

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

  // When conversationId changes, persist it to localStorage
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem("conversation_id", conversationId);
    } else {
      localStorage.removeItem("conversation_id");
    }
  }, [conversationId]);

  /* -------- ADD MESSAGE (LOCAL ONLY) -------- */
  const addMessage = (id, message) => {
    // Note: 'id' was traditionally chatId, now we use it as conversationId if needed
    // But backend is the single source of truth, so we only update local state for UI responsiveness
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

  /* -------- STREAMING UPDATE -------- */
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
    localStorage.removeItem("conversation_id");
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
        loading,
        setLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);