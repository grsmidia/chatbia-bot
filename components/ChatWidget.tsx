
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('baumont_chat_history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        setInitialWelcome();
      }
    } else {
      setInitialWelcome();
    }
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audioRef.current.volume = 0.2;
  }, []);

  const setInitialWelcome = () => {
    setMessages([{
      id: 'welcome',
      type: 'ai',
      parts: [{ text: 'Oi, tudo bem? 😊 Sou a Bia! Como posso te ajudar a escolher sua Bolsa Cartagena hoje?' }],
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  // Fix para o Mobile: Trava o scroll do fundo mas mantém a altura dinâmica
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = originalStyle; };
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage: Message = { id: Date.now().toString(), type: 'user', parts: [{ text: input }], timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    try {
      const response = await sendMessage(currentInput);
      if (audioRef.current) audioRef.current.play().catch(() => {});
      const aiParts: MessagePart[] = [];
      if (response.text) aiParts.push({ text: response.text });
      if (response.functionCalls) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'generateCheckoutLink') {
            const items = fc.args.items as Array<{ color: 'palha' | 'marrom', quantity: number }>;
            const linkParts = items.map(item => `${PRODUCT_IDS[item.color]}:${item.quantity}`);
            const checkoutUrl = `${CHECKOUT_BASE_URL}${linkParts.join('&')}?${UTM_PARAMS}`;
            aiParts.push({ button: { label: 'Finalizar meu Pedido Agora 🛍️', url: checkoutUrl, type: 'checkout' } });
          }
          if (fc.name === 'showSupportOptions') {
            aiParts.push({ button: { label: '📦 Rastrear Pedido', url: 'https://www.lojabaumont.com.br/pages/rastreio-de-pedidos', type: 'support' } });
            aiParts.push({ button: { label: '💬 WhatsApp Suporte', url: 'https://wa.me/5516991574063', type: 'whatsapp' } });
          }
        }
      }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'ai', parts: aiParts, timestamp: new Date() }]);
    } catch (error) { console.error(error); } finally { setIsTyping(false); }
  };

  return (
    <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
      {/* JANELA DE CHAT */}
      {isOpen && (
        <div 
          className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[350px] sm:h-[550px] bg-white sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-slide-up pointer-events-auto"
          style={{ zIndex: 100, pointerEvents: 'auto' }}
        >
          {/* HEADER */}
          <div className="bg-gray-900 p-5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white/20 p-0.5 bg-white overflow-hidden">
                <img src="https://i.pinimg.com/736x/63/b3/92/63b3926734c90412c089bb4fe5b59166.jpg" alt="Bia" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[15px] leading-tight">Bia Baumont</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span className="text-[9px] text-green-400 font-medium uppercase tracking-widest opacity-80">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white sm:hidden">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* MESSAGES */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 chat-container bg-gray-50/50">
            {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0 pb-8 sm:pb-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escreva sua mensagem..."
                className="flex-1 bg-transparent border-none py-3 text-[16px] text-gray-800 focus:outline-none placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-2 transition-all ${input.trim() && !isTyping ? 'text-gray-900' : 'text-gray-300'}`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                Voltar ao site
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BALÃO FLUTUANTE (BOTÃO) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="animate-float"
          style={{
            pointerEvents: 'auto',
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            backgroundColor: '#111827', // Gray-900
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 99,
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '24px' }}>💭</span>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
