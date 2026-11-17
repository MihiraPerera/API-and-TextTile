import React from 'react';
// @ts-ignore
import logoImg from '../assets/images/api_textile_logo_1789724892321.jpg';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  height?: number;
  logoUrl?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  variant = 'dark', 
  height = 56,
  logoUrl
}) => {
  const activeLogo = logoUrl || logoImg;

  return (
    <div 
      className={`flex items-center select-none overflow-hidden ${className}`}
      style={{ height: `${height}px` }}
    >
      <img 
        src={activeLogo} 
        alt="API &amp; Textile Logo" 
        className="h-full w-auto object-contain max-h-full transition-transform duration-300"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
