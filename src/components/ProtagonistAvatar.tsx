/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface ProtagonistAvatarProps {
  stage: 'Baby' | 'Clean Baby' | 'Medium' | 'Grown' | 'Flying';
  selectedTrail: 'None' | 'Blue' | 'Pink' | 'Rainbow';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isJumping?: boolean;
}

export default function ProtagonistAvatar({
  stage,
  selectedTrail,
  size = 'md',
  className = '',
  isJumping = true,
}: ProtagonistAvatarProps) {
  
  // Decide size classes (height & width)
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
    '2xl': 'w-44 h-44',
  }[size] || 'w-16 h-16';

  // Trails visual effect
  const renderTrailEffect = () => {
    if (selectedTrail === 'None') return null;

    if (selectedTrail === 'Blue') {
      return (
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Glowing blue backdrops */}
          <div className="absolute inset-2 bg-sky-500/35 rounded-full blur-xl animate-pulse" />
          <div className="absolute -top-1 -left-2 w-3 h-3 bg-cyan-300 rounded-full blur-sm opacity-80 animate-[ping_2s_infinite_delay-100]" />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-sky-200 rounded-full blur-[1px] opacity-90 animate-[bounce_1.5s_infinite]" />
          <div className="absolute top-1/2 -left-4 w-2 h-2 bg-blue-300 rounded-full opacity-60 animate-[float_3s_infinite]" />
        </div>
      );
    }

    if (selectedTrail === 'Pink') {
      return (
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Sparkling pink fairy trails */}
          <div className="absolute inset-2 bg-pink-500/35 rounded-full blur-xl animate-pulse" />
          <div className="absolute -top-2 -right-1 w-3.5 h-3.5 bg-pink-300 rounded-full blur-sm opacity-90 animate-[ping_1.8s_infinite]" />
          <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-rose-200 rounded-full opacity-90 animate-[bounce_1.2s_infinite]" />
          <div className="absolute top-1/3 -right-4 w-2.5 h-2.5 bg-fuchsia-300 rounded-full opacity-70 animate-[float_2.5s_infinite_delay-300]" />
        </div>
      );
    }

    if (selectedTrail === 'Rainbow') {
      return (
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Prismatic multi-colored dynamic rings */}
          <div className="absolute inset-1 bg-gradient-to-tr from-pink-500 via-amber-400 to-cyan-500 rounded-full blur-xl animate-pulse opacity-40" />
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-amber-300 rounded-full blur-[1px] opacity-95 animate-[ping_2.2s_infinite]" />
          <div className="absolute -bottom-2 -right-2 w-2.5 h-2.5 bg-emerald-300 rounded-full opacity-90 animate-[bounce_1.7s_infinite_delay-100]" />
          <div className="absolute top-2/3 -left-3 w-2 h-2 bg-pink-300 rounded-full opacity-80 animate-[float_4s_infinite]" />
          <div className="absolute top-1/5 -right-3 w-3 h-3 bg-violet-400 rounded-full opacity-70 animate-[float_3.2s_infinite_delay-500]" />
        </div>
      );
    }

    return null;
  };

  // Shadow glow effect determined by Stage milestones (Visual FX requirements)
  const getGlowStyle = () => {
    switch (stage) {
      case 'Clean Baby': // Level 2: small white glow
        return { filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.75))' };
      case 'Medium': // Level 3: small yellow glow with sparkles
        return { filter: 'drop-shadow(0 0 12px rgba(231, 194, 104, 0.9))' };
      case 'Grown': // Level 4: wings with more glow aura
        return { filter: 'drop-shadow(0 0 16px rgba(216, 243, 220, 0.95))' };
      case 'Flying': // Level 5: flying rabbit wings open with cosmic aura
        return { filter: 'drop-shadow(0 0 22px rgba(100, 255, 218, 0.95)) drop-shadow(0 0 6px rgb(236,72,153))' };
      case 'Baby':
      default:
        return {};
    }
  };

  const animationClass = isJumping ? 'animate-bunny-jump' : '';

  return (
    <div className={`relative ${sizeClasses} flex items-center justify-center shrink-0 ${className}`}>
      
      {/* 1. Trails Render */}
      {renderTrailEffect()}

      {/* 2. Sparkle overlays for Level 3+ */}
      {(stage === 'Medium' || stage === 'Flying') && (
        <div className="absolute -top-1 -right-1 z-20 text-yellow-400 animate-pulse pointer-events-none">
          <Sparkles className="w-4 h-4" />
        </div>
      )}
      {(stage === 'Grown' || stage === 'Flying') && (
        <div className="absolute -bottom-1 -left-1 z-20 text-teal-300 animate-pulse pointer-events-none">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      {/* 3. Rabbit Illustration Vector Design */}
      <div 
        style={getGlowStyle()} 
        className={`w-full h-full relative z-10 select-none ${animationClass}`}
      >
        {stage === 'Baby' && (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background elements to represent "abandoned & dirty baby rabbit" */}
            <g id="baby-dirty-bunny">
              {/* Ears - small, drooping & floppy */}
              <ellipse cx="36" cy="24" rx="7" ry="18" fill="#7a8799" transform="rotate(-15 36 24)" />
              <ellipse cx="64" cy="24" rx="7" ry="18" fill="#7a8799" transform="rotate(15 64 24)" />
              {/* Inner ear - sad beige */}
              <ellipse cx="36" cy="24" rx="3.5" ry="14" fill="#a07d72" transform="rotate(-15 36 24)" />
              <ellipse cx="64" cy="24" rx="3.5" ry="14" fill="#a07d72" transform="rotate(15 64 24)" />
              
              {/* Face/Head */}
              <circle cx="50" cy="55" r="23" fill="#8492a6" />
              
              {/* Mud / Dirt Splatters */}
              <path d="M 37 45 Q 39 40 43 44" stroke="#5c4d3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="62" cy="62" r="2.5" fill="#4a3e31" />
              <path d="M 52 66 Q 50 63 56 64" stroke="#5c4d3c" strokeWidth="1.5" fill="none" />
              
              {/* Cute curious baby eyes */}
              <circle cx="41" cy="51" r="3.5" fill="#2d3748" />
              <circle cx="40" cy="50" r="1" fill="#FFF" />
              <circle cx="59" cy="51" r="3.5" fill="#2d3748" />
              <circle cx="58" cy="50" r="1" fill="#FFF" />
              
              {/* Soft tear splash */}
              <circle cx="39" cy="57" r="2" fill="#81e6d9" opacity="0.6" />
              
              {/* Cheeks */}
              <ellipse cx="35" cy="57" rx="3" ry="1.5" fill="#e53e3e" opacity="0.25" />
              <ellipse cx="65" cy="57" rx="3" ry="1.5" fill="#e53e3e" opacity="0.25" />
              
              {/* Cute nose & whiskers */}
              <polygon points="48,56 52,56 50,58" fill="#e53e3e" />
              <path d="M 46 61 Q 50 64 54 61" stroke="#2d3748" strokeWidth="1" fill="none" />
              {/* Whiskers */}
              <line x1="28" y1="58" x2="18" y2="56" stroke="#4a5568" strokeWidth="1" />
              <line x1="29" y1="62" x2="20" y2="63" stroke="#4a5568" strokeWidth="1" />
              <line x1="72" y1="58" x2="82" y2="56" stroke="#4a5568" strokeWidth="1" />
              <line x1="71" y1="62" x2="80" y2="63" stroke="#4a5568" strokeWidth="1" />
              
              {/* Tiny tiny body paws underneath */}
              <circle cx="38" cy="76" r="4.5" fill="#7a8799" />
              <circle cx="62" cy="76" r="4.5" fill="#7a8799" />
            </g>
          </svg>
        )}

        {stage === 'Clean Baby' && (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Pristine, clean baby bunny */}
            <g id="clean-baby-bunny">
              {/* Ears - Perky, cleaned and snowywhite */}
              <ellipse cx="38" cy="22" rx="7.5" ry="19" fill="#FFFFFF" stroke="#e2e8f0" strokeWidth="1.5" transform="rotate(-10 38 22)" />
              <ellipse cx="62" cy="22" rx="7.5" ry="19" fill="#FFFFFF" stroke="#e2e8f0" strokeWidth="1.5" transform="rotate(10 62 22)" />
              {/* Bright pink inner ear */}
              <ellipse cx="38" cy="22" rx="4" ry="15" fill="#FFAEC9" transform="rotate(-10 38 22)" />
              <ellipse cx="62" cy="22" rx="4" ry="15" fill="#FFAEC9" transform="rotate(10 62 22)" />
              
              {/* Round fluffy clean head */}
              <circle cx="50" cy="54" r="23" fill="#FFFFFF" stroke="#ebdcb3" strokeWidth="1" />
              
              {/* Joyous eyes */}
              <circle cx="41" cy="50" r="4" fill="#1A365D" />
              <circle cx="39.5" cy="48.5" r="1.5" fill="#FFF" />
              <circle cx="42" cy="51" r="0.7" fill="#FFF" />
              
              <circle cx="59" cy="50" r="4" fill="#1A365D" />
              <circle cx="57.5" cy="48.5" r="1.5" fill="#FFF" />
              <circle cx="60" cy="51" r="0.7" fill="#FFF" />
              
              {/* Bright cute pink cheeks with high contrast blush */}
              <ellipse cx="33" cy="56" rx="4.5" ry="2.5" fill="#ff70a6" opacity="0.65" />
              <ellipse cx="67" cy="56" rx="4.5" ry="2.5" fill="#ff70a6" opacity="0.65" />
              
              {/* Nose & adorable smirk */}
              <polygon points="48,54 52,54 50,56" fill="#F472B6" />
              <path d="M 47 59 Q 50 61 53 59" stroke="#1A365D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              
              {/* Fluffy collar ruff */}
              <path d="M 32 72 Q 50 78 68 72 Q 50 82 32 72" fill="#E2E8F0" />
              
              {/* Baby paws */}
              <circle cx="40" cy="74" r="4" fill="#FFFFFF" stroke="#e2e8f0" strokeWidth="1" />
              <circle cx="60" cy="74" r="4" fill="#FFFFFF" stroke="#e2e8f0" strokeWidth="1" />
            </g>
          </svg>
        )}

        {stage === 'Medium' && (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Medium sized rabbit - soft cream/lavender with high detail */}
            <g id="medium-rabbit">
              {/* Longer upright ears */}
              <ellipse cx="36" cy="20" rx="8" ry="22" fill="#ece6ff" stroke="#cfc0ff" strokeWidth="1.5" transform="rotate(-5 36 20)" />
              <ellipse cx="64" cy="20" rx="8" ry="22" fill="#ece6ff" stroke="#cfc0ff" strokeWidth="1.5" transform="rotate(5 64 20)" />
              {/* Inner lavender ear */}
              <ellipse cx="36" cy="20" rx="4.5" ry="17" fill="#Fbcfe8" transform="rotate(-5 36 20)" />
              <ellipse cx="64" cy="20" rx="4.5" ry="17" fill="#Fbcfe8" transform="rotate(5 64 20)" />
              
              {/* Golden dynamic hair-tuft on forehead */}
              <path d="M 45 32 Q 50 20 55 32 Q 50 28 45 32" fill="#FDE047" />

              {/* Head */}
              <circle cx="50" cy="53" r="24" fill="#ece6ff" stroke="#cfc0ff" strokeWidth="1" />
              
              {/* Big starry, cute sparkling eyes */}
              <circle cx="40" cy="49" r="4.5" fill="#4c1d95" />
              <circle cx="38" cy="47" r="1.8" fill="#FFF" />
              {/* Little stars inside eyes */}
              <polygon points="42,49 43,47 44,49 46,49 44,51 45,53 43,51 41,53 42,51 40,49" fill="#FDE047" transform="scale(0.8) translate(10, 11)" />
              
              <circle cx="60" cy="49" r="4.5" fill="#4c1d95" />
              <circle cx="58" cy="47" r="1.8" fill="#FFF" />

              {/* Rosy glowing cheeks */}
              <circle cx="32" cy="56" r="4" fill="#ec4899" opacity="0.6" />
              <circle cx="68" cy="56" r="4" fill="#ec4899" opacity="0.6" />

              {/* Nose & dynamic happy mouth */}
              <polygon points="48,53 52,53 50,55" fill="#F472B6" />
              <path d="M 46 58 C 48 60, 52 60, 54 58" stroke="#4c1d95" strokeWidth="1.5" fill="none" strokeLinecap="round" />

              {/* Little bell medallion accessory on neck */}
              <circle cx="50" cy="74" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              <line x1="47" y1="72" x2="53" y2="72" stroke="#ca8a04" strokeWidth="1" />

              {/* Paws */}
              <circle cx="39" cy="75" r="4.5" fill="#ece6ff" stroke="#cfc0ff" strokeWidth="1" />
              <circle cx="61" cy="75" r="4.5" fill="#ece6ff" stroke="#cfc0ff" strokeWidth="1" />
            </g>
          </svg>
        )}

        {stage === 'Grown' && (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Full grown rabbit - sleek, with small magical wings */}
            <g id="grown-rabbit">
              {/* Majestic feathered wings folded on the back */}
              <path d="M 22 55 Q 5 45 15 35 Q 22 45 23 55" fill="#E2E8F0" stroke="#cbd5e1" strokeWidth="1.5" opacity="0.9" />
              <path d="M 78 55 Q 95 45 85 35 Q 78 45 77 55" fill="#E2E8F0" stroke="#cbd5e1" strokeWidth="1.5" opacity="0.9" />

              {/* Tall elegant leaf-shaped ears with golden bands */}
              <ellipse cx="35" cy="18" rx="8.5" ry="24" fill="#f5fff6" stroke="#93c5fd" strokeWidth="1.5" transform="rotate(-6 35 18)" />
              <ellipse cx="65" cy="18" rx="8.5" ry="24" fill="#f5fff6" stroke="#93c5fd" strokeWidth="1.5" transform="rotate(6 65 18)" />
              {/* Inner ear soft cyan */}
              <ellipse cx="35" cy="18" rx="4.5" ry="19" fill="#93c5fd" opacity="0.6" transform="rotate(-6 35 18)" />
              <ellipse cx="65" cy="18" rx="4.5" ry="19" fill="#93c5fd" opacity="0.6" transform="rotate(6 65 18)" />

              {/* Golden band wrapping ears */}
              <rect x="29" y="24" width="8" height="3" rx="1.5" fill="#ca8a04" opacity="0.8" />
              <rect x="63" y="24" width="8" height="3" rx="1.5" fill="#ca8a04" opacity="0.8" />

              {/* Head */}
              <circle cx="50" cy="51" r="25" fill="#f5fff6" stroke="#52B788" strokeWidth="1.5" />

              {/* Sleek confident eyes */}
              <path d="M 33 46 Q 40 43 45 47" stroke="#1b4332" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="39" cy="49" r="3.5" fill="#1b4332" />
              <circle cx="38" cy="48" r="1" fill="#FFF" />

              <path d="M 67 46 Q 60 43 55 47" stroke="#1b4332" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="61" cy="49" r="3.5" fill="#1b4332" />
              <circle cx="60" cy="48" r="1" fill="#FFF" />

              {/* Little magical crown of flowers/leaves */}
              <path d="M 42 30 Q 50 26 58 30" stroke="#ca8a04" strokeWidth="2.5" fill="none" />
              <circle cx="50" cy="27" r="3" fill="#ca8a04" />
              <circle cx="43" cy="29" r="2.5" fill="#52B788" />
              <circle cx="57" cy="29" r="2.5" fill="#52B788" />

              {/* Pink cheeks */}
              <circle cx="32" cy="54" r="3.5" fill="#ec4899" opacity="0.55" />
              <circle cx="68" cy="54" r="3.5" fill="#ec4899" opacity="0.55" />

              {/* Confident smile */}
              <polygon points="49,52 51,52 50,53" fill="#ec4899" />
              <path d="M 47 56 Q 50 58 53 56" stroke="#1b4332" strokeWidth="1.8" fill="none" strokeLinecap="round" />

              {/* Royal steel chest plate badge */}
              <path d="M 44 68 L 56 68 L 50 78 Z" fill="#ca8a04" />
              <circle cx="50" cy="71" r="2.2" fill="#FFFFFF" />

              {/* Confident robust paws */}
              <rect x="34" y="73" width="9" height="7" rx="3.5" fill="#f5fff6" stroke="#52B788" strokeWidth="1" />
              <rect x="57" y="73" width="9" height="7" rx="3.5" fill="#f5fff6" stroke="#52B788" strokeWidth="1" />
            </g>
          </svg>
        )}

        {stage === 'Flying' && (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Flying rabbit - wings fully open, hovering, flapping */}
            <g id="flying-rabbit">
              {/* Large, beautiful open feathered angel-style wings flapping */}
              <path d="M 24 50 Q -10 25 10 15 Q 26 25 24 50" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" className="animate-wing-left" style={{ transformOrigin: '24px 50px' }} />
              <path d="M 76 50 Q 110 25 90 15 Q 74 25 76 50" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" className="animate-wing-right" style={{ transformOrigin: '76px 50px' }} />

              {/* Ears - flying back gracefully */}
              <ellipse cx="34" cy="18" rx="8.5" ry="25" fill="#38bdf8" opacity="0.15" transform="rotate(-15 34 18)" />
              <ellipse cx="36" cy="17" rx="8" ry="24" fill="#FFFFFF" stroke="#0284c7" strokeWidth="1.5" transform="rotate(-12 36 17)" />
              <ellipse cx="66" cy="18" rx="8.5" ry="25" fill="#38bdf8" opacity="0.15" transform="rotate(15 66 18)" />
              <ellipse cx="64" cy="17" rx="8" ry="24" fill="#FFFFFF" stroke="#0284c7" strokeWidth="1.5" transform="rotate(12 64 17)" />

              {/* Inner ear angelic cyan-pink */}
              <ellipse cx="36" cy="17" rx="4" ry="19" fill="#f472b6" opacity="0.6" transform="rotate(-12 36 17)" />
              <ellipse cx="64" cy="17" rx="4" ry="19" fill="#f472b6" opacity="0.6" transform="rotate(12 64 17)" />

              {/* Head - smooth hovering sphere */}
              <circle cx="50" cy="49" r="25" fill="#FFFFFF" stroke="#0ea5e9" strokeWidth="2" />

              {/* Sparkle star forehead crown */}
              <polygon points="50,23 52,26 55,26 53,28 54,31 50,29 46,31 47,28 45,26 48,26" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

              {/* Angelic starry magical eyes */}
              <circle cx="39" cy="47" r="4.5" fill="#0369a1" />
              <ellipse cx="37" cy="45" rx="1.8" ry="1" fill="#FFF" transform="rotate(-10 37 45)" />
              <polygon points="41,48 42,46 43,48" fill="#fbbf24" strokeWidth="0.5" />

              <circle cx="61" cy="47" r="4.5" fill="#0369a1" />
              <ellipse cx="59" cy="45" rx="1.8" ry="1" fill="#FFF" transform="rotate(-10 59 45)" />
              <polygon points="63,48 64,46 65,48" fill="#fbbf24" strokeWidth="0.5" />

              {/* Rosy blush layout */}
              <ellipse cx="32" cy="54" rx="4.5" ry="2" fill="#ec4899" opacity="0.65" />
              <ellipse cx="68" cy="54" rx="4.5" ry="2" fill="#ec4899" opacity="0.65" />

              {/* Magical smile */}
              <polygon points="49.5,50 50.5,50 50,51" fill="#ec4899" />
              <path d="M 47 54 Q 50 56.5 53 54" stroke="#0369a1" strokeWidth="1.8" fill="none" strokeLinecap="round" />

              {/* Prismatic chest jewel */}
              <polygon points="50,65 55,70 50,75 45,70" fill="#f43f5e" stroke="#be123c" strokeWidth="1" />
              
              {/* Paws */}
              <circle cx="37" cy="72" r="4" fill="#FFFFFF" stroke="#0ea5e9" strokeWidth="1" />
              <circle cx="63" cy="72" r="4" fill="#FFFFFF" stroke="#0ea5e9" strokeWidth="1" />
            </g>
          </svg>
        )}
      </div>

      {/* 4. Jumping & Flight keyframe styling injections */}
      <style>{`
        @keyframes bunny-jump {
          0%, 100% {
            transform: translateY(0) scaleX(1) scaleY(1);
          }
          30% {
            transform: translateY(2px) scaleX(1.1) scaleY(0.92);
          }
          50% {
            transform: translateY(-13px) scaleX(0.93) scaleY(1.12);
          }
          80% {
            transform: translateY(0) scaleX(1) scaleY(1);
          }
        }
        .animate-bunny-jump {
          animation: bunny-jump 1.5s infinite ease-in-out;
        }

        @keyframes wing-flap-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-22deg); }
        }
        @keyframes wing-flap-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(22deg); }
        }
        .animate-wing-left {
          animation: wing-flap-left 0.8s infinite ease-in-out;
        }
        .animate-wing-right {
          animation: wing-flap-right 0.8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
