// ─────────────────────────────────────────────────────────────────────────────
// The Hexa Maze — game structure. Six rooms, each a linear sequence of two
// "chains": one that surfaces the room's Hidden Key, one that surfaces its
// Glowing Orb. A chain is an ordered list of `nodes` (distinct clickable
// props); each node has one or more `stages`. A node only becomes
// interactable once the node before it has finished all its stages. The
// chain's key/orb is granted when its LAST node finishes its LAST stage.
//
// This is pure data — see src/components/HexaMaze for how it's rendered/played,
// and src/data/cv.js for the CV content each room's orb reveals.
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
    id: 'library',
    number: 1,
    title: 'The Dusty Library',
    arabicTitle: 'المكتبة الأثرية الغامضة',
    atmosphere: 'The air is thick with old wood and secrets. Somewhere above, unseen pages turn themselves in a draft that shouldn’t exist.',
    accent: '#b3703c',
    doorLabel: 'the well hidden behind the stacks',
    cvSectionId: 'education',
    keyChain: [
      {
        objectId: 'book', type: 'book', position: [-3, 0, -1],
        stages: [{ prompt: 'Pull the crimson book free', sound: 'pageRustle' }],
      },
    ],
    orbChain: [
      {
        objectId: 'painting', type: 'painting', position: [3, 0, -2],
        stages: [{ prompt: 'Tilt the painting outward', sound: 'wallCreak' }],
      },
    ],
  },

  // ── Room II ─────────────────────────────────────────────────────────────
  {
    id: 'greenhouse',
    number: 2,
    title: 'The Bioluminescent Greenhouse',
    arabicTitle: 'حديقة النباتات الليلية',
    atmosphere: 'Night has fallen inside a room that should have no night. Vines glow faint green; crickets chirr from nowhere in particular.',
    accent: '#4fd67a',
    doorLabel: 'the moss-covered well',
    cvSectionId: 'second-step',
    keyChain: [
      {
        objectId: 'wateringcan', type: 'wateringcan', position: [-4, 0, 2],
        stages: [{ prompt: 'Fill the watering can at the basin', sound: 'waterPour' }],
      },
      {
        objectId: 'flytrap', type: 'flytrap', position: [-2, 0, -3],
        stages: [{ prompt: 'Water the giant flytrap', sound: 'plantOpen' }],
      },
    ],
    orbChain: [
      {
        objectId: 'ladder', type: 'ladder', position: [4, 0, 2],
        stages: [{ prompt: 'Drag the ladder beneath the nest', sound: 'ladderDrag' }],
      },
      {
        objectId: 'nest', type: 'nest', position: [4, 0, -3],
        stages: [{ prompt: 'Climb up and reach into the nest', sound: 'chime' }],
      },
    ],
  },

  // ── Room III ────────────────────────────────────────────────────────────
  {
    id: 'steamlab',
    number: 3,
    title: "The Alchemist's Steam Lab",
    arabicTitle: 'مختبر الكيميائي المجنون',
    atmosphere: 'Copper pipes hiss overhead. Beakers boil unattended, their liquids shifting colour when no one looks directly at them.',
    accent: '#4fc7c2',
    doorLabel: 'the reinforced steel hatch',
    cvSectionId: 'blulogix',
    keyChain: [
      {
        objectId: 'blackboard', type: 'blackboard', position: [-4, 0, -3],
        stages: [{ prompt: 'Read the chalk-scrawled equation', sound: 'chalkTap', revealsCode: '471' }],
      },
      {
        objectId: 'drawer', type: 'drawer', position: [-2, 0, 1],
        stages: [{ prompt: 'Dial the combination lock', sound: 'lockClick', requiresCode: '471' }],
      },
    ],
    orbChain: [
      {
        objectId: 'magnet', type: 'magnet', position: [4, 0, -1],
        stages: [{ prompt: 'Take the heavy-duty magnet', sound: 'metalClank' }],
      },
      {
        objectId: 'beaker', type: 'beaker', position: [2, 0, -4],
        stages: [{ prompt: 'Drag the magnet up the glass', sound: 'glassRise' }],
      },
    ],
  },

  // ── Room IV ─────────────────────────────────────────────────────────────
  {
    id: 'toyroom',
    number: 4,
    title: 'The Vintage Toyroom',
    arabicTitle: 'غرفة الألعاب الكلاسيكية',
    atmosphere: 'Wind-up toys shift and click on shelves with no hand to wind them. A music box melody drifts, stopping mid-phrase, resuming elsewhere.',
    accent: '#e78bb0',
    doorLabel: 'the nursery-scaled door',
    cvSectionId: 'skills',
    keyChain: [
      {
        objectId: 'musicbox', type: 'musicbox', position: [-2, 0, -1],
        stages: [{ prompt: 'Wind the music box', sound: 'musicBox', duration: 3.4 }],
      },
    ],
    orbChain: [
      {
        objectId: 'teddybear', type: 'teddybear', position: [3, 0, 1],
        stages: [{ prompt: 'Unzip the worn teddy bear', sound: 'zipper' }],
      },
    ],
  },

  // ── Room V ──────────────────────────────────────────────────────────────
  {
    id: 'observatory',
    number: 5,
    title: 'The Cosmic Observatory',
    arabicTitle: 'المرصد الفلكي',
    atmosphere: 'The ceiling doesn’t exist — replaced by a slow-wheeling galaxy. Model planets turn on unseen gears, patient and silent.',
    accent: '#8b7bea',
    doorLabel: 'the iris-shutter door',
    cvSectionId: 'digitinary',
    keyChain: [
      {
        objectId: 'starchart', type: 'starchart', position: [-4, 0, 0],
        stages: [{ prompt: 'Study the star chart', sound: 'paperUnfold' }],
      },
      {
        objectId: 'telescope', type: 'telescope', position: [0, 0, -4],
        stages: [{ prompt: 'Align the telescope to the marked constellation', sound: 'mechClick' }],
      },
    ],
    orbChain: [
      {
        objectId: 'crank', type: 'crank', position: [4, 0, 2],
        stages: [{ prompt: 'Fit the crank lever into place', sound: 'metalClank' }],
      },
      {
        objectId: 'orrery', type: 'orrery', position: [3, 0, -4],
        stages: [{ prompt: 'Turn the crank to lower the solar system', sound: 'crankTurn' }],
      },
    ],
  },

  // ── Room VI ─────────────────────────────────────────────────────────────
  {
    id: 'mirrorhall',
    number: 6,
    title: 'The Chamber of Mirrors & Thrones',
    arabicTitle: 'قاعة العرش والمرايا',
    atmosphere: 'Every wall is mirror, floor to ceiling. At the centre, a golden throne catches and multiplies what little light remains.',
    accent: '#d9b23c',
    doorLabel: 'the final exit gate',
    cvSectionId: 'contact',
    keyChain: [
      {
        objectId: 'rugtile', type: 'rugtile', position: [0, 0, -3],
        stages: [
          { prompt: 'Drag the velvet rug aside', sound: 'rugDrag' },
          { prompt: 'Lift the loose marble tile', sound: 'tileLift' },
        ],
      },
    ],
    orbChain: [
      {
        objectId: 'mirror1', type: 'mirror', position: [-4, 0, 3],
        stages: [{ prompt: 'Rotate the first mirror', sound: 'mirrorTurn' }],
      },
      {
        objectId: 'mirror2', type: 'mirror', position: [4, 0, 3],
        stages: [{ prompt: 'Rotate the second mirror', sound: 'mirrorTurn' }],
      },
      {
        objectId: 'mirror3', type: 'mirror', position: [0, 0, 1.5],
        stages: [{ prompt: 'Rotate the third mirror', sound: 'mirrorTurn' }],
      },
      {
        objectId: 'crown', type: 'crown', position: [0.4, 0, -3.3],
        stages: [{ prompt: 'The grid is down — take the orb from the crown', sound: 'laserDown' }],
      },
    ],
  },
];

export const finale = {
  title: 'The Grand Finale',
  intro: 'Six keys. Six orbs. The ancient exit gate waits, banded in six circular indentations arranged in a perfect hexagon.',
  slotting: 'One by one, the orbs settle into their slots — each with a distinct low chime, its light climbing the seams of the gate.',
  blast: 'By the sixth orb, the hexagon is complete. Then all six lights detonate into one blinding white flare.',
  unlock: 'A seventh keyhole stands revealed at the gate’s centre. The last key turns, tumblers falling in sequence through the gate’s iron heart.',
  escape: 'The gate exhales, swinging outward — and beyond it: open air, real light, and freedom.',
};
