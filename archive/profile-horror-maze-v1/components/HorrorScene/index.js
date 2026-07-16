import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { playPropSound } from '../../utils/horrorAudio';

// ─── Player ───────────────────────────────────────────────────────────────────

function Player({ posRef }) {
  const group = useRef();
  const lightRef = useRef();
  useFrame((state) => {
    if (!group.current) return;
    group.current.position.set(posRef.current.x, 0, posRef.current.z);
    group.current.rotation.y = posRef.current.facing;
    if (lightRef.current) {
      const flicker = 3.2 + Math.sin(state.clock.elapsedTime * 9) * 0.25
        + (Math.random() - 0.5) * 0.2;
      lightRef.current.intensity = flicker;
    }
  });
  return (
    <group ref={group}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <coneGeometry args={[0.5, 1.5, 8]} />
        <meshStandardMaterial color="#2a2a38" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.9} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.6, 0.4]} color="#ffc478" intensity={3.2} distance={13} decay={1.5} />
    </group>
  );
}

// ─── Camera rig: follows the player smoothly ──────────────────────────────────

function CameraRig({ posRef }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 1, 0));
  useFrame((state) => {
    const targetX = posRef.current.x;
    const targetZ = posRef.current.z + 8;
    const breathe = Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
    camera.position.x += (targetX - camera.position.x) * 0.06;
    camera.position.z += (targetZ - camera.position.z) * 0.06;
    camera.position.y += (6 + breathe - camera.position.y) * 0.06;
    look.current.x += (posRef.current.x - look.current.x) * 0.08;
    look.current.z += (posRef.current.z - 2 - look.current.z) * 0.08;
    camera.lookAt(look.current.x, 1, look.current.z);
  });
  return null;
}

// ─── Movement + proximity controller ──────────────────────────────────────────

function PlayerController({ posRef, bounds, rooms, onNear, moveInputRef, onStep }) {
  const stepTimer = useRef(0);
  useFrame((_, delta) => {
    const speed = 5.2;
    const keys = moveInputRef.current;
    let dx = 0, dz = 0;
    if (keys.forward) dz -= 1;
    if (keys.back) dz += 1;
    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;

    if (dx !== 0 || dz !== 0) {
      const len = Math.hypot(dx, dz);
      dx /= len; dz /= len;
      let nx = posRef.current.x + dx * speed * delta;
      let nz = posRef.current.z + dz * speed * delta;
      nx = THREE.MathUtils.clamp(nx, bounds.minX, bounds.maxX);
      nz = THREE.MathUtils.clamp(nz, bounds.minZ, bounds.maxZ);

      let blocked = false;
      for (const room of rooms) {
        const [px, , pz] = room.position;
        if (Math.hypot(nx - px, nz - pz) < 1.3) { blocked = true; break; }
      }
      if (!blocked) {
        posRef.current.x = nx;
        posRef.current.z = nz;
      }
      posRef.current.facing = Math.atan2(dx, dz);

      stepTimer.current += delta;
      if (stepTimer.current > 0.38) {
        stepTimer.current = 0;
        onStep();
      }
    }

    let nearest = null;
    let nearestDist = 2.6;
    for (const room of rooms) {
      const [px, , pz] = room.position;
      const d = Math.hypot(posRef.current.x - px, posRef.current.z - pz);
      if (d < nearestDist) { nearest = room.id; nearestDist = d; }
    }
    onNear(nearest);
  });
  return null;
}

// ─── Room shell: floor + walls ─────────────────────────────────────────────────

function RoomShell({ bounds }) {
  const w = bounds.maxX - bounds.minX + 2;
  const d = bounds.maxZ - bounds.minZ + 2;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#221f2c" roughness={1} />
      </mesh>
      <mesh position={[0, 4, -d / 2]}>
        <boxGeometry args={[w, 8, 0.4]} />
        <meshStandardMaterial color="#2a2740" roughness={1} />
      </mesh>
      <mesh position={[0, 4, d / 2]}>
        <boxGeometry args={[w, 8, 0.4]} />
        <meshStandardMaterial color="#2a2740" roughness={1} />
      </mesh>
      <mesh position={[-w / 2, 4, 0]}>
        <boxGeometry args={[0.4, 8, d]} />
        <meshStandardMaterial color="#282438" roughness={1} />
      </mesh>
      <mesh position={[w / 2, 4, 0]}>
        <boxGeometry args={[0.4, 8, d]} />
        <meshStandardMaterial color="#282438" roughness={1} />
      </mesh>
    </group>
  );
}

// ─── Shatter particles (used by vase / mirror) ─────────────────────────────────

