
import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget';

const initWidget = () => {
  if (document.getElementById('bia-shadow-host')) return;

  const host = document.createElement('div');
  host.id = 'bia-shadow-host';
  host.style.position = 'fixed';
  host.style.bottom = '0';
  host.style.right = '0';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';
  host.style.width = '100%';
  host.style.height = '100%';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  const rootContainer = document.createElement('div');
  rootContainer.id = 'bia-root-container';
  rootContainer.style.pointerEvents = 'auto';
  rootContainer.style.position = 'absolute';
  rootContainer.style.bottom = '0';
  rootContainer.style.right = '0';
  rootContainer.style.width = '100%';
  rootContainer.style.height = '100%';
  shadow.appendChild(rootContainer);

  const tailwindLink = document.createElement('link');
  tailwindLink.rel = 'stylesheet';
  tailwindLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
  shadow.appendChild(tailwindLink);

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    :host { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* RESET AGRESSIVO: Impede que o CSS do tema Shopify afete o chat */
    * {
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
      max-width: none !important;
      max-height: none !important;
      line-height: 1.5;
    }

    button, input {
      font-family: inherit;
    }

    .chat-container::-webkit-scrollbar { width: 4px; }
    .chat-container::-webkit-scrollbar-track { background: transparent; }
    .chat-container::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
    
    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
    .animate-float { animation: float 3s ease-in-out infinite; }
    
    @keyframes slideUp { 
      from { transform: translateY(20px) scale(0.98); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    .animate-slide-up { animation: slideUp 0.25s cubic-bezier(0, 0, 0.2, 1) forwards; }
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
