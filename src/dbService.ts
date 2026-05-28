/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc, updateDoc, collection, getDocs, writeBatch, limit, query, orderBy } from 'firebase/firestore';
import { db, auth, isFirebaseConfigured, handleFirestoreError, OperationType, loadLocalState, saveLocalState } from './firebase';
import { UserState, JournalNote, LeaderboardEntry } from './types';

// Standard fallback values for new users or offline play
export const DEFAULT_USER_STATE = (uid: string, email: string): UserState => ({
  userId: uid,
  email: email,
  username: 'young sprout',
  level: 1,
  xp: 0,
  xpNeeded: 100,
  gems: 20,
  
  strength: 5,
  wisdom: 5,
  spirit: 5,
  
  walkStreak: 0,
  phoneStreak: 0,
  studyStreak: 0,
  
  perfectDaysCount: 0,
  bestStreak: 0,
  
  bunnyStage: 'Baby',
  bunnyXp: 0,
  bunnyXpNeeded: 100,
  selectedTrail: 'None',
  ownedItems: [],
  
  streakShieldCount: 0,
  xpBoostEnd: null,
  doubleXpBoostEnd: null,
  hasAvatarBadge: false,
  
  walkCompletedToday: false,
  phoneCompletedToday: false,
  studyCompletedToday: false,
  
  lastActiveDate: new Date().toISOString().split('T')[0],
  
  bossHp: 500,
  bossMaxHp: 500,
  bossTier: 1,
  
  xpHistory: {}
});

/**
 * Fetch or Initialize user profile
 */
export async function fetchUserProfile(uid: string, email: string): Promise<UserState> {
  if (!isFirebaseConfigured) {
    // Falls back to offline localStorage driver
    return loadLocalState<UserState>(`profile_${uid}`, DEFAULT_USER_STATE(uid, email));
  }

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as UserState;
      // Merge safe defaults in case some fields are missing from legacy runs
      return {
        ...DEFAULT_USER_STATE(uid, email),
        ...data,
      };
    } else {
      // First time login - initialize full state
      const newState = DEFAULT_USER_STATE(uid, email);
      await setDoc(userRef, newState);
      return newState;
    }
  } catch (err) {
    console.warn("Firestore fetch profile failed, using local fallback state", err);
    return loadLocalState<UserState>(`profile_${uid}`, DEFAULT_USER_STATE(uid, email));
  }
}

/**
 * Save user profile state
 */
export async function saveUserProfile(state: UserState): Promise<void> {
  // Always save locally to avoid losing data and allow rapid offline operations
  saveLocalState(`profile_${state.userId}`, state);

  if (!isFirebaseConfigured || !auth.currentUser) return;

  try {
    const userRef = doc(db, 'users', state.userId);
    await setDoc(userRef, state, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${state.userId}`);
  }
}

/**
 * Fetch Leaderboard scores - reads real online records from Firestore,
 * or generates fantasy medieval AI competitors for realistic gameplay.
 */
export async function fetchLeaderboard(bots: LeaderboardEntry[]): Promise<LeaderboardEntry[]> {
  if (!isFirebaseConfigured) {
    return bots;
  }

  try {
    const usersCol = collection(db, 'users');
    const qSnap = await getDocs(query(usersCol, orderBy('xp', 'desc'), limit(15)));
    const onlineEntries: LeaderboardEntry[] = [];
    
    qSnap.forEach(snap => {
      const d = snap.data();
      if (d.username && d.level !== undefined) {
        onlineEntries.push({
          username: d.username,
          level: d.level,
          xp: d.xp || 0,
          tag: d.level >= 25 ? "Master" : d.level >= 12 ? "Champion" : "Sentry",
          email: d.email
        });
      }
    });

    // Merge online users with the bots to create a vibrant listing
    const merged = [...onlineEntries];
    bots.forEach(bot => {
      if (!merged.some(m => m.username === bot.username)) {
        merged.push({
          username: bot.username,
          level: bot.level,
          xp: dndLevelToXP(bot.level, bot.xp),
          isBot: true,
          tag: bot.tag
        });
      }
    });

    return merged.sort((a, b) => b.xp - a.xp).slice(0, 10);
  } catch (err) {
    console.warn("Firestore leaderboard fetching failed, falling back to local list.", err);
    return bots;
  }
}

function dndLevelToXP(level: number, currentXp: number): number {
  return level * 1000 + currentXp;
}

/**
 * Fetch Journal Notes
 */
export async function fetchJournalNotes(userId: string): Promise<JournalNote[]> {
  const localNotesKey = `notes_${userId}`;
  const localNotes = loadLocalState<JournalNote[]>(localNotesKey, []);

  if (!isFirebaseConfigured) {
    return localNotes;
  }

  try {
    const notesCol = collection(db, 'users', userId, 'notes');
    const snap = await getDocs(notesCol);
    const onlineNotes: JournalNote[] = [];
    snap.forEach((doc) => {
      onlineNotes.push(doc.data() as JournalNote);
    });
    
    if (onlineNotes.length > 0) {
      saveLocalState(localNotesKey, onlineNotes);
      return onlineNotes;
    }
    return localNotes;
  } catch (err) {
    console.warn("Firestore notes loading failed, returning local storage.", err);
    return localNotes;
  }
}

/**
 * Save single Journal Note
 */
export async function saveJournalNote(userId: string, note: JournalNote): Promise<void> {
  const localNotesKey = `notes_${userId}`;
  const current = loadLocalState<JournalNote[]>(localNotesKey, []);
  
  if (!current.some(n => n.id === note.id)) {
    const updated = [note, ...current];
    saveLocalState(localNotesKey, updated);
  }

  if (!isFirebaseConfigured) return;

  try {
    const noteRef = doc(db, 'users', userId, 'notes', note.id);
    await setDoc(noteRef, note);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${userId}/notes/${note.id}`);
  }
}

/**
 * Delete single Journal Note
 */
export async function deleteJournalNote(userId: string, noteId: string): Promise<void> {
  const localNotesKey = `notes_${userId}`;
  const current = loadLocalState<JournalNote[]>(localNotesKey, []);
  const filtered = current.filter(n => n.id !== noteId);
  saveLocalState(localNotesKey, filtered);

  if (!isFirebaseConfigured) return;

  try {
    const noteRef = doc(db, 'users', userId, 'notes', noteId);
    await setDoc(noteRef, { deleted: true }, { merge: true }); // standard soft delete or full delete
  } catch (err) {
    console.warn("Notes Firestore delete error", err);
  }
}
