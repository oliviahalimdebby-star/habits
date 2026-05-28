/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Swords, Gem, Heart, Trophy, User, Settings, Sparkles, X, ChevronRight, Play, Award, Zap, LogIn, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BottomNavBar from './components/BottomNavBar';
import HomeArenaView from './components/HomeArenaView';
import StatsView from './components/StatsView';
import ShopView from './components/ShopView';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';

import { isFirebaseConfigured, auth, loadLocalState, saveLocalState } from './firebase';
import { fetchUserProfile, saveUserProfile, DEFAULT_USER_STATE } from './dbService';
import { UserState } from './types';
import ProtagonistAvatar from './components/ProtagonistAvatar';

export function getBunnyStage(xp: number): 'Baby' | 'Clean Baby' | 'Medium' | 'Grown' | 'Flying' {
  if (xp >= 3501) return 'Flying';
  if (xp >= 2001) return 'Grown';
  if (xp >= 1001) return 'Medium';
  if (xp >= 501) return 'Clean Baby';
  return 'Baby';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'shop' | 'leaderboard' | 'profile' | 'settings'>('home');
  const [userState, setUserState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  // Evolution Transition state
  const [evolutionTransition, setEvolutionTransition] = useState<{
    show: boolean;
    oldStage: 'Baby' | 'Clean Baby' | 'Medium' | 'Grown' | 'Flying';
    newStage: 'Baby' | 'Clean Baby' | 'Medium' | 'Grown' | 'Flying';
  } | null>(null);

  // Level Up Transition state (full screen animation)
  const [levelUpTransition, setLevelUpTransition] = useState<{
    show: boolean;
    oldLevel: number;
    newLevel: number;
    oldStage: 'Baby' | 'Clean Baby' | 'Medium' | 'Grown' | 'Flying';
    newStage: 'Baby' | 'Clean Baby' | 'Medium' | 'Grown' | 'Flying';
  } | null>(null);
  
  // Theme state: false = Emerald Dark, true = Antique Parchment Light
  const [isLightTheme, setIsLightTheme] = useState(() => loadLocalState<boolean>('light_theme_preference', false));

  // Logs stream for Journal and notifications
  const [logs, setLogs] = useState<string[]>(() => loadLocalState<string[]>('campaign_logs_v1', [
    "🛡️ Equipped balance shields. Current daily multiplier calibrated.",
    "☘️ Standard woodland patrols registered for inspection."
  ]));

  // Micro-interactions and Toast State
  const [toasts, setToasts] = useState<{ id: string; msg: string }[]>([]);
  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState(false);

  // Load User Account Profile on Boot
  useEffect(() => {
    async function initUser(uid: string, email: string) {
      setLoading(true);
      const profile = await fetchUserProfile(uid, email);
      
      // RUN ATTACK LOGIC ON APP BOOT
      const today = new Date().toISOString().split('T')[0];
      const revisedProfile = { ...profile };

      if (profile.lastActiveDate !== today) {
        // Did user miss any of the 3 habits yesterday?
        const yesterdayMissed = !profile.walkCompletedToday || !profile.phoneCompletedToday || !profile.studyCompletedToday;
        
        let logMsg = '';
        if (yesterdayMissed) {
          // Trigger Level/Tier of Antagonist Attack!
          if (profile.bossTier === 1) {
            // Level 1 (Sloth): resets streaks to 0 (unless Streak Shield is consumed)
            if (profile.streakShieldCount > 0) {
              revisedProfile.streakShieldCount = profile.streakShieldCount - 1;
              logMsg = "🛡️ SLOTH ATTEMPTS SNOOZE ATTACK! Your stored Streak Shield Leaf absorbed the spell and dissolved safely! Streaks protected.";
              triggerToast("Streak Shield Protected You!");
            } else {
              revisedProfile.walkStreak = 0;
              revisedProfile.phoneStreak = 0;
              revisedProfile.studyStreak = 0;
              logMsg = "💤 SLOTH SNOOZE CAST! Your habit streaks were reset to 0 due to missed goals yesterday. Stock up on Streak Shields!";
              triggerToast("Agh! Sloth reset your streaks!");
            }
          } else if (profile.bossTier === 2) {
            // Level 2 (Procrastinator): Gem Deduction
            const lostGems = Math.min(profile.gems, 10);
            revisedProfile.gems = profile.gems - lostGems;
            logMsg = `🔮 PROCRASTINATOR ATTACK! The Shadow wizard robbed -${lostGems} Gems from your coin purse.`;
            triggerToast("Shadow Wizard stole -10 Gems!");
          } else {
            // Level 3 (Quitter): Gem deduction + XP freeze (decrease XP or freeze progress)
            const lostGems = Math.min(profile.gems, 20);
            revisedProfile.gems = profile.gems - lostGems;
            logMsg = `🏚️ QUITTER BEAST CONJURED! Spells robbed -${lostGems} Gems and depleted overall level energies!`;
            triggerToast("Quitter Beast hijacked -20 Gems!");
          }
        } else {
          // Perfect Days counter bump-ups
          logMsg = "🌞 Welcome back, hero! Yesterday was completed perfectly. Boss retreated!";
        }

        // Restart habit checks for the new day
        revisedProfile.walkCompletedToday = false;
        revisedProfile.phoneCompletedToday = false;
        revisedProfile.studyCompletedToday = false;
        revisedProfile.lastActiveDate = today;

        // Save immediately
        await saveUserProfile(revisedProfile);
        
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${logMsg}`, ...prev]);
      }

      setUserState(revisedProfile);
      setLoading(false);
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        await initUser(firebaseUser.uid, firebaseUser.email || 'oliviahalimdebby@gmail.com');
      } else {
        // Local state sandbox initialization
        await initUser('offline_guest_adventurer', 'oliviahalimdebby@gmail.com');
      }
    });

    return () => unsubscribe();
  }, []);

  // Update Logs Cache when customized
  useEffect(() => {
    saveLocalState('campaign_logs_v1', logs);
  }, [logs]);

  // Update userState and synchronize to Firestore in real-time
  const handleUpdateUserState = async (updates: Partial<UserState>) => {
    if (!userState) return;

    // Detect if PLAYER level is advancing
    if (updates.level !== undefined && updates.level > userState.level) {
      const getBunnyXpForLevel = (lvl: number): number => {
        if (lvl >= 5) return 3501;
        if (lvl === 4) return 2001;
        if (lvl === 3) return 1001;
        if (lvl === 2) return 501;
        return 0;
      };

      const oldStage = getBunnyStage(userState.bunnyXp || 0);
      const targetBunnyXp = getBunnyXpForLevel(updates.level);
      updates.bunnyXp = targetBunnyXp;
      const newStage = getBunnyStage(targetBunnyXp);
      updates.bunnyStage = newStage;

      // Set player level up visual transition modal state
      setLevelUpTransition({
        show: true,
        oldLevel: userState.level,
        newLevel: updates.level,
        oldStage,
        newStage
      });
      triggerConfetti();
    }

    // Determine if bunnyXp is being updated, check for stage changes
    const oldStage = getBunnyStage(userState.bunnyXp || 0);

    const nextState = {
      ...userState,
      ...updates
    };

    if (nextState.bunnyXp !== undefined) {
      const newStage = getBunnyStage(nextState.bunnyXp);
      nextState.bunnyStage = newStage;

      // Stage Evolution level-up trigger! (Suppress standard if we are already showing player level up modal)
      if (oldStage !== newStage && nextState.bunnyXp > userState.bunnyXp && !updates.level) {
        setEvolutionTransition({
          show: true,
          oldStage,
          newStage
        });
        triggerConfetti();
      }
    }

    // Calculate maximum perfect streak
    const hasWalk = updates.walkCompletedToday !== undefined ? updates.walkCompletedToday : userState.walkCompletedToday;
    const hasPhone = updates.phoneCompletedToday !== undefined ? updates.phoneCompletedToday : userState.phoneCompletedToday;
    const hasStudy = updates.studyCompletedToday !== undefined ? updates.studyCompletedToday : userState.studyCompletedToday;
    
    if (hasWalk && hasPhone && hasStudy) {
      const walk = updates.walkStreak !== undefined ? updates.walkStreak : userState.walkStreak;
      const phone = updates.phoneStreak !== undefined ? updates.phoneStreak : userState.phoneStreak;
      const study = updates.studyStreak !== undefined ? updates.studyStreak : userState.studyStreak;
      const highestStreak = Math.max(walk, phone, study);
      
      if (highestStreak > userState.bestStreak) {
        nextState.bestStreak = highestStreak;
      }
    }

    setUserState(nextState);
    await saveUserProfile(nextState);
  };

  const addLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${text}`, ...prev.slice(0, 50)]);
  };

  const triggerToast = (msg: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, msg }]);
    
    // Automatically fade out toast
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleResetCampaign = async () => {
    const freshState = DEFAULT_USER_STATE(
      userState?.userId || 'offline_guest_adventurer',
      userState?.email || 'oliviahalimdebby@gmail.com'
    );
    setUserState(freshState);
    saveLocalState(`profile_${freshState.userId}`, freshState);
    if (isFirebaseConfigured && auth.currentUser) {
      await saveUserProfile(freshState);
    }
    
    setLogs([
      "🕒 Spellbook campaign rewound! Re-aligned levels, attributes, trails, and chronicles."
    ]);
    triggerToast("Campaign Wiped!");
    setActiveTab('home');
  };

  const handleToggleTheme = () => {
    const nextVal = !isLightTheme;
    setIsLightTheme(nextVal);
    saveLocalState('light_theme_preference', nextVal);
    triggerToast(nextVal ? "Antique Parchment mode active!" : "Wizard's Emerald Dark active!");
  };

  const triggerConfetti = () => {
    setShowLevelUpConfetti(true);
    setTimeout(() => {
      setShowLevelUpConfetti(false);
    }, 5500);
  };

  // Profile Bunny Stage illustration for global use
  const getBannerStageName = (): 'Baby' | 'Clean Baby' | 'Medium' | 'Grown' | 'Flying' => {
    if (!userState) return 'Baby';
    return getBunnyStage(userState.bunnyXp || 0);
  };

  const currentStage = getBannerStageName();

  return (
    <div className={`min-h-screen bg-black/95 text-white flex justify-center items-center p-0 md:p-4 selection:bg-[#52B788] selection:text-[#081C15] overflow-x-hidden ${isLightTheme ? 'light-mode' : ''}`}>
      
      {/* High-fidelity Custom Confetti level ascensions */}
      <AnimatePresence>
        {showLevelUpConfetti && (
          <div className="fixed inset-0 z-[120] pointer-events-none flex items-center justify-center">
            {Array.from({ length: 32 }).map((_, i) => {
              const xStart = Math.random() * 400 - 200;
              const yStart = 200;
              const xEnd = xStart + (Math.random() * 200 - 100);
              const yEnd = -400 - Math.random() * 200;

              return (
                <motion.div
                  key={i}
                  initial={{ x: xStart, y: yStart, opacity: 1, scale: 0.5, rotate: 0 }}
                  animate={{
                    x: xEnd,
                    y: yEnd,
                    opacity: [1, 1, 1, 0],
                    scale: [0.5, 1, 0.5],
                    rotate: 360
                  }}
                  transition={{ duration: 4.5, ease: "easeOut", delay: i * 0.05 }}
                  className={`absolute w-3.5 h-3.5 rounded-sm ${
                    i % 3 === 0 ? 'bg-[#52B788]' : i % 2 === 0 ? 'bg-[#D8F3DC]' : 'bg-yellow-400'
                  }`}
                />
              );
            })}
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="bg-[#0b291d] border-2 border-yellow-400 p-8 rounded-[14px] shadow-2xl relative text-center text-white"
            >
              <Award className="w-16 h-16 text-yellow-400 fill-yellow-400 mx-auto animate-bounce mb-3" />
              <h2 className="font-cinzel text-2xl font-bold text-[#D8F3DC]">level ASCENDED!</h2>
              <p className="text-xs text-[#52B788] font-semibold mt-1">YOUR MYSTICAL BUNNY EVOLUTION HAS QUICKENED!</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Micro-interaction Toasts list */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2 w-full max-w-[340px] pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 25, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="p-3 px-4 bg-[#113c2c] border border-[#52B788] text-white rounded-[14px] shadow-2xl flex items-center justify-between gap-3 text-xs font-semibold select-text"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#52B788] shrink-0" />
                <span>{t.msg}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Primary Mobile-first constraints view */}
      <div
        id="phone-container"
        className={`w-full max-w-[480px] h-screen md:h-[90vh] flex flex-col relative overflow-hidden shadow-2xl border-x md:rounded-[14px] transition-colors duration-200 ${
          isLightTheme 
            ? 'bg-[#fcfaf2] border-[#e1dccc] text-slate-900' 
            : 'bg-[#081C15] border-[#1b4332]/50 text-[#f5fff6]'
        }`}
      >
        
        {/* Fixed Headings bar */}
        <header className={`flex justify-between items-center px-4 py-3.5 w-full fixed top-0 left-0 right-0 z-40 border-b shadow-sm transition-colors duration-200 ${
          isLightTheme 
            ? 'bg-[#faf7eb] border-[#ebdcb3]/60' 
            : 'bg-[#0b291d] border-[#1B4332]'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border border-[#52B788] bg-[#081C15] flex items-center justify-center shadow-md relative overflow-hidden shrink-0">
              <ProtagonistAvatar stage={currentStage} selectedTrail={userState?.selectedTrail || 'None'} size="sm" isJumping={false} />
            </div>

            <h1 className={`font-cinzel text-base tracking-wide font-extrabold ${isLightTheme ? 'text-[#1c382a]' : 'text-white'}`}>
              Growdaily
            </h1>
          </div>

          {userState && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded-lg border border-[#1b4332]/30 shrink-0">
                <span className="text-[10px] font-extrabold text-[#52B788] uppercase leading-none">
                  Lvl {userState.level}
                </span>
                <span className="text-[10px] font-mono text-[#D8F3DC] font-extrabold leading-none">
                  {userState.xp} XP
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Gem className="w-3.5 h-3.5 text-[#52B788] fill-[#52b788]" />
                <span className="text-xs font-mono font-extrabold text-[#D8F3DC]">
                  {userState.gems}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Scrollable central container with fixed offsets */}
        <main className="flex-1 overflow-y-auto px-4 pt-16 pb-20 scrollbar-none">
          {loading ? (
            <div className="h-full flex flex-col justify-center items-center gap-3 py-36">
              <Sparkles className="w-10 h-10 text-[#52B788] animate-spin" />
              <p className="text-xs font-cinzel text-[#b0cdbe]">Synchronizing scrolls...</p>
            </div>
          ) : userState ? (
            <div className="pt-4 pb-6 space-y-4">
              
              {activeTab === 'home' && (
                <HomeArenaView
                  userState={userState}
                  onUpdateState={handleUpdateUserState}
                  addLog={addLog}
                  triggerToast={triggerToast}
                  triggerConfetti={triggerConfetti}
                />
              )}

              {activeTab === 'stats' && (
                <StatsView userState={userState} />
              )}

              {activeTab === 'shop' && (
                <ShopView
                  userState={userState}
                  onUpdateState={handleUpdateUserState}
                  addLog={addLog}
                  triggerToast={triggerToast}
                />
              )}

              {activeTab === 'leaderboard' && (
                <LeaderboardView userState={userState} />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  userState={userState}
                  onUpdateState={handleUpdateUserState}
                  addLog={addLog}
                  triggerToast={triggerToast}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  userState={userState}
                  onUpdateState={handleUpdateUserState}
                  onResetCampaign={handleResetCampaign}
                  isLightTheme={isLightTheme}
                  onToggleTheme={handleToggleTheme}
                  addLog={addLog}
                  triggerToast={triggerToast}
                />
              )}

            </div>
          ) : null}
        </main>

        {/* Fixed Footer Tab Selector navigation */}
        <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* 5. IMMERSIVE EVOLUTION CEREMONY FULLSCREEN MODAL */}
      <AnimatePresence>
        {evolutionTransition && evolutionTransition.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[150] flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Ambient magic radial light */}
            <div className="absolute inset-x-0 top-1/4 h-72 bg-gradient-radial from-[#52B788]/20 via-transparent to-transparent pointer-events-none blur-3xl" />
            
            <motion.div
              initial={{ scale: 0.82, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.82, y: 40 }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
              className="w-full max-w-sm bg-[#0b291d] border border-[#52B788]/60 p-6 rounded-[20px] shadow-2xl relative space-y-6 z-10"
            >
              {/* Particle explosions in background */}
              <div className="absolute -top-12 inset-x-0 flex justify-center text-[#52B788] animate-bounce">
                <Sparkles className="w-12 h-12 text-[#52B788] drop-shadow-[0_0_10px_rgba(82,183,136,0.8)]" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#52B788] tracking-widest uppercase">Sacred Quickening</span>
                <h2 className="font-cinzel text-xl font-extrabold text-[#D8F3DC] uppercase tracking-wider">
                  AVATAR EVOLUTION!
                </h2>
              </div>

              {/* Transition Arena showing Evolution */}
              <div className="flex items-center justify-around gap-2 bg-black/35 py-6 px-3 rounded-[16px] border border-[#1b4332]/60 relative overflow-hidden">
                {/* Previous stage */}
                <div className="flex flex-col items-center gap-1.5 opacity-60">
                  <div className="scale-75 origin-center">
                    <ProtagonistAvatar stage={evolutionTransition.oldStage} selectedTrail="None" size="lg" isJumping={false} />
                  </div>
                  <span className="text-[10px] font-mono text-[#b0cdbe]">{evolutionTransition.oldStage}</span>
                </div>

                {/* Growth Arrow icon */}
                <div className="text-[#52B788] flex flex-col items-center gap-1">
                  <ChevronRight className="w-6 h-6 animate-pulse" />
                  <span className="text-[8px] font-bold tracking-wider text-teal-400">ASCENSION</span>
                </div>

                {/* New magnificent stage */}
                <div className="flex flex-col items-center gap-1.5 relative">
                  {/* Outer active shadow halo */}
                  <div className="absolute inset-0 bg-teal-500/25 blur-xl rounded-full scale-125 animate-ping duration-1000" />
                  <div className="scale-110 relative z-10">
                    <ProtagonistAvatar stage={evolutionTransition.newStage} selectedTrail={userState?.selectedTrail || 'None'} size="lg" isJumping={true} />
                  </div>
                  <span className="text-[10px] font-bold text-[#52B788] font-mono relative z-10">{evolutionTransition.newStage}</span>
                </div>
              </div>

              {/* Progression Description Text */}
              <div className="space-y-1 bg-black/15 p-3.5 rounded-xl border border-[#1b4332]/40">
                <h4 className="text-xs font-bold text-teal-300 font-sans">
                  The Protagonist has transformed!
                </h4>
                <p className="text-[10px] text-[#b0cdbe] leading-relaxed">
                  Your commitment to building good habits has empowered your bunny companion to shed its old limits and ascend to a legendary {evolutionTransition.newStage} state.
                </p>
              </div>

              {/* Acknowledge Button */}
              <button
                id="awaken-form-btn"
                onClick={() => {
                  setEvolutionTransition(null);
                  triggerConfetti();
                }}
                className="w-full py-3 bg-[#52B788] hover:bg-[#409c73] text-[#081C15] font-sans font-bold text-xs rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Zap className="w-4 h-4 text-[#081C15]" />
                Awaken New Form
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* IMMERSIVE PLAYER LEVEL UP CEREMONY */}
        {levelUpTransition && levelUpTransition.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[160] flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Ambient magic golden radial lights */}
            <div className="absolute inset-x-0 top-1/4 h-80 bg-gradient-radial from-amber-500/20 via-transparent to-transparent pointer-events-none blur-3xl" />
            
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 22, stiffness: 160 }}
              className="w-full max-w-sm bg-[#0a2017] border-2 border-yellow-400/80 p-6 rounded-[24px] shadow-[0_0_50px_rgba(253,224,71,0.25)] relative space-y-6 z-10"
            >
              {/* Crown Emblem badge */}
              <div className="absolute -top-12 inset-x-0 flex justify-center text-yellow-400 animate-bounce">
                <Award className="w-14 h-14 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(243,156,18,0.8)]" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-yellow-400 tracking-widest uppercase block animate-pulse">MYSTICAL PROGRESSION</span>
                <h2 className="font-cinzel text-2xl font-black text-[#D8F3DC] uppercase tracking-wider">
                  LEVEL ASCENDED!
                </h2>
                <div className="inline-flex items-center gap-2 bg-black/45 px-4 py-1.5 rounded-full border border-yellow-500/30 font-mono text-xs font-bold text-yellow-300">
                  Level {levelUpTransition.oldLevel}
                  <ChevronRight className="w-3 h-3 text-teal-400" />
                  Level {levelUpTransition.newLevel}
                </div>
              </div>

              {/* Avatar Evolution Transition */}
              <div className="flex items-center justify-around gap-2 bg-black/45 py-6 px-3 rounded-[20px] border border-green-950/80 relative overflow-hidden">
                {/* Previous appearance */}
                <div className="flex flex-col items-center gap-1.5 opacity-50">
                  <div className="scale-[0.8] origin-center">
                    <ProtagonistAvatar stage={levelUpTransition.oldStage} selectedTrail="None" size="lg" isJumping={false} />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 capitalize">{levelUpTransition.oldStage}</span>
                </div>

                {/* Magic spark separator */}
                <div className="text-yellow-400 flex flex-col items-center gap-1 shrink-0">
                  <Sparkles className="w-5 h-5 animate-spin-delayed text-yellow-400" />
                  <span className="text-[8px] font-black tracking-widest text-[#52B788]">EVOLUTION</span>
                </div>

                {/* New magnificent status */}
                <div className="flex flex-col items-center gap-1.5 relative">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full scale-125 animate-pulse" />
                  <div className="scale-110 relative z-10">
                    <ProtagonistAvatar stage={levelUpTransition.newStage} selectedTrail={userState?.selectedTrail || 'None'} size="lg" isJumping={true} />
                  </div>
                  <span className="text-[10px] font-bold text-yellow-300 font-mono relative z-10 uppercase tracking-wide">
                    {levelUpTransition.newStage}
                  </span>
                </div>
              </div>

              {/* Evolution milestone parameters checklist */}
              <div className="space-y-1.5 bg-black/35 p-4 rounded-xl border border-green-950 text-left">
                <span className="text-[9px] font-extrabold text-teal-400 tracking-wider block uppercase">
                  ✓ Current Bunny Milestone features:
                </span>
                
                <p className="text-[10px] text-[#b0cdbe] leading-relaxed">
                  <strong>Milestone description:</strong> {
                    levelUpTransition.newStage === 'Flying' ? "Angel wings are fully open! Your cute rabbit levitates with high cosmic FX and trails of stardust." :
                    levelUpTransition.newStage === 'Grown' ? "Grown to full maturity! Earned cute visual wings and a glowing leaf-crown of the woodlands." :
                    levelUpTransition.newStage === 'Medium' ? "Medium size reached! Embraces the forest spirits with a gorgeous golden glow and sparkle overlays." :
                    levelUpTransition.newStage === 'Clean Baby' ? "Pristine white baby bunny! Sourced pure waters to remove all dirt, emitting a subtle warm white aura." :
                    "A cute, small baby rabbit. Ready to begin our daily questing journey!"
                  }
                </p>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2 border-t border-green-950/40 text-[8.5px] font-mono text-[#52B788]">
                  <div>• Clothing: {
                    levelUpTransition.newStage === 'Flying' ? "Flying cute bunny" :
                    levelUpTransition.newStage === 'Grown' ? "Full grown rabbit" :
                    levelUpTransition.newStage === 'Medium' ? "Medium rabbit" :
                    levelUpTransition.newStage === 'Clean Baby' ? "Clean baby bunny" :
                    "Small dirty baby bunny"
                  }</div>
                  <div>• Weapons: None</div>
                  <div>• Visual FX: {
                    levelUpTransition.newStage === 'Flying' ? "Cosmic wings open" :
                    levelUpTransition.newStage === 'Grown' ? "Wings + glow aura" :
                    levelUpTransition.newStage === 'Medium' ? "Glow & sparkles" :
                    levelUpTransition.newStage === 'Clean Baby' ? "White glow" :
                    "No effects"
                  }</div>
                  <div>• Stance: Jumping & Cute</div>
                </div>
              </div>

              {/* Accept button */}
              <button
                onClick={() => {
                  setLevelUpTransition(null);
                  triggerConfetti();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-[#52B788] hover:from-yellow-400 hover:to-[#409c73] text-[#081C15] font-sans font-black text-xs rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4 fill-[#081C15] animate-pulse" />
                Claim Level {levelUpTransition.newLevel} Power
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme mode global injection */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes scanner-beam {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scanner-beam {
          animation: scanner-beam 2.2s infinite linear;
        }
        .light-mode #phone-container {
          background-color: #f7f4e9 !important;
          color: #1e2c24 !important;
          border-color: #ebdcb3 !important;
        }
        .light-mode header {
          background-color: #faf7eb !important;
          border-color: #e5dac1 !important;
        }
        .light-mode nav {
          background-color: #faf7eb !important;
          border-color: #ebdccd !important;
        }
        .light-mode .bg-\\[\\#0b291d\\] {
          background-color: #faf7eb !important;
          border-color: #eeddb6 !important;
        }
        .light-mode .text-\\[\\#f5fff6\\] {
          color: #1c3327 !important;
        }
        .light-mode .text-\\[\\#b0cdbe\\] {
          color: #4a5d52 !important;
        }
        .light-mode .text-\\[\\#D8F3DC\\] {
          color: #1b4332 !important;
        }
        .light-mode .border-\\[\\#1B4332\\] {
          border-color: #ebdcb3 !important;
        }
        .light-mode .bg-\\[\\#113c2c\\] {
          background-color: #ede9da !important;
          border-color: #d8c9a3 !important;
        }
      `}</style>
    </div>
  );
}
