import React from 'react';

// Card Padrão
const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-[#112240] rounded-xl border border-gray-800 shadow-md p-4 ${
      onClick ? 'cursor-pointer active:bg-[#1a3a5c]' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export default Card;
