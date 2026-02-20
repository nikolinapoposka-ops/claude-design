import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  author: string;
  isOwn: boolean;
  time: string;
  text: string;
  likeCount?: number;
  replyCount?: number;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    author: 'Johanna',
    isOwn: false,
    time: '15:49',
    text: 'Hey, can you please review the fire exit checklist before submitting? A few items might need photos.',
    likeCount: 3,
  },
  {
    id: '2',
    author: '',
    isOwn: true,
    time: '16:02',
    text: "On it \u2014 I'll go through each section and attach photos where needed.",
  },
  {
    id: '3',
    author: '',
    isOwn: true,
    time: '16:10',
    text: 'Done. All fire exit photos are attached. Let me know if anything else is needed.',
    replyCount: 1,
  },
];

/* ── Icons ──────────────────────────────────────────────── */
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 00-4-4H4" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

/* ── Toolbar icon button ─────────────────────────────────── */
const ToolbarBtn: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <button className="audit-chat-toolbar-btn" title={label} type="button">
    {children}
  </button>
);

/* ── Main component ──────────────────────────────────────── */
interface AuditChatProps {
  visible: boolean;
  variant?: 'store' | 'auditor'; // 'store' = dark teal bubbles; 'auditor' = light gray + info banner
}

const AuditChat: React.FC<AuditChatProps> = ({ visible, variant = 'store' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length <= INITIAL_MESSAGES.length) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), author: '', isOwn: true, time, text },
    ]);
    setDraft('');
  };

  if (!visible) return null;

  return (
    <div className="audit-chat">
      {variant === 'auditor' && (
        <div className="audit-chat-info-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>This conversation is an audit discussion for this store</span>
        </div>
      )}
      <div className="audit-chat-messages">
        {messages.map((msg) =>
          msg.isOwn ? (
            /* ── Own message ── */
            <div key={msg.id} className="audit-chat-own-row">
              <span className="audit-chat-own-time">{msg.time}</span>
              <div className={`audit-chat-bubble-own${variant === 'auditor' ? ' audit-chat-bubble-own--auditor' : ''}`}>
                {msg.replyCount !== undefined && (
                  <span className={`audit-chat-reply-badge${variant === 'auditor' ? ' audit-chat-reply-badge--auditor' : ''}`}>{msg.replyCount}</span>
                )}
                <span className="audit-chat-bubble-text">{msg.text}</span>
              </div>
              <div className="audit-chat-own-actions">
                <button className="audit-chat-action-btn" type="button" title="Edit">
                  <EditIcon />
                </button>
                <button className="audit-chat-action-btn" type="button" title="Delete">
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ) : (
            /* ── Others' message ── */
            <div key={msg.id} className="audit-chat-other-row">
              <div className="audit-chat-bubble-other">
                <div className="audit-chat-bubble-header">
                  <span className="audit-chat-bubble-author">{msg.author}</span>
                  <span className="audit-chat-bubble-time">{msg.time}</span>
                </div>
                <span className="audit-chat-bubble-text">{msg.text}</span>
              </div>
              <div className="audit-chat-bubble-actions">
                <button className="audit-chat-action-btn" type="button">
                  <StarIcon />
                  {msg.likeCount !== undefined && (
                    <span className="audit-chat-like-count">{msg.likeCount}</span>
                  )}
                </button>
                <button className="audit-chat-action-btn" type="button" title="Reply">
                  <ReplyIcon />
                </button>
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input card */}
      <div className="audit-chat-input-card">
        <textarea
          className="audit-chat-textarea"
          placeholder="Leave a comment"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
        />
        <div className="audit-chat-toolbar">
          <ToolbarBtn label="Heading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M4 6h16M4 12h8M4 18h16" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Text style">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Bullet list">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="3" cy="6" r="1" fill="currentColor" stroke="none" />
              <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
              <circle cx="3" cy="18" r="1" fill="currentColor" stroke="none" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Numbered list">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 10h2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 14H4l2 2-2 2h2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Attachment">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </ToolbarBtn>
        </div>
      </div>

      <p className="audit-chat-footer">View everyone in this comment section</p>
    </div>
  );
};

export default AuditChat;
