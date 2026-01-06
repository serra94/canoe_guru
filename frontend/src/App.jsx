import React from 'react';
import AppRouter from './router';

// APP ROOT
function App() {
  return (
    <div className="font-sans antialiased text-white selection:bg-[#365ef0] selection:text-white">
      {/* Estilos Globais injetados para scrollbar e resets específicos */}
      <style>{`
        body { background-color: #0a1a2f; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a1a2f; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #365ef0; border-radius: 4px; }
      `}</style>
      <AppRouter />
    </div>
  );
}

export default App;
