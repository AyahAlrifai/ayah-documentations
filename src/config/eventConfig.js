/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              SEASONAL EVENT CONFIGURATION                    ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * ─── HOW TO SWITCH EVENTS ─────────────────────────────────────
 *
 *   1. Uncomment the import for the event you want.
 *   2. Comment out the others.
 *   3. Set  activeEvent: <TheImportedName>
 *
 *   To DISABLE all decorations:  set  activeEvent: null
 *
 * ─── HOW TO ADD A NEW EVENT ───────────────────────────────────
 *
 *   1. Create  src/components/EventDecorations/events/MyEvent.js
 *      (copy any existing event file as a template)
 *   2. Add an import line below.
 *   3. Set  activeEvent: MyEvent
 *
 *   EventDecorations/index.js never needs to change.
 *
 * ──────────────────────────────────────────────────────────────
 */

// ── Uncomment ONE event, comment out the rest ─────────────────
import ActiveEvent from '../components/EventDecorations/events/Ramadan';
// import ActiveEvent from '../components/EventDecorations/events/EidAlFitr';
// import ActiveEvent from '../components/EventDecorations/events/EidAlAdha';
// import ActiveEvent from '../components/EventDecorations/events/NewYear';

const eventConfig = {
  /** ← Swap the variable name here to match your import above, or set null */
  activeEvent: ActiveEvent,
  // activeEvent: null,   // ← uncomment this (and comment the line above) to disable
};

export default eventConfig;
