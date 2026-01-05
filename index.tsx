
import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget';

const initWidget = () => {
  if (document.getElementById('bia-shadow-host')) return;

  const host = document.createElement('div');
  host.id = 'bia-shadow-host';
  // Garante que o host não interfira no layout da página
  host.style.position = 'fixed';
  host.style.bottom = '0';
  host.style.right = '0';
  host.style.zIndex = '2147483647';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Container principal do React dentro do Shadow
  const rootContainer = document.createElement('div');
  rootContainer.id = 'bia-root-container';
  shadow.appendChild(rootContainer);

  // Injetar Tailwind via LINK dentro do Shadow DOM
  // Isso aplica o Tailwind APENAS dentro do balão da Bia
  const tailwindLink = document.createElement('link');
  tailwindLink.rel = 'stylesheet';
  tailwindLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
  shadow.appendChild(tailwindLink);

  // Estilos customizados e animações
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    
    :host {
      font-family: 'Inter', sans-serif;
    }

    .chat-container::-webkit-scrollbar { width: 4px; }
    .chat-container::-webkit-scrollbar-track { background: transparent; }
    .chat-container::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
    
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    .animate-float { animation: float 3s ease-in-out infinite; }
    
    @keyframes pulse-cta {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); }
      70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(5, 150, 105, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
    }
    .animate-pulse-cta { animation: pulse-cta 2s infinite; }
  `;
  shadow.appendChild(styleTag);

  const root = ReactDOM.createRoot(rootContainer);
  root.render(
    <React.StrictMode>
      <ChatWidget />
    </React.StrictMode>
  );
};

// Dispara a inicialização
if (document.readyState === 'complete') {
  initWidget();
} else {
  window.addEventListener('load', initWidget);
}
