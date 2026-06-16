
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();
// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ChatProvider = ({ children }) => {
  const { session } = useAuth();

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);


const [conversationId, setConversationId] = useState(null);
  // ---------------------------------------------------------------------------
  // Auth header helper — reads the live Supabase session token
  // Returns an Authorization header if logged in, empty object otherwise.
  // ---------------------------------------------------------------------------
  const getAuthHeaders = () => {
    const token = session?.access_token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
  const userId = session?.user?.id;

  if (!userId) {
    setConversationId(null);
    return;
  }

  try {
    const savedConversation = localStorage.getItem(
      `conversation_id_${userId}`
    );

    setConversationId(savedConversation || null);
  } catch {
    setConversationId(null);
  }
}, [session]);

  // ---------------------------------------------------------------------------
  // Load conversation list — filtered server-side by user_id from JWT
  // ---------------------------------------------------------------------------
  const loadConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/conversations`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        // Session expired or not logged in — clear list silently
        setConversations([]);
        return;
      }

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
  if (session) {
    loadConversations();
  } else {
    setConversationId(null);
    setMessages([]);
    setConversations([]);
  }
}, [session]);


useEffect(() => {
  const userId = session?.user?.id;

  if (!userId) return;

  try {
    const key = `conversation_id_${userId}`;

    if (conversationId) {
      localStorage.setItem(key, conversationId);
    } else {
      localStorage.removeItem(key);
    }
  } catch {}
}, [conversationId, session]);


useEffect(() => {
  setMessages([]);
}, [session?.user?.id]);


  // ---------------------------------------------------------------------------
  // Add message (local only)
  // ---------------------------------------------------------------------------
  const addMessage = (id, message) => {
    setMessages((prev) => [
      ...prev,
      {
        sender:  message.role === "assistant" ? "bot" : "user",
        text:    message.content ?? message,
        content: message.content ?? message,
        prompt:  message.prompt ?? "",
        files:   message.files ?? [],
      },
    ]);
  };

  // ---------------------------------------------------------------------------
  // Streaming update — patches the last message in place
  // ---------------------------------------------------------------------------
  const updateLastMessage = (id, content, prompt) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1
          ? { ...m, content, text: content, prompt: prompt ?? m.prompt ?? "" }
          : m
      )
    );

    // Only reload sidebar once streaming finishes (prompt is passed as signal)
    if (prompt !== undefined) {
      loadConversations();
    }
  };

  // ---------------------------------------------------------------------------
  // Create new chat (reset local state)
  // ---------------------------------------------------------------------------
  const createNewChat = () => {
    setConversationId(null);
    setMessages([]);
    try { localStorage.removeItem("conversation_id"); } catch { /* ignore */ }
  };

  // ---------------------------------------------------------------------------
  // Delete conversation — sends auth header so backend verifies ownership
  // ---------------------------------------------------------------------------
  const deleteConversation = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/conversations/${id}`, {
        method:  "DELETE",
        headers: getAuthHeaders(),
      });
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

  // ---------------------------------------------------------------------------
  // Expose getAuthHeaders so ChatWindow / other components can use it
  // when calling /chat, /generate-script, etc.
  // ---------------------------------------------------------------------------
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
        isGenerating,
        setIsGenerating,
        getAuthHeaders, // <-- expose so chat/send calls can attach the token
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);








