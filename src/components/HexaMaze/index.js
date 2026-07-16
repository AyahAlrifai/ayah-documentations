import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { rooms, ROOM_BOUNDS, PLAYER_START, DOOR_POSITION, WELL_POSITION, finale } from '../../data/hexaMaze';
import { Player, CameraRig, PlayerController, RoomShell, useKeyboard } from './SceneShell';
import { InteractiveObject, Well, Door } from './Props';
import { playSound, playDoorUnlock, playFinaleBlast, playFootstep } from '../../utils/hexaAudio';

function getActiveNode(chain, progress) {
  for (const node of chain) {
    const done = (progress[node.objectId] || 0) >= node.stages.length;
    if (!done) return node;
  }
  return null;
}

function isChainDone(chain, progress) {
  const last = chain[chain.length - 1];
  return (progress[last.objectId] || 0) >= last.stages.length;
}

export default function HexaMaze({ apiRef, onState, onSectionReveal, onNearChange, onCodeRequest, onCodeReveal, onFinaleStage }) {
  const [roomIndex, setRoomIndex] = useState(0);
  const [chainProgress, setChainProgress] = useState({});
  const [animatingId, setAnimatingId] = useState(null);
  const [doorOpenAnim, setDoorOpenAnim] = useState(false);
  const [carriedOrbs, setCarriedOrbs] = useState([]);
  const [pendingCode, setPendingCode] = useState(null);
  const [finaleStage, setFinaleStage] = useState(null);

  const posRef = useRef({ x: PLAYER_START[0], z: PLAYER_START[2], facing: 0 });
  const moveInputRef = useRef({ forward: false, back: false, left: false, right: false });
  const nearIdRef = useRef(null);
  const orbNotifiedRef = useRef(new Set());
  const keyNotifiedRef = useRef(new Set());
  const transitioningRef = useRef(false);

  const room = rooms[roomIndex];
  const keyDone = isChainDone(room.keyChain, chainProgress);
  const orbDone = isChainDone(room.orbChain, chainProgress);
  const doorUnlocked = keyDone && orbDone;

  useEffect(() => {
    onState && onState({
      room, roomIndex, roomCount: rooms.length,
      keyDone, orbDone, doorUnlocked, orbsCarried: carriedOrbs.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomIndex, keyDone, orbDone, carriedOrbs.length]);

  useEffect(() => {
    onCodeRequest && onCodeRequest(pendingCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCode]);

  useEffect(() => {
    onFinaleStage && onFinaleStage(finaleStage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finaleStage]);

  function completeStage(node, chainType) {
    setAnimatingId(null);
    setChainProgress(prev => {
      const next = { ...prev, [node.objectId]: (prev[node.objectId] || 0) + 1 };
      const chain = chainType === 'orb' ? room.orbChain : room.keyChain;
      const lastNode = chain[chain.length - 1];
      const chainNowDone = (next[lastNode.objectId] || 0) >= lastNode.stages.length;
      const notifiedRef = chainType === 'orb' ? orbNotifiedRef : keyNotifiedRef;
      if (chainNowDone && !notifiedRef.current.has(room.id)) {
        notifiedRef.current.add(room.id);
        if (chainType === 'orb') {
          setTimeout(() => {
            playSound('chime');
            setCarriedOrbs(c => [...c, room.cvSectionId]);
          }, 300);
        } else {
          setTimeout(() => playSound('lockClick'), 300);
        }
      }
      return next;
    });
  }

  function goToNextRoom() {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    playDoorUnlock();
    setDoorOpenAnim(true);
    onSectionReveal && onSectionReveal(room.cvSectionId);
    setTimeout(() => {
      setRoomIndex(i => i + 1);
      setChainProgress({});
      setDoorOpenAnim(false);
      posRef.current = { x: PLAYER_START[0], z: PLAYER_START[2], facing: 0 };
      transitioningRef.current = false;
    }, 750);
  }

  function triggerFinale() {
    if (finaleStage) return;
    onSectionReveal && onSectionReveal(room.cvSectionId);
    setFinaleStage('slotting');
    let t = 0;
    rooms.forEach(() => {
      setTimeout(() => playSound('chime'), t);
      t += 380;
    });
    setTimeout(() => {
      setFinaleStage('blast');
      playFinaleBlast();
    }, t + 300);
    setTimeout(() => {
      setFinaleStage('unlocked');
      playDoorUnlock();
    }, t + 2400);
    setTimeout(() => {
      setFinaleStage('escaped');
    }, t + 4400);
  }

  function interact() {
    const id = nearIdRef.current;
    if (!id) return;

    if (id === 'DOOR') {
      if (roomIndex === rooms.length - 1) triggerFinale();
      else goToNextRoom();
      return;
    }

    const keyActive = getActiveNode(room.keyChain, chainProgress);
    const orbActive = getActiveNode(room.orbChain, chainProgress);
    let node = null; let chainType = null;
    if (keyActive && keyActive.objectId === id) { node = keyActive; chainType = 'key'; }
    else if (orbActive && orbActive.objectId === id) { node = orbActive; chainType = 'orb'; }
    if (!node) return;

    const stageIndex = chainProgress[id] || 0;
    const stage = node.stages[stageIndex];
    if (!stage) return;

    if (stage.requiresCode) {
      setPendingCode({ objectId: id, code: stage.requiresCode, chainType, node });
      return;
    }
    if (stage.duration) {
      setAnimatingId(id);
      playSound(stage.sound);
      setTimeout(() => {
        completeStage(node, chainType);
        if (stage.revealsCode) onCodeReveal && onCodeReveal(stage.revealsCode);
      }, stage.duration * 1000);
      return;
    }
    playSound(stage.sound);
    completeStage(node, chainType);
    if (stage.revealsCode) onCodeReveal && onCodeReveal(stage.revealsCode);
  }

  function submitCode(value) {
    if (!pendingCode) return;
    if (value === pendingCode.code) {
      playSound('lockClick');
      completeStage(pendingCode.node, pendingCode.chainType);
    }
    setPendingCode(null);
  }

  useEffect(() => {
    if (apiRef) {
      apiRef.current = {
        setKey: (dir, pressed) => { moveInputRef.current[dir] = pressed; },
        interact,
        submitCode,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomIndex, chainProgress, pendingCode, carriedOrbs, finaleStage]);

  useKeyboard(moveInputRef, () => interact(), [roomIndex, chainProgress, pendingCode, finaleStage]);

  function handleNear(id) {
    if (id !== nearIdRef.current) {
      nearIdRef.current = id;
      let label = null;
      if (id === 'DOOR') {
        label = roomIndex === rooms.length - 1 ? 'Open the final exit gate' : `Open ${room.doorLabel}`;
      } else if (id) {
        const node = [...room.keyChain, ...room.orbChain].find(n => n.objectId === id);
        if (node) {
          const stageIndex = chainProgress[node.objectId] || 0;
          label = node.stages[stageIndex] ? node.stages[stageIndex].prompt : null;
        }
      }
      onNearChange && onNearChange(id, label);
    }
  }

  const allNodes = [...room.keyChain, ...room.orbChain];
  const keyActive = getActiveNode(room.keyChain, chainProgress);
  const orbActive = getActiveNode(room.orbChain, chainProgress);
  const interactables = [];
  if (keyActive) interactables.push({ id: keyActive.objectId, position: keyActive.position });
  if (orbActive) interactables.push({ id: orbActive.objectId, position: orbActive.position });
  if (doorUnlocked && !doorOpenAnim) interactables.push({ id: 'DOOR', position: DOOR_POSITION });

  const initialCamZ = Math.min(PLAYER_START[2] + 6, (ROOM_BOUNDS.maxZ - ROOM_BOUNDS.minZ) / 2 + 0.75 - 1);
  // Both the well and the door block movement, so the player stops just
  // short of each instead of walking through/onto them (which, for the
  // door, used to leave it hidden behind the player's own body).
  const obstacles = [...allNodes, { position: WELL_POSITION }, { position: DOOR_POSITION }];

  return (
    <Canvas camera={{ position: [0, 5.6, initialCamZ], fov: 50 }} gl={{ antialias: true }} style={{ background: '#111018' }}>
      <fog attach="fog" args={['#111018', 14, 34]} />
      <RoomShell bounds={ROOM_BOUNDS} accent={room.accent} kind={room.id} />
      <Player posRef={posRef} orbCount={carriedOrbs.length} />
      <CameraRig posRef={posRef} bounds={ROOM_BOUNDS} />
      <PlayerController
        posRef={posRef}
        bounds={ROOM_BOUNDS}
        obstacles={obstacles}
        interactables={interactables}
        onNear={handleNear}
        moveInputRef={moveInputRef}
        onStep={() => playFootstep()}
      />

      {allNodes.map((node) => {
        const stageIndex = chainProgress[node.objectId] || 0;
        const done = stageIndex >= node.stages.length;
        const active = (keyActive && keyActive.objectId === node.objectId) || (orbActive && orbActive.objectId === node.objectId);
        const chainKind = room.keyChain.includes(node) ? 'key' : 'orb';
        return (
          <InteractiveObject
            key={node.objectId}
            node={node}
            stageIndex={stageIndex}
            done={done}
            active={active}
            animating={animatingId === node.objectId}
            accent={room.accent}
            kind={chainKind}
          />
        );
      })}

      <Well position={WELL_POSITION} unlocked={false} open={false} text={room.wellText} />
      <Door position={DOOR_POSITION} unlocked={doorUnlocked} open={doorOpenAnim || finaleStage === 'unlocked' || finaleStage === 'escaped'} />
    </Canvas>
  );
}

export { finale };
