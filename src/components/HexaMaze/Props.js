import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));

// ── Room I ───────────────────────────────────────────────────────────────────

function BookRenderer({ done }) {
  const bookRef = useRef();
  useFrame(() => {
    if (bookRef.current) bookRef.current.rotation.z = lerp(0, -0.9, done ? 1 : 0);
  });
  return (
    <group>
      <mesh position={[0, 1.1, -0.3]}>
        <boxGeometry args={[1.4, 2.2, 0.5]} />
        <meshStandardMaterial color="#4a3320" roughness={0.9} />
      </mesh>
      {[0.5, 1.1, 1.7].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]}>
          <boxGeometry args={[0.9, 0.22, 0.3]} />
          <meshStandardMaterial color="#5a4530" roughness={0.85} />
        </mesh>
      ))}
      <group ref={bookRef} position={[0.1, 0.5, 0.22]}>
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.8, 0.24, 0.16]} />
          <meshStandardMaterial color={done ? '#3a0a0a' : '#7a1620'} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function PaintingRenderer({ done }) {
  const frameRef = useRef();
  useFrame(() => {
    if (frameRef.current) frameRef.current.rotation.x = lerp(0, 0.5, done ? 1 : 0);
  });
  return (
    <group ref={frameRef} position={[0, 1.6, -0.05]}>
      <mesh>
        <boxGeometry args={[1.1, 1.4, 0.1]} />
        <meshStandardMaterial color="#3a2a14" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[0.9, 1.2]} />
        <meshStandardMaterial color="#20180f" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ── Room II ──────────────────────────────────────────────────────────────────

function WateringcanRenderer({ done }) {
  const tipRef = useRef();
  useFrame(() => {
    if (tipRef.current) tipRef.current.rotation.z = lerp(0, -0.7, done ? 1 : 0);
  });
  return (
    <group ref={tipRef} position={[0, 0.4, 0]}>
      <mesh>
        <cylinderGeometry args={[0.28, 0.32, 0.5, 10]} />
        <meshStandardMaterial color="#5a6a4a" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0.35, 0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
        <meshStandardMaterial color="#5a6a4a" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}

function FlytrapRenderer({ done }) {
  const jawA = useRef(); const jawB = useRef();
  useFrame(() => {
    const open = done ? 1 : 0;
    if (jawA.current) jawA.current.rotation.x = lerp(0, -0.9, open);
    if (jawB.current) jawB.current.rotation.x = lerp(0, 0.9, open);
  });
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 1, 8]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.8} />
      </mesh>
      <group position={[0, 1.05, 0]}>
        <mesh ref={jawA} position={[0, 0.15, 0]}>
          <boxGeometry args={[0.7, 0.3, 0.6]} />
          <meshStandardMaterial color="#3a7a3a" roughness={0.7} />
        </mesh>
        <mesh ref={jawB} position={[0, 0.15, 0]}>
          <boxGeometry args={[0.68, 0.28, 0.58]} />
          <meshStandardMaterial color="#4fd67a" emissive="#1e6b3a" emissiveIntensity={done ? 0.6 : 0.2} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function LadderRenderer({ done }) {
  const g = useRef();
  useFrame(() => { if (g.current) g.current.rotation.z = lerp(0, -0.12, done ? 1 : 0); });
  return (
    <group ref={g}>
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 1.2, 0]}>
          <boxGeometry args={[0.08, 2.4, 0.08]} />
          <meshStandardMaterial color="#6b4a2a" roughness={0.8} />
        </mesh>
      ))}
      {[0.4, 0.9, 1.4, 1.9].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.68, 0.06, 0.06]} />
          <meshStandardMaterial color="#6b4a2a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function NestRenderer({ done }) {
  return (
    <group position={[0, 2.6, 0]}>
      <mesh>
        <torusGeometry args={[0.4, 0.15, 8, 16]} />
        <meshStandardMaterial color="#5a4022" roughness={0.9} />
      </mesh>
      {!done && (
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color="#4fd67a" emissive="#4fd67a" emissiveIntensity={1.4} />
        </mesh>
      )}
    </group>
  );
}

// ── Room III ─────────────────────────────────────────────────────────────────

