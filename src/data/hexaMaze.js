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
// the player to walk into and look back from — the first-person rig needs
// that space too (see FirstPersonRig in SceneShell.js).
export const ROOM_BOUNDS = { minX: -5.5, maxX: 5.5, minZ: -6, maxZ: 8 };
export const PLAYER_START = [0, 0, 5];
// The well is a separate landmark near spawn, at the back — solid (you walk
// around it, not through it) but purely decorative, not an exit.
export const WELL_POSITION = [0, 0, ROOM_BOUNDS.maxZ - 1.6];

// ─── Room wall geometry ─────────────────────────────────────────────────────
// Every room shares the same footprint (ROOM_BOUNDS), so door math is done
// once here rather than per room. Walls are named by which side of the box
// they sit on, not by player-facing terms: NEAR is the wall behind spawn
// (where the Well lives), FAR is the wall you first face, LEFT/RIGHT are the
// side walls. Each room's forward-progress exit door is assigned to FAR,
// LEFT, or RIGHT (never NEAR — that wall is reserved for the back door home
// to the previous room) so doors don't all sit dead-ahead like before.
const HALF_W = (ROOM_BOUNDS.maxX - ROOM_BOUNDS.minX + 1.5) / 2;
const HALF_D = (ROOM_BOUNDS.maxZ - ROOM_BOUNDS.minZ + 1.5) / 2;
const WALL_INSET = 0.3; // how far in front of the wall's inner face a door sits

// Rotation (radians, about Y) that makes a FAR-wall-oriented prop/decal face
// into the room when placed on each wall instead. Shared by Door (Props.js)
// and the wall-facing text decals (ScatteredTextField in SceneShell.js) so
// both agree on which way is "into the room" for a given wall.
export const WALL_ROTATION_Y = { FAR: 0, NEAR: Math.PI, LEFT: Math.PI / 2, RIGHT: -Math.PI / 2 };

export function wallDoorPosition(wall, along = 0) {
  switch (wall) {
    case 'NEAR': return [along, 0, HALF_D - WALL_INSET];
    case 'LEFT': return [-HALF_W + WALL_INSET, 0, along];
    case 'RIGHT': return [HALF_W - WALL_INSET, 0, along];
    case 'FAR':
    default: return [along, 0, -HALF_D + WALL_INSET];
  }
}

// Off-center so the back door never overlaps the Well, which sits at x=0
// near the NEAR wall (see WELL_POSITION above).
export const BACK_DOOR_ALONG = -3.5;

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
    // FAR, not a side wall — the shelving in this room (see RoomDecor's
    // 'archive' case in SceneShell.js) runs almost the full length of both
    // the LEFT and RIGHT walls, so a door cut into either would sit inside
    // the bookshelves. FAR is the only wall clear of it.
    exitWall: 'FAR',
    exitDoorAlong: 0,
    loreFragments: [
      "grep -r TODO . -> 40,000 results, 0 fixed",
      '// do not touch, nobody remembers why',
      "last commit message: 'fix'",
      'deprecated since v1, load-bearing since always',
      'the stack trace ends here. it always does.',
      'you are not the first to stand in this hallway',
      "every function here outlived its author's patience",
      'this comment is older than the bug it describes',
    ],
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
    // RIGHT wall, tucked into the far corner (along -6.2) — clear of the
    // trellis wire (spans z -2.1..2.1), the mushroom cluster (z -4.5), and
    // the potted plant (z 3.5) that otherwise crowd this wall.
    exitWall: 'RIGHT',
    exitDoorAlong: -6.2,
    loreFragments: [
      'fired once. consumed never. still warm.',
      'retry count: infinite',
      'idempotent, even in the dark',
      'the queue remembers what you forgot to send',
      'ack pending since before you got here',
      'this event bloomed and nobody was listening',
      'dead letters make the sweetest fertilizer',
      'backpressure is just the garden pushing back',
    ],
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
    // FAR, not a side wall — both LEFT and RIGHT carry a full-depth ceiling
    // support pole (see RoomDecor's 'vault' case in SceneShell.js) right at
    // header height, which would run straight through a side-wall door.
    // Along 4 clears the cabinet racks mounted on the FAR wall itself.
    exitWall: 'FAR',
    exitDoorAlong: 4,
    loreFragments: [
      'token expired the moment it was issued',
      "trust nothing that hasn't been verified twice",
      'the session clock counts down past zero and keeps going',
      'every door here remembers who knocked',
      '471 was never the real answer, just the door',
      'encrypted, but everyone already knows the secret',
      'access denied is just access delayed',
      'the vault trusts you exactly as much as your last token',
    ],
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
    exitWall: 'RIGHT',
    exitDoorAlong: 2,
    loreFragments: [
      'nothing here was ever really temporary',
      'TTL: never. eviction: refused.',
      'muscle memory does not expire, it just goes stale',
      'still resident. still warm. still yours.',
      'the first thing you learned is still running in the background',
      'cold start, warm heart',
      'this cache outlived the reason it was built',
      'old skills, half-finished habits, all still here',
    ],
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
    exitWall: 'FAR',
    exitDoorAlong: 0,
    loreFragments: [
      "you can't fix what you don't measure",
      'every metric that ever mattered, still plotted',
      "a graph is trending in a direction nobody's watching",
      'the dashboard has no edges, only more panels',
      'somewhere an alert fired and paged no one',
      'the anomaly was flagged. the anomaly was ignored.',
      "scale up. scale out. scale until it's someone else's problem.",
      'the trace goes all the way down',
    ],
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
    exitWall: 'LEFT',
    exitDoorAlong: -1,
    loreFragments: [
      'six services, one system',
      'every wall here reflects a redundant node',
      'failover is just hope with a runbook',
      'the real one was never in the mirror',
      'root sees everything and fixes nothing by itself',
      'the last gate only opens for the whole system, not one piece of it',
      'deploy: green. rollback: ready. hands: shaking.',
      'checks passing everywhere at once, finally',
    ],
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
