import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ChatMessage, TableItem } from '../../types';
import { playMessageSound } from '../../utils/sound';
import {
  Send,
  Code2,
  Smile,
  Copy,
  Check,
  Sparkles,
  Users,
  MessageSquare,
  X
} from 'lucide-react';

interface ChatSectionProps {
  table: TableItem;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ table }) => {
  const { currentUser, userProfile } = useAuth();
  const { t, isRtl } = useLanguage();
  const { soundEnabled } = useTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  // Code snippet modal / drawer in chat
  const [showCodeSnippetInput, setShowCodeSnippetInput] = useState<boolean>(false);
  const [snippetCode, setSnippetCode] = useState<string>('');
  const [snippetLang, setSnippetLang] = useState<string>('javascript');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);

  // Listen to messages in real-time
  useEffect(() => {
    const messagesRef = collection(db, 'tables', table.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          msgs.push({
            id: docSnap.id,
            text: data.text || '',
            senderId: data.senderId || '',
            senderName: data.senderName || 'عضو الفريق',
            senderPhoto: data.senderPhoto || '',
            codeSnippet: data.codeSnippet || undefined,
            codeLanguage: data.codeLanguage || undefined,
            reactions: data.reactions || {},
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });

        // Play chime if new message from someone else
        if (soundEnabled && msgs.length > prevCountRef.current && prevCountRef.current > 0) {
          const last = msgs[msgs.length - 1];
          if (last.senderId !== currentUser?.uid) {
            playMessageSound();
          }
        }
        prevCountRef.current = msgs.length;

        setMessages(msgs);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, `tables/${table.id}/messages`);
      }
    );

    return () => unsubscribe();
  }, [table.id, soundEnabled, currentUser?.uid]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (!inputText.trim() && !snippetCode.trim())) return;

    setSending(true);
    try {
      const now = new Date().toISOString();
      const messagePayload: Record<string, unknown> = {
        text: inputText.trim() || 'شارك مقتطف كود برمجي:',
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || currentUser.displayName || 'مطور',
        senderPhoto: userProfile?.photoURL || currentUser.photoURL || '',
        createdAt: now,
      };

      if (snippetCode.trim()) {
        messagePayload.codeSnippet = snippetCode.trim();
        messagePayload.codeLanguage = snippetLang;
      }

      await addDoc(collection(db, 'tables', table.id, 'messages'), messagePayload);

      if (soundEnabled) {
        playMessageSound();
      }

      setInputText('');
      setSnippetCode('');
      setShowCodeSnippetInput(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tables/${table.id}/messages`);
    } finally {
      setSending(false);
    }
  };

  // Add reaction emoji
  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    try {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg) return;

      const currentReactions = { ...(msg.reactions || {}) };
      const userList = currentReactions[emoji] || [];

      if (userList.includes(currentUser.uid)) {
        currentReactions[emoji] = userList.filter((id) => id !== currentUser.uid);
      } else {
        currentReactions[emoji] = [...userList, currentUser.uid];
      }

      const msgDocRef = doc(db, 'tables', table.id, 'messages', messageId);
      await updateDoc(msgDocRef, {
        reactions: currentReactions,
      });
    } catch (err) {
      console.error('Failed to add reaction', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg">
      {/* Chat Header */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('teamChatTitle')}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-semibold">
                {table.memberCount || 1} مبرمجين
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('teamChatSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCodeSnippetInput(!showCodeSnippetInput)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showCodeSnippetInput
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('shareCodeSnippet')}</span>
          </button>
        </div>
      </div>

      {/* Code Snippet Input Drawer (if open) */}
      {showCodeSnippetInput && (
        <div className="p-4 border-b border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>مشاركة مقتطف كود في محادثة الفريق</span>
            </span>
            <div className="flex items-center gap-2">
              <select
                value={snippetLang}
                onChange={(e) => setSnippetLang(e.target.value)}
                className="text-[11px] px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-slate-700 dark:text-slate-300 font-mono"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="python">Python</option>
                <option value="sql">SQL</option>
                <option value="json">JSON</option>
              </select>
              <button
                onClick={() => setShowCodeSnippetInput(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            rows={4}
            value={snippetCode}
            onChange={(e) => setSnippetCode(e.target.value)}
            placeholder={t('snippetCodePlaceholder')}
            dir="ltr"
            className="w-full p-3 rounded-xl text-xs font-mono bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/60 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12 text-slate-400 text-xs">
            جاري تحميل رسائل الفريق...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-medium">ابدأ المحادثة مع فريقك!</p>
            <p className="text-xs text-slate-500 mt-1">تشاركوا الأكواد والاستفسارات مباشرة هنا.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.uid;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${
                  isMe ? (isRtl ? 'mr-auto flex-row-reverse' : 'ml-auto flex-row-reverse') : (isRtl ? 'ml-auto' : 'mr-auto')
                }`}
              >
                {/* Avatar */}
                <img
                  src={msg.senderPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderId}`}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-xl object-cover bg-slate-200 dark:bg-slate-700 shrink-0 mt-1"
                />

                <div className="flex flex-col">
                  {/* Sender Name & Time */}
                  <div
                    className={`flex items-center gap-2 mb-1 text-[11px] text-slate-500 dark:text-slate-400 ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {isMe ? 'أنت' : msg.senderName}
                    </span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Code Snippet Box */}
                    {msg.codeSnippet && (
                      <div className="mt-2.5 rounded-xl bg-slate-950 p-3 text-slate-200 font-mono text-[11px] border border-slate-800" dir="ltr">
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] text-indigo-400">
                          <span className="uppercase">{msg.codeLanguage || 'code'}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(msg.codeSnippet || '')}
                            className="hover:text-white transition-colors"
                            title="Copy snippet"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <pre className="overflow-x-auto whitespace-pre">{msg.codeSnippet}</pre>
                      </div>
                    )}
                  </div>

                  {/* Reaction Pill Buttons */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {['👍', '🚀', '❤️', '💡', '🔥'].map((emoji) => {
                      const count = (msg.reactions?.[emoji] || []).length;
                      const hasReacted = (msg.reactions?.[emoji] || []).includes(currentUser?.uid || '');

                      return (
                        <button
                          key={emoji}
                          onClick={() => handleAddReaction(msg.id, emoji)}
                          className={`text-[11px] px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                            hasReacted
                              ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-bold'
                              : count > 0
                              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              : 'opacity-0 hover:opacity-100 bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="ml-1 text-[10px]">{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('typeMessage')}
          className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />

        <button
          type="submit"
          disabled={sending || (!inputText.trim() && !snippetCode.trim())}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-40 cursor-pointer flex items-center gap-2"
        >
          <span>{t('send')}</span>
          <Send className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
      </form>
    </div>
  );
};
