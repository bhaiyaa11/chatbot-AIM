import { createContext, useContext, useEffect, useState } from "react";

const ChatContext = createContext();
const API_BASE_URL = "http://localhost:8000";
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // FIX 2 — Zombie session: isGenerating is lifted into context so that
  // ChatWindow can lock both send buttons and the textarea during streaming.
  // Set true before the fetch, false after the post-stream /messages sync.
  const [isGenerating, setIsGenerating] = useState(false);

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

  /* -------- ADD MESSAGE (LOCAL ONLY) --------*/
  const addMessage = (id, message) => {
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
   * Patches the last message in the array with updated streaming content.
   * When `prompt` is defined (final call only), refreshes the sidebar.
   */
  const updateLastMessage = (id, content, prompt) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1
          ? { ...m, content, text: content, prompt: prompt ?? m.prompt ?? "" }
          : m
      )
    );

    // Only reload sidebar when streaming has fully finished (prompt is passed).
    if (prompt !== undefined) {
      loadConversations();
    }
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
        // FIX 2: exposed so ChatWindow locks input during generation
        isGenerating,
        setIsGenerating,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);