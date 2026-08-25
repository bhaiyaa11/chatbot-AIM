import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../supabase";

const ChatContext = createContext();

// const API_BASE_URL = "http://localhost:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const CONVERSATIONS_PAGE_SIZE = 20;

export const ChatProvider = ({ children }) => {
  // const { session } = useAuth();
  const { session, loading: authLoading } = useAuth();

  // ── Per-conversation message + generation state ─────────────────────────
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [generatingConversations, setGeneratingConversations] = useState(new Set());
  const [activeStreamTextByConversation, setActiveStreamTextByConversation] = useState({});
  const [pipelineStatusByConversation, setPipelineStatusByConversation] = useState({});

  // ── Which conversation is currently being VIEWED ─────────────────────────
  const [conversationId, setConversationId] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination for the sidebar conversation list
  const [conversationsOffset, setConversationsOffset] = useState(0);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false);

  // const getAuthHeaders = () => {
  //   const token = session?.access_token;
  //   if (!token) return {};
  //   return { Authorization: `Bearer ${token}` };
  // };
    const getAuthHeaders = () => {
      const token = session?.access_token;
      if (!token) return {};
      return { Authorization: `Bearer ${token}` };
    };

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) { setConversationId(null); return; }
    try {
      const saved = localStorage.getItem(`conversation_id_${userId}`);
      setConversationId(saved || null);
    } catch { setConversationId(null); }
  }, [session]);

   const authedFetch = async (url, options = {}) => {
    let res = await fetch(url, { ...options, headers: { ...options.headers, ...getAuthHeaders() } });
    if (res.status === 401) {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data.session) {
        res = await fetch(url, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${data.session.access_token}` },
        });
      }
    }
    return res;
  };



        const loadConversations = async () => {
            if (authLoading) return; // don't fire until AuthContext has settled
            try {
              const res = await authedFetch(
                `${API_BASE_URL}/conversations?limit=${CONVERSATIONS_PAGE_SIZE}&offset=0`
              );
              if (res.status === 401) {
                setConversations([]);
                setHasMoreConversations(false);
                return;
              }

      const data = await res.json();
      const freshPage = Array.isArray(data)
        ? data
        : Array.isArray(data.conversations) ? data.conversations : [];

      setConversations((prev) => {
        const freshIds = new Set(freshPage.map((c) => c.id));
        const rest = prev.filter((c) => !freshIds.has(c.id));
        return [...freshPage, ...rest];
      });

      setConversationsOffset((prevOffset) =>
        prevOffset === 0 ? freshPage.length : prevOffset
      );
      setHasMoreConversations((prevHasMore) =>
        conversationsOffset === 0 ? freshPage.length === CONVERSATIONS_PAGE_SIZE : prevHasMore
      );
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const loadMoreConversations = async () => {
    if (loadingMoreConversations || !hasMoreConversations) return;
    setLoadingMoreConversations(true);
    try {
      const res = await authedFetch(
        `${API_BASE_URL}/conversations?limit=${CONVERSATIONS_PAGE_SIZE}&offset=${conversationsOffset}`
      );
      if (res.status === 401) { setHasMoreConversations(false); return; }

      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.conversations) ? data.conversations : [];

      setConversations((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        return [...prev, ...list.filter((c) => !existingIds.has(c.id))];
      });
      setConversationsOffset((prev) => prev + list.length);
      setHasMoreConversations(list.length === CONVERSATIONS_PAGE_SIZE);
    } catch (err) {
      console.error("Failed to load more conversations:", err);
    } finally {
      setLoadingMoreConversations(false);
    }
  };

  useEffect(() => {
  if (authLoading) return;
  if (session) {
    loadConversations();
  } else {
    setConversationId(null);
    setMessagesByConversation({});
    setGeneratingConversations(new Set());
    setActiveStreamTextByConversation({});
    setConversations([]);
  }
}, [session, authLoading]); // eslint-disable-line

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    try {
      const key = `conversation_id_${userId}`;
      if (conversationId) localStorage.setItem(key, conversationId);
      else localStorage.removeItem(key);
    } catch {}
  }, [conversationId, session]);

  // ── Per-conversation message helpers ─────────────────────────────────────
  // Every write takes an explicit convId — never reads "current" from state.

  const getMessages = useCallback(
    (convId) => (convId ? messagesByConversation[convId] || [] : []),
    [messagesByConversation]
  );

  const setMessagesForConversation = useCallback((convId, updaterOrArray) => {
    if (!convId) return;
    setMessagesByConversation((prev) => {
      const current = prev[convId] || [];
      const next = typeof updaterOrArray === "function" ? updaterOrArray(current) : updaterOrArray;
      return { ...prev, [convId]: next };
    });
  }, []);

  const addMessage = useCallback((convId, message) => {
    if (!convId) return;
    setMessagesByConversation((prev) => ({
      ...prev,
      [convId]: [
        ...(prev[convId] || []),
        {
          id: message.id ?? crypto.randomUUID(),
          sender: message.role === "assistant" ? "bot" : (message.sender ?? "user"),
          text: message.content ?? message.text ?? "",
          content: message.content ?? message.text ?? "",
          prompt: message.prompt ?? "",
          files: message.files ?? [],
          ...message, // allow callers to pass through extra fields (researchPending, etc.)
        },
      ],
    }));
  }, []);

  const updateLastMessage = useCallback((convId, content, prompt) => {
    if (!convId) return;
    setMessagesByConversation((prev) => {
      const list = prev[convId] || [];
      if (list.length === 0) return prev;
      const updated = [...list];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        content,
        text: content,
        prompt: prompt ?? updated[updated.length - 1].prompt ?? "",
      };
      return { ...prev, [convId]: updated };
    });

    if (prompt !== undefined) {
      loadConversations();
    }
  }, []); // eslint-disable-line

  // Move all state (messages, generating flag, stream text) from one key to another.
  // Used when a draft (temp) conversation id gets replaced by the real backend id.
  const migrateConversation = useCallback((oldId, newId) => {
    if (!oldId || !newId || oldId === newId) return;

    setMessagesByConversation((prev) => {
      if (!(oldId in prev)) return prev;
      const { [oldId]: moved, ...rest } = prev;
      return { ...rest, [newId]: moved };
    });

    setGeneratingConversations((prev) => {
      if (!prev.has(oldId)) return prev;
      const next = new Set(prev);
      next.delete(oldId);
      next.add(newId);
      return next;
    });

    setActiveStreamTextByConversation((prev) => {
      if (!(oldId in prev)) return prev;
      const { [oldId]: moved, ...rest } = prev;
      return { ...rest, [newId]: moved };
    });


    setPipelineStatusByConversation((prev) => {
      if (!(oldId in prev)) return prev;
      const { [oldId]: moved, ...rest } = prev;
      return { ...rest, [newId]: moved };
    });

    // If the user is currently looking at the draft, follow it to the real id
    setConversationId((current) => (current === oldId ? newId : current));
  }, []);

  const startGenerating = useCallback((convId) => {
    setGeneratingConversations((prev) => new Set(prev).add(convId));
  }, []);

  const stopGenerating = useCallback((convId) => {
    setGeneratingConversations((prev) => {
      if (!prev.has(convId)) return prev;
      const next = new Set(prev);
      next.delete(convId);
      return next;
    });
  }, []);

  const setStreamText = useCallback((convId, text) => {
    if (!convId) return;
    setActiveStreamTextByConversation((prev) => ({ ...prev, [convId]: text }));
  }, []);
const setPipelineStatus = useCallback((convId, status) => {
  if (!convId) return;
  setPipelineStatusByConversation((prev) => ({ ...prev, [convId]: status }));
}, []);

const clearPipelineStatus = useCallback((convId) => {
  if (!convId) return;
  setPipelineStatusByConversation((prev) => {
    if (!(convId in prev)) return prev;
    const { [convId]: _, ...rest } = prev;
    return rest;
  });
}, []);
  const clearStreamText = useCallback((convId) => {
    if (!convId) return;
    setActiveStreamTextByConversation((prev) => {
      if (!(convId in prev)) return prev;
      const { [convId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const isGenerating = useCallback(
    (convId) => (convId ? generatingConversations.has(convId) : false),
    [generatingConversations]
  );

  // ── New chat / delete ─────────────────────────────────────────────────────
  const createNewChat = () => {
    setConversationId(null);
  };


  const deleteConversation = async (id) => {
    try {
      await authedFetch(`${API_BASE_URL}/conversations/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }

    setMessagesByConversation((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    stopGenerating(id);
    clearStreamText(id);

    if (conversationId === id) setConversationId(null);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ChatContext.Provider
      value={{
        // viewed conversation
        conversationId,
        setConversationId,

        // per-conversation message API
        getMessages,
        setMessagesForConversation,
        addMessage,
        updateLastMessage,
        migrateConversation,

        // per-conversation generation state
        isGenerating,
        startGenerating,
        stopGenerating,
        activeStreamTextByConversation,
        setStreamText,
        clearStreamText,
        pipelineStatusByConversation,      // ← add
        setPipelineStatus,                 // ← add
        clearPipelineStatus,        

        // conversation list
        conversations,
        setConversations,
        loadConversations,
        loadMoreConversations,
        hasMoreConversations,
        loadingMoreConversations,

        createNewChat,
        deleteConversation,

        loading,
        setLoading,

        getAuthHeaders,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);