// Chalks the node's revealed code onto a canvas texture so the player reads
// the actual combination on the board — not just an abstract "solved" mark —
// before dialling it into the drawer lock.
function useChalkTexture(text) {
  return useMemo(() => {
    if (typeof document === 'undefined' || !text) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 176;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1c2a22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e8e4d8';
    ctx.font = 'bold 92px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 8);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [text]);
}

function BlackboardRenderer({ node, done }) {
  const code = node.stages.map(s => s.revealsCode).find(Boolean);
  const texture = useChalkTexture(code);
  return (
    <group position={[0, 1.6, -0.1]}>
      <mesh>
        <boxGeometry args={[1.6, 1.1, 0.08]} />
        <meshStandardMaterial color="#1c2a22" roughness={0.95} />
      </mesh>
      {done && texture && (
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[1.3, 0.75]} />
          <meshStandardMaterial map={texture} roughness={0.95} />
        </mesh>
      )}
    </group>
  );
}

function DrawerRenderer({ done }) {
  const front = useRef();
  useFrame(() => { if (front.current) front.current.position.z = lerp(0.35, 0.75, done ? 1 : 0); });
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 1, 0.7]} />
        <meshStandardMaterial color="#3a2c1c" roughness={0.85} />
      </mesh>
      <mesh ref={front} position={[0, 0.5, 0.35]}>
        <boxGeometry args={[1, 0.4, 0.1]} />
        <meshStandardMaterial color="#4a3a24" roughness={0.8} />
      </mesh>
    </group>
  );
}

function MagnetRenderer({ done }) {
  const g = useRef();
  useFrame(() => { if (g.current) g.current.rotation.z = lerp(0, 0.6, done ? 1 : 0); });
  return (
    <group ref={g} position={[0, 0.9, 0]}>
      <mesh rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.28, 0.09, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#b23a2a" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-0.28, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.28, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function BeakerRenderer({ done }) {
  const orb = useRef();
  useFrame(() => { if (orb.current) orb.current.position.y = lerp(0.25, 1.4, done ? 1 : 0); });
  return (
    <group>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.55, 0.5, 1.8, 16, 1, true]} />
        <meshStandardMaterial color="#bcd6d4" transparent opacity={0.25} roughness={0.1} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.48, 0.9, 16]} />
        <meshStandardMaterial color="#1a2a28" roughness={0.5} transparent opacity={0.9} />
      </mesh>
      {!done && (
        <mesh ref={orb} position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color="#4fc7c2" emissive="#4fc7c2" emissiveIntensity={1.4} />
        </mesh>
      )}
    </group>
  );
}

// ── Room IV ──────────────────────────────────────────────────────────────────

function MusicboxRenderer({ done, animating }) {
  const knob = useRef();
  const lid = useRef();
  useFrame((_, delta) => {
    if (knob.current && animating) knob.current.rotation.y += delta * 6;
    if (lid.current) lid.current.rotation.x = lerp(0, -1.1, done ? 1 : 0);
  });
  return (
    <group position={[0, 0.6, 0]}>
      <mesh>
        <boxGeometry args={[1, 0.6, 0.8]} />
        <meshStandardMaterial color="#6b4530" roughness={0.7} />
      </mesh>
      <mesh ref={lid} position={[0, 0.3, -0.4]}>
        <boxGeometry args={[1, 0.1, 0.8]} />
        <meshStandardMaterial color="#7a5238" roughness={0.7} />
      </mesh>
      <mesh ref={knob} position={[0.55, 0.1, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 10]} />
        <meshStandardMaterial color="#c9a15a" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

function TeddybearRenderer({ done }) {
  return (
    <group position={[0, 0.7, 0]}>
      <mesh>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.32, 12, 12]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.95} />
      </mesh>
      {[-0.22, 0.22].map((x, i) => (
        <mesh key={i} position={[x, 0.95, 0]}>
          <sphereGeometry args={[0.11, 8, 8]} />
          <meshStandardMaterial color="#8a6a4a" roughness={0.95} />
        </mesh>
      ))}
      {done && (
        <mesh position={[0, 0, 0.5]}>
          <boxGeometry args={[0.25, 0.4, 0.15]} />
          <meshStandardMaterial color="#e78bb0" emissive="#e78bb0" emissiveIntensity={1.2} />
        </mesh>
      )}
    </group>
  );
}

// ── Room V ───────────────────────────────────────────────────────────────────

function StarchartRenderer() {
  return (
    <mesh position={[0, 1.6, -0.05]}>
      <planeGeometry args={[1, 1.3]} />
      <meshStandardMaterial color="#1c1a3a" roughness={0.9} emissive="#3a3570" emissiveIntensity={0.3} />
    </mesh>
  );
}

