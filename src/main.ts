import './style.css';
import { mountApp } from './ui/app';

const root = document.getElementById('app')!;
mountApp(root);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/Alpha-new/sw.js').catch(() => {});
}
