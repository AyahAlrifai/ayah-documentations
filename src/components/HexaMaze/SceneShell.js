import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCanvasTextTexture } from '../../utils/textTexture';

const _euler = new THREE.Euler();

// ─── Player: no visible body (the camera sits inside the player's head in
// first person) — just the light they carry, which grows as they collect orbs

export function Player({ posRef, orbCount }) {
  const lightRef = useRef();
  useFrame((state) => {
    if (!lightRef.current) return;
    const base = 30 + orbCount * 12;
    const flicker = base + Math.sin(state.clock.elapsedTime * 6) * 0.8;
    lightRef.current.intensity = flicker;
    lightRef.current.distance = 12 + orbCount * 2.4;
    lightRef.current.position.set(posRef.current.x, 1.5, posRef.current.z);
  });
  return <pointLight ref={lightRef} color="#fff2d6" intensity={30} distance={12} decay={1.5} />;
}

// ─── First-person camera rig: the camera *is* the player's eyes ───────────────
// Position tracks posRef (set by PlayerController from WASD/D-pad input);
// rotation tracks lookRef (set by LookControls from mouse/touch look input —
// see FirstPersonControls.js). Euler order 'YXZ' is the standard FPS order
// (yaw applied before pitch) so looking up/down never rolls the horizon.

export const EYE_HEIGHT = 1.6;

export function FirstPersonRig({ posRef, lookRef }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.set(posRef.current.x, EYE_HEIGHT, posRef.current.z);
    camera.rotation.set(lookRef.current.pitch, lookRef.current.yaw, 0, 'YXZ');
  });
  return null;
}

// ─── Movement + proximity controller ──────────────────────────────────────────

// Distance from circle center (cx,cz) to the closest point on segment
// (x0,z0)-(x1,z1) — a swept check, not just the destination point. A plain
// endpoint check lets a single large-delta frame (a stutter, or the first
// frame after scene load) tunnel straight through an obstacle whenever that
// frame's step is wider than the obstacle, since the landing point can
// clear the far side without ever sampling the inside.
function segmentCircleDist(x0, z0, x1, z1, cx, cz) {
  const dx = x1 - x0, dz = z1 - z0;
  const lenSq = dx * dx + dz * dz;
  let t = lenSq > 0 ? ((cx - x0) * dx + (cz - z0) * dz) / lenSq : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x0 + t * dx - cx, z0 + t * dz - cz);
}

export function PlayerController({ posRef, lookRef, bounds, obstacles, interactables, onNear, moveInputRef, onStep }) {
  const stepTimer = useRef(0);
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  useFrame((_, rawDelta) => {
    // Clamp so a stutter (GC pause, a backgrounded tab resuming, a slow
    // device) can't turn into one huge movement step — combined with the
    // swept check above this makes tunneling through an obstacle
    // effectively impossible regardless of frame rate.
    const delta = Math.min(rawDelta, 0.05);
    const speed = 5;
    const keys = moveInputRef.current;

    // Facing is driven by look (mouse/touch), not by movement direction —
    // true FPS behavior, unlike the old isometric turn-to-face-movement.
    posRef.current.facing = lookRef.current.yaw;

    let move = 0, strafe = 0;
    if (keys.forward) move += 1;
    if (keys.back) move -= 1;
    if (keys.right) strafe += 1;
    if (keys.left) strafe -= 1;

    if (move !== 0 || strafe !== 0) {
      // Forward/right basis rotated by yaw only — pitch never affects
      // ground movement, matching standard FPS controls.
      _euler.set(0, lookRef.current.yaw, 0);
      forward.current.set(0, 0, -1).applyEuler(_euler);
      right.current.set(1, 0, 0).applyEuler(_euler);

      let dx = forward.current.x * move + right.current.x * strafe;
      let dz = forward.current.z * move + right.current.z * strafe;
      const len = Math.hypot(dx, dz);
      if (len > 0) { dx /= len; dz /= len; }

      let nx = posRef.current.x + dx * speed * delta;
      let nz = posRef.current.z + dz * speed * delta;
      nx = THREE.MathUtils.clamp(nx, bounds.minX, bounds.maxX);
      nz = THREE.MathUtils.clamp(nz, bounds.minZ, bounds.maxZ);

      let blocked = false;
      for (const ob of obstacles) {
        const radius = ob.radius || 1.1;
        if (segmentCircleDist(posRef.current.x, posRef.current.z, nx, nz, ob.position[0], ob.position[2]) < radius) { blocked = true; break; }
      }
      if (!blocked) {
        posRef.current.x = nx;
        posRef.current.z = nz;
      }

      stepTimer.current += delta;
      if (stepTimer.current > 0.32) {
        stepTimer.current = 0;
        onStep();
      }
    }

    let nearest = null;
    let nearestDist = 2.4;
    for (const it of interactables) {
      const d = Math.hypot(posRef.current.x - it.position[0], posRef.current.z - it.position[2]);
      if (d < nearestDist) { nearest = it.id; nearestDist = d; }
    }
    onNear(nearest);
  });
  return null;
}

