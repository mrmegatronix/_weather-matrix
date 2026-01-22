import React from 'react';

interface IconProps {
  className?: string;
}

interface NavigationIconProps extends IconProps {
  size?: number | string;
  style?: React.CSSProperties;
  fill?: string;
}

// Reusable Gradients Definition
const IconGradients = () => (
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFD700" />
      <stop offset="100%" stopColor="#D4AF37" />
    </linearGradient>
    <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F3F4F6" />
      <stop offset="100%" stopColor="#9CA3AF" />
    </linearGradient>
    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#60A5FA" />
      <stop offset="100%" stopColor="#2563EB" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
);

export const SunIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible`} viewBox="0 0 64 64">
    <IconGradients />
    <g className="animate-spin-slow origin-center">
      {/* Sun Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line 
          key={deg}
          x1="32" y1="10" x2="32" y2="4" 
          stroke="url(#goldGradient)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
    </g>
    {/* Sun Core */}
    <circle cx="32" cy="32" r="16" fill="url(#goldGradient)" filter="url(#glow)" />
  </svg>
);

export const SunriseIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible`} viewBox="0 0 64 64">
    <IconGradients />
    {/* Horizon Line */}
    <path d="M4 54 L60 54" stroke="url(#silverGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    
    {/* Sun Group */}
    <g transform="translate(0, -4)">
        {/* Rays */}
        <g className="animate-spin-slow origin-[32px_38px]">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line 
            key={deg}
            x1="32" y1="24" x2="32" y2="18" 
            stroke="url(#goldGradient)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            transform={`rotate(${deg} 32 38)`}
            />
        ))}
        </g>
        {/* Core */}
        <circle cx="32" cy="38" r="10" fill="url(#goldGradient)" filter="url(#glow)" />
    </g>

    {/* Up Arrow */}
    <path d="M32 18 L32 8 M26 14 L32 8 L38 14" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
  </svg>
);

export const SunsetIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible`} viewBox="0 0 64 64">
    <IconGradients />
    {/* Horizon Line */}
    <path d="M4 54 L60 54" stroke="url(#silverGradient)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    
    {/* Sun Group */}
    <g transform="translate(0, 4)">
        {/* Rays */}
        <g className="animate-spin-slow origin-[32px_38px]">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line 
            key={deg}
            x1="32" y1="24" x2="32" y2="18" 
            stroke="url(#goldGradient)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            transform={`rotate(${deg} 32 38)`}
            />
        ))}
        </g>
        {/* Core */}
        <circle cx="32" cy="38" r="10" fill="url(#goldGradient)" filter="url(#glow)" />
    </g>

    {/* Down Arrow */}
    <path d="M32 8 L32 18 M26 12 L32 18 L38 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
  </svg>
);

export const UVIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible`} viewBox="0 0 64 64">
    <IconGradients />
    {/* Shield Outline */}
    <path 
      d="M32 4 L56 14 V28 C56 46 32 60 32 60 C32 60 8 46 8 28 V14 L32 4 Z" 
      fill="none" 
      stroke="url(#goldGradient)" 
      strokeWidth="2.5" 
      strokeLinejoin="round" 
      filter="url(#glow)"
      className="opacity-90"
    />
    
    {/* Inner Sun */}
    <g className="animate-spin-slow origin-center">
       {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line 
          key={deg}
          x1="32" y1="22" x2="32" y2="16" 
          stroke="url(#goldGradient)" 
          strokeWidth="3" 
          strokeLinecap="round" 
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
       {/* Core */}
      <circle cx="32" cy="32" r="8" fill="url(#goldGradient)" />
    </g>
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible animate-float`} viewBox="0 0 64 64">
    <IconGradients />
    <path 
      d="M48 32C48 45.2548 37.2548 56 24 56C19.8 56 15.9 54.9 12.5 53C16.5 60 25 62 32 62C48.5685 62 62 48.5685 62 32C62 18.5 55 8 48 3.5C48 3.5 48 18 48 32Z" 
      fill="url(#silverGradient)" 
      filter="url(#glow)"
    />
  </svg>
);

export const CloudIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible animate-float`} viewBox="0 0 64 64">
    <IconGradients />
    <path 
      d="M46 48H18C11.3726 48 6 42.6274 6 36C6 29.8 10.6 24.7 16.6 24.1C17.8 15.6 25 9 33.5 9C42.8 9 50.5 15.8 52 24.8C57.6 25.9 62 30.7 62 36.5C62 42.85 56.85 48 50.5 48H46Z" 
      fill="url(#silverGradient)" 
      opacity="0.9"
    />
  </svg>
);

