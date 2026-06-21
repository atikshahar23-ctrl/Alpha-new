// Keyboard shortcuts system — registers and displays
// global keyboard shortcuts for the application.

export interface Shortcut {
  keys: string;
  label: string;
  action: () => void;
}

const registered: Shortcut[] = [];

export function registerShortcut(keys: string, label: string, action: () => void) {
  registered.push({ keys, label, action });
}

export function getShortcuts(): Shortcut[] {
  return [...registered];
}

export function initShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    for (const s of registered) {
      if (matchKey(e, s.keys)) {
        e.preventDefault();
        s.action();
        return;
      }
    }
  });
}

function matchKey(e: KeyboardEvent, keys: string): boolean {
  const parts = keys.toLowerCase().split('+').map(p => p.trim());
  const needCtrl = parts.includes('ctrl') || parts.includes('cmd');
  const needShift = parts.includes('shift');
  const needAlt = parts.includes('alt');
  const key = parts.filter(p => !['ctrl', 'cmd', 'shift', 'alt'].includes(p))[0];
  if (needCtrl && !(e.ctrlKey || e.metaKey)) return false;
  if (needShift && !e.shiftKey) return false;
  if (needAlt && !e.altKey) return false;
  if (!needCtrl && (e.ctrlKey || e.metaKey)) return false;
  return e.key.toLowerCase() === key;
}

export function shortcutsHTML(): string {
  const groups = registered.map(s =>
    `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)">
      <span style="color:var(--dim)">${s.label}</span>
      <kbd style="background:rgba(255,255,255,.06);padding:2px 8px;border-radius:4px;font-size:12px;font-family:monospace;color:var(--gold)">${s.keys}</kbd>
    </div>`
  );
  return groups.join('');
}
