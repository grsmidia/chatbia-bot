
import React, { useState, useRef, useEffect } from 'react';
import { Message, MessagePart } from '../types';
import MessageBubble from './MessageBubble';
import { sendMessage } from '../services/geminiService';
import { PRODUCT_IDS, CHECKOUT_BASE_URL, UTM_PARAMS } from '../constants';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('baumont_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) { setInitialWelcome(); }
    } else { setInitialWelcome(); }
  }, []);

  const setInitialWelcome = () => {
    setMessages([{
      id: 'welcome',
      type: 'ai',
      parts: [{ text: 'Oi, tudo bem? 😊 Sou a Bia! Como posso te ajudar hoje?' }],
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), type: 'user', parts: [{ text: input }], timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendMessage(input);
      const aiParts: MessagePart[] = [];
      if (response.text) aiParts.push({ text: response.text });
      
      if (response.functionCalls) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'generateCheckoutLink') {
            const items = fc.args.items as any[];
            const linkParts = items.map(item => `${PRODUCT_IDS[item.color as keyof typeof PRODUCT_IDS]}:${item.quantity}`);
            const checkoutUrl = `${CHECKOUT_BASE_URL}${linkParts.join('&')}?${UTM_PARAMS}`;
            aiParts.push({ button: { label: 'Finalizar Pedido Agora 🛍️', url: checkoutUrl, type: 'checkout' } });
          }
          if (fc.name === 'showSupportOptions') {
            aiParts.push({ button: { label: '📦 Rastrear Pedido', url: 'https://www.lojabaumont.com.br/pages/rastreio-de-pedidos', type: 'support' } });
          }
        }
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'ai', parts: aiParts, timestamp: new Date() }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* BOTÃO FLUTUANTE (BALÃO) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="animate-float"
          style={{
            pointerEvents: 'auto',
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            width: '65px',
            height: '65px',
            backgroundColor: '#111827',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '28px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            zIndex: 999999,
            border: 'none',
            outline: 'none'
          }}
        >
          💭
        </button>
      )}

      {/* JANELA DE CHAT */}
      {isOpen && (
        <div 
          className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[360px] sm:h-[550px] bg-white sm:rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-slide-in"
          style={{ pointerEvents: 'auto', zIndex: 1000000 }}
        >
          {/* HEADER */}
          <div className="bg-gray-900 p-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <img src="https://i.pinimg.com/736x/63/b3/92/63b3926734c90412c089bb4fe5b59166.jpg" className="w-10 h-10 rounded-full border border-white/20" alt="Bia" />
              <div>
                <p className="font-bold text-sm">Bia Baumont</p>
                <p className="text-[10px] text-green-400 uppercase tracking-tighter">● Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* MESSAGES */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 chat-container">
            {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
            {isTyping && <div className="p-2 text-gray-400 text-xs italic animate-pulse">Bia está digitando...</div>}
          </div>

          {/* INPUT */}
          <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
            <div className="flex gap-2 items-center bg-gray-100 rounded-xl px-3">
              <input
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Como posso ajudar?"
                className="flex-1 bg-transparent border-none py-3 text-sm focus:outline-none"
              />
              <button onClick={handleSend} className="text-gray-900 p-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[10px] text-gray-400 uppercase font-bold text-center tracking-widest hover:text-gray-600 transition-colors">
              Voltar ao site
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
