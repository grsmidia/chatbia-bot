
import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget';

const initWidget = () => {
  if (document.getElementById('bia-shadow-host')) return;

  const host = document.createElement('div');
  host.id = 'bia-shadow-host';
  // O host agora é apenas um ponto de ancoragem fixo no canto
  host.style.position = 'fixed';
  host.style.bottom = '0';
  host.style.right = '0';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none'; // Permite clicar "através" da área vazia do host
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  const rootContainer = document.createElement('div');
  rootContainer.id = 'bia-root-container';
  rootContainer.style.pointerEvents = 'auto'; // Reativa eventos dentro do widget
  shadow.appendChild(rootContainer);

  const tailwindLink = document.createElement('link');
  tailwindLink.rel = 'stylesheet';
  tailwindLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
  shadow.appendChild(tailwindLink);

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    
    :host { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* Reset básico para evitar vazamentos de estilo da Shopify */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .chat-container::-webkit-scrollbar { width: 4px; }
    .chat-container::-webkit-scrollbar-track { background: transparent; }
    .chat-container::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
    
    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
    .animate-float { animation: float 3s ease-in-out infinite; }
    
    @keyframes slideUp { 
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
  `;
  shadow.appendChild(styleTag);

  const root = ReactDOM.createRoot(rootContainer);
  root.render(
    <React.StrictMode>
      <ChatWidget />
    </React.StrictMode>
  );
};

if (document.readyState === 'complete') {
  initWidget();
} else {
  window.addEventListener('load', initWidget);
}
