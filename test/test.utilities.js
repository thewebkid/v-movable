import { sendMouse, resetMouse } from '@web/test-runner-commands';

/** Viewport-center of an element, rounded for CDP mouse coordinates. */
export const findCenter = (element) => {
  const { top, left, height, width } = element.getBoundingClientRect();
  return [Math.round(left + width / 2), Math.round(top + height / 2)];
};

/**
 * Drag with real browser mouse input (CDP via sendMouse).
 * Synthetic PointerEvents cannot activate setPointerCapture, so interaction
 * coverage must go through native input.
 */
/**
 * Drag with real browser mouse input (CDP via sendMouse).
 * Moves in several steps so the engine sees multiple pointermove events and
 * pointer capture is established before motion.
 */
export const dragBy = async (element, dx, dy) => {
  const [x, y] = findCenter(element);
  await sendMouse({ type: 'move', position: [x, y] });
  await sendMouse({ type: 'down' });
  const steps = 4;
  for (let i = 1; i <= steps; i += 1) {
    await sendMouse({
      type: 'move',
      position: [Math.round(x + (dx * i) / steps), Math.round(y + (dy * i) / steps)],
    });
  }
  await sendMouse({ type: 'up' });
};

export const releaseMouse = () => resetMouse();

export const px = (value) => Number(String(value).replace(/px$/, '') || 0);

/** Wait until the lit-movable element has finished its first update (listeners bound). */
export const whenReady = async (el) => {
  if (el && typeof el.updateComplete?.then === 'function') {
    await el.updateComplete;
  }
  // Two rAFs so the engine's firstUpdated (pointerdown binding) has run.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
};
