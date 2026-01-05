
import React from 'react';
import ChatWidget from './components/ChatWidget';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Exemplo de Página de Loja Shopify para Teste */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl p-12 space-y-8 border border-gray-100">
        <header className="space-y-4">
          <div className="w-20 h-20 bg-gray-800 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-2xl">B</div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Baumont Premium</h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
            Página de demonstração. O widget da Bia está ativo no canto inferior.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
             <img src="https://picsum.photos/id/175/600/600" alt="Bolsa Cartagena" className="w-full h-full object-cover mix-blend-multiply opacity-90" />
          </div>
          <div className="text-left space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Bolsa Cartagena</h2>
            <p className="text-3xl font-black text-green-600">R$ 209,00</p>
            <p className="text-gray-600 leading-relaxed">
              Design artesanal inspirado no estilo praiano. Ideal para quem busca elegância e praticidade.
            </p>
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-sm font-medium">
              🔥 Teste agora a Bia no balão flutuante!
            </div>
          </div>
        </div>
      </div>

      {/* No App.tsx de teste, renderizamos o widget. 
          No Shopify, o index.tsx detectará a ausência do root e renderizará apenas o widget. */}
      <ChatWidget />
    </div>
  );
};

export default App;