// ─── Room shell: floor + walls, tinted per room, with light per-type flourish ──

// Splits a wall of total length `totalLen` around a door gap centered at
// `gap.along`, returning the two solid side segments' lengths/centers (in
// the wall's local along-axis, 0 = wall center). Returns null when there's
// no gap for this wall, so the caller falls back to one solid box.
function gapSegments(totalLen, gap) {
  if (!gap) return null;
  const gapWidth = gap.width ?? 2.4;
  const along = gap.along ?? 0;
  const half = totalLen / 2;
  const leftLen = (along - gapWidth / 2) - -half;
  const rightLen = half - (along + gapWidth / 2);
  return {
    leftLen, rightLen,
    leftCenter: -half + leftLen / 2,
    rightCenter: along + gapWidth / 2 + rightLen / 2,
  };
}

// One wall of the room, optionally with a door-sized gap cut into it (two
// side segments + a header above the gap instead of one solid box) so a
// room's exit/back door can sit on any of the four walls, not just FAR.
function Wall({ orientation, w, d, color, metalness, roughness, gap }) {
  const isX = orientation === 'FAR' || orientation === 'NEAR'; // wall spans along world X
  const length = isX ? w : d;
  const thickness = 0.4;
  const height = 7;
  const fixedCoord = orientation === 'FAR' ? -d / 2
    : orientation === 'NEAR' ? d / 2
    : orientation === 'LEFT' ? -w / 2
    : w / 2;
  const boxArgs = (len) => (isX ? [len, height, thickness] : [thickness, height, len]);
  const posFor = (along) => (isX ? [along, height / 2, fixedCoord] : [fixedCoord, height / 2, along]);
  const mat = <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />;

  const seg = gapSegments(length, gap);
  if (!seg) {
    return (
      <mesh position={posFor(0)}>
        <boxGeometry args={boxArgs(length)} />
        {mat}
      </mesh>
    );
  }
  const gapHeight = gap.height ?? 3.6;
  const headerHeight = height - gapHeight;
  const headerPos = isX
    ? [gap.along ?? 0, gapHeight + headerHeight / 2, fixedCoord]
    : [fixedCoord, gapHeight + headerHeight / 2, gap.along ?? 0];
  const headerArgs = isX ? [gap.width ?? 2.4, headerHeight, thickness] : [thickness, headerHeight, gap.width ?? 2.4];
  return (
    <group>
      <mesh position={posFor(seg.leftCenter)}>
        <boxGeometry args={boxArgs(seg.leftLen)} />
        {mat}
      </mesh>
      <mesh position={posFor(seg.rightCenter)}>
        <boxGeometry args={boxArgs(seg.rightLen)} />
        {mat}
      </mesh>
      <mesh position={headerPos}>
        <boxGeometry args={headerArgs} />
        {mat}
      </mesh>
    </group>
  );
}

