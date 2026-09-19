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
    if (allowedRoles.includes(role as Role)) return true;

    // /dashboard también pasa por este guard (ver app.routes.ts) — un PATIENT
    // bloqueado ahí NUNCA puede caer de vuelta en '/dashboard', o se produce
    // un loop de redirección infinito. Cada rol tiene un "home" distinto.
    const fallback = role === Role.PATIENT ? '/portal-paciente/mis-citas' : '/dashboard';
    return this.router.createUrlTree([fallback]);
  }
}
