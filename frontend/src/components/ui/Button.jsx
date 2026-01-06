import React from 'react';
import { COLORS } from '../../styles/colors';

// Botão Primário e Secundário
const Button = ({ children, variant = 'primary', onClick, className = '', disabled = false }) => {
  const baseStyle =
    'w-full py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2';
  const variants = {
    primary: `bg-[${COLORS.bluePrimary}] text-white shadow-lg shadow-blue-900/50 hover:bg-[${COLORS.blueNeon}]`,
    secondary: `bg-transparent border-2 border-[${COLORS.blueNeon}] text-[${COLORS.blueNeon}] hover:bg-[${COLORS.darkBlue}]`,
    danger: 'bg-red-500 text-white',
    success: 'bg-green-600 text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      style={{
        backgroundColor: variant === 'primary' ? COLORS.bluePrimary : undefined,
        borderColor: variant === 'secondary' ? COLORS.blueNeon : undefined,
        color: variant === 'secondary' ? COLORS.blueNeon : undefined,
      }}
    >
      {children}
    </button>
  );
};

export default Button;
