import React from 'react';

export const BOT_COLORS = [
  { id: 'blue_dark', label: 'Biru Tua', body: '#1d4ed8', shade: '#1e3a8a', eye: '#60a5fa' },
  { id: 'blue_light', label: 'Biru Muda', body: '#0ea5e9', shade: '#0369a1', eye: '#38bdf8' },
  { id: 'green', label: 'Hijau', body: '#22c55e', shade: '#15803d', eye: '#4ade80' },
  { id: 'yellow', label: 'Kuning', body: '#eab308', shade: '#a16207', eye: '#fde047' },
  { id: 'orange', label: 'Oranye', body: '#f97316', shade: '#c2410c', eye: '#fdba74' },
  { id: 'purple', label: 'Ungu', body: '#a855f7', shade: '#7e22ce', eye: '#d8b4fe' },
  { id: 'pink', label: 'Pink', body: '#ec4899', shade: '#be185d', eye: '#f9a8d4' },
  { id: 'red', label: 'Merah', body: '#ef4444', shade: '#b91c1c', eye: '#fca5a5' },
];

export const BOT_HATS = [
  { id: 'none', label: 'Tanpa Topi' },
  { id: 'peci_putih', label: 'Peci Putih' },
  { id: 'kopyah_hitam', label: 'Kopyah Hitam' },
  { id: 'topi_kasual', label: 'Topi Kasual' },
  { id: 'topi_koboi', label: 'Topi Koboi' },
  { id: 'bucket_hat', label: 'Bucket Hat' },
];

const SIZE_MAP = {
  xs: 'w-9 h-9',
  sm: 'w-11 h-11',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

function renderHat(hatId) {
  switch (hatId) {
    case 'peci_putih':
      return (
        <g>
          <path
            d="M42 48 Q64 33 86 48 L89 62 Q64 66 39 62 Z"
            fill="#ffffff"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M41 58 Q64 62 87 58"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M52 46 Q64 40 76 46"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      );
    case 'kopyah_hitam':
      return (
        <g>
          <path
            d="M40 43 Q64 37 88 43 L90 61 Q64 65 38 61 Z"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Aksen garis tipis emas di kopyah */}
          <path
            d="M40 57 Q64 61 88 57"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      );
    case 'topi_kasual':
      return (
        <g>
          {/* Mahkota topi baseball */}
          <path
            d="M36 58 C36 36 92 36 92 58 Z"
            fill="#2563eb"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M64 39 L64 56"
            stroke="#93c5fd"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Lidah topi (visor) ke kanan */}
          <path
            d="M35 58 Q68 54 106 60 Q108 65 92 65 Q62 63 35 58 Z"
            fill="#1d4ed8"
            stroke="#1e293b"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <circle cx="64" cy="39" r="3" fill="#fbbf24" stroke="#1e293b" strokeWidth="2" />
        </g>
      );
    case 'topi_koboi':
      return (
        <g>
          {/* Crown */}
          <path
            d="M43 56 L48 36 Q56 41 64 37 Q72 41 80 36 L85 56 Z"
            fill="#b45309"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Pita kulit */}
          <path d="M44 52 L84 52" stroke="#fef3c7" strokeWidth="4" />
          {/* Brim lebar melengkung */}
          <path
            d="M22 52 Q64 65 106 52 Q98 63 64 64 Q30 63 22 52 Z"
            fill="#d97706"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>
      );
    case 'bucket_hat':
      return (
        <g>
          <path
            d="M41 55 L46 37 Q64 33 82 37 L87 55 Z"
            fill="#10b981"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M42 52 L86 52"
            stroke="#fef08a"
            strokeWidth="3.5"
          />
          <path
            d="M28 63 L41 54 L87 54 L100 63 Q64 68 28 63 Z"
            fill="#059669"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>
      );
    default:
      return null;
  }
}

