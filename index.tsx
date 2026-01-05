
import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget';
import App from './App';

const initWidget = () => {
  // 1. Tenta achar o container que você colocou no Shopify
  const biaContainer = document.getElementById('bia-chat-widget');
  
  // 2. Se achar (Modo Shopify), renderiza só o Widget lá dentro
  if (biaContainer) {
    const root = ReactDOM.createRoot(biaContainer);
    root.render(
      <React.StrictMode>
        <ChatWidget />
      </React.StrictMode>
    );
    return;
  }

  // 3. Se estiver na Vercel (onde tem o id="root"), usa o App.tsx limpo
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    // 4. Fallback: Se não tiver nada, cria um div no body e injeta
    const autoDiv = document.createElement('div');
    autoDiv.id = 'bia-chat-widget-auto';
    document.body.appendChild(autoDiv);
    const root = ReactDOM.createRoot(autoDiv);
    root.render(
      <React.StrictMode>
        <ChatWidget />
      </React.StrictMode>
    );
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  initWidget();
}