function TelescopeRenderer({ done }) {
  const barrel = useRef();
  useFrame(() => { if (barrel.current) barrel.current.rotation.x = lerp(-0.5, -1.1, done ? 1 : 0); });
  return (
    <group position={[0, 0.9, 0]}>
      {[[-0.3, 0, -0.3], [0.3, 0, -0.3], [0, 0, 0.35]].map((p, i) => (
        <mesh key={i} position={p} rotation={[0.15, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.7} />
        </mesh>
      ))}
      <mesh ref={barrel} position={[0, 0.6, 0]} rotation={[-0.5, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.19, 1.6, 12]} />
        <meshStandardMaterial color="#8b7bea" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function CrankRenderer({ animating }) {
  const g = useRef();
  useFrame((_, delta) => { if (g.current && animating) g.current.rotation.z += delta * 5; });
  return (
    <group position={[0, 1.1, 0]}>
      <mesh>
        <boxGeometry args={[0.3, 0.3, 0.15]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.5} roughness={0.5} />
      </mesh>
      <group ref={g} position={[0, 0, 0.12]}>
        <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
          <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

function OrreryRenderer({ done }) {
  const g = useRef();
  useFrame(() => { if (g.current) g.current.position.y = lerp(3.6, 1.2, done ? 1 : 0); });
  return (
    <group ref={g} position={[0, 3.6, 0]}>
      {!done && (
        <mesh>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#ffcf6b" emissive="#ffcf6b" emissiveIntensity={1.6} />
        </mesh>
      )}
      {[0.6, 1, 1.4].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.01, 6, 24]} />
          <meshStandardMaterial color="#6a63a0" />
        </mesh>
      ))}
    </group>
  );
}

// ── Room VI ──────────────────────────────────────────────────────────────────

function RugtileRenderer({ stageIndex }) {
  const rug = useRef();
  const tile = useRef();
  useFrame(() => {
    if (rug.current) rug.current.position.x = lerp(0, 1.1, stageIndex >= 1 ? 1 : 0);
    if (tile.current) tile.current.rotation.x = lerp(0, -1.2, stageIndex >= 2 ? 1 : 0);
  });
  return (
    <group>
      <mesh ref={tile} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshStandardMaterial color="#4a4438" roughness={0.9} />
      </mesh>
      {stageIndex >= 2 && (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.3, 0.2, 0.3]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.4} />
        </mesh>
      )}
      <mesh ref={rug} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 2.2]} />
        <meshStandardMaterial color="#7a1c24" roughness={0.9} />
      </mesh>
    </group>
  );
}

function MirrorRenderer({ done }) {
  const g = useRef();
  useFrame(() => { if (g.current) g.current.rotation.y = lerp(0, 0.5, done ? 1 : 0); });
  return (
    <group ref={g} position={[0, 1.1, 0]}>
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.7, 1.3, 0.06]} />
        <meshStandardMaterial color="#d9d9e0" metalness={0.9} roughness={0.08} emissive={done ? '#d9b23c' : '#000000'} emissiveIntensity={done ? 0.25 : 0} />
      </mesh>
    </group>
  );
}

function CrownRenderer({ done }) {
  const laserA = useRef(); const laserB = useRef();
  useFrame((state) => {
    const flicker = done ? 0 : 0.6 + Math.sin(state.clock.elapsedTime * 12) * 0.4;
    if (laserA.current) laserA.current.material.opacity = flicker;
    if (laserB.current) laserB.current.material.opacity = flicker;
  });
  return (
    <group>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1, 1.8, 1]} />
        <meshStandardMaterial color="#3a2a10" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[1, 0.6, 1]} />
        <meshStandardMaterial color="#5a4014" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <coneGeometry args={[0.35, 0.4, 8]} />
        <meshStandardMaterial color="#d9b23c" metalness={0.8} roughness={0.25} />
      </mesh>
      {!done && (
        <>
          <mesh ref={laserA} position={[0, 2.35, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.6, 0.02, 0.02]} />
            <meshBasicMaterial color="#ff2a3a" transparent opacity={0.7} />
          </mesh>
          <mesh ref={laserB} position={[0, 2.35, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[1.6, 0.02, 0.02]} />
            <meshBasicMaterial color="#ff2a3a" transparent opacity={0.7} />
          </mesh>
        </>
      )}
      {done && (
        <mesh position={[0, 2.4, 0.3]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color="#d9b23c" emissive="#d9b23c" emissiveIntensity={1.6} />
        </mesh>
      )}
    </group>
  );
}

export const PROP_RENDERERS = {
  book: BookRenderer,
  painting: PaintingRenderer,
  wateringcan: WateringcanRenderer,
  flytrap: FlytrapRenderer,
  ladder: LadderRenderer,
  nest: NestRenderer,
  blackboard: BlackboardRenderer,
  drawer: DrawerRenderer,
  magnet: MagnetRenderer,
  beaker: BeakerRenderer,
  musicbox: MusicboxRenderer,
  teddybear: TeddybearRenderer,
  starchart: StarchartRenderer,
  telescope: TelescopeRenderer,
  crank: CrankRenderer,
  orrery: OrreryRenderer,
  rugtile: RugtileRenderer,
  mirror: MirrorRenderer,
  crown: CrownRenderer,
};

// ─── Beacons: mark which prop is currently interactable ──────────────────────
// Key-chain nodes get a small spinning key (not a ball — a key is a key);
// orb-chain nodes keep the glowing orb, since those literally are orbs.

