import React from "react";

// Input Padrão
const Input = ({ placeholder, type = 'text', icon: Icon, value, onChange }) => (
  <div className="relative w-full mb-4">
    {Icon && (
      <Icon
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={20}
      />
    )}

    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full bg-[#112240] border border-gray-700 rounded-xl py-3 
        ${Icon ? "pl-12 pr-4" : "px-4"}
        text-white placeholder-gray-500
        placeholder-center
        focus:outline-none focus:border-[#4f7cff] transition-colors
      `}
    />
  </div>
);

export default Input;
