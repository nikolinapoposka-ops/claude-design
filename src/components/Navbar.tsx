import React, { useState, useRef, useEffect } from 'react';

interface InsightCard {
  type: 'alert' | 'risk' | 'positive' | 'task';
  title: string;
  value?: string;
  description: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ava';
  text: string;
  action?: { label: string; type: 'open-template'; templateTitle: string };
  cards?: InsightCard[];
  templateCard?: { title: string; sections: string[]; category: string };
  taskCard?: { title: string; priority: string; due: string; category: string };
}

interface NavbarProps {
  onScheduleClick?: () => void;
  onEmployeeHubClick?: () => void;
  activeSection?: 'schedule' | 'employee-hub' | null;
  onAvaCreateTemplate?: (title: string) => void;
}

const AVA_SUGGESTIONS = [
  'How are my stores performing?',
  'Who are my top performers?',
  'Which areas need attention?',
  'Create a food safety audit template',
];

const AVA_INSIGHTS = [
  {
    type: 'positive' as const,
    icon: 'star' as const,
    title: 'James Wilson is your top performer',
    description: 'Avg score 93% across Dallas, Houston & Austin. Consistently on time, zero overdue follow-ups.',
  },
  {
    type: 'alert' as const,
    icon: 'trend-down' as const,
    title: 'Operations dropped 18% in February',
    description: 'All 18 stores declined. Feb avg 64% vs Jan 82%. Largest monthly drop this year.',
  },
  {
    type: 'risk' as const,
    icon: 'flag' as const,
    title: 'Lisa Chen\'s region needs attention',
    description: 'Southwest stores declined 3 consecutive quarters. Fire Safety at 58% — 20pts below avg.',
  },
  {
    type: 'task' as const,
    icon: 'clock' as const,
    title: '12 follow-up tasks overdue',
    description: '5 in Midwest, 4 in Southwest. Oldest is 45 days past due. Mostly Fire Safety.',
  },
];