function Shards({ active }) {
  const shards = useMemo(() => Array.from({ length: 10 }, () => ({
    vel: [(Math.random() - 0.5) * 4, Math.random() * 3 + 1.5, (Math.random() - 0.5) * 4],
    rot: [Math.random() * 5, Math.random() * 5, Math.random() * 5],
  })), [active]);
  const refs = useRef([]);
  const age = useRef(0);

  useFrame((_, delta) => {
    if (!active) return;
    age.current += delta;
    shards.forEach((s, i) => {
      const m = refs.current[i];
      if (!m) return;
      s.vel[1] -= 9 * delta;
      m.position.x += s.vel[0] * delta;
      m.position.y += s.vel[1] * delta;
      m.position.z += s.vel[2] * delta;
      m.rotation.x += s.rot[0] * delta;
      m.rotation.y += s.rot[1] * delta;
      if (m.position.y < 0) m.position.y = 0;
      m.material.opacity = Math.max(0, 1 - age.current / 1.1);
    });
  });

  if (!active) return null;
  return (
    <group position={[0, 0.8, 0]}>
      {shards.map((s, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <tetrahedronGeometry args={[0.14]} />
          <meshStandardMaterial color="#cbd5f5" transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Individual prop types (all take a 0→1 `progress` number) ────────────────

function VaseProp({ progress }) {
  const scale = Math.max(0.001, 1 - progress);
  return (
    <group>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.7, 0.8, 0.7]} />
        <meshStandardMaterial color="#3a3a2a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.1, 0]} scale={[scale, scale, scale]}>
        <cylinderGeometry args={[0.35, 0.22, 0.9, 10]} />
        <meshStandardMaterial color="#8f5fb0" roughness={0.5} />
      </mesh>
      <Shards active={progress > 0.02 && progress < 1} />
    </group>
  );
}

function ChestProp({ progress }) {
  const lidAngle = -progress * 1.9;
  return (
    <group>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.3, 0.7, 0.9]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.88, 0.45]} rotation={[lidAngle, 0, 0]}>
        <boxGeometry args={[1.3, 0.35, 0.9]} />
        <meshStandardMaterial color="#4d382a" roughness={0.85} />
      </mesh>
      {progress > 0.5 && (
        <pointLight position={[0, 0.9, 0]} color="#ffd27a" intensity={0.8} distance={2.5} />
      )}
    </group>
  );
}

function BookshelfProp({ progress }) {
  const slide = progress * 0.9;
  return (
    <group>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.6, 2, 0.5]} />
        <meshStandardMaterial color="#241a12" roughness={0.9} />
      </mesh>
      {[0.4, 0.9, 1.4].map((y, i) => (
        <mesh key={i} position={[-0.35 + i * 0.35, y, 0.3 + (i === 1 ? slide : 0)]}
          rotation={[0, 0, i === 1 ? -progress * 0.5 : 0]}>
          <boxGeometry args={[0.28, 0.38, 0.08]} />
          <meshStandardMaterial color={i === 1 ? '#8a6a3a' : '#5a4530'} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function WellProp({ progress }) {
  const rise = progress * 1.6;
  const opacity = progress > 0.05 ? Math.min(1, (1 - progress) * 2 + 0.15) : 0;
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.6, 16]} />
        <meshStandardMaterial color="#2c2c34" roughness={1} />
      </mesh>
      <mesh position={[0, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.08, 8, 20]} />
        <meshStandardMaterial color="#1c1c22" roughness={1} />
      </mesh>
      {progress > 0.01 && (
        <mesh position={[0, 0.6 + rise, 0]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#9fe8ff" emissive="#4fd0ff" emissiveIntensity={1.4} transparent opacity={opacity} />
        </mesh>
      )}
    </group>
  );
}

function MirrorProp({ progress }) {
  const shakeActive = progress > 0 && progress < 0.4;
  const shake = shakeActive ? (Math.random() - 0.5) * 0.05 : 0;
  const flash = progress > 0 && progress < 0.3;
  return (
    <group position={[shake, 0, 0]}>
      <mesh position={[0, 1.1, -0.08]}>
        <boxGeometry args={[1.1, 1.6, 0.12]} />
        <meshStandardMaterial color="#2a1f14" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <planeGeometry args={[0.9, 1.4]} />
        <meshStandardMaterial
          color={flash ? '#7a1f2a' : '#8b93a8'}
          metalness={0.6}
          roughness={0.15}
        />
      </mesh>
      {progress > 0.1 && (
        <group position={[0, 1.1, 0.01]}>
          <mesh rotation={[0, 0, 0.5]}><boxGeometry args={[0.9, 0.01, 0.01]} /><meshBasicMaterial color="#000" /></mesh>
          <mesh rotation={[0, 0, -0.4]}><boxGeometry args={[0.7, 0.01, 0.01]} /><meshBasicMaterial color="#000" /></mesh>
          <mesh rotation={[0, 0, 1.2]}><boxGeometry args={[0.5, 0.01, 0.01]} /><meshBasicMaterial color="#000" /></mesh>
        </group>
      )}
    </group>
  );
}

function AltarProp({ progress }) {
  const open = progress * 1.3;
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.4, 1, 0.9]} />
        <meshStandardMaterial color="#241a1a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.3, 1.05, 0]} rotation={[-Math.PI / 2.3, 0, open]}>
        <boxGeometry args={[0.55, 0.02, 0.7]} />
        <meshStandardMaterial color="#e8dcb8" roughness={0.6} />
      </mesh>
      <mesh position={[0.3, 1.05, 0]} rotation={[-Math.PI / 2.3, 0, -open]}>
        <boxGeometry args={[0.55, 0.02, 0.7]} />
        <meshStandardMaterial color="#e8dcb8" roughness={0.6} />
      </mesh>
      <pointLight position={[0, 1.6, 0]} color="#ffcf6b" intensity={0.6 + progress * 2.2} distance={5 + progress * 3} />
    </group>
  );
}

