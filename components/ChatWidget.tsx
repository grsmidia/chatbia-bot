
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
  }, [messages, isTyping]);

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
    <div className="fixed bottom-12 right-2 sm:right-3 z-[2147483647] flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="animate-slide-up pointer-events-auto w-[310px] sm:w-[360px] h-[500px] bg-white rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden mb-4 border border-gray-100">
          {/* HEADER FIXO */}
          <div className="bg-gray-900 px-5 py-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-white/20 p-0.5 bg-white">
                <img src="https://i.pinimg.com/736x/63/b3/92/63b3926734c90412c089bb4fe5b59166.jpg" alt="Bia" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">Bia Baumont</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* ÁREA DE MENSAGENS COM SCROLL FIXO */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 chat-container space-y-4 bg-[#fcfcfc]">
            {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT FIXO NO RODAPÉ */}
          <div className="p-3 bg-white border-t border-gray-50 shrink-0">
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escreva aqui..."
                className="flex-1 bg-transparent border-none py-2 text-sm text-gray-800 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-2 rounded-xl transition-all ${input.trim() && !isTyping ? 'bg-gray-900 text-white' : 'text-gray-300'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO FLUTUANTE REDUZIDO */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto relative w-12 h-12 sm:w-13 sm:h-13 bg-gray-900 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-90 animate-float"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
