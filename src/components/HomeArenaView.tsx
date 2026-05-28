/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Swords, Heart, Shield, RefreshCw, Zap, Sparkles, Footprints, BookOpen, Camera, Smartphone, AlertTriangle, CheckCircle, Play, Pause, Upload, Activity, Flame, Eye, Check } from 'lucide-react';
import { UserState } from '../types';
import { MOTIVATIONAL_QUOTES } from '../data';
import ProtagonistAvatar from './ProtagonistAvatar';

interface HomeArenaViewProps {
  userState: UserState;
  onUpdateState: (newState: Partial<UserState>) => void;
  addLog: (text: string) => void;
  triggerToast: (msg: string) => void;
  triggerConfetti: () => void;
}

export default function HomeArenaView({
  userState,
  onUpdateState,
  addLog,
  triggerToast,
  triggerConfetti
}: HomeArenaViewProps) {
  // Reset countdown
  const [timeLeft, setTimeLeft] = useState('');
  
  // Simulated Interactive scanning triggers
  const [activeScanner, setActiveScanner] = useState<'reading' | 'eating' | 'walking' | null>(null);
  const [scanStream, setScanStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // AI Feature 1: Reading Scanner (Supports Reading)
  const [readingDemoMode, setReadingDemoMode] = useState(true); // true = 15s speedrun, false = 15m duration
  const [readingTimeLeft, setReadingTimeLeft] = useState(15);
  const [isReadingActive, setIsReadingActive] = useState(false);
  const [readingPages, setReadingPages] = useState(0);
  const [readingLogs, setReadingLogs] = useState<string[]>([]);
  const readingIntervalRef = useRef<any>(null);

  // AI Feature 2: Meal Photo Analyzer (Supports Healthy Eating)
  const [selectedMealPreset, setSelectedMealPreset] = useState<'salad' | 'salmon' | 'acai' | null>('salad');
  const [customMealImage, setCustomMealImage] = useState<string | null>(null);
  const [mealScanStep, setMealScanStep] = useState(0); // 0=idle, 1=scanning, 2=complete
  
  // AI Feature 3: Walking Motion Tracker (Supports Morning Walk/Run)
  const [totalKineticPoints, setTotalKineticPoints] = useState(0); // target 2500
  const [liveForce, setLiveForce] = useState(0.85); // raw acceleration force visualization
  const [isMotionTracking, setIsMotionTracking] = useState(false);
  const [motionSensorActive, setMotionSensorActive] = useState(false);
  const [kineticsHistory, setKineticsHistory] = useState<number[]>(new Array(15).fill(0.85));

  // Quotes cycle
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Care/Training handlers for bunny protagonist
  const handleBypassLevelUp = () => {
    const nextLevel = userState.level + 1;
    const nextXpNeeded = Math.floor(userState.xpNeeded * 1.3);

    onUpdateState({
      level: nextLevel,
      xpNeeded: nextXpNeeded
    });

    triggerConfetti();
    triggerToast(`✨ Advanced to Level ${nextLevel}!`);
    addLog(`🎉 LEVEL UP BYPASS: Automatically ascended to Level ${nextLevel}! (All requirements bypassed)`);
  };

  const handleFeedBunny = () => {
    const currentGems = userState.gems;
    if (currentGems < 1) {
      triggerToast("Requires 1 Gem!");
      return;
    }
    const xpIncrease = 150;
    const newBunnyXp = (userState.bunnyXp || 0) + xpIncrease;
    
    onUpdateState({
      gems: currentGems - 1,
      bunnyXp: newBunnyXp
    });
    
    triggerConfetti();
    triggerToast("✨ Fed with Golden Carrot!");
    addLog(`🥕 Fed the Protagonist a juicy Golden Carrot. Gained +150 bunnyXP. (Used 1 Gem)`);
  };

  const handleTrainBunny = () => {
    const currentGems = userState.gems;
    if (currentGems < 2) {
      triggerToast("Requires 2 Gems!");
      return;
    }
    const xpIncrease = 300;
    const newBunnyXp = (userState.bunnyXp || 0) + xpIncrease;
    
    onUpdateState({
      gems: currentGems - 2,
      bunnyXp: newBunnyXp
    });
    
    triggerConfetti();
    triggerToast("⚔️ Finished Sparring Session!");
    addLog(`⚔️ Trained the Protagonist in the sparing sandbox. Gained +300 bunnyXP. (Used 2 Gems)`);
  };

  const handlePetBunny = () => {
    const xpIncrease = 60;
    const newBunnyXp = (userState.bunnyXp || 0) + xpIncrease;
    
    onUpdateState({
      bunnyXp: newBunnyXp
    });
    
    triggerToast("💗 Sent warm pets to bunny!");
    addLog(`💗 Petted and loved the cute Protagonist companion. Gained +60 bunnyXP.`);
  };

  useEffect(() => {
    // Motivation quote interval
    const qInterval = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 15000);

    // Midnight Countdown logic
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(
        `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
      );
    };

    tick();
    const cInterval = setInterval(tick, 1000);

    return () => {
      clearInterval(qInterval);
      clearInterval(cInterval);
    };
  }, []);

  // Shutdown camera when scanning exits
  useEffect(() => {
    if (!activeScanner && scanStream) {
      scanStream.getTracks().forEach(track => track.stop());
      setScanStream(null);
    }
  }, [activeScanner, scanStream]);

  // Handle Habit Completion & Game Logic
  const handleToggleHabit = (habitId: 'walk' | 'phone' | 'study') => {
    const isCompleted = habitId === 'walk' ? userState.walkCompletedToday :
                        habitId === 'phone' ? userState.phoneCompletedToday :
                        userState.studyCompletedToday;

    if (isCompleted) {
      triggerToast("Quest has already been logged on this sun cycle!");
      return;
    }

    // Determine rewards & streaking based on habit
    let xpGain = 0;
    let gemGain = 0;
    let logMsg = '';
    const updatePayload: Partial<UserState> = {};

    // Apply multiplier if streak is hot
    const streakMult = (userState.walkStreak >= 5 || userState.phoneStreak >= 5 || userState.studyStreak >= 5) ? 2.5 : 1.0;

    if (habitId === 'walk') {
      const newStreak = userState.walkStreak + 1;
      xpGain = Math.round(5 * streakMult);
      updatePayload.walkCompletedToday = true;
      updatePayload.walkStreak = newStreak;
      
      if (newStreak % 3 === 0) {
        gemGain = 1;
        logMsg = `🚶 Walk quest completed! Streak hits ${newStreak}d. Earned +${xpGain} XP & +${gemGain} Gen Gem!`;
      } else {
        logMsg = `🚶 Walk streak increased to ${newStreak}d! Obtained +${xpGain} XP (instant).`;
      }
    } else if (habitId === 'phone') {
      const newStreak = userState.phoneStreak + 1;
      xpGain = Math.round(10 * streakMult);
      updatePayload.phoneCompletedToday = true;
      updatePayload.phoneStreak = newStreak;
      
      if (newStreak % 5 === 0) {
        gemGain = 15;
        logMsg = `📵 Phone-free trial success! Streak hits ${newStreak}d. Earned +${xpGain} XP & +${gemGain} Gems!`;
      } else {
        logMsg = `📵 Digital detox logged! Streak: ${newStreak}d. Gained +${xpGain} XP.`;
      }
    } else if (habitId === 'study') {
      const newStreak = userState.studyStreak + 1;
      xpGain = Math.round(15 * streakMult);
      updatePayload.studyCompletedToday = true;
      updatePayload.studyStreak = newStreak;
      
      if (newStreak % 7 === 0) {
        gemGain = 30;
        logMsg = `📖 Scribing weekly target achieved! Streak reaches ${newStreak}d. Awarded +${xpGain} XP & +${gemGain} Gems!`;
      } else {
        logMsg = `📖 Scroll read! Streak: ${newStreak}d. +${xpGain} XP logged.`;
      }
    }

    // Check level ups & evolution steps
    let newXp = userState.xp + xpGain;
    let currentLevel = userState.level;
    let neededXp = userState.xpNeeded;
    let didLevelUp = false;

    while (newXp >= neededXp) {
      newXp -= neededXp;
      currentLevel += 1;
      neededXp = Math.floor(neededXp * 1.3);
      didLevelUp = true;
    }

    if (didLevelUp) {
      updatePayload.level = currentLevel;
      updatePayload.xpNeeded = neededXp;
      setTimeout(() => {
        triggerConfetti();
        addLog(`🎉 LEVEL UP! You ascended to Level ${currentLevel}! Your mythical beast evolution is quickening.`);
      }, 500);
    }
    updatePayload.xp = newXp;

    // Apply Gems
    if (gemGain > 0) {
      updatePayload.gems = userState.gems + gemGain;
    }

    // Deplete Boss HP
    const attackHarm = xpGain * 10;
    const newBossHp = Math.max(0, userState.bossHp - attackHarm);
    updatePayload.bossHp = newBossHp;

    if (newBossHp === 0) {
      // Victory bonus
      const bossBonus = userState.bossTier * 15;
      updatePayload.gems = (updatePayload.gems || userState.gems) + bossBonus;
      updatePayload.bossHp = userState.bossMaxHp; // resurrects stronger or next level!
      updatePayload.bossTier = Math.min(3, userState.bossTier + 1) as 1 | 2 | 3;
      logMsg += ` ⚔️ BOSS DEFEATED! Collected ${bossBonus} Victory Gems! Tier advanced.`;
    }

    // Perfect day verification check
    const isWalkNow = habitId === 'walk' ? true : userState.walkCompletedToday;
    const isPhoneNow = habitId === 'phone' ? true : userState.phoneCompletedToday;
    const isStudyNow = habitId === 'study' ? true : userState.studyCompletedToday;

    if (isWalkNow && isPhoneNow && isStudyNow) {
      const perfectBonus = 50;
      updatePayload.gems = (updatePayload.gems || userState.gems) + perfectBonus;
      updatePayload.perfectDaysCount = userState.perfectDaysCount + 1;
      logMsg += ` 🌟 PERFECT DAY SECURED! Celestial spirits award +50 bonus Gems!`;
    }

    onUpdateState(updatePayload);
    addLog(logMsg);
    triggerToast(`Gained +${xpGain} XP!`);
  };

  // Setup Camera Stream safely
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setScanStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera check: blocked or absent. Operating in fallback wireframe vision simulations.");
    }
  };

  // Launch AI scanner simulations
  const launchScanner = async (type: 'reading' | 'eating' | 'walking') => {
    setActiveScanner(type);
    
    // Clear old state configurations
    if (type === 'reading') {
      const initTime = readingDemoMode ? 15 : 900;
      setReadingTimeLeft(initTime);
      setIsReadingActive(false);
      setReadingPages(0);
      setReadingLogs([
        "👁️ Reading posture system initiated.",
        "👁️ Calibrating target textbook depth..."
      ]);
      startCamera();
    } else if (type === 'eating') {
      setMealScanStep(0);
      setSelectedMealPreset('salad');
      setCustomMealImage(null);
      startCamera();
    } else if (type === 'walking') {
      setTotalKineticPoints(0);
      setLiveForce(0.85);
      setIsMotionTracking(false);
    }
  };

  // Trigger Reading AI detection state
  const handleToggleReadingTimer = () => {
    if (isReadingActive) {
      // Pause
      setIsReadingActive(false);
      if (readingIntervalRef.current) clearInterval(readingIntervalRef.current);
      setReadingLogs(prev => [...prev, "⏸️ Detection paused by scribe user."]);
    } else {
      // Start
      setIsReadingActive(true);
      setReadingLogs(prev => [...prev, "▶️ AI Tracking Core engaged. Tracking eye movement scan patterns..."]);
      
      readingIntervalRef.current = setInterval(() => {
        setReadingTimeLeft(prev => {
          if (prev <= 1) {
            // Completed!
            clearInterval(readingIntervalRef.current);
            setIsReadingActive(false);
            
            // Succeed study habit!
            handleToggleHabit('study');
            setActiveScanner(null);
            triggerConfetti();
            triggerToast("📖 Scribe quest completed successfully!");
            addLog("📖 Verified 15-minute scribe study: AI vision tracker detected sustained page gaze layout.");
            return 0;
          }
          const next = prev - 1;
          
          // Random aesthetic eye sensory checks
          if (next % 4 === 0) {
            setReadingPages(p => p + 1);
            setReadingLogs(logs => [
              ...logs, 
              `📚 Turn detected! Verified page #${Math.floor(Math.random() * 20 + 3)}.`,
              `✓ Reading posture stable. WPM score: ${Math.floor(Math.random() * 50 + 190)} WPM.`
            ]);
          } else if (next % 6 === 0) {
            setReadingLogs(logs => [
              ...logs,
              "👁️ Gaze patterns tracking: Left-to-right eye focus verified."
            ]);
          }
          return next;
        });
      }, 1000);
    }
  };

  // Meal Photo Scanner progression trigger
  const handleTriggerMealScan = () => {
    setMealScanStep(1); // scanning
    let stepCount = 1;
    
    const interval = setInterval(() => {
      stepCount += 1;
      if (stepCount >= 4) {
        clearInterval(interval);
        setMealScanStep(2); // scanned successfully!
        triggerConfetti();
        triggerToast("Meal identified! Grade A+");
      }
    }, 1200);
  };

  const handleClaimMealRewards = () => {
    const xpBonus = 180;
    const gemsBonus = 5;
    
    onUpdateState({
      gems: userState.gems + gemsBonus,
      bunnyXp: (userState.bunnyXp || 0) + xpBonus
    });
    
    addLog(`🥗 Dietary Alchemy Verified! AI Meal vision detected optimized macro nutrients. Received +5 Gems & +180 companionXP.`);
    triggerToast("Claimed +5 Gems & Companion XP!");
    setActiveScanner(null);
  };

  // Motion Track Step & Accelerometer simulation
  const handleAddKineticPoints = (amt: number) => {
    setTotalKineticPoints(prev => {
      const next = prev + amt;
      const forceSlight = 1.2 + Math.random() * 3.1;
      setLiveForce(Number(forceSlight.toFixed(2)));
      
      // Update historical wave graphs
      setKineticsHistory(hist => [...hist.slice(1), forceSlight]);

      if (next >= 2500) {
        // Automatically complete walking habit!
        setTimeout(() => {
          handleToggleHabit('walk');
          setActiveScanner(null);
          triggerConfetti();
          triggerToast("🚶 Patrol path completed!");
        }, 800);
        return 2500;
      }
      return next;
    });
  };

  const handleRawDeviceMotion = (e: DeviceMotionEvent) => {
    const acc = e.acceleration || e.accelerationIncludingGravity;
    if (acc) {
      const gravity = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      setLiveForce(Number(gravity.toFixed(2)));
      setKineticsHistory(hist => [...hist.slice(1), gravity]);
      
      if (gravity > 3.5) {
        // Add kinetic steps directly when physically shaking/jogging!
        const scoreGain = Math.floor(gravity * 18);
        setTotalKineticPoints(prev => {
          const added = prev + scoreGain;
          if (added >= 2500) {
            // completed!
            window.removeEventListener('devicemotion', handleRawDeviceMotion);
            setTimeout(() => {
              handleToggleHabit('walk');
              setActiveScanner(null);
              triggerConfetti();
              triggerToast("🚶 Walk verified via Kinetic sensors!");
            }, 800);
            return 2500;
          }
          return added;
        });
      }
    }
  };

  // Device orientation / Motion setup hook
  const handleToggleMotionTracking = () => {
    if (isMotionTracking) {
      setIsMotionTracking(false);
      // clean listener
      window.removeEventListener('devicemotion', handleRawDeviceMotion);
      setMotionSensorActive(false);
    } else {
      setIsMotionTracking(true);
      
      // Check for motion permissibility APIs in Safari or browser
      if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission()
          .then((state: string) => {
            if (state === 'granted') {
              window.addEventListener('devicemotion', handleRawDeviceMotion, true);
              setMotionSensorActive(true);
              triggerToast("🔗 Accelerometer G-Sensor locked!");
            }
          })
          .catch(e => {
            console.warn("Motion request permission rejected: " + e.message);
          });
      } else {
        window.addEventListener('devicemotion', handleRawDeviceMotion, true);
        setMotionSensorActive(true);
        triggerToast("🔗 G-Sensor feedback active!");
      }
    }
  };

  // Clear interval safety hook
  useEffect(() => {
    return () => {
      if (readingIntervalRef.current) clearInterval(readingIntervalRef.current);
      window.removeEventListener('devicemotion', handleRawDeviceMotion);
    };
  }, []);

  // Boss Info based on Tier
  const getBossDetails = () => {
    switch (userState.bossTier) {
      case 1:
        return {
          name: "Sloth",
          description: "Laid on an emerald tree playing inside a smartphone. Sluggish, charming, and sleepy.",
          color: "from-blue-900 to-indigo-950",
          svg: (
             <svg viewBox="0 0 100 100" className="w-32 h-32 animate-bounce">
               {/* Body */}
               <circle cx="50" cy="50" r="35" fill="#8d7256" />
               {/* Face Mask */}
               <path d="M 30 45 Q 50 35 70 45 Q 80 65 50 65 Q 20 65 30 45 Z" fill="#eed9c4" />
               {/* Sleeping Eyes */}
               <path d="M 35 48 Q 40 52 45 48" stroke="#1B4332" strokeWidth="2.5" fill="none" />
               <path d="M 55 48 Q 60 52 65 48" stroke="#1B4332" strokeWidth="2.5" fill="none" />
               {/* Cute pink cheeks */}
               <circle cx="28" cy="54" r="4" fill="#ff70a6" opacity="0.6"/>
               <circle cx="72" cy="54" r="4" fill="#ff70a6" opacity="0.6"/>
               {/* Tree Vine */}
               <rect x="10" y="70" width="80" height="8" rx="4" fill="#523a28" />
               <circle cx="35" cy="74" r="3" fill="#52B788" />
               <circle cx="65" cy="74" r="3" fill="#52B788" />
               {/* Tiny Smartphone */}
               <rect x="42" y="58" width="16" height="24" rx="2" fill="#151515" transform="rotate(-15 50 70)" />
               <rect x="44" y="60" width="12" height="20" rx="1" fill="#52B788" transform="rotate(-15 50 70)" opacity="0.8" />
             </svg>
          )
        };
      case 2:
        return {
          name: "Shadow Procrastinator",
          description: "A nebulous phantom wizard hovering with a grand spell block saying 'tomorrow'!",
          color: "from-purple-950 to-neutral-950",
          svg: (
            <svg viewBox="0 0 100 100" className="w-32 h-32 animate-float">
              {/* Cloak Shadow */}
              <path d="M 50 15 L 25 75 C 35 85 65 85 75 75 Z" fill="#2c1a3b" />
              <path d="M 50 25 L 30 70 C 40 78 60 78 70 70 Z" fill="#13091c" />
              {/* Wizard Hat */}
              <path d="M 50 5 L 30 25 L 70 25 Z" fill="#4d2f66" />
              <path d="M 28 25 Q 50 20 72 25 L 74 27 Q 50 22 26 27 Z" fill="#c497e8" />
              {/* Sleeping Eyes glowing red/gold */}
              <circle cx="42" cy="40" r="3" fill="#ff6b6b" />
              <circle cx="58" cy="40" r="3" fill="#ff6b6b" />
              {/* Hands holding scrolling banner */}
              <rect x="25" y="55" width="50" height="15" rx="3" fill="#eed9c4" stroke="#4d2f66" strokeWidth="1" />
              <text x="50" y="66" className="text-[7px] font-sans font-bold" fill="#1B4332" textAnchor="middle">TOMORROW</text>
            </svg>
          )
        };
      case 3:
      default:
        return {
          name: "The Quitter Beast",
          description: "A sad miniature visual creature engulfed in mock dramatic regret who gave up too soon.",
          color: "from-rose-950 to-neutral-950",
          svg: (
            <svg viewBox="0 0 100 100" className="w-32 h-32 animate-pulse">
              {/* Teardrop visual shape body */}
              <path d="M 50 15 Q 85 60 75 80 Q 50 95 25 80 Q 15 60 50 15 Z" fill="#1e2c38" />
              {/* Crown of shame */}
              <path d="M 38 25 L 43 15 L 50 22 L 57 15 L 62 25 Z" fill="#7a8b99" />
              {/* Downcast eyes */}
              <path d="M 36 50 Q 42 46 44 52" stroke="#ff6b6b" strokeWidth="2.5" fill="none" />
              <path d="M 64 50 Q 58 46 56 52" stroke="#ff6b6b" strokeWidth="2.5" fill="none" />
              {/* Teardrops */}
              <circle cx="44" cy="58" r="2.5" fill="#52b788" />
              {/* Sign Board */}
              <rect x="20" y="68" width="60" height="18" rx="2" fill="#fff" stroke="#ff6b6b" strokeWidth="2" />
              <text x="50" y="80" className="text-[10px] font-sans font-bold" fill="#000" textAnchor="middle">I CAN'T</text>
            </svg>
          )
        };
    }
  };

  const boss = getBossDetails();
  const progressPercent = Math.round((userState.bossHp / userState.bossMaxHp) * 100);

  return (
    <div className="space-y-4">
      {/* Motivational Scroll Banner */}
      <div className="p-3 bg-[#113c2c] border border-[#1b4332] rounded-[14px] flex items-center gap-3 shadow-md">
        <Sparkles className="w-5 h-5 text-[#52B788] animate-spin-delayed" />
        <p className="text-[12px] font-medium text-[#D8F3DC] italic leading-tight">
          "{MOTIVATIONAL_QUOTES[quoteIdx]}"
        </p>
      </div>

      {/* Attack Warning Banner (if missed habit yesterday) */}
      {userState.walkStreak === 0 && userState.phoneStreak === 0 && userState.studyStreak === 0 && (
        <div className="p-3 bg-red-950/70 border-2 border-red-800 rounded-[14px] flex items-start gap-3 shadow-md animate-pulse">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
          <div className="text-xs">
            <h4 className="font-cinzel font-bold text-red-200">BOSS AMBUSH TRIGGERED!</h4>
            <p className="text-red-300 font-medium leading-normal">
              You missed habit scrolls yesterday! The level {userState.bossTier} boss triggered a penalty strike. Defeat them back by completing today's quests!
            </p>
          </div>
        </div>
      )}

      {/* Battle Arena View */}
      <div className={`relative rounded-[14px] bg-gradient-to-b ${boss.color} border border-[#1B4332] p-5 shadow-lg overflow-hidden`}>
        {/* Arena decorative background vectors */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full border-4 border-dashed border-[#52B788]"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full border-2 border-[#D8F3DC]"></div>
        </div>

        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-red-800 text-red-100 text-[10px] font-bold uppercase tracking-wider">
                TIER {userState.bossTier} BOSS
              </span>
              <span className="text-[10px] text-[#52B788] font-bold">FEARSOME CUTE 1/5</span>
            </div>
            <h3 className="font-cinzel text-base font-bold tracking-wide text-white">{boss.name}</h3>
            
            {/* HP Indicator */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" />
                  ENERGY HP
                </span>
                <span className="font-mono text-[10px]">{userState.bossHp} / {userState.bossMaxHp}</span>
              </div>
              <div className="h-2 w-full bg-[#081C15] rounded-full overflow-hidden border border-[#1b4332] relative font-mono">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Protagonist Training & Care Panel */}
            <div className="space-y-1 pt-1 border-t border-[#1b4332]/40">
              <span className="text-[8px] font-bold text-[#52B788] tracking-widest uppercase block">Companion Care</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={handleFeedBunny}
                  className="py-1 px-1 bg-green-950/80 hover:bg-green-900 border border-green-800/60 text-white rounded-lg transition active:scale-95 flex flex-col items-center justify-center shrink-0 cursor-pointer text-center font-sans"
                >
                  <span className="text-[10px] font-bold leading-none">Feed</span>
                  <span className="text-[7.5px] text-[#52B788] font-semibold mt-0.5">-1 💎</span>
                </button>
                <button
                  onClick={handleTrainBunny}
                  className="py-1 px-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-800/50 text-[#fdeb6c] rounded-lg transition active:scale-95 flex flex-col items-center justify-center shrink-0 cursor-pointer text-center font-sans"
                >
                  <span className="text-[10px] font-bold leading-none">Train</span>
                  <span className="text-[7.5px] text-amber-500 font-semibold mt-0.5">-2 💎</span>
                </button>
                <button
                  onClick={handlePetBunny}
                  className="py-1 px-1 bg-pink-950/60 hover:bg-pink-900 border border-pink-800/50 text-[#fdaec9] rounded-lg transition active:scale-95 flex flex-col items-center justify-center shrink-0 cursor-pointer text-center font-sans"
                >
                  <span className="text-[10px] font-bold leading-none">Pet</span>
                  <span className="text-[7.5px] text-pink-400 font-semibold mt-0.5">FREE</span>
                </button>
              </div>
            </div>
          </div>

          {/* DUAL COMBATANTS: The Protagonist ABOVE Sloth Boss separator */}
          <div className="shrink-0 w-36 flex flex-col items-center justify-center p-3 rounded-xl bg-black/45 border border-[#1b4332] self-stretch">
            {/* 1. Protagonist */}
            <div className="flex flex-col items-center gap-1 h-20 relative w-full">
              <span className="text-[8px] font-bold text-teal-400 font-mono tracking-wider leading-none">MY BUNNY</span>
              <div className="flex items-center justify-center">
                <ProtagonistAvatar stage={userState.bunnyStage || 'Baby'} selectedTrail={userState.selectedTrail || 'None'} size="md" isJumping={true} />
              </div>
            </div>

            {/* 2. Versus separator ornament */}
            <div className="w-full flex items-center justify-center py-1 gap-1 opacity-70">
              <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-red-500/70" />
              <span className="text-[9px] font-extrabold text-red-500 font-sans tracking-wide">VS</span>
              <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-red-500/70" />
            </div>

            {/* 3. Sloth Boss */}
            <div className="flex flex-col items-center gap-0.5 h-14 relative overflow-hidden w-full">
              <span className="text-[7px] font-bold text-red-400 font-mono tracking-wider leading-none">BOSS</span>
              <div className="scale-[0.55] origin-top flex items-center justify-center -mt-1.5">
                {boss.svg}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quest / Habit Checklist section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h4 className="font-cinzel text-sm font-bold text-[#D8F3DC] flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-[#52B788]" />
            DAILY HABIT QUESTS
          </h4>
          <span className="text-[11px] font-sans font-bold text-[#52B788] flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            Resets: {timeLeft}
          </span>
        </div>

        {/* Walk Habit Card */}
        <div className="p-3.5 bg-[#0b291d] border border-[#1B4332] rounded-[14px] flex justify-between items-center shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-green-950/60 border border-green-800 text-[#52B788] text-[9px] font-bold uppercase">
                Easy
              </span>
              <h5 className="font-cinzel text-xs font-bold text-[#f5fff6]">Afternoon walk 10 mins</h5>
            </div>
            <p className="text-[10px] text-[#b0cdbe] max-w-[260px] leading-tight">
              Stretch your paws in the wildwood. Rewards XP and resets Sloth snooze spells!
            </p>
            <div className="flex items-center gap-2 pt-1 text-[10px] text-[#52B788] font-bold">
              <span>Streak: {userState.walkStreak}d</span>
              <span>•</span>
              <span>Next reward: 3d (+1 Gem)</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {userState.walkCompletedToday ? (
              <div className="p-1 px-3 bg-[#1B4332] border border-[#52B788] text-[#D8F3DC] rounded-xl text-[10px] font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#52B788] fill-[#1B4332]" />
                Completed
              </div>
            ) : (
              <button
                onClick={() => launchScanner('walking')}
                className="p-1.5 px-3 bg-[#52B788] text-[#081C15] font-sans font-bold text-xs rounded-xl active:scale-95 transition-transform flex items-center gap-1"
              >
                <Footprints className="w-3.5 h-3.5" />
                Patrol
              </button>
            )}
          </div>
        </div>

        {/* Phone Habit Card */}
        <div className="p-3.5 bg-[#0b291d] border border-[#1B4332] rounded-[14px] flex justify-between items-center shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-yellow-950/60 border border-yellow-800 text-yellow-400 text-[9px] font-bold uppercase">
                Medium
              </span>
              <h5 className="font-cinzel text-xs font-bold text-[#f5fff6]">{`1 hour no phone`}</h5>
            </div>
            <p className="text-[10px] text-[#b0cdbe] max-w-[260px] leading-tight">
              Banish phone distraction. Resists Procrastinator gold stealing effects.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[10px] text-[#52B788] font-bold">
              <span>Streak: {userState.phoneStreak}d</span>
              <span>•</span>
              <span>Next reward: 5d (+15 Gems)</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {userState.phoneCompletedToday ? (
              <div className="p-1 px-3 bg-[#1B4332] border border-[#52B788] text-[#D8F3DC] rounded-xl text-[10px] font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#52B788] fill-[#1B4332]" />
                Completed
              </div>
            ) : (
              <button
                onClick={() => handleToggleHabit('phone')}
                className="p-1.5 px-3 bg-[#52B788] text-[#081C15] font-sans font-bold text-xs rounded-xl active:scale-95 transition-transform flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mute
              </button>
            )}
          </div>
        </div>

        {/* Study Habit Card */}
        <div className="p-3.5 bg-[#0b291d] border border-[#1B4332] rounded-[14px] flex justify-between items-center shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-400 text-[9px] font-bold uppercase">
                Hard
              </span>
              <h5 className="font-cinzel text-xs font-bold text-[#f5fff6]">1 hour studying</h5>
            </div>
            <p className="text-[10px] text-[#b0cdbe] max-w-[260px] leading-tight">
              Scribe ancient tomes to grow wisdom. Protects against Quitter curses.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[10px] text-[#52B788] font-bold">
              <span>Streak: {userState.studyStreak}d</span>
              <span>•</span>
              <span>Next reward: 7d (+30 Gems)</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {userState.studyCompletedToday ? (
              <div className="p-1 px-3 bg-[#1B4332] border border-[#52B788] text-[#D8F3DC] rounded-xl text-[10px] font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#52B788] fill-[#1B4332]" />
                Completed
              </div>
            ) : (
              <button
                onClick={() => launchScanner('reading')}
                className="p-1.5 px-3 bg-[#52B788] text-[#081C15] font-sans font-bold text-xs rounded-xl active:scale-95 transition-transform flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Scribe
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Extra Action: Diet Verification camera link */}
      <button
        onClick={() => launchScanner('eating')}
        className="w-full p-3 bg-[#113c2c] border border-dashed border-[#52B788] rounded-[14px] hover:bg-[#1b4332] transition-colors flex items-center justify-center gap-2 shadow-sm text-[#D8F3DC] text-xs font-bold leading-none py-3.5 active:scale-95 cursor-pointer"
      >
        <Camera className="w-4 h-4 text-[#52B788]" />
        ORB SCAN: VERIFY HEALTHY INTAKE (+2 Gems)
      </button>

      {/* Level Up Bypass Action */}
      <button
        onClick={handleBypassLevelUp}
        className="w-full p-3 bg-gradient-to-r from-teal-600/80 to-[#113c2c] hover:from-teal-500/90 hover:to-[#1b4332] border border-[#52B788]/60 rounded-[14px] transition-all flex items-center justify-center gap-2 shadow-md text-white text-xs font-bold leading-none py-3.5 active:scale-95 cursor-pointer"
      >
        <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
        LEVEL UP: BYPASS REQUIREMENTS (Lvl {userState.level} → {userState.level + 1})
      </button>

      {/* High Fidelity Scanner Overlays */}
      {activeScanner && (
        <div className="fixed inset-0 bg-[#051510]/95 z-[100] flex flex-col justify-center items-center p-4 overflow-y-auto">
          <div className="w-full max-w-[485px] bg-[#0c291e] border-2 border-[#52B788] rounded-2xl p-5 shadow-2xl relative text-center space-y-4 my-auto">
            
            {/* Header with holographic scanner icon */}
            <div className="flex items-center justify-between border-b border-[#1b4332] pb-3">
              <div className="flex items-center gap-2 text-left">
                <span className="p-1.5 rounded bg-[#113c2c] border border-[#52B788]">
                  <Activity className="w-4 h-4 text-[#52B788] animate-pulse" />
                </span>
                <div>
                  <h4 className="font-cinzel text-xs font-bold text-[#f5fff6] tracking-wider uppercase">
                    {activeScanner === 'reading' && "AI Study Vision Tracker"}
                    {activeScanner === 'eating' && "Druid's Alchemy Plate Vision"}
                    {activeScanner === 'walking' && "Vapor G-Force Kinetic Tracker"}
                  </h4>
                  <span className="text-[10px] text-[#52B788] font-semibold tracking-widest block uppercase">
                    {activeScanner === 'reading' && "Computer Vision • Reading Detector"}
                    {activeScanner === 'eating' && "Computer Vision • Nutrient Classifier"}
                    {activeScanner === 'walking' && "Motion Sensing • Step Estimator"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveScanner(null);
                  if (scanStream) {
                    scanStream.getTracks().forEach(t => t.stop());
                    setScanStream(null);
                  }
                  setIsReadingActive(false);
                  if (readingIntervalRef.current) clearInterval(readingIntervalRef.current);
                }}
                className="p-1 text-[#52B788] hover:text-red-400 bg-black/40 hover:bg-black/60 rounded-full transition cursor-pointer font-bold shrink-0 text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* AI FEATURE 1: READING SCANNER */}
            {activeScanner === 'reading' && (
              <div className="space-y-4">
                {/* Mode Select Tabs */}
                {!isReadingActive && (
                  <div className="bg-black/30 p-1 rounded-xl border border-[#1b4332] grid grid-cols-2 gap-1">
                    <button
                      onClick={() => {
                        setReadingDemoMode(true);
                        setReadingTimeLeft(15);
                      }}
                      className={`py-1.5 text-[11px] font-sans font-bold rounded-lg transition-all ${
                        readingDemoMode
                          ? 'bg-[#52B788] text-[#081C15]'
                          : 'text-[#b0cdbe] hover:bg-green-950/40'
                      }`}
                    >
                      🚀 Speedrun (15s Demo)
                    </button>
                    <button
                      onClick={() => {
                        setReadingDemoMode(false);
                        setReadingTimeLeft(900);
                      }}
                      className={`py-1.5 text-[11px] font-sans font-bold rounded-lg transition-all ${
                        !readingDemoMode
                          ? 'bg-[#52B788] text-[#081C15]'
                          : 'text-[#b0cdbe] hover:bg-green-950/40'
                      }`}
                    >
                      ⌛ Focused (15 Mins)
                    </button>
                  </div>
                )}

                {/* Main Video/Tracker Viewport */}
                <div className="w-full h-48 bg-black/65 rounded-[14px] relative overflow-hidden border border-[#2d6a4f] flex flex-col items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-75" />
                  
                  {/* Holographic matrix grids */}
                  <div className="absolute inset-0 border border-emerald-500/10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full opacity-15" style={{
                      backgroundImage: "radial-gradient(circle, #52b788 1.1px, transparent 1.1px)",
                      backgroundSize: "20px 20px"
                    }} />
                  </div>

                  {/* AI Facial & Gaze Tracking Overlay Target */}
                  <div className={`absolute w-32 h-32 rounded-full border border-[#52B788]/50 flex items-center justify-center p-3 transition-transform duration-300 ${
                    isReadingActive ? 'scale-105 border-dashed border-[#52B788]' : 'scale-100 opacity-60'
                  }`}>
                    <div className={`w-full h-full rounded-full border border-dashed border-cyan-400/40 flex items-center justify-center transition-spin ${isReadingActive ? 'animate-spin-delayed' : ''}`}>
                      <Eye className={`w-10 h-10 ${isReadingActive ? 'text-[#52B788] animate-pulse' : 'text-slate-400'}`} />
                    </div>
                  </div>

                  {/* Laser Beam scan sweep */}
                  {isReadingActive && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-scanner-beam" />
                  )}

                  {/* Live Telemetry coordinates */}
                  <div className="absolute top-2 left-2 flex flex-col items-start gap-0.5 font-mono text-[8px] text-teal-400 font-bold bg-black/50 p-1 rounded">
                    <span>EYE VECTORS: [OK]</span>
                    <span>DISTANCE: 34cm</span>
                    <span>POSTURE SCORE: 98%</span>
                  </div>

                  <div className="absolute bottom-2 right-2 font-mono text-[8px] text-red-400 font-bold bg-black/50 p-1 rouneded animate-pulse flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${isReadingActive ? 'bg-red-500' : 'bg-[#52B788]'}`} />
                    <span>{isReadingActive ? "CORE_TRACKING_LIVE" : "STANDBY"}</span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-between items-center px-1">
                  <div className="text-left">
                    <span className="text-[10px] text-[#b0cdbe] block">AI Posture Sentry Verification:</span>
                    <span className="text-sm font-mono font-bold text-[#f5fff6]">
                      {Math.floor(readingTimeLeft / 60)}m {readingTimeLeft % 60}s remaining
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#b0cdbe] block">Gaze Page Turns:</span>
                    <span className="text-sm font-mono font-bold text-[#52B788] flex items-center gap-1 justify-end">
                      📖 {readingPages} Pages
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full bg-[#081C15] rounded-full overflow-hidden border border-[#1b4332]">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-[#52B788] transition-all duration-1000"
                    style={{
                      width: `${((readingDemoMode ? 15 : 900) - readingTimeLeft) / (readingDemoMode ? 15 : 900) * 100}%`
                    }}
                  />
                </div>

                {/* Gaze Logging Feed Terminal */}
                <div className="bg-black/45 rounded-xl border border-green-950 p-2.5 h-24 overflow-y-auto text-left space-y-1 font-mono text-[9px] text-[#b0cdbe]">
                  <span className="text-[8px] font-bold text-teal-400 block tracking-wider uppercase border-b border-green-950/50 pb-0.5">
                    📺 live gaze telemetry stream
                  </span>
                  {[...readingLogs].reverse().map((log, idx) => (
                    <div key={idx} className="leading-tight truncate">
                      <span className="text-[#52B788] font-bold">{`>`}</span> {log}
                    </div>
                  ))}
                </div>

                {/* Scribe Session Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleReadingTimer}
                    className={`flex-1 py-3 px-4 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer shadow-md ${
                      isReadingActive
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-[#52B788] hover:bg-[#409c73] text-[#081C15]'
                    }`}
                  >
                    {isReadingActive ? (
                      <>
                        <Pause className="w-4 h-4 fill-white" />
                        Pause Detection Spell
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-[#081C15]" />
                        Engage Eye Gaze AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* AI FEATURE 2: MEAL PHOTO ANALYZER */}
            {activeScanner === 'eating' && (
              <div className="space-y-4">
                {/* State 0: Setup Selection / Upload */}
                {mealScanStep === 0 && (
                  <div className="space-y-4">
                    <p className="text-[11px] text-[#b0cdbe] text-left leading-relaxed">
                      To verify the healthy eating requirement, upload a camera snapshot of your dietary plate, or simulate with a premium organic crop preset below! Our camera computer vision identifies nutritional molecular properties instantly.
                    </p>

                    {/* Standard image input uploader */}
                    <div className="border-2 border-dashed border-[#52B788]/60 rounded-xl p-4 bg-black/20 text-center hover:bg-black/30 transition relative cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const url = URL.createObjectURL(e.target.files[0]);
                            setCustomMealImage(url);
                            setSelectedMealPreset(null);
                            triggerToast("Custom photo uploaded successfully!");
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                      />
                      <Upload className="w-8 h-8 text-[#52B788] mx-auto mb-1 animate-pulse" />
                      <span className="text-[11px] font-bold text-[#f5fff6] block">
                        Snap or Upload meal photograph
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                        {customMealImage ? "✓ Click again to replace photos" : "Supports JPEG, PNG, WEBP"}
                      </span>
                    </div>

                    {/* Presets Title */}
                    <div className="text-left border-t border-[#1b4332]/40 pt-3">
                      <span className="text-[10px] font-bold text-[#52B788] uppercase tracking-wider">
                        Or Pick Mythic Superfood Presets to Verify:
                      </span>
                    </div>

                    {/* Food Presets Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setSelectedMealPreset('salad');
                          setCustomMealImage(null);
                        }}
                        className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer ${
                          selectedMealPreset === 'salad'
                            ? 'bg-green-950/80 border-[#52B788] text-white'
                            : 'bg-black/20 border-[#1b4332] text-slate-400 hover:border-green-800'
                        }`}
                      >
                        <span className="text-xl">🥗</span>
                        <span className="text-[9px] font-bold block leading-tight">Druid Salad</span>
                        <span className="text-[7.5px] text-[#52B788] font-mono leading-none">290 kcal</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedMealPreset('salmon');
                          setCustomMealImage(null);
                        }}
                        className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer ${
                          selectedMealPreset === 'salmon'
                            ? 'bg-green-950/80 border-cyan-500 text-white'
                            : 'bg-black/20 border-[#1b4332] text-slate-400 hover:border-cyan-900'
                        }`}
                      >
                        <span className="text-xl">🍣</span>
                        <span className="text-[9px] font-bold block leading-tight">Elven Salmon</span>
                        <span className="text-[7.5px] text-cyan-400 font-mono leading-none">410 kcal</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedMealPreset('acai');
                          setCustomMealImage(null);
                        }}
                        className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer ${
                          selectedMealPreset === 'acai'
                            ? 'bg-green-950/80 border-pink-500 text-white'
                            : 'bg-black/20 border-[#1b4332] text-slate-400 hover:border-pink-900'
                        }`}
                      >
                        <span className="text-xl">🍓</span>
                        <span className="text-[9px] font-bold block leading-tight">Fairy Acai</span>
                        <span className="text-[7.5px] text-pink-400 font-mono leading-none">230 kcal</span>
                      </button>
                    </div>

                    {/* Action button to execute scanner */}
                    <button
                      onClick={handleTriggerMealScan}
                      className="w-full py-3 bg-[#52B788] text-[#081C15] font-sans font-extrabold text-xs rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-md mt-4"
                    >
                      <Camera className="w-4 h-4" />
                      ACTIVATE MOLECULAR NUTRIENT VISION
                    </button>
                  </div>
                )}

                {/* State 1: Scanning Mode */}
                {mealScanStep === 1 && (
                  <div className="space-y-4 py-6">
                    <div className="relative w-40 h-40 mx-auto rounded-full border-4 border-dashed border-[#52B788] flex flex-col items-center justify-center bg-black/40 animate-spin-delayed">
                      <span className="text-3xl animate-bounce">
                        {selectedMealPreset === 'salad' ? "🥗" : selectedMealPreset === 'salmon' ? "🍣" : "🍓"}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-[12px] font-bold text-white uppercase tracking-widest animate-pulse">
                        Analyzing dietary elements...
                      </h5>
                      <p className="text-[10px] text-[#b0cdbe] font-mono mt-1">
                        Spectral Vision Matrix: isolating leafy textures, amino bonds, trans-fats...
                      </p>
                    </div>
                  </div>
                )}

                {/* State 2: Scan Complete Overlays */}
                {mealScanStep === 2 && (
                  <div className="space-y-4">
                    {/* Image plate with absolute bounding boxes */}
                    <div className="w-full h-44 bg-[#081C15] rounded-xl relative overflow-hidden border border-[#52B788] flex items-center justify-center">
                      {customMealImage ? (
                        <img src={customMealImage} alt="User plate" className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <div className="w-full h-full bg-[#113c2c]/30 flex flex-col items-center justify-center relative p-4">
                          <span className="text-6xl animate-pulse">
                            {selectedMealPreset === 'salad' && "🥗"}
                            {selectedMealPreset === 'salmon' && "🍣"}
                            {selectedMealPreset === 'acai' && "🍓"}
                          </span>
                        </div>
                      )}

                      {/* Computer Vision Dotted Bounding Boxes Overlaid */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Box 1 (Veggies / Greens) */}
                        <div className="absolute top-8 left-10 w-28 h-14 border border-green-500 border-dashed rounded bg-green-500/10 p-1 flex flex-col justify-start">
                          <span className="text-[6.5px] font-mono font-bold text-green-400 bg-black/75 rounded px-0.5 w-max">
                            ✓ SPINACH ROOT: HIGH MINERALS (99.1%)
                          </span>
                        </div>
                        {/* Box 2 (Protein) */}
                        <div className="absolute bottom-6 right-8 w-32 h-16 border border-cyan-500 border-dashed rounded bg-cyan-500/10 p-1 flex flex-col justify-end">
                          <span className="text-[6.5px] font-mono font-bold text-cyan-400 bg-black/75 rounded px-0.5 w-max">
                            ✓ ORGANIC FLAVONOIDS: COMPLIANT (95.3%)
                          </span>
                        </div>
                        {/* General Frame indicator */}
                        <div className="absolute inset-5 border border-dashed border-yellow-500/30 rounded" />
                      </div>

                      {/* Flash glow sweep */}
                      <div className="absolute inset-0 bg-green-500/10 pointer-events-none animate-pulse" />
                    </div>

                    {/* Nutrition Report Scorecard */}
                    <div className="bg-black/35 rounded-xl border border-green-950 p-3 space-y-2 text-left">
                      <div className="flex justify-between items-center border-b border-green-950/40 pb-1.5">
                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest leading-none">
                          Molecular report card:
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-[8.5px] font-sans font-bold text-[#fdeb6c] uppercase">
                          S-Tier Druid Match
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center pt-1">
                        <div>
                          <span className="text-[8px] text-[#b0cdbe] block uppercase font-bold">Est. Weight</span>
                          <span className="text-xs font-mono font-bold text-[#f5fff6]">
                            {selectedMealPreset === 'salad' ? "380g" : selectedMealPreset === 'salmon' ? "420g" : "310g"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-[#b0cdbe] block uppercase font-bold">Protein Multi</span>
                          <span className="text-xs font-mono font-bold text-[#52B788]">
                            {selectedMealPreset === 'salad' ? "8.4g" : selectedMealPreset === 'salmon' ? "24.1g" : "12.2g"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-[#b0cdbe] block uppercase font-bold">Greens Ratio</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {selectedMealPreset === 'salad' ? "98%" : selectedMealPreset === 'salmon' ? "85%" : "96%"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-green-950/40 text-[9.5px] text-[#b0cdbe] leading-tight font-sans">
                        Ingredients verified: <strong className="text-white">Fresh spinach leaves, healthy fatty elements, raw nuts, anti-oxidants, zero artificial sucrose overlays</strong>. Verified safe nutrient profile.
                      </div>
                    </div>

                    {/* Claim payouts */}
                    <button
                      onClick={handleClaimMealRewards}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-[#52B788] text-[#081C15] font-sans font-black text-xs rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1 shadow-md"
                    >
                      <Sparkles className="w-4 h-4 fill-[#081C15]" />
                      CLAIM ALCHEMY REWARD (+5 Gems & +180 Companion XP)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AI FEATURE 3: WALKING MOTION TRACKER */}
            {activeScanner === 'walking' && (
              <div className="space-y-4">
                <p className="text-[11px] text-[#b0cdbe] text-left leading-relaxed">
                  Start your morning trek! Activate tracking sensors and walk with your phone in hand. It analyzes G-force kinetic acceleration intervals. desktop test: click buttons below to generate kinetic footsteps!
                </p>

                {/* Accelerometer Status Link */}
                <div className="bg-black/30 rounded-xl p-2.5 border border-green-950 flex items-center justify-between text-left">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-bold text-[#52B788] tracking-widest uppercase block leading-none">
                      Phone Accelerometer Link
                    </span>
                    <span className="text-[10px] text-[#f5fff6] font-extrabold block">
                      {motionSensorActive ? "🔗 Hardware Sensors Actively Feeding" : "⚠️ Sensors Offline (Tap or click fallback)"}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleMotionTracking}
                    className={`py-1 px-2 text-[8px] font-black uppercase rounded border transition cursor-pointer ${
                      motionSensorActive
                        ? 'bg-red-950 text-red-400 border-red-900 hover:bg-red-900'
                        : 'bg-green-950 text-[#52B788] border-green-800 hover:bg-green-900'
                    }`}
                  >
                    {motionSensorActive ? "Disable Link" : "Activate Link"}
                  </button>
                </div>

                {/* Live Real-time Waveform Canvas/Aesthetic */}
                <div className="w-full h-24 bg-black/70 rounded-xl border border-green-950 relative overflow-hidden flex flex-col justify-end p-2 px-3">
                  {/* Dynamic accelerometer plot wave grid lines */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-25">
                    {kineticsHistory.map((val, idx) => {
                      const waveH = Math.min(65, Math.max(10, val * 12));
                      return (
                        <div
                          key={idx}
                          className={`w-4 bg-gradient-to-t rounded transition-all duration-300 ${
                            val > 3.0 ? 'from-[#fdeb6c] to-amber-500' : 'from-[#52B788] to-teal-400'
                          }`}
                          style={{ height: `${waveH}px` }}
                        />
                      );
                    })}
                  </div>

                  <div className="relative flex justify-between items-center text-left font-mono text-[9px] text-teal-400 mt-auto z-10 font-bold">
                    <span>LIVE FORCE METERS: {liveForce} Gs</span>
                    <span className={`${liveForce > 3.0 ? 'text-[#fdeb6c] animate-bounce' : 'text-slate-500'}`}>
                      {liveForce > 3.0 ? "⚡ EXERTION VERIFIED!" : "STANDBY MINIMAL KINETICS"}
                    </span>
                  </div>
                </div>

                {/* Goal progress */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-[#b0cdbe]">PATROL WAYPOINTS TRACED</span>
                    <span className="text-white font-mono">{totalKineticPoints} / 2500 kinetic steps</span>
                  </div>
                  <div className="h-3.5 w-full bg-[#081C15] rounded-full overflow-hidden border border-[#1b4332] relative font-mono">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-[#52B788] transition-all duration-300 text-[8px] flex items-center justify-end pr-2 text-black font-extrabold leading-tight shadow-inner"
                      style={{ width: `${Math.min(100, (totalKineticPoints / 2500) * 100)}%` }}
                    >
                      {Math.round((totalKineticPoints / 2500) * 100)}% COMPLETE
                    </div>
                  </div>
                </div>

                {/* Desktop Fallback Controllers grid */}
                <div className="space-y-1 border-t border-green-950 pt-3">
                  <span className="text-[8px] font-extrabold text-[#52B788] tracking-widest uppercase block text-left">
                    Simulator Step Injectors (Admin/Desktop Devs)
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleAddKineticPoints(200)}
                      className="py-2 bg-green-950/70 border border-green-800 text-[#52B788] text-[9.5px] font-bold rounded-lg cursor-pointer hover:bg-[#113c2c] active:scale-95 transition-all text-center"
                    >
                      🚶 Walk (+200)
                    </button>
                    <button
                      onClick={() => handleAddKineticPoints(450)}
                      className="py-2 bg-teal-950/70 border border-teal-800 text-teal-300 text-[9.5px] font-bold rounded-lg cursor-pointer hover:bg-teal-900 active:scale-95 transition-all text-center"
                    >
                      🏃 Jog (+450)
                    </button>
                    <button
                      onClick={() => handleAddKineticPoints(750)}
                      className="py-2 bg-amber-950/60 border border-amber-850 text-[#fdeb6c] text-[9.5px] font-bold rounded-lg cursor-pointer hover:bg-amber-900 active:scale-95 transition-all text-center animate-pulse"
                    >
                      ⚡ Sprint (+750)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* General Abort button */}
            <div className="pt-2 border-t border-green-950 text-center">
              <button
                onClick={() => {
                  setActiveScanner(null);
                  if (scanStream) {
                    scanStream.getTracks().forEach(t => t.stop());
                    setScanStream(null);
                  }
                  setIsReadingActive(false);
                  if (readingIntervalRef.current) clearInterval(readingIntervalRef.current);
                }}
                className="text-[10px] font-extrabold text-red-400 hover:text-red-300 hover:underline cursor-pointer tracking-widest uppercase"
              >
                Abort Spell Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
