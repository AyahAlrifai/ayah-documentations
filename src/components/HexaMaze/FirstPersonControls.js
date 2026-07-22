import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

// Mouse (Pointer Lock) + touch-drag look control. Mutates lookRef.{yaw,pitch}
// directly each event (no re-renders), matching the posRef/moveInputRef
// pattern the rest of the game loop already uses in SceneShell.js.
const MOUSE_SENSITIVITY = 0.0022;
const TOUCH_SENSITIVITY = 0.0055;
const PITCH_LIMIT = 1.4; // just short of +/-90deg, avoids the camera flipping over

export function LookControls({ lookRef, onLockChange }) {
  const { gl } = useThree();
  const touchRef = useRef(null);

  useEffect(() => {
    const el = gl.domElement;

    const onMouseMove = (e) => {
      if (document.pointerLockElement !== el) return;
      lookRef.current.yaw -= e.movementX * MOUSE_SENSITIVITY;
      lookRef.current.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, lookRef.current.pitch - e.movementY * MOUSE_SENSITIVITY));
    };
    const onClick = () => {
      if (document.pointerLockElement === el) return;
      const request = el.requestPointerLock();
      if (request && request.catch) request.catch(() => {}); // touch devices / user gesture edge cases
    };
    const onPointerLockChange = () => {
      onLockChange && onLockChange(document.pointerLockElement === el);
    };

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e) => {
      if (!touchRef.current || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - touchRef.current.x;
      const dy = t.clientY - touchRef.current.y;
      touchRef.current = { x: t.clientX, y: t.clientY };
      lookRef.current.yaw -= dx * TOUCH_SENSITIVITY;
      lookRef.current.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, lookRef.current.pitch - dy * TOUCH_SENSITIVITY));
    };
    const onTouchEnd = () => { touchRef.current = null; };

    el.addEventListener('click', onClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('click', onClick);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [gl, lookRef, onLockChange]);

  return null;
}
