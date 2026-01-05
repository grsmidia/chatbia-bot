
import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget';

const initWidget = () => {
  if (document.getElementById('bia-shadow-host')) return;

  // 1. Host fixo na tela toda, mas transparente a cliques
  const host = document.createElement('div');
  host.id = 'bia-shadow-host';
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '2147483647',
    pointerEvents: 'none',
  });
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  
  // 2. Container interno que define o contexto de posicionamento
  const rootContainer = document.createElement('div');
  rootContainer.id = 'bia-root-container';
  Object.assign(rootContainer.style, {
    position: 'relative',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  });
  shadow.appendChild(rootContainer);

  // 3. Estilos globais do Widget (Injetando Tailwind e CSS Base)
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    :host { 
      font-family: 'Inter', sans-serif;
    }

    * { box-sizing: border-box; }

    .chat-container::-webkit-scrollbar { width: 4px; }
    .chat-container::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
    
    @keyframes float { 
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-float { animation: float 3s ease-in-out infinite; }
    
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
  `;
  shadow.appendChild(styleTag);

  const root = ReactDOM.createRoot(rootContainer);
  root.render(
    <React.StrictMode>
      <ChatWidget />
    </React.StrictMode>
  );
};

// Executa assim que possível
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  initWidget();
}
