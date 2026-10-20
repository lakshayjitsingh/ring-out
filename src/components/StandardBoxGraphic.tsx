import React from 'react';

interface StandardBoxGraphicProps {
  className?: string;
  size?: number; // width in px
  isOpening?: boolean;
}

export const StandardBoxGraphic: React.FC<StandardBoxGraphicProps> = ({
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
          {/* Blue Body Gradient (Royal Blue to Deep Navy) */}
          <linearGradient id="stdBodyGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="25%" stopColor="#0284c7" />
            <stop offset="70%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>

          {/* Yellow Lid Gradient (Vibrant Gold) */}
          <linearGradient id="stdLidGrad" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#facc15" />
            <stop offset="70%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>

          {/* Crimson Red Center Clasp / Band */}
          <linearGradient id="stdRedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="40%" stopColor="#f43f5e" />
            <stop offset="85%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Golden Keyhole / Lock Plate */}
          <linearGradient id="stdGoldPlate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fde047" />
            <stop offset="80%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Corner Bracket Gradient */}
          <linearGradient id="stdCornerGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
        </defs>

        {/* 1. BLUE LOWER CHEST BODY */}
        <rect
          x="32"
          y="78"
          width="136"
          height="88"
          rx="18"
          fill="url(#stdBodyGrad)"
          stroke="#07192a"
          strokeWidth="5"
        />

        {/* Inner Depth Shadow on Body */}
        <rect
          x="36"
          y="82"
          width="128"
          height="12"
          fill="#0369a1"
          opacity="0.5"
        />

        {/* 2. CRIMSON VERTICAL STRAP / BAND */}
        <rect
          x="88"
          y="42"
          width="24"
          height="124"
          rx="6"
          fill="url(#stdRedGrad)"
          stroke="#3f0516"
          strokeWidth="3.5"
        />

        {/* 3. GOLDEN LID */}
        <rect
          x="26"
          y="38"
          width="148"
          height="48"
          rx="14"
          fill="url(#stdLidGrad)"
          stroke="#451a03"
          strokeWidth="5"
        />

        {/* Glossy White Reflection on Lid */}
        <path
          d="M 40 44 L 160 44"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Red Strap Section Over Lid */}
        <rect
          x="88"
          y="38"
          width="24"
          height="48"
          rx="4"
          fill="url(#stdRedGrad)"
          stroke="#3f0516"
          strokeWidth="3.5"
        />

        {/* 4. GOLDEN CORNER BRACKETS WITH RIVETS */}
        {/* Top Left Bracket */}
        <path
          d="M 26 52 C 26 42, 36 38, 48 38 L 48 56 L 36 56 C 30 56, 26 62, 26 68 Z"
          fill="url(#stdCornerGrad)"
          stroke="#451a03"
          strokeWidth="3"
        />
        <circle cx="38" cy="48" r="3" fill="#ffffff" opacity="0.8" />
        <circle cx="39" cy="49" r="2.5" fill="#78350f" />

        {/* Top Right Bracket */}
        <path
          d="M 174 52 C 174 42, 164 38, 152 38 L 152 56 L 164 56 C 170 56, 174 62, 174 68 Z"
          fill="url(#stdCornerGrad)"
          stroke="#451a03"
          strokeWidth="3"
        />
        <circle cx="162" cy="48" r="3" fill="#ffffff" opacity="0.8" />
        <circle cx="161" cy="49" r="2.5" fill="#78350f" />

        {/* Bottom Left Bracket */}
        <path
          d="M 32 142 L 32 154 C 32 162, 40 166, 48 166 L 56 166 L 56 150 C 46 150, 42 146, 42 142 Z"
          fill="url(#stdCornerGrad)"
          stroke="#451a03"
          strokeWidth="3"
        />
        <circle cx="44" cy="156" r="3" fill="#78350f" />

        {/* Bottom Right Bracket */}
        <path
          d="M 168 142 L 168 154 C 168 162, 160 166, 152 166 L 144 166 L 144 150 C 154 150, 158 146, 158 142 Z"
          fill="url(#stdCornerGrad)"
          stroke="#451a03"
          strokeWidth="3"
        />
        <circle cx="156" cy="156" r="3" fill="#78350f" />

        {/* 5. CENTER BRASS / GOLDEN LOCK CLASP */}
        <rect
          x="82"
          y="72"
          width="36"
          height="34"
          rx="10"
          fill="url(#stdGoldPlate)"
          stroke="#451a03"
          strokeWidth="3.5"
        />

        {/* Metallic Bevel Ring */}
        <rect
          x="86"
          y="76"
          width="28"
          height="26"
          rx="7"
          fill="none"
          stroke="#fef08a"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Authentic Keyhole */}
        <circle cx="100" cy="85" r="4.5" fill="#1c0f05" />
        <polygon points="98,87 102,87 103,96 97,96" fill="#1c0f05" />

        {/* 6. SUBTLE BLUE BODY EMBOSS / ACCENTS */}
        <path
          d="M 44 100 L 76 100"
          stroke="#7dd3fc"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M 124 100 L 156 100"
          stroke="#7dd3fc"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M 48 114 L 72 114"
          stroke="#0284c7"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M 128 114 L 152 114"
          stroke="#0284c7"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};
