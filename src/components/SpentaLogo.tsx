import React from 'react';

interface SpentaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  iconOnly?: boolean;
}

/**
 * Official Spenta Logo Component
 * Replicates the official Spenta brand mark:
 * - Left circuit-leaf emblem transitioning from deep forest/emerald green to crimson red at the bottom-right corner, with white circuit traces & nodes.
 * - "spenta" custom geometric wordmark with circuit-trace terminals on 's' and 'n', a circuit-leaf counter inside 'p', a dual-leaf 'e', and a green-to-crimson gradient on 'a'.
 */
export const SpentaLogo: React.FC<SpentaLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  iconOnly = false,
}) => {
  const heightMap = {
    xs: 'h-6',
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16',
  };

  if (iconOnly) {
    return (
      <div className={`inline-flex items-center select-none ${className}`} title="Spenta Official Brand Mark">
        <svg
          viewBox="0 0 110 110"
          className={`${heightMap[size]} w-auto drop-shadow-[0_0_10px_rgba(16,185,129,0.25)]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="spentaLeafGradIcon" x1="10" y1="15" x2="95" y2="98" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#129958" />
              <stop offset="48%" stopColor="#104930" />
              <stop offset="68%" stopColor="#5c1624" />
              <stop offset="100%" stopColor="#d4143a" />
            </linearGradient>
          </defs>

          {/* Outer Leaf Shape */}
          <path
            d="M15 95 C12 45, 38 14, 96 14 C98 62, 74 96, 15 95 Z"
            fill="url(#spentaLeafGradIcon)"
          />

          {/* Circuit Traces inside Leaf */}
          {/* Main diagonal stem from bottom-left */}
          <path
            d="M14 96 L46 64 L66 64 L79 51 L79 33"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left branch */}
          <path
            d="M27 83 L27 56"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Middle branch */}
          <path
            d="M55 64 L55 52"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Bottom horizontal branch */}
          <path
            d="M36 78 L65 78"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Circuit Nodes (Hollow White Rings) */}
          <circle cx="27" cy="48" r="7.5" stroke="#FFFFFF" strokeWidth="4.5" fill="#135c3b" />
          <circle cx="55" cy="44" r="7" stroke="#FFFFFF" strokeWidth="4.5" fill="#135c3b" />
          <circle cx="79" cy="25" r="7.5" stroke="#FFFFFF" strokeWidth="4.5" fill="#147948" />
          <circle cx="73" cy="78" r="7.5" stroke="#FFFFFF" strokeWidth="4.5" fill="#b31536" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <svg
        viewBox="0 0 500 135"
        className={`${heightMap[size]} w-auto drop-shadow-[0_2px_12px_rgba(16,185,129,0.18)]`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Spenta Official Logo"
      >
        <defs>
          {/* Main Left Leaf Gradient: Emerald Green top-left to Deep Forest middle to Crimson Red bottom-right */}
          <linearGradient id="spentaLeafGrad" x1="12" y1="18" x2="104" y2="112" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#14a05c" />
            <stop offset="46%" stopColor="#0f472e" />
            <stop offset="68%" stopColor="#631525" />
            <stop offset="100%" stopColor="#d8193e" />
          </linearGradient>

          {/* Inner 'p' Leaf Gradient */}
          <linearGradient id="spentaPLeafGrad" x1="200" y1="54" x2="238" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16a35e" />
            <stop offset="50%" stopColor="#114b31" />
            <stop offset="72%" stopColor="#6c1526" />
            <stop offset="100%" stopColor="#d8193e" />
          </linearGradient>

          {/* 's', 'p', 'n', 't' Vertical Green Gradient */}
          <linearGradient id="spentaGreenLetter" x1="0" y1="30" x2="0" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#199a5b" />
            <stop offset="55%" stopColor="#155d3b" />
            <stop offset="100%" stopColor="#0c2f1f" />
          </linearGradient>

          {/* 'e' Top Leaf Bright Green Gradient */}
          <linearGradient id="spentaELeafTop" x1="258" y1="45" x2="314" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1eb86b" />
            <stop offset="60%" stopColor="#146c43" />
            <stop offset="100%" stopColor="#0c3220" />
          </linearGradient>

          {/* 'a' Green to Crimson Red Gradient */}
          <linearGradient id="spentaAGrad" x1="428" y1="48" x2="492" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#168750" />
            <stop offset="38%" stopColor="#3c4c3f" />
            <stop offset="75%" stopColor="#b92948" />
            <stop offset="100%" stopColor="#e1264c" />
          </linearGradient>
        </defs>

        {/* ==================== 1. LEFT CIRCUIT-LEAF EMBLEM ==================== */}
        <g transform="translate(4, 8)">
          <path
            d="M12 102 C9 46, 39 10, 104 10 C106 66, 79 103, 12 102 Z"
            fill="url(#spentaLeafGrad)"
          />
          {/* White circuit paths */}
          <path
            d="M11 103 L47 67 L69 67 L84 52 L84 32"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M26 88 L26 58"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M57 67 L57 54"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M37 83 L69 83"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          {/* Circuit rings */}
          <circle cx="26" cy="49" r="8" stroke="#FFFFFF" strokeWidth="4.8" fill="#135c3b" />
          <circle cx="57" cy="45" r="7.5" stroke="#FFFFFF" strokeWidth="4.8" fill="#135c3b" />
          <circle cx="84" cy="23" r="8" stroke="#FFFFFF" strokeWidth="4.8" fill="#147948" />
          <circle cx="77" cy="83" r="8" stroke="#FFFFFF" strokeWidth="4.8" fill="#b31536" />
        </g>

        {/* ==================== 2. LETTER 's' WITH CIRCUIT NODE ==================== */}
        <g>
          {/* Main 's' body */}
          <path
            d="M167 49 H142 C131 49, 125 54, 125 62 C125 70, 131 75, 142 75 H160 C171 75, 178 80, 178 89 C178 98, 171 103, 159 103 H124"
            stroke="url(#spentaGreenLetter)"
            strokeWidth="10.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Thin trace and ring extending from top-right of 's' */}
          <line x1="168" y1="49" x2="177" y2="49" stroke="#187749" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="182.5" cy="49" r="4.8" stroke="#187749" strokeWidth="3" fill="none" />
        </g>

        {/* ==================== 3. LETTER 'p' WITH INNER CIRCUIT LEAF ==================== */}
        <g>
          {/* Outer 'p' stem and bowl */}
          <path
            d="M192 122 V77 C192 56, 208 45, 232 45 H247 V74 C247 93, 232 104, 211 104 H192"
            stroke="url(#spentaGreenLetter)"
            strokeWidth="10.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner miniature leaf counter */}
          <path
            d="M202 92 C201 66, 214 54, 237 54 C238 79, 226 93, 202 92 Z"
            fill="url(#spentaPLeafGrad)"
          />
          {/* Miniature circuit traces inside 'p' leaf */}
          <path
            d="M202 92 L217 77 L225 77 L230 71 L230 63"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M208 86 L208 73" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M220 77 L220 71" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M213 84 L225 84" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <circle cx="208" cy="69.5" r="2.8" stroke="#FFFFFF" strokeWidth="1.8" fill="#135c3b" />
          <circle cx="220" cy="67.5" r="2.6" stroke="#FFFFFF" strokeWidth="1.8" fill="#135c3b" />
          <circle cx="230" cy="59.5" r="2.8" stroke="#FFFFFF" strokeWidth="1.8" fill="#147948" />
          <circle cx="228" cy="84" r="2.8" stroke="#FFFFFF" strokeWidth="1.8" fill="#b31536" />
        </g>

        {/* ==================== 4. LETTER 'e' STYLISED DUAL-LEAF ==================== */}
        <g>
          {/* Main upper leaf body */}
          <path
            d="M260 95 C256 61, 276 44, 319 44 C319 72, 299 87, 267 97 Z"
            fill="url(#spentaELeafTop)"
          />
          {/* Crisp leaf vein cutout */}
          <path
            d="M261 95 C271 75, 286 67, 307 65"
            stroke="#05070B"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Lower dark green leaf base */}
          <path
            d="M272 103 C288 106, 313 102, 319 84 C303 87, 286 92, 272 103 Z"
            fill="#0d3724"
          />
        </g>

        {/* ==================== 5. LETTER 'n' WITH CIRCUIT DROP NODE ==================== */}
        <g>
          {/* Arch of 'n' */}
          <path
            d="M332 82 V69 C332 54, 344 46, 359 46 C374 46, 385 54, 385 69 V102"
            stroke="url(#spentaGreenLetter)"
            strokeWidth="10.5"
            strokeLinecap="round"
          />
          {/* Left vertical drop trace and hollow node */}
          <line x1="332" y1="84" x2="332" y2="96" stroke="#187749" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="332" cy="101.5" r="4.8" stroke="#187749" strokeWidth="3" fill="none" />
        </g>

        {/* ==================== 6. LETTER 't' ==================== */}
        <g>
          <path
            d="M402 27 V87 C402 98, 409 103, 421 103"
            stroke="url(#spentaGreenLetter)"
            strokeWidth="10.5"
            strokeLinecap="round"
          />
          <line
            x1="402"
            y1="49"
            x2="424"
            y2="49"
            stroke="#188752"
            strokeWidth="9.5"
            strokeLinecap="round"
          />
        </g>

        {/* ==================== 7. LETTER 'a' WITH CONCENTRIC CRIMSON CORE ==================== */}
        <g>
          {/* Outer rounded 'a' loop & right stem */}
          <path
            d="M475 102 H462 C444 102, 432 90, 432 74 C432 58, 444 46, 462 46 C480 46, 492 58, 492 74 V102"
            stroke="url(#spentaAGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner solid gradient core */}
          <circle cx="462" cy="74" r="13.5" fill="url(#spentaAGrad)" />
        </g>
      </svg>

      {showTagline && (
        <span className="text-[9px] font-mono text-cyan-400 tracking-[0.22em] uppercase mt-0.5 pl-1">
          INTELLIGENT REALITY // XR & PHYSICAL AI
        </span>
      )}
    </div>
  );
};