export const RainIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible`} viewBox="0 0 64 64">
    <IconGradients />
    <path 
      d="M46 38H18C11.3726 38 6 32.6274 6 26C6 19.8 10.6 14.7 16.6 14.1C17.8 5.6 25 -1 33.5 -1C42.8 -1 50.5 5.8 52 14.8C57.6 15.9 62 20.7 62 26.5C62 32.85 56.85 38 50.5 38H46Z" 
      fill="url(#silverGradient)" 
    />
    <g>
       <path d="M22 42L18 52" stroke="url(#blueGradient)" strokeWidth="3" strokeLinecap="round" className="animate-rain" style={{animationDelay: '0s'}} />
       <path d="M32 42L28 52" stroke="url(#blueGradient)" strokeWidth="3" strokeLinecap="round" className="animate-rain" style={{animationDelay: '0.3s'}} />
       <path d="M42 42L38 52" stroke="url(#blueGradient)" strokeWidth="3" strokeLinecap="round" className="animate-rain" style={{animationDelay: '0.6s'}} />
    </g>
  </svg>
);

export const SnowIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible`} viewBox="0 0 64 64">
    <IconGradients />
    <path 
      d="M46 38H18C11.3726 38 6 32.6274 6 26C6 19.8 10.6 14.7 16.6 14.1C17.8 5.6 25 -1 33.5 -1C42.8 -1 50.5 5.8 52 14.8C57.6 15.9 62 20.7 62 26.5C62 32.85 56.85 38 50.5 38H46Z" 
      fill="url(#silverGradient)" 
    />
    <g className="animate-float-sway">
      <circle cx="20" cy="50" r="2" fill="#fff" />
      <circle cx="32" cy="56" r="2" fill="#fff" />
      <circle cx="44" cy="50" r="2" fill="#fff" />
    </g>
  </svg>
);

export const ThunderIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={`${className} overflow-visible`} viewBox="0 0 64 64">
    <IconGradients />
    <path 
      d="M46 38H18C11.3726 38 6 32.6274 6 26C6 19.8 10.6 14.7 16.6 14.1C17.8 5.6 25 -1 33.5 -1C42.8 -1 50.5 5.8 52 14.8C57.6 15.9 62 20.7 62 26.5C62 32.85 56.85 38 50.5 38H46Z" 
      fill="#52525B" 
    />
    <path 
      d="M34 36L24 50H32L30 62L44 46H34L36 36Z" 
      fill="url(#goldGradient)" 
      className="animate-flash"
      stroke="#fff"
      strokeWidth="1"
    />
  </svg>
);

export const NavigationIcon: React.FC<NavigationIconProps> = ({ size = 24, className, style, fill }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className} 
    style={style}
  >
    <polygon points="3 11 22 2 13 21 11 13 3 11" fill={fill} stroke={fill} />
  </svg>
);

export const getWeatherIcon = (code: number, isDay: boolean, className: string) => {
  if (code === 0 || code === 1) return isDay ? <SunIcon className={className} /> : <MoonIcon className={className} />;
  if (code === 2 || code === 3) return <CloudIcon className={className} />;
  if (code >= 45 && code <= 48) return <CloudIcon className={`${className} opacity-75`} />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <RainIcon className={className} />;
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <SnowIcon className={className} />;
  if (code >= 95) return <ThunderIcon className={className} />;
  return <CloudIcon className={className} />;
};