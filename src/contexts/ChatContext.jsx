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

//   /* -------- ADD MESSAGE (AUTO-CREATE CHAT) -------- */
//   const addMessage = async (chatId, message) => {
//     let targetChatId = chatId;

//     // ✅ Auto-create chat if none exists
//     if (!targetChatId) {
//       const { data: newChat } = await supabase
//         .from("chats")
//         .insert({})
//         .select()
//         .single();

//       if (!newChat) return;

//       setChats((prev) => [newChat, ...prev]);
//       setActiveChatId(newChat.id);
//       setMessages([]);

//       targetChatId = newChat.id;
//     }

//     await supabase.from("messages").insert({
//       chat_id: targetChatId,
//       role: message.role ?? "user",
//       content: message.content ?? message,
//     });
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

//   // const activeChat = chats.find((c) => c.id === activeChatId)
//   //   ? { ...chats.find((c) => c.id === activeChatId), messages }
//   //   : null;
//   const activeChat = chats.find((c) => c.id === activeChatId)
//   ? {
//       ...chats.find((c) => c.id === activeChatId),
//       messages: messages.map((m) => ({
//         sender: m.role === "assistant" ? "bot" : "user",
//         text: m.content,
//         files: [],
//       })),
//     }
//   : null;

  

//   return (
//     <ChatContext.Provider
//       value={{
//         chats,
//         activeChat,
//         activeChatId,
//         setActiveChatId,
//         addMessage,
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

  /* -------- ADD MESSAGE (AUTO-CREATE CHAT) -------- */
  const addMessage = async (chatId, message) => {
    let targetChatId = chatId;

    if (!targetChatId) {
      const { data: newChat } = await supabase
        .from("chats")
        .insert({})
        .select()
        .single();

      if (!newChat) return;

      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setMessages([]);

      targetChatId = newChat.id;
    }

    await supabase.from("messages").insert({
      chat_id: targetChatId,
      role: message.role ?? "user",
      content: message.content ?? message,
    });
  };

  /* -------- STREAMING UPDATE (NEW) -------- */
  const updateLastMessage = (chatId, content) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1
          ? { ...m, content }
          : m
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
          files: [],
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
        addMessage,
        updateLastMessage,   // ✅ exported
        loading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
