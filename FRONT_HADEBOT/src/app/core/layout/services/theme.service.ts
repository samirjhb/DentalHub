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

  constructor() {
    // Los diálogos, mat-select/mat-menu, tooltips y snackbars de Angular
    // Material se renderizan vía CDK Overlay directo en <body>, FUERA del
    // árbol de mat-sidenav-container donde full.component.html pone la
    // clase .dark-theme — las variables --mat-sys-* de dark-theme-variables
    // (scope "html .dark-theme") nunca llegaban a esos overlays y quedaban
    // siempre con el tema claro sin importar el toggle. Poniendo la misma
    // clase en <body> las variables (custom properties, heredables) llegan
    // por igual a todo el árbol, overlays incluidos.
    this.applyBodyClass(this.themeSignal());
  }

  setTheme(mode: ThemeMode): void {
    this.themeSignal.set(mode);
    this.applyBodyClass(mode);
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

  private applyBodyClass(mode: ThemeMode): void {
    document.body.classList.toggle('dark-theme', mode === 'dark');
    document.body.classList.toggle('light-theme', mode === 'light');
  }
}
