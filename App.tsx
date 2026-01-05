import React from 'react';
import ChatWidget from './components/ChatWidget';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      {/* 
          A página agora está vazia e transparente. 
          Apenas o widget da Bia será renderizado no canto inferior.
      */}
      <ChatWidget />
    </div>
  );
};

export default App;
