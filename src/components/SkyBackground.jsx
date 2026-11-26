import React from 'react';

export default function SkyBackground({ children, showHills = true }) {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100 flex justify-center">
      {/* Decorative Animated Clouds */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Cloud 1 */}
        <svg
          viewBox="0 0 180 70"
          className="absolute top-6 left-[4%] w-36 text-white/85 animate-cloud-slow drop-shadow-sm"
          fill="currentColor"
        >
          <path d="M38 58h98a20 20 0 0 0 4-39.6A28 28 0 0 0 86 12a24 24 0 0 0-43 13A17 17 0 0 0 38 58Z" />
        </svg>

        {/* Cloud 2 */}
        <svg
          viewBox="0 0 180 70"
          className="absolute top-16 right-[5%] w-28 text-white/75 animate-cloud-reverse drop-shadow-sm"
          fill="currentColor"
        >
          <path d="M38 58h98a20 20 0 0 0 4-39.6A28 28 0 0 0 86 12a24 24 0 0 0-43 13A17 17 0 0 0 38 58Z" />
        </svg>

        {/* Cloud 3 */}
        <svg
          viewBox="0 0 180 70"
          className="absolute top-44 left-[12%] w-24 text-white/55 animate-cloud-slow"
          fill="currentColor"
        >
          <path d="M38 58h98a20 20 0 0 0 4-39.6A28 28 0 0 0 86 12a24 24 0 0 0-43 13A17 17 0 0 0 38 58Z" />
        </svg>

        {/* Green Hills at Bottom */}
        {showHills && (
          <div className="absolute bottom-0 inset-x-0 w-full leading-none">
            <svg
              viewBox="0 0 440 150"
              preserveAspectRatio="none"
              className="w-full h-28 sm:h-36"
            >
              {/* Far light green hill */}
              <path
                d="M0 78 Q110 18 235 66 T440 52 L440 150 L0 150 Z"
                fill="#86efac"
              />
              {/* Mid green hill */}
              <path
                d="M0 98 Q145 48 290 92 T440 76 L440 150 L0 150 Z"
                fill="#4ade80"
              />
              {/* Foreground lush hill */}
              <path
                d="M0 116 Q95 88 215 112 T440 104 L440 150 L0 150 Z"
                fill="#22c55e"
              />
              {/* Tiny decorative hill flowers */}
              <circle cx="58" cy="118" r="3" fill="#fef08a" />
              <circle cx="145" cy="128" r="2.5" fill="#ffffff" />
              <circle cx="320" cy="122" r="3" fill="#fef08a" />
              <circle cx="385" cy="116" r="2.5" fill="#fbcfe8" />
            </svg>
          </div>
        )}
      </div>

      {/* Mobile-First 9:16 Container */}
      <div className="relative z-10 w-full max-w-[440px] min-h-[100dvh] flex flex-col">
        {children}
      </div>
    </div>
  );
}
