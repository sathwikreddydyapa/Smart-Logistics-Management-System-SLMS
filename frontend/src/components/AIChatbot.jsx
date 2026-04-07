import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import api from '../services/api';

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "I am MUSEPHIC, your AI Logistics Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, isBot: false }]);
    setInput("");

    // Simulate typing
    setMessages(prev => [...prev, { id: Date.now() + 1, text: "...", isBot: true, isTyping: true }]);

    try {
      const res = await api.post('/ai/consult', { prompt: userMsg });
      
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isTyping);
        return [...filtered, { id: Date.now() + 2, text: res.data.response, isBot: true }];
      });
    } catch (error) {
       setMessages(prev => {
        const filtered = prev.filter(m => !m.isTyping);
        return [...filtered, { id: Date.now() + 2, text: "Error consulting AI engine.", isBot: true }];
      });
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: '30px', right: '30px',
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--primary))',
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            transition: 'transform 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-panel" style={{
          position: 'fixed', bottom: '30px', right: '30px',
          width: '350px', height: '480px', display: 'flex', flexDirection: 'column',
          zIndex: 1000, overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px', background: 'rgba(0,0,0,0.4)', 
            borderBottom: '1px solid var(--border-color)', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <Bot size={20} color="var(--accent)" />
              <span style={{fontWeight:'600'}}>MUSEPHIC AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer'}}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1, padding: '16px', overflowY: 'auto', display: 'flex',
            flexDirection: 'column', gap: '12px'
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex', justifyContent: msg.isBot ? 'flex-start' : 'flex-end',
                gap: '8px'
              }}>
                {msg.isBot && <Bot size={16} color="var(--accent)" style={{marginTop:'4px'}} />}
                <div style={{
                  background: msg.isBot ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                  padding: '10px 14px', borderRadius: '12px', maxWidth: '80%',
                  fontSize: '14px', lineHeight: '1.4',
                  borderBottomLeftRadius: msg.isBot ? '2px' : '12px',
                  borderBottomRightRadius: !msg.isBot ? '2px' : '12px'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '16px', borderTop: '1px solid var(--border-color)',
            display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)'
          }}>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              style={{
                flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)',
                borderRadius: '20px', padding: '10px 16px', color: 'white',
                outline: 'none', fontSize: '14px'
              }}
            />
            <button onClick={handleSend} style={{
              background: 'var(--primary)', border: 'none', borderRadius: '50%',
              width: '40px', height: '40px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', cursor: 'pointer'
            }}>
              <Send size={18} style={{marginLeft:'-2px'}} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