const Navbar: React.FC<NavbarProps> = ({ onScheduleClick, onEmployeeHubClick, activeSection, onAvaCreateTemplate }) => {
  const [avaOpen, setAvaOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [avaTyping, setAvaTyping] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, avaTyping]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const btn = document.querySelector('.ava-nav-btn');
        if (btn && btn.contains(e.target as Node)) return;
        setAvaOpen(false);
      }
    };
    if (avaOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [avaOpen]);

  const simulateAvaResponse = (userText: string) => {
    setAvaTyping(true);
    const lower = userText.toLowerCase();
    const msg: ChatMessage = { id: `ava-${Date.now()}`, role: 'ava', text: '' };

    if (lower.includes('top performer') || lower.includes('best performer') || lower.includes('best auditor') || lower.includes('who is the best') || lower.includes('who are my top')) {
      msg.text = 'Here are your auditors ranked by performance:';
      msg.cards = [
        { type: 'positive', title: 'James Wilson — Texas', value: '93%', description: '3 stores, avg 93%. Zero overdue tasks. Highest consistency score across all auditors.' },
        { type: 'positive', title: 'John Smith — East Coast', value: '91%', description: '3 stores, avg 91%. NY is top store company-wide. 1 open follow-up.' },
        { type: 'alert', title: 'Emily Davis — West Coast', value: '79%', description: '4 stores, avg 79%. Solid but carrying the heaviest store load. Watch for burnout.' },
        { type: 'alert', title: 'Sarah Johnson — Southeast', value: '78%', description: '3 stores, avg 78%. Charlotte strong (82%), Miami lagging (72%). Improving trend.' },
        { type: 'risk', title: 'Maria Garcia — Midwest', value: '65%', description: '3 stores, avg 65%. Denver is weakest at 58%. Declining since Q3. May need support.' },
        { type: 'risk', title: 'Lisa Chen — Southwest', value: '61%', description: '3 stores, avg 61%. Declined 3 consecutive quarters. Consider a coaching session.' },
      ];
    } else if (lower.includes('area') || lower.includes('region') || lower.includes('which area') || lower.includes('location') || lower.includes('need attention') || lower.includes('struggling')) {
      msg.text = 'Here\'s how your regions compare:';
      msg.cards = [
        { type: 'positive', title: 'Texas', value: '93%', description: 'Top region. Dallas & Houston near-perfect on Operations and VM. Strong across all audit types.' },
        { type: 'positive', title: 'East Coast', value: '91%', description: 'NY leads company-wide. Boston & DC solid. Consistent quarter over quarter.' },
        { type: 'alert', title: 'Southeast', value: '78%', description: 'Charlotte is strong (82%), but Miami drags the average down (72%). Gap widening.' },
        { type: 'alert', title: 'West Coast', value: '79%', description: 'SF improving steadily. LA and Seattle are mid-range. Portland needs attention on Safety.' },
        { type: 'risk', title: 'Midwest', value: '65%', description: 'Denver is the weakest store at 58%. All 3 stores below company avg. Fire Safety critical.' },
        { type: 'risk', title: 'Southwest', value: '61%', description: 'Lowest region. Las Vegas at 56%. Declined 3 quarters in a row. Recommend focused action plan.' },
      ];
    } else if (lower.includes('workload') || lower.includes('burnout') || lower.includes('capacity') || lower.includes('overloaded') || lower.includes('balance')) {
      msg.text = 'Here\'s the current workload distribution:';
      msg.cards = [
        { type: 'risk', title: 'Emily Davis — West Coast', value: '4 stores', description: 'Heaviest load. 3 active audits this month + 6 open follow-ups. Consider redistributing.' },
        { type: 'alert', title: 'Maria Garcia — Midwest', value: '3 stores', description: '2 active audits, 4 open follow-ups. Low scores may indicate she needs support, not more work.' },
        { type: 'positive', title: 'James Wilson — Texas', value: '3 stores', description: '1 active audit, 0 overdue tasks. Has capacity — could take on a coaching role.' },
        { type: 'positive', title: 'John Smith — East Coast', value: '3 stores', description: '2 active audits, 1 open follow-up. Well-balanced workload.' },
      ];
    } else if (lower.includes('coaching') || lower.includes('retrain') || lower.includes('improve') || lower.includes('recommend') || lower.includes('what should i do') || lower.includes('action')) {
      msg.text = 'Here are my recommended actions:';
      msg.cards = [
        { type: 'risk', title: 'Schedule coaching: Lisa Chen', value: 'Urgent', description: 'Southwest declined 3 quarters. A focused review on Fire Safety protocols could reverse the trend.' },
        { type: 'risk', title: 'Support Maria Garcia', value: 'Urgent', description: 'Denver scores dropped 8pts since Q3. Consider pairing with James Wilson for peer mentoring.' },
        { type: 'alert', title: 'Rebalance Emily Davis\'s load', value: 'Soon', description: 'She manages 4 stores vs avg of 3. Reassign Portland to reduce burnout risk.' },
        { type: 'positive', title: 'Recognize James Wilson', value: 'Positive', description: 'Top performer for 3 consecutive quarters. Flag for recognition or expanded responsibilities.' },
        { type: 'alert', title: 'Investigate Feb Operations drop', value: 'Soon', description: 'All 18 stores dropped simultaneously — likely a systemic issue, not individual. Check if process changed.' },
      ];
    } else if (lower.includes('insight') || lower.includes('reporting') || lower.includes('performance') || lower.includes('trend') || lower.includes('score') || lower.includes('how are') || lower.includes('overview') || lower.includes('summary')) {
      msg.text = 'Here\'s a snapshot of your audit performance:';
      msg.cards = [
        { type: 'alert', title: 'Operations Review', value: '-18%', description: 'Feb avg 64% vs Jan 82% — largest monthly drop this year across all 18 stores.' },
        { type: 'risk', title: 'Southwest Region', value: '58%', description: 'Las Vegas, Phoenix & San Diego trail the company average by 15–20 pts. Fire Safety is weakest.' },
        { type: 'positive', title: 'Visual Merchandising', value: '+28%', description: 'Strongest improvement since Q1 2024. NY, Dallas & Charlotte now at 99%.' },
        { type: 'task', title: 'Open Follow-ups', value: '12', description: 'Mostly Fire Safety in Midwest & Southwest. Oldest task is 45 days overdue.' },
      ];
    } else if (lower.includes('checklist') || lower.includes('audit template') || (lower.includes('audit') && lower.includes('create')) || (lower.includes('create') && lower.includes('audit'))) {
      const isFood = lower.includes('food safety');
      const isOpening = lower.includes('opening');
      const templateTitle = isFood ? 'Food Safety & Hygiene Inspection' : isOpening ? 'Store Opening Checklist' : 'Brand Standards Audit';
      const sections = isFood ? ['Kitchen Hygiene', 'Cold Storage', 'Staff Compliance'] : isOpening ? ['Store Presentation', 'Cash & POS Setup', 'Safety Check'] : ['Visual Merchandising', 'Signage', 'Cleanliness'];
      const category = isFood ? 'Safety' : isOpening ? 'Operations' : 'Branding';
      msg.text = 'I\'ve drafted a template for you:';
      msg.templateCard = { title: templateTitle, sections, category };
      msg.action = { label: 'Open in template editor', type: 'open-template', templateTitle };
    } else if (lower.includes('task')) {
      const title = lower.includes('restock') ? 'Restock front displays' : 'New task';
      const priority = (lower.includes('urgent') || lower.includes('priority')) ? 'High' : 'Normal';
      const due = lower.includes('friday') ? 'Friday' : lower.includes('thursday') ? 'Thursday' : 'End of week';
      msg.text = 'Done! Here\'s the task:';
      msg.taskCard = { title, priority, due, category: 'Operations' };
    } else if (lower.includes('story')) {
      const storyTitle = (lower.includes('summer') || lower.includes('campaign')) ? 'Summer Campaign Launch' : 'New Story';
      msg.text = `I've drafted a story: **${storyTitle}**\n\nI can add text, images, and attachments. Want me to open the story editor?`;
    } else {
      msg.text = 'I can help you with:';
      msg.cards = [
        { type: 'positive', title: 'Performance insights', value: '', description: '"How are my stores performing?" or "Give me an overview"' },
        { type: 'positive', title: 'People analytics', value: '', description: '"Who are my top performers?" or "Who needs coaching?"' },
        { type: 'alert', title: 'Region comparison', value: '', description: '"Which areas need attention?" or "Compare my regions"' },
        { type: 'task', title: 'Recommendations', value: '', description: '"What should I do?" or "Give me action items"' },
        { type: 'positive', title: 'Create content', value: '', description: '"Create a food safety audit" or "Create a task"' },
      ];
    }

    setTimeout(() => {
      setMessages(prev => [...prev, msg]);
      setAvaTyping(false);
    }, 1200);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', text }]);
    setInput('');
    simulateAvaResponse(text);
  };

  const handleSuggestion = (text: string) => {
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', text }]);
    simulateAvaResponse(text);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <img
            src="https://www.figma.com/api/mcp/asset/0116bdaa-392d-4506-a2ac-96ed07982fe0"
            alt="Quinyx Logo"
            className="logo-image"
          />
        </div>

        <button className="nav-button">DASHBOARD</button>
        <button className="nav-button nav-button-dropdown" onClick={onScheduleClick}>
          SCHEDULE
          <svg className="chevron" viewBox="0 0 10 5" fill="white">
            <path d="M0 0l5 5 5-5z" />
          </svg>
        </button>
        <button className="nav-button nav-button-dropdown">
          TIME
          <svg className="chevron" viewBox="0 0 10 5" fill="white">
            <path d="M0 0l5 5 5-5z" />
          </svg>
        </button>
        <button className="nav-button">PEOPLE</button>
        <button className="nav-button">ANALYTICS</button>
        <button className="nav-button">FORECAST</button>
        <button
          className={`nav-button${activeSection === 'employee-hub' ? ' nav-button-active' : ''}`}
          onClick={onEmployeeHubClick}
        >
          EMPLOYEE HUB
        </button>
      </div>

      <div className="navbar-right">
        <button className="nav-button nav-button-dropdown">
          Unit Name
          <svg className="chevron" viewBox="0 0 10 5" fill="white">
            <path d="M0 0l5 5 5-5z" />
          </svg>
        </button>

        {/* Ava AI button */}
        <button
          className={`nav-icon-button ava-nav-btn${avaOpen ? ' ava-nav-btn--active' : ''}`}
          onClick={() => setAvaOpen(o => !o)}
          aria-label="Ava AI Assistant"
        >
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <rect x="2" y="2" width="20" height="20" rx="10" fill="url(#ava-gradient)" />
            <path d="M8 14.5c0 0 1.5 2 4 2s4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="9" cy="10.5" r="1.2" fill="white" />
            <circle cx="15" cy="10.5" r="1.2" fill="white" />
            <defs>
              <linearGradient id="ava-gradient" x1="2" y1="2" x2="22" y2="22">
                <stop stopColor="#7c3aed" />
                <stop offset="1" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
        </button>

        <button className="nav-icon-button">
          <img
            src="https://www.figma.com/api/mcp/asset/65c87913-535d-4fca-aca8-154fd033195b"
            alt="Mail"
            className="icon"
          />
        </button>
        <button className="nav-icon-button nav-button-dropdown">
          <div className="avatar">
            <span className="avatar-text">SJ</span>
          </div>
          <svg className="chevron" viewBox="0 0 10 5" fill="white">
            <path d="M0 0l5 5 5-5z" />
          </svg>
        </button>
      </div>

      {/* Ava chat panel */}
      {avaOpen && (
        <div className="ava-panel" ref={panelRef}>
          <div className="ava-panel-header">
            <div className="ava-panel-header-left">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <rect x="2" y="2" width="20" height="20" rx="10" fill="url(#ava-gradient2)" />
                <path d="M8 14.5c0 0 1.5 2 4 2s4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="9" cy="10.5" r="1.2" fill="white" />
                <circle cx="15" cy="10.5" r="1.2" fill="white" />
                <defs>
                  <linearGradient id="ava-gradient2" x1="2" y1="2" x2="22" y2="22">
                    <stop stopColor="#7c3aed" />
                    <stop offset="1" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="ava-panel-title">Ava</span>
              <span className="ava-panel-badge">AI Assistant</span>
            </div>
            <button className="ava-panel-close" onClick={() => setAvaOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Persistent insights section */}
          <div className="ava-insights-strip">
            <div className="ava-insights-strip-header">
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                <rect x="2" y="2" width="20" height="20" rx="10" fill="url(#ava-gradient3)" />
                <path d="M8 14.5c0 0 1.5 2 4 2s4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="9" cy="10.5" r="1.2" fill="white" />
                <circle cx="15" cy="10.5" r="1.2" fill="white" />
                <defs>
                  <linearGradient id="ava-gradient3" x1="2" y1="2" x2="22" y2="22">
                    <stop stopColor="#7c3aed" />
                    <stop offset="1" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="ava-insights-strip-title">Today's insights</span>
            </div>
            <div className="ava-insights">
              {AVA_INSIGHTS.map((insight, i) => (
                <div key={i} className={`ava-insight-card ava-insight-card--${insight.type}`}>
                  <div className="ava-insight-icon">
                    {insight.icon === 'star' && (
                      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
                    {insight.icon === 'trend-down' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                        <polyline points="17 18 23 18 23 12" />
                      </svg>
                    )}
                    {insight.icon === 'flag' && (
                      <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    )}
                    {insight.icon === 'clock' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    )}
                  </div>
                  <div className="ava-insight-body">
                    <span className="ava-insight-title">{insight.title}</span>
                    <span className="ava-insight-desc">{insight.description}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="ava-suggestions">
              {AVA_SUGGESTIONS.map((s) => (
                <button key={s} className="ava-suggestion-chip" onClick={() => handleSuggestion(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="ava-panel-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`ava-msg ava-msg--${msg.role}`}>
                {msg.role === 'ava' && (
                  <div className="ava-msg-avatar">
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                      <rect x="2" y="2" width="20" height="20" rx="10" fill="url(#ava-gradient4)" />
                      <path d="M8 14.5c0 0 1.5 2 4 2s4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="9" cy="10.5" r="1.2" fill="white" />
                      <circle cx="15" cy="10.5" r="1.2" fill="white" />
                      <defs>
                        <linearGradient id="ava-gradient4" x1="2" y1="2" x2="22" y2="22">
                          <stop stopColor="#7c3aed" />
                          <stop offset="1" stopColor="#2563eb" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}
                <div className={`ava-msg-bubble ava-msg-bubble--${msg.role}`}>
                  {/* Text with bold support */}
                  {msg.text && (
                    <div className="ava-msg-text">
                      {msg.text.split('\n').map((line, i) => (
                        <span key={i}>
                          {line.replace(/\*\*(.*?)\*\*/g, '⟨$1⟩').split('⟨').map((part, j) => {
                            if (part.includes('⟩')) {
                              const [bold, rest] = part.split('⟩');
                              return <span key={j}><strong>{bold}</strong>{rest}</span>;
                            }
                            return <span key={j}>{part}</span>;
                          })}
                          {i < msg.text.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Insight / metric cards */}
                  {msg.cards && (
                    <div className="ava-resp-cards">
                      {msg.cards.map((card, ci) => (
                        <div key={ci} className={`ava-resp-card ava-resp-card--${card.type}`}>
                          <div className="ava-resp-card-header">
                            <span className="ava-resp-card-title">{card.title}</span>
                            {card.value && <span className={`ava-resp-card-value ava-resp-card-value--${card.type}`}>{card.value}</span>}
                          </div>
                          <span className="ava-resp-card-desc">{card.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Template card */}
                  {msg.templateCard && (
                    <div className="ava-template-card">
                      <div className="ava-template-card-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span className="ava-template-card-name">{msg.templateCard.title}</span>
                        <span className="ava-template-card-cat">{msg.templateCard.category}</span>
                      </div>
                      <div className="ava-template-card-sections">
                        {msg.templateCard.sections.map((s) => (
                          <span key={s} className="ava-template-section-pill">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Task card */}
                  {msg.taskCard && (
                    <div className="ava-task-card">
                      <div className="ava-task-card-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                        <span className="ava-task-card-name">{msg.taskCard.title}</span>
                      </div>
                      <div className="ava-task-card-meta">
                        <span className={`ava-task-meta-pill${msg.taskCard.priority === 'High' ? ' ava-task-meta-pill--high' : ''}`}>{msg.taskCard.priority}</span>
                        <span className="ava-task-meta-pill">{msg.taskCard.due}</span>
                        <span className="ava-task-meta-pill">{msg.taskCard.category}</span>
                      </div>
                    </div>
                  )}

                  {/* Action button */}
                  {msg.action && (
                    <button
                      className="ava-action-btn"
                      onClick={() => {
                        if (msg.action!.type === 'open-template' && onAvaCreateTemplate) {
                          onAvaCreateTemplate(msg.action!.templateTitle);
                          setAvaOpen(false);
                        }
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      {msg.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {avaTyping && (
              <div className="ava-msg ava-msg--ava">
                <div className="ava-msg-avatar">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <rect x="2" y="2" width="20" height="20" rx="10" fill="url(#ava-gradient5)" />
                    <path d="M8 14.5c0 0 1.5 2 4 2s4-2 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="9" cy="10.5" r="1.2" fill="white" />
                    <circle cx="15" cy="10.5" r="1.2" fill="white" />
                    <defs>
                      <linearGradient id="ava-gradient5" x1="2" y1="2" x2="22" y2="22">
                        <stop stopColor="#7c3aed" />
                        <stop offset="1" stopColor="#2563eb" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="ava-msg-bubble ava-msg-bubble--ava ava-typing">
                  <span className="ava-dot" /><span className="ava-dot" /><span className="ava-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ava-panel-input-area">
            <div className="ava-input-wrapper">
              <textarea
                className="ava-panel-input"
                placeholder="Ask Ava anything..."
                value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                rows={1}
              />
              <button className="ava-panel-send" onClick={handleSend} disabled={!input.trim()}>
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
