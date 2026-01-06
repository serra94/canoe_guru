import React from 'react';
import { X } from 'lucide-react';

// Modal Base
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0a1a2f] w-full max-w-md h-[85vh] rounded-2xl border border-gray-800 flex flex-col relative overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#0a1a2f]">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-white">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
