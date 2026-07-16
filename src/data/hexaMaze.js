// ─────────────────────────────────────────────────────────────────────────────
// The Core Dump — game structure. Six rooms, each a subsystem of one broken
// system you're repairing from the inside. Each room is a linear sequence of
// two "chains": one that surfaces the room's Access Key, one that surfaces
// its Memory Core. A chain is an ordered list of `nodes` (distinct clickable
// props); each node has one or more `stages`. A node only becomes
// interactable once the node before it has finished all its stages. The
// chain's key/core is granted when its LAST node finishes its LAST stage.
//
// This is pure data — see src/components/HexaMaze for how it's rendered/played,
// and src/data/cv.js for the CV content each room's core reveals.
// ─────────────────────────────────────────────────────────────────────────────

// maxZ has extra depth beyond PLAYER_START so there's an open vestibule behind
// the player to walk into and look back from — the chase camera needs that
// space too, see CameraRig's clamp in SceneShell.js.
export const ROOM_BOUNDS = { minX: -5.5, maxX: 5.5, minZ: -6, maxZ: 8 };
export const PLAYER_START = [0, 0, 5];
// The door (the room's actual exit) is at the front — set flush against the
// far wall you're facing when you spawn, deeper into the room past all the
// props. Mirrors RoomShell's wall placement (±d/2 with 1.5 padding, 0.4
// thick) so the door sits against the wall's inner face instead of floating
// out at ROOM_BOUNDS.minZ, which left a visible gap between door and wall.
const BACK_WALL_Z = -((ROOM_BOUNDS.maxZ - ROOM_BOUNDS.minZ + 1.5) / 2);
export const DOOR_POSITION = [0, 0, BACK_WALL_Z + 0.3];
// The well is a separate landmark near spawn, at the back — solid (you walk
// around it, not through it) but purely decorative, not the exit.
export const WELL_POSITION = [0, 0, ROOM_BOUNDS.maxZ - 1.6];

