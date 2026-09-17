import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'dentalhub-theme';

// localStorage, no sessionStorage como el token (SessionManagerService) — la
// preferencia de tema debe persistir entre sesiones, no expirar con el login.
function readStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themeSignal = signal<ThemeMode>(readStoredTheme());

  theme = this.themeSignal.asReadonly();

  setTheme(mode: ThemeMode): void {
    this.themeSignal.set(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // localStorage no disponible (modo privado, etc.) — el tema sigue
      // funcionando en memoria para esta sesión, solo no persiste.
    }
  }

  toggle(): void {
    this.setTheme(this.themeSignal() === 'light' ? 'dark' : 'light');
  }
}
