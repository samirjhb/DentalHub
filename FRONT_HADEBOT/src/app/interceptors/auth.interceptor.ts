import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionManagerService } from '../services/session-manager.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private sessionManager: SessionManagerService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token from the session manager
    const token = this.sessionManager.getToken();

    // If token exists, clone the request and add the authorization header
    if (token) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Handle the authenticated request
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // If we get a 401 Unauthorized response, clear the token and redirect to login
          if (error.status === 401) {
            this.sessionManager.clearToken();
            this.router.navigate(['/authentication/login']);
          }
          return throwError(() => error);
        })
      );
    }
    
    // If no token, proceed with the original request
    return next.handle(request);
  }
}