const PROP_COMPONENTS = {
  vase: VaseProp,
  chest: ChestProp,
  bookshelf: BookshelfProp,
  well: WellProp,
  mirror: MirrorProp,
  altar: AltarProp,
};

const ANIM_DURATION = 1.1;

// ─── One interactive room object ───────────────────────────────────────────────

function Prop({ room, found, triggerId, onDone }) {
  const [phase, setPhase] = useState(found ? 'done' : 'idle');
  const [progress, setProgress] = useState(found ? 1 : 0);

  useEffect(() => {
    if (found && phase !== 'done') {
      setPhase('done');
      setProgress(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found]);

  useEffect(() => {
    if (triggerId && triggerId.startsWith(room.id + ':') && phase === 'idle') {
      setPhase('animating');
      playPropSound(room.prop);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerId]);

  useFrame((_, delta) => {
    if (phase !== 'animating') return;
    const next = Math.min(1, progress + delta / ANIM_DURATION);
    setProgress(next);
    if (next >= 1) {
      setPhase('done');
      onDone(room.id);
    }
  });

  const Comp = PROP_COMPONENTS[room.prop] || VaseProp;
  return (
    <group position={room.position}>
      <Comp progress={progress} />
      {phase === 'idle' && (
        <>
          <mesh position={[0, 2.1, 0]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshStandardMaterial color={room.color} emissive={room.color} emissiveIntensity={2.2} />
          </mesh>
          <pointLight position={[0, 2.1, 0]} color={room.color} intensity={2.2} distance={6} decay={1.6} />
        </>
      )}
      {phase === 'done' && (
        <pointLight position={[0, 1.4, 0]} color={room.color} intensity={0.5} distance={3} decay={2} />
      )}
    </group>
  );
}

// ─── Scene root ─────────────────────────────────────────────────────────────

export default function HorrorScene({ rooms, playerStart, bounds, foundRooms, onReveal, onNearChange, onFootstep, apiRef }) {
  const posRef = useRef({ x: playerStart[0], z: playerStart[2], facing: 0 });
  const moveInputRef = useRef({ forward: false, back: false, left: false, right: false });
  const nearIdRef = useRef(null);
  const [triggerId, setTriggerId] = useState(null);

  function interact() {
    const id = nearIdRef.current;
    if (id && !foundRooms.has(id)) {
      setTriggerId(id + ':' + Date.now());
    }
  }

  useEffect(() => {
    if (apiRef) {
      apiRef.current = {
        setKey: (dir, pressed) => { moveInputRef.current[dir] = pressed; },
        interact,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundRooms]);

  useEffect(() => {
    const downMap = {
      ArrowUp: 'forward', ArrowDown: 'back', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'forward', s: 'back', a: 'left', d: 'right', W: 'forward', S: 'back', A: 'left', D: 'right'
    };
    const onDown = (e) => {
      const k = downMap[e.key];
      if (k) { moveInputRef.current[k] = true; e.preventDefault(); }
      if (e.key === 'e' || e.key === 'E') interact();
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
  }, [foundRooms]);

  function handleNear(id) {
    if (id !== nearIdRef.current) {
      nearIdRef.current = id;
      onNearChange(id);
    }
  }

  return (
    <Canvas
      camera={{ position: [0, 6, playerStart[2] + 8], fov: 48 }}
      gl={{ antialias: true }}
      style={{ background: '#0a0a14' }}
    >
      <fog attach="fog" args={['#0a0a14', 12, 36]} />
      <ambientLight intensity={0.45} color="#4a4a6e" />
      <hemisphereLight args={['#40406a', '#0c0c16', 0.55]} />
      <pointLight position={[0, 7.5, 0]} color="#8890c0" intensity={1.1} distance={26} decay={1.8} />

      <RoomShell bounds={bounds} />
      <Player posRef={posRef} />
      <CameraRig posRef={posRef} />
      <PlayerController
        posRef={posRef}
        bounds={bounds}
        rooms={rooms}
        onNear={handleNear}
        moveInputRef={moveInputRef}
        onStep={onFootstep}
      />

      {rooms.map((room) => (
        <Prop
          key={room.id}
          room={room}
          found={foundRooms.has(room.id)}
          triggerId={triggerId}
          onDone={(id) => {
            const found = rooms.find(r => r.id === id);
            if (found) onReveal(found);
          }}
        />
      ))}
    </Canvas>
  );
}
