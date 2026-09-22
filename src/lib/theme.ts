import { safeStorage } from './storage';
export type Theme = 'dark' | 'light';
const KEY = 'builda99.theme';
export function savedTheme(): Theme {
  return safeStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
}
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f3f5f6' : '#06090b');
  safeStorage.setItem(KEY, theme);
}
