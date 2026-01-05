
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ChatWidget from './components/ChatWidget';

const initWidget = () => {
  // Verifica se existe o container específico do widget ou o root de teste
  const biaContainer = document.getElementById('bia-chat-widget');
  const testRoot = document.getElementById('root');

  if (biaContainer) {
    // Modo Produção: Só o balãozinho no Shopify
    const root = ReactDOM.createRoot(biaContainer);
    root.render(
      <React.StrictMode>
        <ChatWidget />
      </React.StrictMode>
    );
  } else if (testRoot) {
    // Modo Teste: Página inteira para você ver aqui
    const root = ReactDOM.createRoot(testRoot);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    // Fallback: Cria o widget se nada for achado
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
