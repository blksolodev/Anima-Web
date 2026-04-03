import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, Radio, Send, Tv2, MessagesSquare } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { DiscussionRoom as DiscussionRoomType, DiscussionMessage } from '../../types';
import {
  getDiscussion,
  subscribeMessages,
  sendMessage,
  checkSpoilerVerified,
  markSpoilerVerified,
} from '../../services/discussion.service';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const DiscussionRoom: React.FC = () => {
  const { discussionId } = useParams<{ discussionId: string }>();
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const { user } = useAuthStore();

  const [room, setRoom] = useState<DiscussionRoomType | null>(null);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Spoiler gate
  const [spoilerVerified, setSpoilerVerified] = useState(false);
  const [confirmingGate, setConfirmingGate] = useState(false);

  // Input
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch or auto-create room, then check spoiler gate
  useEffect(() => {
    if (!discussionId || !user) return;

    const inferredType: 'episode' | 'live' = discussionId.startsWith('live_') ? 'live' : 'episode';

    const init = async () => {
      let r = await getDiscussion(discussionId);

      // Auto-create doc if it doesn't exist yet (e.g. older posts)
      if (!r) {
        const title = (locationState as any)?.discussionTitle ?? discussionId;
        const newRoom: Omit<DiscussionRoomType, 'id'> = {
          type: inferredType,
          title,
          messageCount: 0,
          createdBy: user.id,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'discussions', discussionId), newRoom, { merge: true });
        r = { id: discussionId, ...newRoom } as DiscussionRoomType;
      }

      setRoom(r);

      // Spoiler gate check
      if (r.type === 'live') {
        setSpoilerVerified(true);
      } else {
        const verified = await checkSpoilerVerified(discussionId, user.id);
        setSpoilerVerified(verified);
      }

      setLoading(false);
    };

    init().catch((err) => {
      console.error('DiscussionRoom init error', err);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discussionId, user?.id]);

  // Subscribe to messages once past spoiler gate
  useEffect(() => {
    if (!discussionId || !spoilerVerified) return;
    const unsub = subscribeMessages(discussionId, setMessages);
    return () => unsub();
  }, [discussionId, spoilerVerified]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEnterRoom = async () => {
    if (!discussionId || !user) return;
    setConfirmingGate(true);
    await markSpoilerVerified(discussionId, user.id);
    setSpoilerVerified(true);
    setConfirmingGate(false);
  };

  const handleSend = async () => {
    if (!discussionId || !user || !text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      const author = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        powerLevel: user.powerLevel ?? 1,
        auraColor: '#7C3AED',
      };
      await sendMessage(discussionId, author, content);
    } catch (e) {
      console.error('send error', e);
      setText(content);
    } finally {
      setSending(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const isLive = room?.type === 'live';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-[#FF6B35]" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#0D0D14] sm:bg-[#0D0D14]/90 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/5 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </button>

        {room?.animeCover && (
          <img
            src={room.animeCover}
            alt=""
            className="w-9 h-12 object-cover rounded-md flex-shrink-0 border border-white/10"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {isLive
              ? <Radio size={13} className="text-[#FF6B35] flex-shrink-0" />
              : <Tv2 size={13} className="text-[#06B6D4] flex-shrink-0" />
            }
            <span className={`text-[11px] font-bold uppercase tracking-wide ${isLive ? 'text-[#FF6B35]' : 'text-[#06B6D4]'}`}>
              {isLive ? 'Live Discussion' : 'Episode Discussion'}
            </span>
            {room?.episode && (
              <span className="text-[11px] text-[#6B6B7B]">· Ep {room.episode}</span>
            )}
          </div>
          <h1 className="text-sm font-bold truncate">{room?.title}</h1>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-[#A0A0B0]">{messages.length}</p>
          <p className="text-[10px] text-[#6B6B7B]">msgs</p>
        </div>
      </div>

      {/* Spoiler gate overlay — episode only, before verified */}
      {!spoilerVerified && room?.type === 'episode' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mb-5">
            <Tv2 size={32} className="text-[#F59E0B]" />
          </div>
          {room.animeCover && (
            <img
              src={room.animeCover}
              alt=""
              className="w-20 h-28 object-cover rounded-xl border border-white/10 mb-4"
            />
          )}
          <h2 className="text-lg font-bold text-white mb-1">{room.animeName}</h2>
          {room.episode && (
            <p className="text-sm text-[#A0A0B0] mb-1">Episode {room.episode}</p>
          )}
          <p className="text-[#A0A0B0] text-sm mb-6 max-w-xs">
            This room contains spoilers. Only enter if you've watched this episode.
          </p>
          <button
            onClick={handleEnterRoom}
            disabled={confirmingGate}
            className="px-6 py-3 bg-[#FF6B35] hover:bg-[#FF8A50] disabled:opacity-50 text-white font-bold rounded-2xl transition-colors flex items-center gap-2"
          >
            {confirmingGate ? <Loader2 size={16} className="animate-spin" /> : null}
            I've Watched It — Enter Room
          </button>
        </div>
      )}

      {/* Messages */}
      {spoilerVerified && (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-[#6B6B7B] text-sm mt-20">
                <MessagesSquare size={36} className="mb-3 opacity-40" />
                <p>Be the first to say something!</p>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.authorId === user?.id;
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <img
                      src={msg.author.avatarUrl || `https://ui-avatars.com/api/?name=${msg.author.username}&background=random&color=fff`}
                      alt={msg.author.username}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end border border-white/10"
                    />
                  )}
                  <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {!isMe && (
                      <span className="text-[11px] text-[#A0A0B0] px-1">{msg.author.displayName}</span>
                    )}
                    <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#FF6B35] text-white rounded-2xl rounded-br-sm'
                        : 'bg-[#1A1A2E] text-white rounded-2xl rounded-bl-sm border border-white/10'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="flex-shrink-0 px-4 py-3 border-t border-white/10">
            <div className="flex items-end gap-2">
              <img
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=random&color=fff`}
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/10"
              />
              <div className="flex-1 flex items-end gap-2 bg-[#1A1A2E] border border-white/10 rounded-2xl px-3 py-2">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 500))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Say something…"
                  rows={1}
                  className="flex-1 bg-transparent text-white text-sm placeholder-[#6B6B7B] resize-none focus:outline-none max-h-28 min-h-[24px] leading-relaxed"
                />
                <button
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#FF6B35] hover:bg-[#FF8A50] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  {sending
                    ? <Loader2 size={14} className="animate-spin text-white" />
                    : <Send size={14} className="text-white ml-0.5" />
                  }
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