export const rooms = [
  // ── Room I ──────────────────────────────────────────────────────────────
  {
    id: 'archive',
    number: 1,
    title: 'The Monolith Archive',
    arabicTitle: 'أرشيف النظام الأحادي',
    atmosphere: 'Version history stacks floor to ceiling here — every deprecated function ever written, never deleted, only buried. A cursor blinks somewhere in the dark, waiting on a command no one remembers typing.',
    accent: '#b3703c',
    doorLabel: 'the gate tagged commit zero',
    wellText: 'Every system starts as one giant file — A.A.',
    cvSectionId: 'education',
    keyChain: [
      {
        objectId: 'book', type: 'book', position: [-3, 0, -1],
        stages: [{ prompt: 'Pull the annotated thesis free from the stack', sound: 'pageRustle' }],
      },
    ],
    orbChain: [
      {
        objectId: 'painting', type: 'painting', position: [3, 0, -2],
        stages: [{ prompt: 'Tilt the framed diagram to see the wiring behind it', sound: 'wallCreak' }],
      },
    ],
  },

  // ── Room II ─────────────────────────────────────────────────────────────
  {
    id: 'queue',
    number: 2,
    title: 'The Message Garden',
    arabicTitle: 'حديقة الرسائل',
    atmosphere: 'Events bloom here instead of flowers — each one fired, forgotten, and left to grow wild. Somewhere a queue has backed up so long it has grown roots.',
    accent: '#4fd67a',
    doorLabel: 'the gate behind the retry policy',
    wellText: 'Idempotent, even in the dark — A.A.',
    cvSectionId: 'second-step',
    keyChain: [
      {
        objectId: 'wateringcan', type: 'wateringcan', position: [-4, 0, 2],
        stages: [{ prompt: 'Fill the config injector at the basin', sound: 'waterPour' }],
      },
      {
        objectId: 'flytrap', type: 'flytrap', position: [-2, 0, -3],
        stages: [{ prompt: 'Feed the config to the listener node', sound: 'plantOpen' }],
      },
    ],
    orbChain: [
      {
        objectId: 'ladder', type: 'ladder', position: [4, 0, 2],
        stages: [{ prompt: 'Drag the ladder beneath the dead-letter nest', sound: 'ladderDrag' }],
      },
      {
        objectId: 'nest', type: 'nest', position: [4, 0, -3],
        stages: [{ prompt: 'Climb up and retrieve the stuck message', sound: 'chime' }],
      },
    ],
  },

  // ── Room III ────────────────────────────────────────────────────────────
  {
    id: 'vault',
    number: 3,
    title: 'The Auth Vault',
    arabicTitle: 'خزنة المصادقة',
    atmosphere: 'Every door here checks a token first. The air smells faintly of expired certificates. Somewhere a session clock counts down past zero and keeps going.',
    accent: '#4fc7c2',
    doorLabel: 'the reinforced access gate',
    wellText: 'Trust, but always verify — A.A.',
    cvSectionId: 'blulogix',
    keyChain: [
      {
        objectId: 'blackboard', type: 'blackboard', position: [-4, 0, -3],
        stages: [{ prompt: 'Read the cipher scrawled on the board', sound: 'chalkTap', revealsCode: '471' }],
      },
      {
        objectId: 'drawer', type: 'drawer', position: [-2, 0, 1],
        stages: [{ prompt: 'Dial the recovered token into the vault lock', sound: 'lockClick', requiresCode: '471' }],
      },
    ],
    orbChain: [
      {
        objectId: 'magnet', type: 'magnet', position: [4, 0, -1],
        stages: [{ prompt: 'Take the debug probe', sound: 'metalClank' }],
      },
      {
        objectId: 'beaker', type: 'beaker', position: [2, 0, -4],
        stages: [{ prompt: 'Trace the probe up through the encrypted column', sound: 'glassRise' }],
      },
    ],
  },

  // ── Room IV ─────────────────────────────────────────────────────────────
  {
    id: 'cache',
    number: 4,
    title: 'The Cache Nursery',
    arabicTitle: 'حضانة الذاكرة المؤقتة',
    atmosphere: 'Everything here should have expired by now and didn’t. Old skills, half-finished habits, muscle memory — all still warm, all still resident, refusing eviction.',
    accent: '#e78bb0',
    doorLabel: 'the door with no TTL',
    wellText: 'Nothing here was ever really temporary — A.A.',
    cvSectionId: 'skills',
    keyChain: [
      {
        objectId: 'musicbox', type: 'musicbox', position: [-2, 0, -1],
        stages: [{ prompt: 'Wind the loop until it repeats on its own', sound: 'musicBox', duration: 3.4 }],
      },
    ],
    orbChain: [
      {
        objectId: 'teddybear', type: 'teddybear', position: [3, 0, 1],
        stages: [{ prompt: 'Unzip the old toolkit', sound: 'zipper' }],
      },
    ],
  },

  // ── Room V ──────────────────────────────────────────────────────────────
  {
    id: 'deck',
    number: 5,
    title: 'The Observability Deck',
    arabicTitle: 'منصة المراقبة',
    atmosphere: 'The ceiling here is a dashboard with no edges — every metric that ever mattered, still plotted, still live. Somewhere a graph is trending in a direction nobody’s watching.',
    accent: '#8b7bea',
    doorLabel: 'the iris-shutter gate',
    wellText: 'You can’t fix what you don’t measure — A.A.',
    cvSectionId: 'digitinary',
    keyChain: [
      {
        objectId: 'starchart', type: 'starchart', position: [-4, 0, 0],
        stages: [{ prompt: 'Study the traffic chart', sound: 'paperUnfold' }],
      },
      {
        objectId: 'telescope', type: 'telescope', position: [0, 0, -4],
        stages: [{ prompt: 'Align the trace to the flagged anomaly', sound: 'mechClick' }],
      },
    ],
    orbChain: [
      {
        objectId: 'crank', type: 'crank', position: [4, 0, 2],
        stages: [{ prompt: 'Fit the scaling lever into place', sound: 'metalClank' }],
      },
      {
        objectId: 'orrery', type: 'orrery', position: [3, 0, -4],
        stages: [{ prompt: 'Turn the lever to spin up the cluster', sound: 'crankTurn' }],
      },
    ],
  },

  // ── Room VI ─────────────────────────────────────────────────────────────
  {
    id: 'console',
    number: 6,
    title: 'The Root Console',
    arabicTitle: 'وحدة التحكم الجذرية',
    atmosphere: 'Every wall here reflects a redundant node — the same rack, multiplied for failover, none of them the real one. At the centre, a console throne catches whatever light is left and mirrors it six times over.',
    accent: '#d9b23c',
    doorLabel: 'the final deploy gate',
    wellText: 'Six services, one system — A.A.',
    cvSectionId: 'contact',
    keyChain: [
      {
        objectId: 'rugtile', type: 'rugtile', position: [0, 0, -3],
        stages: [
          { prompt: 'Slide the floor panel aside', sound: 'rugDrag' },
          { prompt: 'Lift the maintenance hatch', sound: 'tileLift' },
        ],
      },
    ],
    orbChain: [
      {
        objectId: 'mirror1', type: 'mirror', position: [-4, 0, 3],
        stages: [{ prompt: 'Bring the first node online', sound: 'mirrorTurn' }],
      },
      {
        objectId: 'mirror2', type: 'mirror', position: [4, 0, 3],
        stages: [{ prompt: 'Bring the second node online', sound: 'mirrorTurn' }],
      },
      {
        objectId: 'mirror3', type: 'mirror', position: [0, 0, 1.5],
        stages: [{ prompt: 'Bring the third node online', sound: 'mirrorTurn' }],
      },
      {
        objectId: 'crown', type: 'crown', position: [0.4, 0, -3.3],
        stages: [{ prompt: 'The failover grid is stable — take the root credential', sound: 'laserDown' }],
      },
    ],
  },
];

export const finale = {
  title: 'The Root Deploy',
  intro: 'Six access keys. Six memory cores. The root console waits, its hex socket banded in six empty slots.',
  slotting: 'One by one, the cores seat into the array — each with a distinct low chime, its light climbing the socket’s seams.',
  blast: 'By the sixth core, the array is complete. All six lights detonate into one blinding white flare — checks passing everywhere at once.',
  unlock: 'A seventh slot stands revealed at the console’s centre. The last access key turns, permissions cascading through the system’s root.',
  escape: 'The gate exhales, swinging outward — and beyond it: open air, a green build, and a system finally, fully deployed.',
};
