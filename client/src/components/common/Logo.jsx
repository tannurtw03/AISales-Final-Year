import React from 'react';
import { Link } from 'react-router-dom';

export const LogoIcon = ({ className = "w-9 h-9" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="50%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient id="logoArrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38BDF8" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
      <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Neural Network Nodes & Brain Curve */}
    <path d="M 45 20 C 26 20, 16 34, 16 50 C 16 66, 26 80, 45 80" stroke="url(#logoBlueGrad)" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M 28 34 C 38 42, 35 58, 26 66" stroke="url(#logoBlueGrad)" strokeWidth="3" strokeDasharray="3 3" opacity="0.8" />
    
    <circle cx="28" cy="34" r="4" fill="#2563EB" />
    <circle cx="20" cy="50" r="4" fill="#4F46E5" />
    <circle cx="28" cy="66" r="4" fill="#7C3AED" />

    {/* Right Hemisphere Arc */}
    <path d="M 55 20 C 74 20, 84 34, 84 48" stroke="url(#logoBlueGrad)" strokeWidth="4.5" strokeLinecap="round" opacity="0.6" />

    {/* Upward AI Growth Arrow Trend Line */}
    <path d="M 18 74 L 40 52 L 56 62 L 82 26" stroke="url(#logoArrowGrad)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#logoGlow)" />
    
    {/* Sharp Arrowhead */}
    <path d="M 68 26 H 82 V 40" stroke="url(#logoArrowGrad)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Pulsing Nodes */}
    <circle cx="40" cy="52" r="3.5" fill="#38BDF8" />
    <circle cx="56" cy="62" r="3.5" fill="#818CF8" />
    <circle cx="82" cy="26" r="4.5" fill="#10B981" filter="url(#logoGlow)" />
  </svg>
);

export const Logo = ({ 
  size = 'md', 
  showSubtitle = true, 
  variant = 'horizontal', 
  linkTo = '/dashboard',
  className = '' 
}) => {
  // Size configurations for icon & text
  const sizes = {
    sm: {
      icon: 'w-7 h-7',
      title: 'text-sm font-extrabold',
      subtitle: 'text-[9px]',
      badge: 'text-[9px] px-1 py-0.2',
      gap: 'gap-2'
    },
    md: {
      icon: 'w-9 h-9',
      title: 'text-base font-extrabold',
      subtitle: 'text-[10px]',
      badge: 'text-[10px] px-1.5 py-0.5',
      gap: 'gap-2.5'
    },
    lg: {
      icon: 'w-11 h-11',
      title: 'text-xl font-black',
      subtitle: 'text-xs',
      badge: 'text-xs px-2 py-0.5',
      gap: 'gap-3'
    },
    xl: {
      icon: 'w-14 h-14',
      title: 'text-2xl font-black',
      subtitle: 'text-xs',
      badge: 'text-xs px-2.5 py-1',
      gap: 'gap-3.5'
    }
  };

  const currentSize = sizes[size] || sizes.md;

  const logoContent = (
    <div className={`flex ${variant === 'vertical' ? 'flex-col items-center text-center' : 'items-center'} ${currentSize.gap} ${className}`}>
      {/* Clean Icon with Smooth Hover Scale (NO container box or border) */}
      <div className="shrink-0 transition-transform duration-300 hover:scale-105">
        <LogoIcon className={currentSize.icon} />
      </div>

      {variant !== 'iconOnly' && (
        <div className={variant === 'vertical' ? 'mt-1.5' : ''}>
          <div className="flex items-center gap-1.5">
            <span className={`${currentSize.title} bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 bg-clip-text text-transparent tracking-tight leading-tight`}>
              SmartSales
            </span>
            <span className={`${currentSize.badge} font-black uppercase rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25 tracking-wider`}>
              AI
            </span>
          </div>
          {showSubtitle && (
            <p className={`${currentSize.subtitle} text-blue-600 font-bold tracking-wider uppercase mt-0.5`}>
              Business Analytics
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block focus:outline-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