export function RoomShell({ bounds, accent, kind, doorGaps }) {
  const w = bounds.maxX - bounds.minX + 1.5;
  const d = bounds.maxZ - bounds.minZ + 1.5;
  const wallColor = kind === 'console' ? '#3a3a44' : '#221f2c';
  const wallMetalness = kind === 'console' ? 0.85 : 0.05;
  const wallRoughness = kind === 'console' ? 0.15 : 0.95;
  const gaps = doorGaps || {};

  const stars = React.useMemo(() => {
    if (kind !== 'deck') return [];
    return Array.from({ length: 46 }, () => ({
      pos: [(Math.random() - 0.5) * w * 0.95, 6.6 + Math.random() * 2, (Math.random() - 0.5) * d * 0.95],
      size: 0.03 + Math.random() * 0.05,
    }));
  }, [kind, w, d]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#26222f" roughness={0.95} />
      </mesh>

      {kind !== 'deck' && (
        <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color="#1a1722" roughness={1} />
        </mesh>
      )}
      {kind === 'deck' && stars.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[s.size, 6, 6]} />
          <meshStandardMaterial color="#cfd0ff" emissive="#8b7bea" emissiveIntensity={2} />
        </mesh>
      ))}

      <Wall orientation="FAR" w={w} d={d} color={wallColor} metalness={wallMetalness} roughness={wallRoughness} gap={gaps.FAR} />
      <Wall orientation="NEAR" w={w} d={d} color={wallColor} metalness={wallMetalness} roughness={wallRoughness} gap={gaps.NEAR} />
      <Wall orientation="LEFT" w={w} d={d} color={wallColor} metalness={wallMetalness} roughness={wallRoughness} gap={gaps.LEFT} />
      <Wall orientation="RIGHT" w={w} d={d} color={wallColor} metalness={wallMetalness} roughness={wallRoughness} gap={gaps.RIGHT} />

      {/* Intensities here are tuned high because three.js's physically-correct
          lighting (default since r155) treats point/spot intensity as
          candela — the pre-r155 "reasonable-looking" numbers now render
          the room almost black outside a tiny radius around each light. */}
      <ambientLight intensity={9} color={accent} />
      <hemisphereLight args={['#6a6490', '#201c2c', 9]} />
      <pointLight position={[0, 6, 0]} color={accent} intensity={420} distance={30} decay={1.6} />
      <pointLight position={[0, 5, bounds.maxZ - 1]} color="#fff2d6" intensity={260} distance={16} decay={1.8} />
      <pointLight position={[0, 5, bounds.minZ + 1]} color="#fff2d6" intensity={260} distance={16} decay={1.8} />

      <RoomDecor kind={kind} w={w} d={d} accent={accent} bounds={bounds} />
    </group>
  );
}

// ─── Decor collision ────────────────────────────────────────────────────────
// RoomDecor is purely visual — nothing in it blocks the player by default.
// That's fine for wall-mounted or floor-flush pieces, but freestanding
// furniture (tables, racks, the throne) needs its own solid obstacle entry
// here, matched to its position/footprint in RoomDecor below, or the player
// visibly clips through it.
export function roomFurnitureObstacles(kind, bounds) {
  const w = bounds.maxX - bounds.minX + 1.5;
  const d = bounds.maxZ - bounds.minZ + 1.5;
  const table = (position, radius) => ({ position, radius });
  switch (kind) {
    case 'archive':
      return [
        table([1.8, 0, 2.6], 1.1),
        table([-w / 2 + 0.9, 0, 3.4], 0.6),
      ];
    case 'queue':
      return [
        table([-w / 2 + 0.8, 0, 3.5], 0.45),
        table([w / 2 - 0.8, 0, 3.5], 0.45),
        table([-w / 2 + 0.8, 0, -4.5], 0.45),
        table([w / 2 - 0.9, 0, -4.5], 0.4),
      ];
    case 'vault':
      return [
        table([0, 0, 3], 1.0),
        ...[-1.6, -0.5, 0.6, 1.7].map((x) => table([x, 0, -d / 2 + 0.5], 0.4)),
      ];
    case 'cache':
      return [
        table([-3.6, 0, -4.2], 0.6),
      ];
    case 'deck':
      return [
        table([-2.2, 0, 3.2], 0.5),
        table([2, 0, 3.2], 0.6),
      ];
    case 'console':
      return [
        table([-2, 0, 4.6], 0.7),
      ];
    default:
      return [];
  }
}

// ─── Room decor: per-room set-dressing so rooms don't feel like empty boxes ───

function DecorLight({ position, color }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} />
      </mesh>
      <pointLight color={color} intensity={6} distance={4} decay={2} />
    </group>
  );
}

