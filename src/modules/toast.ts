// Toast Notifications — lightweight, non-blocking notification toasts.

let container: HTMLElement | null = null;

function ensureContainer(): HTMLElement {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'toast-container';
  container.id = 'toastContainer';
  document.body.appendChild(container);
  return container;
}

export interface ToastOptions {
  icon?: string;
  title: string;
  text?: string;
  duration?: number;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const TYPE_ICONS: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

export function showToast(opts: ToastOptions): void {
  const c = ensureContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';

  const icon = opts.icon || TYPE_ICONS[opts.type || 'info'] || 'ℹ️';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-body">
      <div class="toast-title">${opts.title}</div>
      ${opts.text ? `<div class="toast-text">${opts.text}</div>` : ''}
    </div>
    <button class="toast-close">✕</button>
  `;

  const close = () => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close')!.addEventListener('click', close);

  c.appendChild(toast);

  const duration = opts.duration ?? 4000;
  if (duration > 0) setTimeout(close, duration);

  if (c.children.length > 5) {
    c.firstElementChild?.remove();
  }
}

export function toastSuccess(title: string, text?: string) {
  showToast({ type: 'success', title, text });
}
export function toastError(title: string, text?: string) {
  showToast({ type: 'error', title, text, duration: 6000 });
}
export function toastInfo(title: string, text?: string) {
  showToast({ type: 'info', title, text });
}
export function toastWarning(title: string, text?: string) {
  showToast({ type: 'warning', title, text, duration: 5000 });
}
