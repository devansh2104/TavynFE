import React from 'react';

/**
 * High-definition vector monogram "T" logo
 * Based on the custom geometric brand mark with sharp chamfered wings and angled spear tip.
 */
export function LogoMark({ className = "h-5 w-5", fill = "currentColor", ...props }) {
  return (
    <svg 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      {...props}
    >
      <polygon 
        points="66,77 446,77 408,132.5 283.8,132.5 282.3,435 213.6,321 213.6,132.5 104,132.5" 
        fill={fill} 
      />
    </svg>
  );
}

/**
 * Brand Logo Icon with high-quality dark or themed rounded squircle container
 */
export function BrandLogo({ 
  size = "md", 
  variant = "dark", // 'dark' | 'primary' | 'transparent'
  className = "" 
}) {
  const sizeMap = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 rounded-xl",
    lg: "h-12 w-12 rounded-2xl",
    xl: "h-16 w-16 rounded-3xl"
  };

  const iconSizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8"
  };

  const variantMap = {
    dark: "bg-zinc-950 text-white shadow-md shadow-zinc-950/20 border border-zinc-800",
    primary: "bg-primary text-primary-foreground shadow-md shadow-primary/25",
    transparent: "bg-transparent text-foreground"
  };

  return (
    <div 
      className={`flex items-center justify-center shrink-0 transition-all ${sizeMap[size] || sizeMap.md} ${variantMap[variant] || variantMap.dark} ${className}`}
    >
      <LogoMark className={iconSizeMap[size] || iconSizeMap.md} fill="currentColor" />
    </div>
  );
}

export default BrandLogo;
