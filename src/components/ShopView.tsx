/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Gem, ShieldCheck, Sparkles, Award, Palette, CheckCircle } from 'lucide-react';
import { UserState } from '../types';

interface ShopViewProps {
  userState: UserState;
  onUpdateState: (newState: Partial<UserState>) => void;
  addLog: (text: string) => void;
  triggerToast: (msg: string) => void;
}

export default function ShopView({
  userState,
  onUpdateState,
  addLog,
  triggerToast
}: ShopViewProps) {
  const [purchaseGemsEffect, setPurchaseGemsEffect] = useState(false);

  const shopItems = [
    {
      id: "streak-shield",
      name: "Streak Shield Leaf",
      description: "Protects all active quest streaks if you forget to complete a habit tomorrow.",
      cost: 50,
      category: "Powerups",
      effectText: "+1 Shield stockpile"
    },
    {
      id: "xp-boost",
      name: "Scribe Focus Tome",
      description: "Grants 1.5x Multiplier to all habit checkpoints for the next 24 hours.",
      cost: 75,
      category: "Powerups",
      effectText: "1.5x Multiplier for 24h"
    },
    {
      id: "double-xp-boost",
      name: "Double XP Elixir",
      description: "A rich wizard potion that doubles all habit check XP for the next 24 hours.",
      cost: 100,
      category: "Powerups",
      effectText: "2.0x Multiplier for 24h"
    },
    {
      id: "avatar-badge",
      name: "Royal Medallion",
      description: "Unlocks a brilliant gold shield emblem next to your name on Leaderboards.",
      cost: 30,
      category: "Unlocks",
      effectText: "+Hero Status Badge"
    },
  ];

  const cosmetics = [
    {
      id: "trail-blue",
      name: "Mist Blue Trail",
      description: "Equip a cozy chilling blue mist trail that follows your avatar bunny.",
      cost: 100,
      category: "Cosmetics"
    },
    {
      id: "trail-pink",
      name: "Sprite Pink Trail",
      description: "Surround your rabbit with sparkling magical pink fairy dust trails.",
      cost: 300,
      category: "Cosmetics"
    },
    {
      id: "trail-rainbow",
      name: "Prismatic Rainbow Trail",
      description: "Divine multi-colored rainbow halo particle effect behind your rabbit.",
      cost: 500,
      category: "Cosmetics"
    },
  ];

  const handleBuyItem = (itemId: string, cost: number) => {
    if (userState.gems < cost) {
      triggerToast("Alas! You do not have enough Gems for this item.");
      return;
    }

    // Purchase effects
    setPurchaseGemsEffect(true);
    setTimeout(() => setPurchaseGemsEffect(false), 800);

    const updatePayload: Partial<UserState> = {
      gems: userState.gems - cost
    };

    let logText = '';

    if (itemId === 'streak-shield') {
      updatePayload.streakShieldCount = userState.streakShieldCount + 1;
      logText = `🛡️ Purchased Streak Shield Leaf from mystical merchant for 50 Gems!`;
    } else if (itemId === 'xp-boost') {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);
      updatePayload.xpBoostEnd = expirationDate.toISOString();
      logText = `📖 Opened Focus Tome. XP gains boosted to 1.5x for the next 24 hours!`;
    } else if (itemId === 'double-xp-boost') {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);
      updatePayload.doubleXpBoostEnd = expirationDate.toISOString();
      logText = `🧪 Quaffed Double XP Elixir. XP rewards doubled for 24 hours!`;
    } else if (itemId === 'avatar-badge') {
      updatePayload.hasAvatarBadge = true;
      updatePayload.ownedItems = [...userState.ownedItems, 'avatar-badge'];
      logText = `🎖️ Equipped Grand Royal Medallion to profile hero! User status upgraded.`;
    }

    onUpdateState(updatePayload);
    addLog(logText);
    triggerToast("Locked Purchase! Gems deducted.");
  };

  const handleBuyCosmetic = (cosmeticId: string, cost: number) => {
    const isOwned = userState.ownedItems.includes(cosmeticId);

    if (isOwned) {
      // Toggle Equipping
      let nextTrail = userState.selectedTrail;
      const trailName = cosmeticId === 'trail-blue' ? 'Blue' : cosmeticId === 'trail-pink' ? 'Pink' : 'Rainbow';

      if (userState.selectedTrail === trailName) {
        updateSelectedTrail('None', `Equipped trail altered: Particles dismissed.`);
      } else {
        updateSelectedTrail(trailName as any, `Equipped trail altered: Active particles set to ${trailName}.`);
      }
      return;
    }

    if (userState.gems < cost) {
      triggerToast("Alas! Insufficient Gems inside pouch.");
      return;
    }

    setPurchaseGemsEffect(true);
    setTimeout(() => setPurchaseGemsEffect(false), 800);

    const trailName = cosmeticId === 'trail-blue' ? 'Blue' : cosmeticId === 'trail-pink' ? 'Pink' : 'Rainbow';
    const updatedGems = userState.gems - cost;
    const updatedOwned = [...userState.ownedItems, cosmeticId];

    onUpdateState({
      gems: updatedGems,
      ownedItems: updatedOwned,
      selectedTrail: trailName as any
    });

    addLog(`🎨 Purchased & equipped ${trailName} cosmetic magic trail!`);
    triggerToast("Purchased Cosmetic Trail!");
  };

  const updateSelectedTrail = (trail: 'None' | 'Blue' | 'Pink' | 'Rainbow', message: string) => {
    onUpdateState({ selectedTrail: trail });
    addLog(message);
    triggerToast("Trail updated!");
  };

  return (
    <div className="space-y-4">
      {/* Gems pouch balance */}
      <div className="p-4 bg-[#113c2c] border border-[#1B4332] rounded-[14px] flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="space-y-1">
          <span className="text-[10px] text-[#52B788] font-bold tracking-widest uppercase">
            SPELLSHOP CASHIER
          </span>
          <h4 className="font-cinzel text-base font-bold text-[#f5fff6]">Wizard Merchant Gringold</h4>
        </div>
        <div className={`p-2 px-4 rounded-xl border border-[#D8F3DC] bg-[#081C15] flex items-center gap-2 transition-all duration-300 ${purchaseGemsEffect ? 'scale-110 shadow-[0_0_15px_#52b788]' : ''}`}>
          <Gem className="w-5 h-5 text-[#52B788] fill-[#52b788] animate-pulse" />
          <span className="font-mono font-bold text-lg text-[#D8F3DC]">
            {userState.gems} Gems
          </span>
        </div>
      </div>

      {/* Medieval Consumables */}
      <h5 className="font-cinzel text-xs font-bold text-[#D8F3DC] px-1 uppercase tracking-wider flex items-center gap-1.5 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#52B788]" />
        FANTASY RUNES & SCROLLS
      </h5>

      <div className="space-y-3">
        {shopItems.map((item) => {
          const hasBadge = item.id === 'avatar-badge' && userState.hasAvatarBadge;
          return (
            <div key={item.id} className="p-3.5 bg-[#0b291d] border border-[#1B4332] rounded-[14px] flex justify-between items-center shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#52B788] font-bold uppercase font-sans bg-green-950/60 border border-green-800 px-1.5 rounded">
                    {item.cost} GEMS
                  </span>
                  <h5 className="font-cinzel text-xs font-bold text-[#f5fff6]">{item.name}</h5>
                </div>
                <p className="text-[10px] text-[#b0cdbe] max-w-[280px] leading-tight">
                  {item.description}
                </p>
                <div className="text-[9px] font-sans font-bold text-[#D8F3DC]">
                  Effect: {item.effectText}
                </div>
              </div>

              <div>
                {hasBadge ? (
                  <div className="p-1 px-3 bg-[#1B4332] border border-[#52B788] text-[#D8F3DC] rounded-xl text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#52B788]" /> Owned
                  </div>
                ) : (
                  <button
                    disabled={userState.gems < item.cost}
                    onClick={() => handleBuyItem(item.id, item.cost)}
                    className={`p-1.5 px-3 rounded-xl font-sans font-bold text-[11px] transition-transform active:scale-95 ${
                      userState.gems >= item.cost
                        ? 'bg-[#52B788] text-[#081C15]'
                        : 'bg-neutral-800 text-neutral-400 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    Buy Item
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Avatar trailing effects cosmetics */}
      <h5 className="font-cinzel text-xs font-bold text-[#D8F3DC] px-1 uppercase tracking-wider flex items-center gap-1.5 pt-1">
        <Palette className="w-3.5 h-3.5 text-[#52B788]" />
        COSMETIC PARTICLES TRAILS
      </h5>

      <div className="space-y-3">
        {cosmetics.map((item) => {
          const isOwned = userState.ownedItems.includes(item.id);
          const isEquipped =
            (item.id === 'trail-blue' && userState.selectedTrail === 'Blue') ||
            (item.id === 'trail-pink' && userState.selectedTrail === 'Pink') ||
            (item.id === 'trail-rainbow' && userState.selectedTrail === 'Rainbow');

          return (
            <div key={item.id} className="p-3.5 bg-[#0b291d] border border-[#1B4332] rounded-[14px] flex justify-between items-center shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#52B788] font-bold uppercase font-sans bg-green-950/60 border border-green-800 px-1.5 rounded">
                    {item.cost} GEMS
                  </span>
                  <h5 className="font-cinzel text-xs font-bold text-[#f5fff6]">{item.name}</h5>
                </div>
                <p className="text-[10px] text-[#b0cdbe] max-w-[280px] leading-tight">
                  {item.description}
                </p>
                <div className="text-[9px] font-sans font-bold text-[#D8F3DC]">
                  {isOwned ? (isEquipped ? "Currently equipped - click to dismiss" : "Purchased - click to equip") : "Lacks ownership - Spend Gems!"}
                </div>
              </div>

              <div>
                {isOwned ? (
                  <button
                    onClick={() => handleBuyCosmetic(item.id, item.cost)}
                    className={`p-1.5 px-3 rounded-xl font-sans font-bold text-[11px] active:scale-95 transition-transform ${
                      isEquipped ? 'bg-[#1b4332] text-white border border-[#52B788]' : 'bg-[#52B788] text-[#081C15]'
                    }`}
                  >
                    {isEquipped ? "Dismiss" : "Equip"}
                  </button>
                ) : (
                  <button
                    disabled={userState.gems < item.cost}
                    onClick={() => handleBuyCosmetic(item.id, item.cost)}
                    className={`p-1.5 px-3 rounded-xl font-sans font-bold text-[11px] transition-transform active:scale-95 ${
                      userState.gems >= item.cost
                        ? 'bg-[#52B788] text-[#081C15]'
                        : 'bg-neutral-800 text-neutral-400 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    Unlock
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
