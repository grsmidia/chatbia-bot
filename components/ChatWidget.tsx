
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

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      parts: [{ text: input }],
      timestamp: new Date()
    };

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

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        parts: aiParts,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[2147483647] flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div 
          className="animate-slide-up pointer-events-auto flex flex-col bg-white overflow-hidden shadow-2xl border border-gray-100"
          style={{ 
            width: '350px', 
            height: '520px', 
            borderRadius: '28px', 
            marginBottom: '15px'
          }}
        >
          {/* HEADER */}
          <div className="bg-gray-900 px-5 py-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white/10 p-0.5 bg-white overflow-hidden shrink-0">
                <img src="https://i.pinimg.com/736x/63/b3/92/63b3926734c90412c089bb4fe5b59166.jpg" alt="Bia" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[15px] leading-tight">Bia Baumont</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span className="text-[9px] text-green-400 font-medium uppercase tracking-widest opacity-90">Online agora</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* MESSAGES */}
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-4 space-y-4 chat-container bg-gray-50/50"
            style={{ scrollBehavior: 'smooth' }}
          >
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

          {/* INPUT */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escreva sua mensagem..."
                className="flex-1 bg-transparent border-none py-3 text-[14px] text-gray-800 focus:outline-none placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-2 transition-all ${input.trim() && !isTyping ? 'text-gray-900' : 'text-gray-300'}`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUTTON (Bola preta com 💭) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-14 h-14 bg-gray-900 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 ${!isOpen ? 'animate-float' : ''}`}
      >
        {isOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl" style={{ transform: 'translateY(-1px)' }}>💭</span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
