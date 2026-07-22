import { useMemo } from 'react';
import * as THREE from 'three';

// Shared canvas->CanvasTexture drawing used anywhere a prop needs to render
// live text onto a 3D surface (blackboard codes, the well's plaque, scattered
// wall/floor/ceiling lore). Centralized so each caller only supplies the
// canvas size/font/colors and, optionally, a custom `draw` for multi-line
// layouts — the canvas setup/texture wiring is otherwise identical everywhere.
export function useCanvasTextTexture(text, {
  width = 512,
  height = 200,
  background = null, // null leaves the canvas transparent (alpha channel)
  color = '#e8e4d8',
  font = 'italic 40px Georgia, serif',
  border = null,
  draw = null,
} = {}) {
  return useMemo(() => {
    if (typeof document === 'undefined' || !text) return null;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    }
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, width - 20, height - 20);
    }
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = font;
    if (draw) {
      draw(ctx, text, width, height);
    } else {
      ctx.fillText(text, width / 2, height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [text, width, height, background, color, font, border, draw]);
}
