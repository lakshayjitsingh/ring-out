import React from 'react';

interface MegaBoxGraphicProps {
  className?: string;
  size?: number; // width in px
  isOpening?: boolean;
}

export const MegaBoxGraphic: React.FC<MegaBoxGraphicProps> = ({
  className = '',
  size = 110,
  isOpening = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform duration-200 select-none ${
        isOpening ? 'animate-bounce scale-110' : 'hover:scale-108 active:scale-95'
      } ${className}`}
      style={{ width: size, height: size * 0.95 }}
    >
      <svg
        viewBox="0 0 200 190"
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Yellow Lid Gradient (Vibrant Brawl Stars Gold) */}
          <linearGradient id="lidGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#fff566" />
            <stop offset="25%" stopColor="#ffdb1a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Blue Body Gradient (Royal Cobalt to Deep Navy) */}
          <linearGradient id="bodyGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="30%" stopColor="#1d4ed8" />
            <stop offset="75%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Pinkish-Red Brackets & Knobs */}
          <linearGradient id="pinkRedGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="35%" stopColor="#f43f5e" />
            <stop offset="80%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Top Handle Blue Grip */}
          <linearGradient id="handleBlueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          {/* Rivet Gradient */}
          <linearGradient id="rivetGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
        </defs>

        {/* 1. TOP HANDLE (Pinkish Red Arch with Blue Grip) */}
        {/* Handle Left Post */}
        <path d="M 66 26 L 66 42 L 78 42 L 78 26 Z" fill="url(#pinkRedGrad)" stroke="#1a0005" strokeWidth="3" />
        {/* Handle Right Post */}
        <path d="M 122 26 L 122 42 L 134 42 L 134 26 Z" fill="url(#pinkRedGrad)" stroke="#1a0005" strokeWidth="3" />
        
        {/* Handle Outer Arch */}
        <path
          d="M 64 30 C 64 12, 75 8, 100 8 C 125 8, 136 12, 136 30 L 124 30 C 124 18, 118 16, 100 16 C 82 16, 76 18, 76 30 Z"
          fill="url(#pinkRedGrad)"
          stroke="#1a0005"
          strokeWidth="3.5"
        />

        {/* Handle Center Cyan/Blue Grip */}
        <rect x="74" y="10" width="52" height="13" rx="5" fill="url(#handleBlueGrad)" stroke="#0f172a" strokeWidth="2.5" />
        <path d="M 78 12 L 122 12" stroke="#e0f2fe" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

        {/* 2. BLUE LOWER BODY (Deep Beveled Base) */}
        <rect
          x="28"
          y="84"
          width="144"
          height="82"
          rx="22"
          fill="url(#bodyGrad)"
          stroke="#0b132b"
          strokeWidth="5"
        />

        {/* 3. YELLOW LID & SKULL FACE PLATE */}
        <path
          d="M 28 50 
             C 28 38, 38 32, 50 32 
             L 150 32 
             C 162 32, 172 38, 172 50 
             L 172 98 
             C 162 98, 152 92, 142 92 
             C 130 92, 126 122, 100 122 
             C 74 122, 70 92, 58 92 
             C 48 92, 38 98, 28 98 
             Z"
          fill="url(#lidGrad)"
          stroke="#271300"
          strokeWidth="5"
        />

        {/* Glossy Lid Highlight */}
        <path
          d="M 44 38 L 156 38"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.65"
        />

        {/* 4. ICONIC SKULL EYES & NOSE (Dark Brown/Black) */}
        {/* Left Eye */}
        <circle cx="68" cy="80" r="15" fill="#1c0f05" stroke="#451a03" strokeWidth="3" />
        <circle cx="65" cy="77" r="3" fill="#ffffff" opacity="0.3" />

        {/* Right Eye */}
        <circle cx="132" cy="80" r="15" fill="#1c0f05" stroke="#451a03" strokeWidth="3" />
        <circle cx="129" cy="77" r="3" fill="#ffffff" opacity="0.3" />

        {/* Triangular Nose */}
        <polygon points="100,82 91,97 109,97" fill="#1c0f05" stroke="#451a03" strokeWidth="2.5" />

        {/* Angered Brow Slashes */}
        <path d="M 74 65 L 85 73" stroke="#1c0f05" strokeWidth="4" strokeLinecap="round" />
        <path d="M 126 65 L 115 73" stroke="#1c0f05" strokeWidth="4" strokeLinecap="round" />

        {/* 5. PINKISH-RED CORNER BRACKETS & ROUND RIVETS */}
        {/* Top-Left Bracket */}
        <path
          d="M 26 40 C 26 33, 33 28, 42 28 L 56 28 C 56 44, 42 56, 26 56 Z"
          fill="url(#pinkRedGrad)"
          stroke="#1a0005"
          strokeWidth="3.5"
        />
        <circle cx="40" cy="38" r="3.5" fill="url(#rivetGrad)" stroke="#4c0519" strokeWidth="1.5" />

        {/* Top-Right Bracket */}
        <path
          d="M 174 40 C 174 33, 167 28, 158 28 L 144 28 C 144 44, 158 56, 174 56 Z"
          fill="url(#pinkRedGrad)"
          stroke="#1a0005"
          strokeWidth="3.5"
        />
        <circle cx="160" cy="38" r="3.5" fill="url(#rivetGrad)" stroke="#4c0519" strokeWidth="1.5" />

        {/* Bottom-Left Bracket */}
        <path
          d="M 26 150 C 26 160, 34 168, 46 168 L 56 168 C 56 150, 44 140, 26 140 Z"
          fill="url(#pinkRedGrad)"
          stroke="#1a0005"
          strokeWidth="3.5"
        />
        <circle cx="39" cy="156" r="3.5" fill="url(#rivetGrad)" stroke="#4c0519" strokeWidth="1.5" />

        {/* Bottom-Right Bracket */}
        <path
          d="M 174 150 C 174 160, 166 168, 154 168 L 144 168 C 144 150, 156 140, 174 140 Z"
          fill="url(#pinkRedGrad)"
          stroke="#1a0005"
          strokeWidth="3.5"
        />
        <circle cx="161" cy="156" r="3.5" fill="url(#rivetGrad)" stroke="#4c0519" strokeWidth="1.5" />

        {/* 6. PINKISH-RED SIDE LATCH KNOBS WITH NOTCH */}
        {/* Left Knob */}
        <ellipse cx="26" cy="94" rx="9" ry="18" fill="url(#pinkRedGrad)" stroke="#1a0005" strokeWidth="3" />
        <line x1="26" y1="84" x2="26" y2="104" stroke="#1a0005" strokeWidth="3.5" strokeLinecap="round" />

        {/* Right Knob */}
        <ellipse cx="174" cy="94" rx="9" ry="18" fill="url(#pinkRedGrad)" stroke="#1a0005" strokeWidth="3" />
        <line x1="174" y1="84" x2="174" y2="104" stroke="#1a0005" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
