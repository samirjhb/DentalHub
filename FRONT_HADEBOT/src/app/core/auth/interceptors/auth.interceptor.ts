import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { SessionManagerService } from '../services/session-manager.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

// Un 401 en estas rutas es "credenciales/refresh token inválido", no "access token
// vencido" — nunca deben disparar un intento de refresh (evitaría además un loop,
// ya que /auth/refresh pasa por este mismo interceptor).
const AUTH_EXCLUDED_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

interface RefreshResponse {
  token: string;
  refreshToken: string;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshedToken$ = new BehaviorSubject<string | null>(null);

  constructor(
    private sessionManager: SessionManagerService,
    private router: Router,
    private http: HttpClient
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.sessionManager.getToken();
    const authReq = token
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        const isExcluded = AUTH_EXCLUDED_PATHS.some((path) => request.url.includes(path));
        if (error.status === 401 && !isExcluded) {
          return this.handle401(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshedToken$.next(null);

      const refreshToken = this.sessionManager.getRefreshToken();
      if (!refreshToken) {
        this.isRefreshing = false;
        this.logoutAndRedirect();
        return throwError(() => new Error('No refresh token available'));
      }

      return this.http
        .post<RefreshResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
        .pipe(
          switchMap((response) => {
            this.isRefreshing = false;
            this.sessionManager.setToken(response.token);
            this.sessionManager.setRefreshToken(response.refreshToken);
            this.refreshedToken$.next(response.token);
            return next.handle(
              request.clone({ setHeaders: { Authorization: `Bearer ${response.token}` } })
            );
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.logoutAndRedirect();
            return throwError(() => err);
          })
        );
    }

    return this.refreshedToken$.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) =>
        next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
      )
    );
  }

  private logoutAndRedirect(): void {
    this.sessionManager.clearToken();
    this.router.navigate(['/authentication/login']);
  }
}
