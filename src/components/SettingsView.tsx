/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sun, Moon, Info, RotateCcw, Award, Star, Mail, Sparkles } from 'lucide-react';
import { UserState } from '../types';

interface SettingsViewProps {
  userState: UserState;
  onUpdateState: (newState: Partial<UserState>) => void;
  onResetCampaign: () => void;
  isLightTheme: boolean;
  onToggleTheme: () => void;
  addLog: (text: string) => void;
  triggerToast: (msg: string) => void;
}

export default function SettingsView({
  userState,
  onUpdateState,
  onResetCampaign,
  isLightTheme,
  onToggleTheme,
  addLog,
  triggerToast
}: SettingsViewProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleApplyGems = () => {
    onUpdateState({ gems: userState.gems + 10 });
    addLog("🎁 Goddess sprites gifted you +10 extra gems! Luck is with you.");
    triggerToast("Gems Gained!");
  };

  return (
    <div className="space-y-4">
      {/* Title block */}
      <div className="p-4 bg-[#113c2c] border border-[#1b4332] rounded-[14px] shadow-lg relative text-center justify-center flex flex-col">
        <h4 className="font-cinzel text-sm font-bold text-[#f5fff6]">SPELLBOOK OPTIONS</h4>
        <p className="text-[10px] text-[#52B788] font-bold tracking-widest uppercase">
          Configure Medieval mechanics
        </p>
      </div>

      {/* Theme Toggles & Aesthetics */}
      <div className="p-4 bg-[#0b291d] border border-[#1B4332] rounded-[14px] space-y-3 shadow-md">
        <h5 className="font-cinzel text-xs font-bold text-[#D8F3DC] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-[#1b4332]">
          {isLightTheme ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-[#52B788]" />}
          visual appearance
        </h5>

        <div className="flex justify-between items-center text-xs">
          <div className="space-y-0.5">
            <span className="text-[#f5fff6] font-sans font-bold block">Parchment Light Mode</span>
            <span className="text-[10px] text-[#b0cdbe]">Switch to an antique light paper styling</span>
          </div>
          <button
            onClick={onToggleTheme}
            id="theme-toggler"
            className="p-1 px-3 bg-[#113c2c] hover:bg-[#1b4332] border border-[#52B788] text-[#D8F3DC] text-[10px] uppercase font-bold rounded-xl active:scale-95 transition-all"
          >
            {isLightTheme ? "Emerald Dark" : "Parchment Light"}
          </button>
        </div>
      </div>

      {/* Sprites Cheat blessing */}
      <div className="p-4 bg-[#0b291d] border border-[#1B4332] rounded-[14px] space-y-3.5 shadow-md">
        <h5 className="font-cinzel text-xs font-bold text-[#D8F3DC] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-[#1b4332]">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
          goddess sprite support
        </h5>
        
        <p className="text-[10px] text-[#b0cdbe] leading-relaxed">
          Sluggish progression? Struck by lethargy snoozers? Request supplementary gems from the forest sprites!
        </p>

        <button
          onClick={handleApplyGems}
          className="w-full py-2.5 bg-[#52B788] hover:bg-[#52B788]/90 text-[#081C15] font-sans font-bold uppercase rounded-[14px] active:scale-95 transition-transform flex items-center justify-center gap-1 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" /> Request +10 Sprite Gems
        </button>
      </div>

      {/* Developer Settings Wipe campaigners */}
      <div className="p-4 bg-[#0b291d] border border-[#1B4332] rounded-[14px] space-y-3.5 shadow-md">
        <h5 className="font-cinzel text-xs font-bold text-[#D8F3DC] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-[#1b4332]">
          <RotateCcw className="w-3.5 h-3.5 text-red-400" />
          campaign diagnostics
        </h5>

        <div className="flex justify-between items-center text-xs">
          <div className="space-y-0.5">
            <span className="text-red-300 font-sans font-bold block">Wipe campaign scrolls</span>
            <span className="text-[10px] text-[#b0cdbe]">Resets level to 1, clears streaks & gems</span>
          </div>
          
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="p-1 px-3 border border-red-500 hover:bg-red-950/20 text-red-400 text-[10px] uppercase font-bold rounded-xl active:scale-95 transition-transform"
            >
              Reset
            </button>
          ) : (
            <div className="flex gap-1.5 items-center">
              <button
                onClick={onResetCampaign}
                className="p-1 px-2.5 bg-red-800 text-white text-[9px] uppercase font-bold rounded"
              >
                CONFIRM WIPE
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="p-1 px-2.5 text-neutral-400 text-[9px] font-bold"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Supplementary info block */}
      <div className="p-4 bg-[#05140f] border border-[#1b4332]/40 rounded-[14px] flex items-start gap-3 text-[10.5px] leading-relaxed select-text text-[#b0cdbe]">
        <Info className="w-4 h-4 text-[#52B788] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-cinzel font-bold text-white uppercase text-[9px] tracking-wider leading-none">growdaily guide</p>
          <p>
            Growdaily integrates RPG gaming loops into self-improvement. Check walk patrols, mute phone distractions, or scribe scrolls to earn permanent XP and spendable Gems. Maintain consecutive days of habit checking to activate a glorious 2.5x streak multiplier! Keep your guards active: sleeping Sloths or shadow Procrastinators check yesterday's checklist on app start to trigger penalties if goals were missed!
          </p>
          <p className="font-mono text-[9px] text-[#52B788]">Client Build Version: v1.5 • Host: Cloud Run Ingress</p>
        </div>
      </div>
    </div>
  );
}
