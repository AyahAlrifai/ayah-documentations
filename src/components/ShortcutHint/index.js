import React, { useState, useEffect, useRef } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import styles from '../../css/style.module.css';

/**
 * ShortcutHint — ⓘ button that reveals a keyboard-shortcut popover.
 *
 * Props:
 *   shortcuts  {Array}  Each entry is either:
 *     { keys: ['Ctrl', 'Enter'], label: 'Format' }   ← a key combo
 *     { note: 'Auto-processes as you type' }          ← a plain note
 */
export default function ShortcutHint({ shortcuts = [] }) {
  const { colorMode } = useColorMode();
  const dark = colorMode === 'dark';
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={wrapRef} className={styles.shortcutWrap}>
      <button
        className={`${styles.tBtn} ${styles.tBtnGhost} ${styles.shortcutInfoBtn}`}
        onClick={() => setOpen(o => !o)}
        title="Keyboard shortcuts"
        aria-label="Show keyboard shortcuts"
        aria-expanded={open}
      >
        ⓘ
      </button>

      {open && (
        <div className={`${styles.shortcutPopover} ${dark ? styles.shortcutPopoverDark : styles.shortcutPopoverLight}`}>
          <div className={styles.shortcutPopoverTitle}>Keyboard Shortcuts</div>

          {shortcuts.map((entry, i) =>
            entry.note ? (
              <div key={i} className={`${styles.shortcutNote} ${dark ? styles.shortcutNoteDark : styles.shortcutNoteLight}`}>
                {entry.note}
              </div>
            ) : (
              <div key={i} className={styles.shortcutRow}>
                <span className={`${styles.shortcutLabel} ${dark ? styles.shortcutLabelDark : styles.shortcutLabelLight}`}>
                  {entry.label}
                </span>
                <div className={styles.shortcutKeys}>
                  {entry.keys.map((k, j) => (
                    <React.Fragment key={j}>
                      {j > 0 && <span className={styles.shortcutPlus}>+</span>}
                      <kbd className={`${styles.shortcutKbd} ${dark ? styles.shortcutKbdDark : styles.shortcutKbdLight}`}>
                        {k}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
