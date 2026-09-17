import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { SessionManagerService } from '../services/session-manager.service';
import { Role } from '../enums/role.enum';

// Defensa en profundidad de UX, no de seguridad real — el backend ya aplica
// la misma matriz de roles y sigue siendo la autoridad en cada request. Esto
// solo evita que un rol sin acceso vea una pantalla que de todos modos le
// devolvería 403 en cada llamada.
@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private sessionManager: SessionManagerService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRoles = route.data['roles'] as Role[] | undefined;
    if (!allowedRoles) return true;

    const role = this.sessionManager.getRole();
    return allowedRoles.includes(role as Role)
      ? true
      : this.router.createUrlTree(['/dashboard']);
  }
}
