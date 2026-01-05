
import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget';

const initWidget = () => {
  if (document.getElementById('bia-shadow-host')) return;

  const host = document.createElement('div');
  host.id = 'bia-shadow-host';
  // O host ocupa a tela toda para permitir o fullscreen no mobile, mas pointer-events: none permite clicar no site por baixo.
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100dvh',
    zIndex: '2147483647',
    pointerEvents: 'none',
  });
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  
  const rootContainer = document.createElement('div');
  rootContainer.id = 'bia-root-container';
  Object.assign(rootContainer.style, {
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  });
  shadow.appendChild(rootContainer);

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
    
    :host { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    button, input, div {
      box-sizing: border-box;
    }

    .chat-container::-webkit-scrollbar { width: 5px; }
    .chat-container::-webkit-scrollbar-track { background: transparent; }
    .chat-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    
    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
    .animate-float { animation: float 3s ease-in-out infinite; }
    
    @keyframes slideUp { 
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0, 0, 0.2, 1) forwards; }
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
