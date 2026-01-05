
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

  const playPopSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

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
      await new Promise(resolve => setTimeout(resolve, 600));
      playPopSound();

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
    <div className="fixed bottom-8 right-4 sm:bottom-12 sm:right-8 z-[2147483647] flex flex-col items-end">
      {isOpen && (
        <div className="animate-slide-up w-[320px] sm:w-[380px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden mb-5 border border-gray-200">
          {/* Header Sólido */}
          <div className="bg-gray-900 px-5 py-4 flex items-center justify-between text-white shrink-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-white/20 p-0.5 overflow-hidden bg-white">
                <img 
                  src="https://i.pinimg.com/736x/63/b3/92/63b3926734c90412c089bb4fe5b59166.jpg" 
                  alt="Bia" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="font-bold text-[15px] leading-none">Bia Baumont</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[11px] font-medium text-green-400">Online e pronta pra ajudar</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-white/10 p-2 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Área de Chat com Fundo Sólido */}
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-4 chat-container space-y-4 bg-gray-50/50"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Fixo no Fundo */}
          <div className="bg-white p-4 border-t border-gray-100 shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-gray-900/5 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escreva sua mensagem..."
                className="flex-1 bg-transparent border-none px-3 py-2 text-[14px] text-gray-800 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-2.5 rounded-xl transition-all ${input.trim() && !isTyping ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante Otimizado */}
      <button
        onClick={() => { if(!isOpen) playPopSound(); setIsOpen(!isOpen); }}
        className={`group relative w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center justify-center text-white transition-all duration-300 ${!isOpen ? 'animate-float' : 'rotate-90 scale-90'}`}
      >
        {!isOpen && (
          <div className="absolute -top-12 right-0 bg-white text-gray-900 px-4 py-2 rounded-2xl rounded-br-none text-[12px] font-bold shadow-2xl border border-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all pointer-events-none">
            Dúvidas? Fale comigo! 😊
          </div>
        )}
        {isOpen ? (
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
