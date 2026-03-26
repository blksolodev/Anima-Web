import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, ChevronLeft, Mail, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { db } from '../../lib/firebase';
import {
  collection, query, where, onSnapshot, orderBy,
  addDoc, updateDoc, doc, serverTimestamp, limit,
} from 'firebase/firestore';
import { Conversation, Message, User } from '../../types';
import { getUserById } from '../../services/user.service';

export const Messages: React.FC = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [otherUsers, setOtherUsers] = useState<Record<string, User>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Listen for conversations
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.id),
      orderBy('lastMessageAt', 'desc'),
      limit(50),
    );
    const unsub = onSnapshot(
      q,
      async (snap) => {
        const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
        setConversations(chats);
        setLoadingChats(false);

        // Fetch any other users we haven't loaded yet
        const newUserIds = chats
          .map((c) => c.participants.find((p) => p !== user.id))
          .filter((id): id is string => !!id && !otherUsers[id]);

        if (newUserIds.length > 0) {
          const fetched = await Promise.all(newUserIds.map((id) => getUserById(id)));
          setOtherUsers((prev) => {
            const next = { ...prev };
            fetched.forEach((u) => { if (u) next[u.id] = u; });
            return next;
          });
        }
      },
      (err) => {
        console.error('conversations error', err);
        setLoadingChats(false);
      },
    );
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Listen for messages in active chat
  useEffect(() => {
    if (!activeChatId) return;
    const q = query(
      collection(db, 'conversations', activeChatId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(200),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
    });
    return () => unsub();
  }, [activeChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!activeChatId || !newMessage.trim() || !user || sending) return;
    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);
    try {
      await addDoc(collection(db, 'conversations', activeChatId, 'messages'), {
        senderId: user.id,
        text,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'conversations', activeChatId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('send error', e);
    } finally {
      setSending(false);
    }
  };

  const getOtherId = (chat: Conversation) =>
    chat.participants.find((id) => id !== user?.id) ?? '';

  const getOtherUser = (chat: Conversation) => otherUsers[getOtherId(chat)];

  const filteredChats = conversations.filter((c) => {
    if (!search) return true;
    const other = getOtherUser(c);
    const name = other?.displayName || other?.username || getOtherId(c);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const activeChat = conversations.find((c) => c.id === activeChatId);
  const activePeer = activeChat ? getOtherUser(activeChat) : null;

  return (
    <div className="h-[calc(100vh-80px)] lg:h-screen flex flex-col md:flex-row">

      {/* Conversation list */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-white/10 flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0B0]" size={16} />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#FF6B35]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingChats ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin text-[#FF6B35]" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#A0A0B0] px-4 text-center">
              <MessageSquare className="mb-2 opacity-50" size={32} />
              <p className="font-medium">No active chats</p>
              <p className="text-xs mt-1">Visit a profile to start a conversation.</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const other = getOtherUser(chat);
              const otherId = getOtherId(chat);
              const displayName = other?.displayName || other?.username || `User ${otherId.slice(0, 6)}`;
              const avatar = other?.avatarUrl;
              const isActive = activeChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-3 rounded-xl flex gap-3 cursor-pointer transition-colors ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex-shrink-0 overflow-hidden">
                    {avatar
                      ? <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-semibold truncate text-sm">{displayName}</span>
                    </div>
                    <p className="text-xs text-[#A0A0B0] truncate">
                      {chat.lastMessage || 'Start chatting…'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className={`flex-1 flex flex-col bg-[#0D0D14] ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChatId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#0D0D14]/95 backdrop-blur z-10">
              <button onClick={() => setActiveChatId(null)} className="md:hidden text-[#A0A0B0]">
                <ChevronLeft size={24} />
              </button>
              <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0 border border-white/10 overflow-hidden">
                {activePeer?.avatarUrl
                  ? <img src={activePeer.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                      {(activePeer?.displayName || activePeer?.username || 'U').slice(0, 2).toUpperCase()}
                    </div>
                }
              </div>
              <div>
                <h2 className="font-bold text-sm">
                  {activePeer?.displayName || activePeer?.username || 'Chat'}
                </h2>
                {activePeer?.username && (
                  <p className="text-xs text-[#A0A0B0]">@{activePeer.username}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-[#6B6B7B] mt-10 text-sm">
                  No messages yet. Say hello!
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMe
                        ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8A50] text-white rounded-br-none'
                        : 'bg-[#1A1A2E] text-white rounded-bl-none border border-white/10'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2 items-end bg-[#1A1A2E] p-2 rounded-2xl border border-white/10">
                <textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                  }}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white resize-none max-h-32 min-h-[44px] py-3 text-sm"
                  rows={1}
                />
                <Button
                  className="!p-2 !rounded-xl !h-10 !w-10 flex items-center justify-center"
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                >
                  <Send size={18} className="ml-0.5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#A0A0B0]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Mail size={40} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Select a Conversation</h2>
            <p>Choose a chat from the list to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};
