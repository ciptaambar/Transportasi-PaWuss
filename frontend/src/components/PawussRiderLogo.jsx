import React from 'react';

export default function PawussRiderLogo({ size = 40, className = '' }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-green-400 p-2 shadow-lg shadow-emerald-600/30 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Speed Wind Streaks */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full stroke-white stroke-2">
          <path d="M5 25 L35 25" strokeDasharray="4 4" />
          <path d="M10 50 L45 50" strokeDasharray="6 3" />
          <path d="M5 75 L30 75" strokeDasharray="5 3" />
        </svg>
      </div>

      {/* Modern Motorcycle Rider SVG Vector */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md"
      >
        {/* Speed motion lines */}
        <path d="M4 36H16" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M2 42H12" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M6 48H18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

        {/* Motorcycle Rear Wheel */}
        <circle cx="21" cy="46" r="8" stroke="#0F172A" strokeWidth="3" fill="#334155" />
        <circle cx="21" cy="46" r="4" fill="#E2E8F0" />

        {/* Motorcycle Front Wheel */}
        <circle cx="49" cy="46" r="8" stroke="#0F172A" strokeWidth="3" fill="#334155" />
        <circle cx="49" cy="46" r="4" fill="#E2E8F0" />

        {/* Motorcycle Body Frame */}
        <path
          d="M21 46L29 37H39L49 46"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Scooter Chassis / Fairing (PaWuss Green) */}
        <path
          d="M26 38L33 30H43L48 40L39 42L33 38Z"
          fill="#10B981"
          stroke="#047857"
          strokeWidth="1.5"
        />

        {/* Handlebar & Windshield */}
        <path d="M41 29L45 22H40" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M44 21L47 16" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

        {/* Headlight Beam */}
        <polygon points="50,33 62,28 62,38" fill="#FDE047" opacity="0.8" />

        {/* Rider Body & Green Jacket */}
        <path
          d="M27 34C27 34 30 25 35 24C39 23 43 28 43 28L37 36H30Z"
          fill="#059669"
          stroke="#064E3B"
          strokeWidth="1.5"
        />

        {/* Rider Arms on Handlebar */}
        <path
          d="M34 26L42 24"
          stroke="#047857"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Rider Helmet (PaWuss Signature Green Helmet with Visor) */}
        <circle cx="36" cy="16" r="6.5" fill="#10B981" stroke="#064E3B" strokeWidth="1.5" />
        {/* Cat ears / Paw horn accent on helmet */}
        <path d="M32 12L34 9L36 11" fill="#047857" />
        <path d="M37 11L39 9L41 12" fill="#047857" />
        {/* Helmet Dark Visor */}
        <path
          d="M37 14C39 14 42 16 42 18H37V14Z"
          fill="#0F172A"
        />
      </svg>
    </div>
  );
}
