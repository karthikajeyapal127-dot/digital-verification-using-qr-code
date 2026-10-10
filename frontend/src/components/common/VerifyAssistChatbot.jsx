import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Globe, Minimize2 } from 'lucide-react';
import { chatbotApi } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function VerifyAssistChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am VerifyAssist, your digital verification AI assistant. How can I help you authenticate or manage digital identities today?',
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { language, toggleLanguage, t } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickChipsEn = [
    'How to scan QR code?',
    'What does VALID mean?',
    'What does REVOKED mean?',
    'What is Trust & Risk Score?',
    'How to create Digital ID?'
  ];

  const quickChipsTa = [
    'QR எப்படி ஸ்கேன் செய்வது?',
    'VALID என்றால் என்ன?',
    'REVOKED என்றால் என்ன?',
    'நம்பிக்கை மதிப்பெண் என்றால் என்ன?',
    'டிஜிட்டல் ஐடி பெறுவது எப்படி?'
  ];

  const quickChipsHi = [
    'QR कोड कैसे स्कैन करें?',
    'VALID का क्या अर्थ है?',
    'REVOKED का क्या मतलब है?',
    'ट्रस्ट और रिस्क स्कोर क्या है?',
    'डिजिटल आईडी कैसे बनाएं?'
  ];

  const activeChips = language === 'ta' ? quickChipsTa : language === 'hi' ? quickChipsHi : quickChipsEn;

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await chatbotApi.sendMessage(textToSend, language);
      setIsTyping(false);
      if (res && res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: res.reply,
            time: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: language === 'ta'
            ? 'மன்னிக்கவும், சேவையகத்துடன் தொடர்பு கொள்ள முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : language === 'hi'
              ? 'क्षमा करें, सत्यापन सर्वर से संपर्क करने में समस्या हुई। कृपया पुनः प्रयास करें।'
              : 'Sorry, I had trouble reaching the verification server. Please try again.',
          time: 'Just now'
        }
      ]);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.85rem 1.35rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4), 0 8px 10px -6px rgba(2, 132, 199, 0.2)',
            cursor: 'pointer',
            zIndex: 9998,
            transition: 'transform 0.2s, box-shadow 0.2s',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
        >
          <div style={{ position: 'relative' }}>
            <Bot size={20} />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 6px #10b981'
            }} />
          </div>
          <span>VerifyAssist</span>
          <span style={{
            fontSize: '0.7rem',
            backgroundColor: 'rgba(255,255,255,0.25)',
            padding: '0.15rem 0.45rem',
            borderRadius: '0.5rem'
          }}>
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '380px',
          maxWidth: 'calc(100vw - 2rem)',
          height: '520px',
          maxHeight: 'calc(100vh - 3rem)',
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'chatSlideUp 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '0.65rem',
                backgroundColor: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>VerifyAssist</span>
                  <span style={{ fontSize: '0.65rem', backgroundColor: '#0284c7', padding: '0.1rem 0.4rem', borderRadius: '0.35rem' }}>2.0</span>
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span>Online · Instant Answers</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={toggleLanguage}
                title="Switch Language"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.35rem 0.55rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Globe size={13} />
                <span>{language === 'en' ? 'தமிழ்' : 'EN'}</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  padding: '0.35rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick FAQ Chips */}
          <div style={{
            padding: '0.5rem 0.85rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {activeChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  cursor: 'pointer',
                  fontWeight: 600,
                  flexShrink: 0
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            backgroundColor: '#ffffff'
          }}>
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isUser ? '#0f172a' : '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    fontSize: '0.75rem'
                  }}>
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div style={{
                    maxWidth: '78%',
                    backgroundColor: isUser ? '#0284c7' : '#f1f5f9',
                    color: isUser ? '#ffffff' : '#0f172a',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.85rem',
                    fontSize: '0.83rem',
                    lineHeight: '1.4',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {m.text}
                    <div style={{
                      fontSize: '0.65rem',
                      color: isUser ? 'rgba(255,255,255,0.7)' : '#64748b',
                      marginTop: '0.3rem',
                      textAlign: 'right'
                    }}>
                      {m.time}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Bot size={14} />
                </div>
                <div style={{
                  backgroundColor: '#f1f5f9',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.85rem',
                  fontSize: '0.8rem',
                  color: '#64748b'
                }}>
                  <Sparkles size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  {language === 'ta' ? 'பதிலளிக்கிறது...' : 'Consulting ledger rules...'}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div style={{
            padding: '0.75rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              placeholder={language === 'ta' ? 'கேள்வி கேட்கவும்...' : 'Ask VerifyAssist a question...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                borderRadius: '0.65rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              style={{
                backgroundColor: input.trim() ? '#0284c7' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.65rem',
                padding: '0.65rem 0.85rem',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
