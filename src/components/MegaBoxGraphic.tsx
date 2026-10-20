import React from 'react';

interface MegaBoxGraphicProps {
  className?: string;
  size?: number; // width in px
  isOpening?: boolean;
}

export const MegaBoxGraphic: React.FC<MegaBoxGraphicProps> = ({
  className = '',
  size = 120,
  isOpening = false,
}) => {
  return (
    <div
      className={`relative inline-block transition-transform duration-200 select-none ${
        isOpening ? 'animate-bounce scale-110' : 'hover:scale-105'
      } ${className}`}
      style={{ width: size, height: size * 0.95 }}
    >
      <svg
        viewBox="0 0 200 190"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Yellow Lid Gradient */}
          <linearGradient id="yellowLidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="85%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Blue Body Gradient */}
          <linearGradient id="blueBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="40%" stopColor="#1d4ed8" />
            <stop offset="80%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Pinkish-Red Brackets Gradient */}
          <linearGradient id="redBracketGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          {/* Top Handle Blue Grip */}
          <linearGradient id="handleGripGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Rim Highlights */}
          <linearGradient id="goldRimGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {/* 1. TOP HANDLE */}
        {/* Handle Posts (Red) */}
        <path d="M 68 28 L 68 40 L 80 40 L 80 28 Z" fill="url(#redBracketGrad)" stroke="#4c0519" strokeWidth="2" />
        <path d="M 120 28 L 120 40 L 132 40 L 132 28 Z" fill="url(#redBracketGrad)" stroke="#4c0519" strokeWidth="2" />
        {/* Handle Arch (Red) */}
        <path
          d="M 66 32 C 66 16, 75 12, 100 12 C 125 12, 134 16, 134 32 L 124 32 C 124 22, 118 20, 100 20 C 82 20, 76 22, 76 32 Z"
          fill="url(#redBracketGrad)"
          stroke="#4c0519"
          strokeWidth="2.5"
        />
        {/* Handle Cyan/Blue Grip */}
        <rect x="76" y="14" width="48" height="11" rx="4" fill="url(#handleGripGrad)" stroke="#0f172a" strokeWidth="1.5" />
        {/* Handle Shimmer */}
        <path d="M 80 16 L 115 16" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />

        {/* 2. BLUE LOWER BODY */}
        <rect
          x="30"
          y="85"
          width="140"
          height="80"
          rx="18"
          fill="url(#blueBodyGrad)"
          stroke="#0f172a"
          strokeWidth="4"
        />

        {/* 3. YELLOW TOP LID / SKULL JAWLINE */}
        <path
          d="M 30 52 
             C 30 42, 38 36, 48 36 
             L 152 36 
             C 162 36, 170 42, 170 52 
             L 170 102 
             C 160 102, 150 96, 140 96 
             C 130 96, 126 118, 100 118 
             C 74 118, 70 96, 60 96 
             C 50 96, 40 102, 30 102 
             Z"
          fill="url(#yellowLidGrad)"
          stroke="#451a03"
          strokeWidth="4"
        />

        {/* Lid Top Shine */}
        <path
          d="M 45 42 L 155 42"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* 4. SKULL FACE (Black Eyes & Triangular Nose + Angered Brows) */}
        {/* Left Eye */}
        <circle cx="70" cy="80" r="14" fill="#261005" stroke="#78350f" strokeWidth="2.5" />
        {/* Right Eye */}
        <circle cx="130" cy="80" r="14" fill="#261005" stroke="#78350f" strokeWidth="2.5" />
        {/* Triangular Nose */}
        <polygon points="100,82 92,96 108,96" fill="#261005" stroke="#78350f" strokeWidth="2" />

        {/* Angry Brow Slash Marks */}
        <path d="M 76 66 L 86 73" stroke="#261005" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 124 66 L 114 73" stroke="#261005" strokeWidth="3.5" strokeLinecap="round" />

        {/* 5. PINKISH-RED CORNER BRACKETS & RIVETS */}
        {/* Top-Left Bracket */}
        <path
          d="M 28 42 C 28 36, 34 32, 42 32 L 56 32 C 56 46, 42 56, 28 56 Z"
          fill="url(#redBracketGrad)"
          stroke="#4c0519"
          strokeWidth="3"
        />
        <circle cx="40" cy="42" r="3" fill="#fda4af" stroke="#881337" strokeWidth="1" />

        {/* Top-Right Bracket */}
        <path
          d="M 172 42 C 172 36, 166 32, 158 32 L 144 32 C 144 46, 158 56, 172 56 Z"
          fill="url(#redBracketGrad)"
          stroke="#4c0519"
          strokeWidth="3"
        />
        <circle cx="160" cy="42" r="3" fill="#fda4af" stroke="#881337" strokeWidth="1" />

        {/* Bottom-Left Bracket */}
        <path
          d="M 28 152 C 28 160, 34 166, 44 166 L 54 166 C 54 152, 44 144, 28 144 Z"
          fill="url(#redBracketGrad)"
          stroke="#4c0519"
          strokeWidth="3"
        />
        <circle cx="38" cy="156" r="3" fill="#fda4af" stroke="#881337" strokeWidth="1" />

        {/* Bottom-Right Bracket */}
        <path
          d="M 172 152 C 172 160, 166 166, 156 166 L 146 166 C 146 152, 156 144, 172 144 Z"
          fill="url(#redBracketGrad)"
          stroke="#4c0519"
          strokeWidth="3"
        />
        <circle cx="162" cy="156" r="3" fill="#fda4af" stroke="#881337" strokeWidth="1" />

        {/* 6. RED SIDE LATCH KNOBS */}
        {/* Left Knob */}
        <ellipse cx="28" cy="94" rx="8" ry="16" fill="url(#redBracketGrad)" stroke="#4c0519" strokeWidth="2.5" />
        <line x1="28" y1="84" x2="28" y2="104" stroke="#4c0519" strokeWidth="3" strokeLinecap="round" />

        {/* Right Knob */}
        <ellipse cx="172" cy="94" rx="8" ry="16" fill="url(#redBracketGrad)" stroke="#4c0519" strokeWidth="2.5" />
        <line x1="172" y1="84" x2="172" y2="104" stroke="#4c0519" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};