// A short line of packet cubes crawling along the back wall on a loop —
// visible message traffic, so the "events grow wild" atmosphere reads as
// something actually moving through the room, not just static decor.
function QueueConveyor({ w, d }) {
  const refs = useRef([]);
  const count = 5;
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.35;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const p = ((t + i / count) % 1) * (w - 1.6) - (w - 1.6) / 2;
      m.position.x = p;
    });
  });
  return (
    <group position={[0, 0.35, -d / 2 + 0.5]}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshStandardMaterial color="#9fffb0" emissive="#4fd67a" emissiveIntensity={1.2} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function RoomDecor({ kind, w, d, accent, bounds }) {
  if (kind === 'archive') {
    const shelfXs = [-w / 2 + 0.5, w / 2 - 0.5];
    const cableRuns = React.useMemo(() => Array.from({ length: 5 }, (_, i) => ({
      z: -d / 2 + 0.8 + i * (d - 1.6) / 4,
      sag: 0.15 + Math.random() * 0.2,
    })), [d]);
    return (
      <group>
        {shelfXs.map((x, si) => (
          <group key={si} position={[x, 0, 0]}>
            {[1.2, 2.4, 3.6].map((y, i) => (
              <mesh key={i} position={[0, y, -0.5]}>
                <boxGeometry args={[0.5, 0.1, d * 0.5]} />
                <meshStandardMaterial color="#3a2c1c" roughness={0.9} />
              </mesh>
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <mesh key={`b${i}`} position={[si === 0 ? 0.15 : -0.15, 1.5 + (i % 3) * 1.2, -1.4 + i * 0.9]}>
                <boxGeometry args={[0.18, 0.5 + (i % 4) * 0.08, 0.32]} />
                <meshStandardMaterial color={['#5a2020', '#2a3a5a', '#4a3a1a', '#2a4a3a'][i % 4]} roughness={0.85} />
              </mesh>
            ))}
          </group>
        ))}
        <DecorLight position={[0, 3.7, -1]} color="#e8a860" />

        {/* Ceiling cable runs — the archive's version history, still wired live. */}
        {cableRuns.map((c, i) => (
          <mesh key={i} position={[0, 3.85 - c.sag, c.z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, w - 1.2, 6]} />
            <meshStandardMaterial color="#1c1a16" roughness={0.6} />
          </mesh>
        ))}

        {/* A rack of superseded builds, glowing faintly — the monolith's old
            deploys, kept instead of deleted, the way this room's atmosphere
            promises. */}
        <group position={[-w / 2 + 0.9, 0, 3.4]}>
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[0.7, 2.2, 0.5]} />
            <meshStandardMaterial color="#2a241c" roughness={0.7} metalness={0.3} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[0, 0.25 + i * 0.34, 0.26]}>
              <boxGeometry args={[0.5, 0.05, 0.02]} />
              <meshStandardMaterial color={i === 5 ? '#e8a860' : '#5a4a2c'} emissive={i === 5 ? '#e8a860' : '#000'} emissiveIntensity={i === 5 ? 1.4 : 0} />
            </mesh>
          ))}
        </group>

        {/* Reading table, tucked in the vestibule so it never crowds a node. */}
        <group position={[1.8, 0, 2.6]}>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 1.4]} />
            <meshStandardMaterial color="#5a2020" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1.1, 0.08, 0.7]} />
            <meshStandardMaterial color="#3a2c1c" roughness={0.85} />
          </mesh>
          {[[-0.45, -0.28], [0.45, -0.28], [-0.45, 0.28], [0.45, 0.28]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.27, z]}>
              <boxGeometry args={[0.08, 0.55, 0.08]} />
              <meshStandardMaterial color="#3a2c1c" roughness={0.85} />
            </mesh>
          ))}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0.2, 0.62 + i * 0.08, 0.1]} rotation={[0, i * 0.35, 0]}>
              <boxGeometry args={[0.32, 0.07, 0.24]} />
              <meshStandardMaterial color={['#5a2020', '#2a3a5a', '#4a3a1a'][i]} roughness={0.85} />
            </mesh>
          ))}
          <DecorLight position={[0, 1.0, 0]} color="#e8a860" />
        </group>
      </group>
    );
  }
  if (kind === 'queue') {
    const fireflies = React.useMemo(() => Array.from({ length: 10 }, () => ({
      pos: [(Math.random() - 0.5) * w * 0.8, 1.2 + Math.random() * 2.2, (Math.random() - 0.5) * d * 0.8],
    })), [w, d]);
    const potSpots = [[-w / 2 + 0.8, 3.5], [w / 2 - 0.8, 3.5], [-w / 2 + 0.8, -4.5]];
    return (
      <group>
        {[-w / 2 + 0.4, w / 2 - 0.4].map((x, i) => (
          <mesh key={i} position={[x, 3.6, 0]} rotation={[0, 0, i === 0 ? 0.12 : -0.12]}>
            <cylinderGeometry args={[0.05, 0.05, 4.2, 6]} />
            <meshStandardMaterial color="#2d5a2d" roughness={0.85} />
          </mesh>
        ))}
        {/* Fireflies doubling as stray events — little packets that fired
            and never found a consumer, still drifting through the room. */}
        {fireflies.map((f, i) => (
          <mesh key={i} position={f.pos}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color="#9fffb0" emissive="#9fffb0" emissiveIntensity={2.4} />
          </mesh>
        ))}

        {/* A visible queue: packets crawling single-file along the back
            wall, the way messages should move but rarely do this cleanly. */}
        <QueueConveyor w={w} d={d} />

        {/* Pipe junction boxes with a blinking status LED each, mounted
            where the trellis wires meet the side walls. */}
        {[-w / 2 + 0.4, w / 2 - 0.4].map((x, i) => (
          <group key={i} position={[x, 3.6, -d / 2 + 0.6]}>
            <mesh>
              <boxGeometry args={[0.22, 0.22, 0.14]} />
              <meshStandardMaterial color="#26321f" roughness={0.7} metalness={0.2} />
            </mesh>
            <DecorLight position={[0, 0, 0.1]} color="#9fffb0" />
          </group>
        ))}

        {/* Potted plants along the walls, and a glowing mushroom cluster on the floor. */}
        {potSpots.map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.22, 0.28, 0.5, 10]} />
              <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.65, 0]}>
              <coneGeometry args={[0.32, 0.8, 8]} />
              <meshStandardMaterial color="#2d6a2d" roughness={0.8} />
            </mesh>
          </group>
        ))}
        <group position={[w / 2 - 0.9, 0, -4.5]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[i * 0.16 - 0.16, 0.08 + i * 0.03, i * 0.1]}>
              <coneGeometry args={[0.09 - i * 0.015, 0.16, 8]} />
              <meshStandardMaterial color="#e07a9a" emissive="#e07a9a" emissiveIntensity={0.8} roughness={0.6} />
            </mesh>
          ))}
        </group>
      </group>
    );
  }
  if (kind === 'vault') {
    return (
      <group>
        {[-w / 2 + 0.5, w / 2 - 0.5].map((x, i) => (
          <mesh key={i} position={[x, 5.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, d - 1, 8]} />
            <meshStandardMaterial color="#8a6a3a" metalness={0.7} roughness={0.35} />
          </mesh>
        ))}
        {[1.5, -1.5].map((z, i) => (
          <mesh key={i} position={[0, 5.5, z]}>
            <torusGeometry args={[0.22, 0.05, 8, 16]} />
            <meshStandardMaterial color="#4fc7c2" emissive="#4fc7c2" emissiveIntensity={0.6} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
        <DecorLight position={[0, 5.5, 1.5]} color="#4fc7c2" />

        {/* Hazard-striped floor band around the vault's centre, the way a
            restricted zone gets marked before you're allowed near it. */}
        <mesh position={[0, 0.012, -1]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.3, 2.5, 32]} />
          <meshStandardMaterial color="#4fc7c2" emissive="#4fc7c2" emissiveIntensity={0.35} roughness={0.6} transparent opacity={0.55} />
        </mesh>

        {/* Locked cabinet racks along the back wall — sealed session
            records, each with its own status light. */}
        {[-1.6, -0.5, 0.6, 1.7].map((x, i) => (
          <group key={i} position={[x, 0, -d / 2 + 0.5]}>
            <mesh position={[0, 1.0, 0]}>
              <boxGeometry args={[0.55, 2.0, 0.4]} />
              <meshStandardMaterial color="#233a39" roughness={0.7} metalness={0.25} />
            </mesh>
            <DecorLight position={[0, 1.85, 0.22]} color={i % 2 === 0 ? '#4fc7c2' : '#b23a2a'} />
          </group>
        ))}

        {/* Workbench with spare bottles, tucked in the vestibule. */}
        <group position={[0, 0, 3]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.6, 0.9, 0.6]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.3} roughness={0.6} />
          </mesh>
          {[-0.5, -0.15, 0.2, 0.55].map((x, i) => (
            <mesh key={i} position={[x, 1.02, 0]}>
              <cylinderGeometry args={[0.07, 0.09, 0.35, 8]} />
              <meshStandardMaterial color={['#4fc7c2', '#b23a2a', '#8a6a3a', '#4fc7c2'][i]} transparent opacity={0.75} roughness={0.2} />
            </mesh>
          ))}
        </group>

        {/* Pressure gauges on the side walls. */}
        {[-w / 2 + 0.42, w / 2 - 0.42].map((x, i) => (
          <group key={i} position={[x, 2.6, 2]} rotation={[0, i === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
              <meshStandardMaterial color="#c9c9c9" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[0.02, 0.16, 0.02]} />
              <meshStandardMaterial color="#b23a2a" />
            </mesh>
          </group>
        ))}
      </group>
    );
  }
  if (kind === 'cache') {
    const blocks = React.useMemo(() => Array.from({ length: 7 }, () => ({
      pos: [(Math.random() - 0.5) * w * 0.6, 0.14, (Math.random() - 0.5) * d * 0.6],
      color: ['#e78bb0', '#8bd0e7', '#f0d878', '#a8e78b'][Math.floor(Math.random() * 4)],
      rot: Math.random() * Math.PI,
    })), [w, d]);
    return (
      <group>
        {blocks.map((b, i) => (
          <mesh key={i} position={b.pos} rotation={[0, b.rot, 0]}>
            <boxGeometry args={[0.28, 0.28, 0.28]} />
            <meshStandardMaterial color={b.color} roughness={0.6} />
          </mesh>
        ))}

        {/* Rocking horse, tucked by the back-left wall. */}
        <group position={[-3.6, 0, -4.2]} rotation={[0, 0.4, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.9, 0.35, 0.25]} />
            <meshStandardMaterial color="#c9915a" roughness={0.7} />
          </mesh>
          <mesh position={[0.4, 0.75, 0]}>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshStandardMaterial color="#c9915a" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <torusGeometry args={[0.55, 0.05, 6, 16, Math.PI]} />
            <meshStandardMaterial color="#8a5a30" roughness={0.7} />
          </mesh>
        </group>

        {/* Shelf of toy soldiers along the right wall. */}
        <group position={[w / 2 - 0.5, 0.55, -2.5]}>
          <mesh>
            <boxGeometry args={[0.35, 0.06, 1.6]} />
            <meshStandardMaterial color="#6b4530" roughness={0.8} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[0, 0.16, -0.65 + i * 0.26]}>
              <cylinderGeometry args={[0.05, 0.06, 0.3, 8]} />
              <meshStandardMaterial color={['#b23a2a', '#3a5aa0'][i % 2]} roughness={0.7} />
            </mesh>
          ))}
        </group>

        {/* A shelf of resident memory sticks along the left wall — old
            skills that never got evicted, each blinking that it's still
            in use. */}
        <group position={[-w / 2 + 0.5, 0.55, -2.5]}>
          <mesh>
            <boxGeometry args={[0.35, 0.06, 1.6]} />
            <meshStandardMaterial color="#6b4530" roughness={0.8} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <group key={i} position={[0, 0.12, -0.7 + i * 0.2]}>
              <mesh>
                <boxGeometry args={[0.24, 0.05, 0.09]} />
                <meshStandardMaterial color="#3a2c3a" roughness={0.6} metalness={0.3} />
              </mesh>
              <mesh position={[0.08, 0.03, 0.05]}>
                <boxGeometry args={[0.02, 0.02, 0.02]} />
                <meshStandardMaterial color="#e78bb0" emissive="#e78bb0" emissiveIntensity={1.6} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    );
  }
  if (kind === 'deck') {
    return (
      <group>
        {[2.2, -2.2].map((x, i) => (
          <mesh key={i} position={[x, 2.4, -d / 2 + 1]}>
            <sphereGeometry args={[0.4 - i * 0.1, 14, 14]} />
            <meshStandardMaterial color="#6a63a0" emissive="#4a3fa0" emissiveIntensity={0.5} roughness={0.5} />
          </mesh>
        ))}

        {/* A second, purely decorative telescope stand and star desk in the vestibule. */}
        <group position={[-2.2, 0, 3.2]} rotation={[0, 0.5, 0]}>
          <mesh position={[0, 0.9, 0]} rotation={[-0.3, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 1.5, 10]} />
            <meshStandardMaterial color="#8b7bea" metalness={0.6} roughness={0.3} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.sin(i * 2.1) * 0.28, 0.05, Math.cos(i * 2.1) * 0.28]}>
              <cylinderGeometry args={[0.04, 0.04, 0.85, 6]} />
              <meshStandardMaterial color="#4a3a2a" roughness={0.7} />
            </mesh>
          ))}
        </group>
        <group position={[2, 0, 3.2]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1, 0.06, 0.7]} />
            <meshStandardMaterial color="#2a2650" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.53, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 0.5]} />
            <meshStandardMaterial color="#1c1a3a" emissive="#3a3570" emissiveIntensity={0.3} roughness={0.9} />
          </mesh>
          {[[-0.4, 0.27], [0.4, 0.27], [-0.4, -0.27], [0.4, -0.27]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.25, z]}>
              <boxGeometry args={[0.06, 0.5, 0.06]} />
              <meshStandardMaterial color="#2a2650" roughness={0.8} />
            </mesh>
          ))}
        </group>

        {/* Wall-mounted telemetry panels — live graphs on both side walls,
            so the "dashboard with no edges" atmosphere has something to
            actually point at besides the ceiling stars. */}
        {[-w / 2 + 0.42, w / 2 - 0.42].map((x, i) => (
          <group key={i} position={[x, 2.4, -1.5]} rotation={[0, i === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            <mesh>
              <planeGeometry args={[1, 0.6]} />
              <meshStandardMaterial color="#1c1a3a" emissive="#6a63a0" emissiveIntensity={0.4} roughness={0.9} />
            </mesh>
            {Array.from({ length: 5 }, (_, j) => (
              <mesh key={j} position={[-0.4 + j * 0.2, -0.25 + (0.14 + (j % 3) * 0.09), 0.01]}>
                <boxGeometry args={[0.06, 0.2 + (j % 3) * 0.18, 0.01]} />
                <meshStandardMaterial color="#cfd0ff" emissive="#8b7bea" emissiveIntensity={1.4} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    );
  }
  if (kind === 'console') {
    const corners = [
      [-w / 2 + 0.7, -d / 2 + 0.7], [w / 2 - 0.7, -d / 2 + 0.7],
      [-w / 2 + 0.7, d / 2 - 0.7], [w / 2 - 0.7, d / 2 - 0.7],
    ];
    return (
      <group>
        {corners.map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.06, 0.09, 2.8, 8]} />
              <meshStandardMaterial color="#d9b23c" metalness={0.75} roughness={0.3} />
            </mesh>
            <DecorLight position={[0, 2.85, 0]} color="#ffb84d" />
          </group>
        ))}

        {/* The console throne — the one real seat among six reflected
            racks — tucked into the vestibule so it never crowds a node. */}
        <group position={[-2, 0, 4.6]}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.9, 0.9, 0.8]} />
            <meshStandardMaterial color="#7a1c24" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.3, -0.35]}>
            <boxGeometry args={[0.9, 1.6, 0.14]} />
            <meshStandardMaterial color="#d9b23c" metalness={0.7} roughness={0.25} />
          </mesh>
          {[-0.5, 0.5].map((x, i) => (
            <mesh key={i} position={[x, 0.45, 0]}>
              <boxGeometry args={[0.12, 0.9, 0.8]} />
              <meshStandardMaterial color="#d9b23c" metalness={0.7} roughness={0.25} />
            </mesh>
          ))}
          <DecorLight position={[0, 2.15, -0.3]} color="#ffb84d" />
        </group>
        {/* Carpet runner leading from spawn toward the console. */}
        <mesh position={[-1, 0.015, 5.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 2.6]} />
          <meshStandardMaterial color="#7a1c24" roughness={0.9} />
        </mesh>

        {/* Redundant server racks along the back wall, each with its own
            blinking status column — the failover nodes the room's mirrors
            are multiplying. */}
        {[-2.6, -1.3, 1.3, 2.6].map((x, i) => (
          <group key={i} position={[x, 0, -d / 2 + 0.55]}>
            <mesh position={[0, 1.3, 0]}>
              <boxGeometry args={[0.6, 2.6, 0.5]} />
              <meshStandardMaterial color="#2c2a34" roughness={0.6} metalness={0.4} />
            </mesh>
            {Array.from({ length: 4 }, (_, j) => (
              <mesh key={j} position={[0, 0.5 + j * 0.55, 0.27]}>
                <boxGeometry args={[0.06, 0.06, 0.02]} />
                <meshStandardMaterial color="#d9b23c" emissive="#d9b23c" emissiveIntensity={j === i % 4 ? 1.8 : 0.4} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    );
  }
  return null;
}

// ─── Scattered environmental text ──────────────────────────────────────────
// Short lore fragments (room.loreFragments in src/data/hexaMaze.js) spread
// across all six surfaces — FAR/NEAR/LEFT/RIGHT walls, floor, ceiling — so a
// full 360 look-around always finds something to read. Placement is
// deterministic (no per-render Math.random reshuffle) and nudges away from
// whichever wall has a door gap on it, so fragments never render on top of a
// door frame.

const TEXT_SURFACES = ['FAR', 'NEAR', 'LEFT', 'RIGHT', 'floor', 'ceiling'];

// Spreads `count` items evenly across [-span/2+pad, span/2-pad].
function spreadAlong(index, count, span, pad = 1.2) {
  const usable = Math.max(span - pad * 2, 0.5);
  const t = count > 1 ? index / (count - 1) : 0.5;
  return -usable / 2 + t * usable;
}

function fragmentTransform(surface, index, count, w, d, doorAlong) {
  const halfW = w / 2, halfD = d / 2;
  const height = 1.4 + (index % 2) * 1.2;
  let along;
  if (surface === 'FAR' || surface === 'NEAR') along = spreadAlong(index, count, w);
  else if (surface === 'LEFT' || surface === 'RIGHT') along = spreadAlong(index, count, d);

  if (along !== undefined && doorAlong != null && Math.abs(along - doorAlong) < 1.6) {
    along += along >= doorAlong ? 1.8 : -1.8;
  }

  switch (surface) {
    case 'FAR': return { position: [along, height, -halfD + 0.05], rotation: [0, 0, 0] };
    case 'NEAR': return { position: [along, height, halfD - 0.05], rotation: [0, Math.PI, 0] };
    case 'LEFT': return { position: [-halfW + 0.05, height, along], rotation: [0, Math.PI / 2, 0] };
    case 'RIGHT': return { position: [halfW - 0.05, height, along], rotation: [0, -Math.PI / 2, 0] };
    case 'floor': return {
      position: [spreadAlong(index, count, w * 0.8), 0.02, ((index * 2.7) % (d - 2)) - (d - 2) / 2],
      rotation: [-Math.PI / 2, 0, 0],
    };
    case 'ceiling': default: return {
      position: [spreadAlong(index, count, w * 0.8), 3.85, ((index * 3.3) % (d - 2)) - (d - 2) / 2],
      rotation: [Math.PI / 2, 0, 0],
    };
  }
}

// A single lore fragment rendered as a canvas-text decal. Each frame, it
// checks how closely the camera's look direction (from lookRef.{yaw,pitch})
// points toward it and ramps opacity/glow up when it's near the center of
// view versus the periphery — a cheap dot-product view-cone check rather
// than a literal per-mesh Raycaster hit-test, since the goal is "text
// visually focuses as you look toward it," not occlusion-accurate picking.
function TextDecal({ text, position, rotation, lookRef }) {
  const texture = useCanvasTextTexture(text, {
    width: 320, height: 100, color: '#cfc6ae', font: 'italic 30px Georgia, serif',
  });
  const matRef = useRef();
  const worldPos = useMemo(() => new THREE.Vector3(position[0], position[1], position[2]), [position]);
  const forward = useRef(new THREE.Vector3());
  const toText = useRef(new THREE.Vector3());
  useFrame((state) => {
    if (!matRef.current) return;
    _euler.set(lookRef.current.pitch, lookRef.current.yaw, 0, 'YXZ');
    forward.current.set(0, 0, -1).applyEuler(_euler);
    toText.current.copy(worldPos).sub(state.camera.position);
    const dist = toText.current.length();
    toText.current.normalize();
    const dot = forward.current.dot(toText.current);
    const focus = dist < 9 ? THREE.MathUtils.clamp((dot - 0.85) / 0.15, 0, 1) : 0;
    matRef.current.opacity = 0.18 + focus * 0.82;
    matRef.current.emissiveIntensity = 0.15 + focus * 1.6;
  });
  if (!texture) return null;
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[1.1, 0.34]} />
      <meshStandardMaterial
        ref={matRef} map={texture} transparent opacity={0.18}
        emissive="#fff8e0" emissiveMap={texture} emissiveIntensity={0.15}
        depthWrite={false} side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function ScatteredTextField({ fragments, bounds, doorGaps, lookRef }) {
  const w = bounds.maxX - bounds.minX + 1.5;
  const d = bounds.maxZ - bounds.minZ + 1.5;
  const gaps = doorGaps || {};

  const items = useMemo(() => {
    const bySurface = { FAR: [], NEAR: [], LEFT: [], RIGHT: [], floor: [], ceiling: [] };
    (fragments || []).forEach((text, i) => bySurface[TEXT_SURFACES[i % TEXT_SURFACES.length]].push(text));
    const out = [];
    Object.entries(bySurface).forEach(([surface, texts]) => {
      const doorAlong = gaps[surface] ? gaps[surface].along ?? 0 : null;
      texts.forEach((text, i) => {
        const { position, rotation } = fragmentTransform(surface, i, texts.length, w, d, doorAlong);
        out.push({ key: `${surface}-${i}`, text, position, rotation });
      });
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragments, w, d, gaps.FAR, gaps.NEAR, gaps.LEFT, gaps.RIGHT]);

  return (
    <group>
      {items.map((item) => (
        <TextDecal key={item.key} text={item.text} position={item.position} rotation={item.rotation} lookRef={lookRef} />
      ))}
    </group>
  );
}

// ─── Keyboard bridge ────────────────────────────────────────────────────────

export function useKeyboard(moveInputRef, onInteract, deps) {
  useEffect(() => {
    const downMap = {
      ArrowUp: 'forward', ArrowDown: 'back', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'forward', s: 'back', a: 'left', d: 'right', W: 'forward', S: 'back', A: 'left', D: 'right',
    };
    const onDown = (e) => {
      const k = downMap[e.key];
      if (k) { moveInputRef.current[k] = true; e.preventDefault(); }
      if (e.key === 'e' || e.key === 'E') onInteract();
    };
    const onUp = (e) => {
      const k = downMap[e.key];
      if (k) { moveInputRef.current[k] = false; }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
