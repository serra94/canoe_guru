import React from 'react';
import { Menu, ChevronLeft } from 'lucide-react';

// Header Padrão
const Header = ({ title, showBack = false, onBack }) => (
  <header className="sticky top-0 z-40 bg-[#0a1a2f] border-b border-gray-800 shadow-lg">
    <div className="flex items-center justify-between px-4 py-4 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={onBack} className="p-1 -ml-2 text-white hover:text-[#4f7cff]">
            <ChevronLeft size={28} />
          </button>
        )}
        <h1 className="text-xl font-bold text-white tracking-wide truncate max-w-[200px]">
          {title || 'CanoeGuru'}
        </h1>
      </div>
      <button className="text-white hover:text-[#4f7cff]">
        <Menu size={24} />
      </button>
    </div>
  </header>
);

export default Header;
