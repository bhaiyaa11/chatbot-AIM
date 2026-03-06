// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../supabase";

// const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const [chats, setChats] = useState([]);
//   const [activeChatId, setActiveChatId] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);

//   /* -------- LOAD CHATS -------- */
//   const loadChats = async () => {
//     const { data } = await supabase
//       .from("chats")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (data) {
//       setChats(data);
//       if (!activeChatId && data.length) {
//         setActiveChatId(data[0].id);
//       }
//     }
//   };

//   /* -------- LOAD MESSAGES -------- */
//   const loadMessages = async (chatId) => {
//     if (!chatId) return;

//     const { data } = await supabase
//       .from("messages")
//       .select("*")
//       .eq("chat_id", chatId)
//       .order("created_at");

//     if (data) setMessages(data);
//   };

//   /* -------- CREATE NEW CHAT (FIX) -------- */
//   const createNewChat = async () => {
//     const { data, error } = await supabase
//       .from("chats")
//       .insert([{ title: "New Chat" }])
//       .select()
//       .single();

//     if (error) {
//       console.error(error);
//       return;
//     }

//     setChats((prev) => [data, ...prev]);
//     setActiveChatId(data.id);
//     setMessages([]);
//   };

//   /* -------- ADD MESSAGE (AUTO-CREATE CHAT) -------- */
//   const addMessage = async (chatId, message) => {
//   let targetChatId = chatId;

//   if (!targetChatId) {
//     const { data: newChat } = await supabase
//       .from("chats")
//       .insert({})
//       .select()
//       .single();

//     setChats((prev) => [newChat, ...prev]);
//     setActiveChatId(newChat.id);
//     setMessages([]);

//     targetChatId = newChat.id;
//   }

//   await supabase.from("messages").insert({
//     chat_id: targetChatId,
//     role: message.role ?? "user",
//     content: message.content ?? message,
//   });

//   /* ---------- AUTO CHAT TITLE ---------- */
//   if (message.role === "user") {
//     const chat = chats.find((c) => c.id === targetChatId);

//     if (!chat?.title || chat.title === "New Chat") {
//       const title = (message.content || "").slice(0, 40);

//       await supabase
//         .from("chats")
//         .update({ title })
//         .eq("id", targetChatId);

//       setChats((prev) =>
//         prev.map((c) =>
//           c.id === targetChatId ? { ...c, title } : c
//         )
//       );
//     }
//   }
// };

//   /* -------- STREAMING UPDATE -------- */
//   const updateLastMessage = (chatId, content) => {
//     setMessages((prev) =>
//       prev.map((m, i) =>
//         // i === prev.length - 1 ? { ...m, content } : m
//         i === prev.length - 1 ? { ...m, content, prompt: prompt ?? m.prompt ?? "" } : m
//       )
//     );
//   };

//   /* -------- REALTIME -------- */
//   useEffect(() => {
//     if (!activeChatId) return;

//     const channel = supabase
//       .channel(`messages-${activeChatId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "messages",
//           filter: `chat_id=eq.${activeChatId}`,
//         },
//         (payload) => {
//           setMessages((prev) => [...prev, payload.new]);
//         }
//       )
//       .subscribe();

//     return () => supabase.removeChannel(channel);
//   }, [activeChatId]);

//   useEffect(() => {
//     loadChats().finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     loadMessages(activeChatId);
//   }, [activeChatId]);

//   const activeChat = chats.find((c) => c.id === activeChatId)
//     ? {
//         ...chats.find((c) => c.id === activeChatId),
//         messages: messages.map((m) => ({
//           sender: m.role === "assistant" ? "bot" : "user",
//           text: m.content,
//           content: m.content,
//           prompt: m.prompt ?? "",
//           files: [],
//         })),
//       }
//     : null;

//   return (
//     <ChatContext.Provider
//       value={{
//         chats,
//         activeChat,
//         activeChatId,
//         setActiveChatId,
//         createNewChat,   // ✅ FIX
//         addMessage,
//         updateLastMessage,
//         loading,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChat = () => useContext(ChatContext);




import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageFiles, setMessageFiles] = useState({}); // ← stores files keyed by message index

  /* -------- LOAD CHATS -------- */
  const loadChats = async () => {
    const { data } = await supabase
      .from("chats")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setChats(data);
      if (!activeChatId && data.length) {
        setActiveChatId(data[0].id);
      }
    }
  };

  /* -------- LOAD MESSAGES -------- */
  const loadMessages = async (chatId) => {
    if (!chatId) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at");

    if (data) setMessages(data);
  };

  /* -------- CREATE NEW CHAT (FIX) -------- */
  const createNewChat = async () => {
    const { data, error } = await supabase
      .from("chats")
      .insert([{ title: "New Chat" }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setChats((prev) => [data, ...prev]);
    setActiveChatId(data.id);
    setMessages([]);
  };

  /* -------- ADD MESSAGE (AUTO-CREATE CHAT) -------- */
  const addMessage = async (chatId, message) => {
  let targetChatId = chatId;

  if (!targetChatId) {
    const { data: newChat } = await supabase
      .from("chats")
      .insert({})
      .select()
      .single();

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setMessages([]);

    targetChatId = newChat.id;
  }

  const { data: inserted } = await supabase.from("messages").insert({
    chat_id: targetChatId,
    role: message.role ?? "user",
    content: message.content ?? message,
  }).select().single();

  // ← store files in local state keyed by the inserted message id
  if (inserted && message.files?.length > 0) {
    setMessageFiles((prev) => ({ ...prev, [inserted.id]: message.files }));
  }

  /* ---------- AUTO CHAT TITLE ---------- */
  if (message.role === "user") {
    const chat = chats.find((c) => c.id === targetChatId);

    if (!chat?.title || chat.title === "New Chat") {
      const title = (message.content || "").slice(0, 40);

      await supabase
        .from("chats")
        .update({ title })
        .eq("id", targetChatId);

      setChats((prev) =>
        prev.map((c) =>
          c.id === targetChatId ? { ...c, title } : c
        )
      );
    }
  }
};

  /* -------- STREAMING UPDATE -------- */
  const updateLastMessage = (chatId, content) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        // i === prev.length - 1 ? { ...m, content } : m
        i === prev.length - 1 ? { ...m, content, prompt: prompt ?? m.prompt ?? "" } : m
      )
    );
  };

  /* -------- REALTIME -------- */
  useEffect(() => {
    if (!activeChatId) return;

    const channel = supabase
      .channel(`messages-${activeChatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${activeChatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeChatId]);

  useEffect(() => {
    loadChats().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadMessages(activeChatId);
  }, [activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId)
    ? {
        ...chats.find((c) => c.id === activeChatId),
        messages: messages.map((m) => ({
          sender: m.role === "assistant" ? "bot" : "user",
          text: m.content,
          content: m.content,
          prompt: m.prompt ?? "",
          files: messageFiles[m.id] ?? [], // ← pull files from local state by message id
        })),
      }
    : null;

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        activeChatId,
        setActiveChatId,
        createNewChat,   // ✅ FIX
        addMessage,
        updateLastMessage,
        loading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);



