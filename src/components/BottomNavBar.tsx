/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Swords, BarChart2, ShoppingBag, Trophy, User, Settings } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'home' | 'stats' | 'shop' | 'leaderboard' | 'profile' | 'settings';
  setActiveTab: (tab: 'home' | 'stats' | 'shop' | 'leaderboard' | 'profile' | 'settings') => void;
}

export default function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  const tabs = [
    { id: 'home', label: 'Arena', icon: Swords },
    { id: 'stats', label: 'Stats', icon: BarChart2 },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'leaderboard', label: 'Rank', icon: Trophy },
    { id: 'profile', label: 'Hero', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 flex justify-between items-center px-2.5 py-2 pb-safe bg-[#0b291d] border-t border-[#1B4332] shadow-[0px_-4px_24px_rgba(8,28,21,0.6)] rounded-t-[14px]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-[14px] transition-all duration-100 ease-in-out active:scale-90 ${
              isActive
                ? 'text-[#D8F3DC] bg-[#1B4332]'
                : 'text-[#52B788] hover:text-[#D8F3DC] opacity-75 hover:opacity-100'
            }`}
          >
            <Icon className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[10px] font-medium mt-0.5 font-sans leading-none">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
