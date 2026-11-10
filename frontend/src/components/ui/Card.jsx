import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white/75 backdrop-blur-md border border-[#E5E7EB]/85 rounded-xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ${hover ? 'hover:bg-white/85 hover:border-[#FFA116]/40 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] transition-all duration-150' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-5 pb-3 border-b border-[#F1F3F5] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-base font-bold text-[#262626] ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-[#64748B] mt-0.5 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-5 pt-3 border-t border-[#F1F3F5] bg-[#F7F8FA]/50 rounded-b-xl ${className}`} {...props}>
      {children}
    </div>
  );
}