function KeyBeacon({ accent }) {
  const g = useRef();
  useFrame((_, delta) => { if (g.current) g.current.rotation.y += delta * 1.1; });
  return (
    <group ref={g} position={[0, 2.15, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <torusGeometry args={[0.1, 0.028, 8, 16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.22, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0.055, -0.23, 0]}>
        <boxGeometry args={[0.085, 0.032, 0.032]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0.05, -0.28, 0]}>
        <boxGeometry args={[0.055, 0.032, 0.032]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  );
}

function OrbBeacon({ accent }) {
  return (
    <mesh position={[0, 2.1, 0]}>
      <sphereGeometry args={[0.09, 8, 8]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2} />
    </mesh>
  );
}

// ─── Generic wrapper: renders a node's prop + the "come here" beacon ─────────

export function InteractiveObject({ node, stageIndex, done, active, animating, accent, kind }) {
  const Renderer = PROP_RENDERERS[node.type];
  if (!Renderer) return null;
  return (
    <group position={node.position}>
      <Renderer node={node} stageIndex={stageIndex} done={done} active={active} animating={animating} />
      {active && !done && (
        <>
          {kind === 'key' ? <KeyBeacon accent={accent} /> : <OrbBeacon accent={accent} />}
          <pointLight position={[0, 2.1, 0]} color={accent} intensity={1.7} distance={5.5} decay={1.6} />
        </>
      )}
    </group>
  );
}

// ─── Well ───────────────────────────────────────────────────────────────────
// A decorative landmark set into the vestibule floor near spawn — not the
// room's exit (see Door below). It's a real obstacle — the player walks
// around its rim, not through it — but its hatch/glow props are currently
// always rendered closed and unlit (see the hardcoded unlocked/open props
// passed to it in index.js).

export function Well({ position, unlocked, open }) {
  const hatchLeft = useRef();
  const hatchRight = useRef();
  const glow = useRef();
  useFrame((state) => {
    const t = open ? 1 : 0;
    if (hatchLeft.current) hatchLeft.current.rotation.z = lerp(0, -2.1, t);
    if (hatchRight.current) hatchRight.current.rotation.z = lerp(0, 2.1, t);
    if (glow.current && unlocked) {
      glow.current.material.emissiveIntensity = (open ? 1.6 : 0.9) + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 0.6, 20, 1, true]} />
        <meshStandardMaterial color="#4a453c" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 0.92, 20]} />
        <meshStandardMaterial color="#5a5448" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.78, 20]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>

      {unlocked && (
        <>
          <mesh ref={glow} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.55, 20]} />
            <meshStandardMaterial color="#d9b23c" emissive="#d9b23c" emissiveIntensity={0.9} />
          </mesh>
          <pointLight position={[0, 0.9, 0]} color="#d9b23c" intensity={1.8} distance={6.5} decay={1.7} />
        </>
      )}

      <group ref={hatchLeft} position={[-0.02, 0.66, 0]}>
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.8, 0.08, 0.78]} />
          <meshStandardMaterial color={unlocked ? '#5a4530' : '#2a2420'} roughness={0.8} />
        </mesh>
      </group>
      <group ref={hatchRight} position={[0.02, 0.66, 0]}>
        <mesh position={[-0.4, 0, 0]}>
          <boxGeometry args={[0.8, 0.08, 0.78]} />
          <meshStandardMaterial color={unlocked ? '#5a4530' : '#2a2420'} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Door ───────────────────────────────────────────────────────────────────
// The room's actual exit: an upright gate frame set against the far wall,
// separate from the decorative Well near spawn (see DOOR_POSITION/
// WELL_POSITION in src/data/hexaMaze.js).

export function Door({ position, unlocked, open }) {
  const left = useRef();
  const right = useRef();
  useFrame(() => {
    const t = open ? 1 : 0;
    if (left.current) left.current.rotation.y = lerp(0, 1.3, t);
    if (right.current) right.current.rotation.y = lerp(0, -1.3, t);
  });
  return (
    <group position={position}>
      <group ref={left} position={[-0.95, 0, 0]}>
        <mesh position={[0.65, 1.6, 0]}>
          <boxGeometry args={[1.3, 3.2, 0.15]} />
          <meshStandardMaterial color={unlocked ? '#4a3a24' : '#2a2420'} roughness={0.8} />
        </mesh>
      </group>
      <group ref={right} position={[0.95, 0, 0]}>
        <mesh position={[-0.65, 1.6, 0]}>
          <boxGeometry args={[1.3, 3.2, 0.15]} />
          <meshStandardMaterial color={unlocked ? '#4a3a24' : '#2a2420'} roughness={0.8} />
        </mesh>
      </group>
      {unlocked && !open && (
        <pointLight position={[0, 1.8, 0.5]} color="#ffd27a" intensity={1.6} distance={5} />
      )}
    </group>
  );
}
