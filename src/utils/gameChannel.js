// src/utils/gameChannel.js
//
// Firebase config is fetched automatically from Firebase Hosting.
// No API keys or config values need to be added here.
//
// ── ONE-TIME SETUP (do this once in Firebase Console) ────────────────────────
// 1. Go to https://console.firebase.google.com → project canvas-eye-416011
// 2. Left menu → Build → Realtime Database → Create database
//    → Start in test mode → choose us-central1 → Done
// 3. Realtime Database → Rules tab → replace everything with:
//    {
//      "rules": {
//        "games": {
//          "$gameId": { ".read": true, ".write": true }
//        }
//      }
//    }
//    → click Publish
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps } from 'firebase/app';
import {
  getDatabase, ref, push, onChildAdded, get, query,
  orderByKey, startAfter, runTransaction,
  onDisconnect as fbOnDisconnect, remove, limitToLast,
} from 'firebase/database';

let _db = null;

// Auto-loads Firebase config from Firebase Hosting — no hardcoded values needed
async function getDb() {
  if (_db) return _db;
  if (getApps().length > 0) {
    _db = getDatabase(getApps()[0]);
    return _db;
  }
  const res = await fetch('/__/firebase/init.json');
  if (!res.ok) throw new Error('Firebase config unavailable');
  const config = await res.json();
  // Ensure databaseURL is present (required for Realtime Database)
  if (!config.databaseURL) {
    config.databaseURL = `https://${config.projectId}-default-rtdb.firebaseio.com`;
  }
  _db = getDatabase(initializeApp(config));
  return _db;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}

/**
 * Connect to a multiplayer game room via Firebase Realtime Database.
 * Drop-in replacement for WebSocket. Returns { send(jsonStr), close() }.
 *
 * Messages delivered to onMessage:
 *   { type: 'waiting' }             — you are player 1, waiting for opponent
 *   { type: 'start', playerNumber } — both players ready
 *   { type: 'full' }                — room already has 2 players
 *   { type: 'disconnect' }          — opponent left
 *   { type: 'move', ...payload }    — move relayed to both players
 *   { type: 'reset' }               — new game requested
 */
export async function connectGame(gameId, onMessage) {
  const db = await withTimeout(getDb(), 8000);
  const seatsRef = ref(db, `games/${gameId}/seats`);

  // Atomically claim seat 1 or 2
  let myPlayer = 0;
  await withTimeout(
    runTransaction(seatsRef, (seats) => {
      myPlayer = 0;
      const s = seats || {};
      if (!s[1]) { s[1] = true; myPlayer = 1; return s; }
      if (!s[2]) { s[2] = true; myPlayer = 2; return s; }
      return; // abort — room full
    }),
    8000
  );

  if (!myPlayer) {
    onMessage({ type: 'full' });
    return { send: () => {}, close: () => {} };
  }

  const myMailRef  = ref(db, `games/${gameId}/mail/${myPlayer}`);
  const oppMailRef = ref(db, `games/${gameId}/mail/${3 - myPlayer}`);
  const mySeatRef  = ref(db, `games/${gameId}/seats/${myPlayer}`);

  // Only receive messages pushed after this point
  let startKey = '0';
  const snap = await get(query(myMailRef, orderByKey(), limitToLast(1)));
  snap.forEach((child) => { startKey = child.key; });

  // onDisconnect: release seat + notify opponent
  fbOnDisconnect(mySeatRef).remove();
  const disconnectMsgRef = push(oppMailRef);
  fbOnDisconnect(disconnectMsgRef).set({ type: 'disconnect' });

  // Listen for new incoming messages
  const unsubscribe = onChildAdded(
    query(myMailRef, orderByKey(), startAfter(startKey)),
    (s) => { const msg = s.val(); if (msg) onMessage(msg); },
  );

  // Send initial control message
  if (myPlayer === 1) {
    push(myMailRef, { type: 'waiting' });
  } else {
    push(ref(db, `games/${gameId}/mail/1`), { type: 'start', playerNumber: 1 });
    push(myMailRef,                          { type: 'start', playerNumber: 2 });
  }

  return {
    send(jsonStr) {
      const msg = JSON.parse(jsonStr);
      push(myMailRef,  msg); // echo to self (mirrors server broadcast)
      push(oppMailRef, msg); // relay to opponent
    },
    close() {
      unsubscribe();
      fbOnDisconnect(mySeatRef).cancel();
      fbOnDisconnect(disconnectMsgRef).cancel();
      push(oppMailRef, { type: 'disconnect' });
      remove(mySeatRef);
    },
  };
}
