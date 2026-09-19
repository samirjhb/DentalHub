import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/shared/material.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { SessionManagerService } from 'src/app/core/auth/services/session-manager.service';
import { ThemeService } from 'src/app/core/layout/services/theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
  ],
  templateUrl: './header.component.html',
  styles: [
    `
      .avatar-initials {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: var(--mat-sys-primary, #5d87ff);
        color: #fff;
        font-weight: 600;
        font-size: 0.95rem;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  // true cuando el sidenav de desktop está en modo compacto (solo íconos).
  @Input() sidenavCollapsed = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleSidenavCollapsed = new EventEmitter<void>();

  theme = this.themeService.theme;
  userEmail = this.sessionManager.getEmail() ?? '';
  initials = this.userEmail ? this.userEmail.charAt(0).toUpperCase() : '?';

  constructor(
    private authService: AuthService,
    private sessionManager: SessionManagerService,
    private router: Router,
    private themeService: ThemeService,
  ) {}

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    // Llamar al método logout del servicio de autenticación
    this.authService.logout();
    // Redirigir al usuario a la página de login
    this.router.navigate(['/authentication/login']);
  }
}