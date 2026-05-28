/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Trophy, ShieldAlert, Sparkles, Medal, User, Crown } from 'lucide-react';
import { LeaderboardEntry, UserState } from '../types';
import { fetchLeaderboard } from '../dbService';
import { LEADERBOARD_BOTS } from '../data';

interface LeaderboardViewProps {
  userState: UserState;
}

export default function LeaderboardView({ userState }: LeaderboardViewProps) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBoard() {
      setLoading(true);
      // Construct a list of bot competitors mapped to the type
      const botsList: LeaderboardEntry[] = LEADERBOARD_BOTS.map(b => ({
        username: b.name,
        level: b.level,
        xp: b.xp,
        isBot: true,
        tag: b.tag
      }));

      // Inject the current user into the comparative list
      const userEntry: LeaderboardEntry = {
        username: userState.username + " (You)",
        level: userState.level,
        xp: userState.xp + (userState.level * 1000),
        tag: userState.hasAvatarBadge ? "Sovereign" : "Adventurer",
        email: userState.email
      };

      const fullList = await fetchLeaderboard([userEntry, ...botsList]);
      
      // Filter out duplicate user profiles or bots representing user
      const unique: LeaderboardEntry[] = [];
      const seen = new Set<string>();
      
      for (const ent of fullList) {
        const idKey = ent.username.toLowerCase();
        if (!seen.has(idKey)) {
          seen.add(idKey);
          unique.push(ent);
        }
      }

      setBoard(unique.sort((a, b) => b.xp - a.xp));
      setLoading(false);
    }
    loadBoard();
  }, [userState]);

  return (
    <div className="space-y-4">
      {/* Leaderboard Champion Banner */}
      <div className="p-4 bg-[#113c2c] border border-[#1b4332] rounded-[14px] flex items-center gap-3.5 shadow-md relative overflow-hidden text-center justify-center flex-col">
        <div className="absolute top-0 right-0 w-20 h-20 opacity-15 pointer-events-none">
          <Trophy className="w-full h-full text-[#52B788]" />
        </div>
        <Crown className="w-10 h-10 text-yellow-400 fill-yellow-400 animate-bounce" />
        <div className="space-y-0.5">
          <h4 className="font-cinzel text-sm font-bold text-[#f5fff6]">CELestial highscores</h4>
          <p className="text-[10px] text-[#52B788] font-bold tracking-widest uppercase">
            Top Habit Scribes of the Realm
          </p>
        </div>
      </div>

      {/* Main rankings lists */}
      <div className="p-3 bg-[#0b291d] border border-[#1B4332] rounded-[14px] shadow-lg space-y-2">
        {loading ? (
          <div className="py-12 flex flex-col justify-center items-center gap-2">
            <Sparkles className="w-8 h-8 text-[#52B788] animate-spin" />
            <p className="text-xs text-[#b0cdbe] font-mono leading-none">Summoning scroll records...</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1b4332]">
            {board.map((player, idx) => {
              const rank = idx + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;
              const isCurrentUser = player.username.includes("(You)") || player.email === userState.email;

              return (
                <div
                  key={player.username}
                  className={`flex items-center justify-between py-3 px-2 transition-all ${
                    isCurrentUser ? 'bg-[#52b788]/10 rounded-lg border border-[#52B788]/20 px-2' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank counter badges */}
                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                      {isFirst ? (
                        <Medal className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      ) : isSecond ? (
                        <Medal className="w-5 h-5 text-zinc-300 fill-zinc-300" />
                      ) : isThird ? (
                        <Medal className="w-5 h-5 text-amber-600 fill-amber-600" />
                      ) : (
                        <span className="font-mono font-bold text-[#52B788] text-xs">#{rank}</span>
                      )}
                    </div>

                    {/* Username custom medallions */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold font-cinzel leading-none ${isCurrentUser ? 'text-[#D8F3DC]' : 'text-[#f5fff6]'}`}>
                          {player.username}
                        </span>
                        
                        {/* Render Shop Medallion if hasAvatarBadge active on player */}
                        {(player.tag === 'Sovereign' || player.tag === 'Guardian') && (
                          <div className="w-3.5 h-3.5 bg-yellow-400 rounded-full flex items-center justify-center p-0.5" title="Sovereign Shield badge">
                            <Crown className="w-2.5 h-2.5 text-[#081C15]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#52B788] block leading-none">
                        {player.tag || "Scribe"}
                      </span>
                    </div>
                  </div>

                  {/* Level details */}
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-[#081C15] border border-[#1b4332] text-[#D8F3DC] font-sans font-extrabold text-[10px] rounded">
                      Lvl {player.level}
                    </span>
                    <div className="text-[9px] font-mono font-medium text-[#b0cdbe] mt-0.5">
                      {player.xp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