export default function AvatarBot({
  colorId = 'blue_light',
  hatId = 'peci_putih',
  size = 'md',
  mood = 'happy',
  animate = true,
  className = '',
}) {
  const color = BOT_COLORS.find((c) => c.id === colorId) || BOT_COLORS[1];
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${sizeClass} ${
        animate ? 'animate-bot-float' : ''
      } ${className}`}
    >
      <svg viewBox="0 0 128 128" className="w-full h-full overflow-visible drop-shadow-md">
        <defs>
          <radialGradient id={`eyeGlow-${color.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="55%" stopColor={color.eye} stopOpacity="1" />
            <stop offset="100%" stopColor={color.eye} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Antena (terlihat jelas jika tanpa topi, atau menyembul lucu) */}
        {hatId === 'none' && (
          <g>
            <line
              x1="64"
              y1="26"
              x2="64"
              y2="42"
              stroke="#1e293b"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx="64" cy="21" r="7" fill="#fde047" stroke="#1e293b" strokeWidth="3.2" />
            <circle cx="62" cy="19" r="2" fill="#ffffff" />
          </g>
        )}

        {/* Telinga samping bot */}
        <rect
          x="16"
          y="70"
          width="10"
          height="22"
          rx="5"
          fill={color.shade}
          stroke="#1e293b"
          strokeWidth="3.5"
        />
        <rect
          x="102"
          y="70"
          width="10"
          height="22"
          rx="5"
          fill={color.shade}
          stroke="#1e293b"
          strokeWidth="3.5"
        />

        {/* Badan / Kepala Bulat */}
        <circle
          cx="64"
          cy="80"
          r="40"
          fill={color.body}
          stroke="#1e293b"
          strokeWidth="4"
        />

        {/* Bayangan bawah lembut */}
        <path
          d="M31 94 A38 38 0 0 0 97 94 A40 34 0 0 1 31 94 Z"
          fill={color.shade}
          opacity="0.35"
        />

        {/* Kilau atas */}
        <ellipse cx="47" cy="55" rx="9" ry="4.5" transform="rotate(-24 47 55)" fill="#ffffff" opacity="0.35" />

        {/* Visor / Layar Wajah */}
        <rect
          x="33"
          y="63"
          width="62"
          height="30"
          rx="15"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="2.5"
        />

        {/* Mata Bersinar */}
        {mood === 'sad' ? (
          <g>
            <path d="M44 76 L53 81 L44 83" fill="none" stroke={color.eye} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M84 76 L75 81 L84 83" fill="none" stroke={color.eye} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : (
          <g className="animate-bot-blink">
            {/* Glow belakang mata */}
            <circle cx="49" cy="78" r="11" fill={`url(#eyeGlow-${color.id})`} opacity="0.55" />
            <circle cx="79" cy="78" r="11" fill={`url(#eyeGlow-${color.id})`} opacity="0.55" />
            {/* Bola mata */}
            <circle cx="49" cy="78" r="6.5" fill={color.eye} />
            <circle cx="79" cy="78" r="6.5" fill={color.eye} />
            {/* Kilau mata */}
            <circle cx="51" cy="75.5" r="2.5" fill="#ffffff" />
            <circle cx="81" cy="75.5" r="2.5" fill="#ffffff" />
          </g>
        )}

        {/* Pipi merona */}
        <ellipse cx="37" cy="96" rx="4.5" ry="2.8" fill="#fda4af" opacity="0.85" />
        <ellipse cx="91" cy="96" rx="4.5" ry="2.8" fill="#fda4af" opacity="0.85" />

        {/* Mulut */}
        {mood === 'sad' ? (
          <path
            d="M54 105 Q64 98 74 105"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        ) : mood === 'celebrate' ? (
          <path
            d="M52 99 Q64 112 76 99 Z"
            fill="#ffffff"
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M54 100 Q64 109 74 100"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.8"
            strokeLinecap="round"
          />
        )}

        {/* Aksesoris / Topi SVG */}
        {renderHat(hatId)}

        {/* Sparkle saat celebrate */}
        {mood === 'celebrate' && (
          <g fill="#fde047">
            <path d="M14 40 L17 47 L24 50 L17 53 L14 60 L11 53 L4 50 L11 47 Z" />
            <path d="M114 34 L116 39 L121 41 L116 43 L114 48 L112 43 L107 41 L112 39 Z" />
          </g>
        )}
      </svg>
    </div>
  );
}
