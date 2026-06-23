import './style.css';
import { mountApp } from './ui/app';

const root = document.getElementById('app')!;
mountApp(root);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  });
  caches.keys().then(keys => {
    keys.forEach(k => caches.delete(k));
  });
}
