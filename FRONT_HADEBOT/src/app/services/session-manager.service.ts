import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionManagerService {
  private readonly TOKEN_KEY = 'auth_token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor() { }

  /**
   * Store authentication token in session storage
   * @param token The authentication token to store
   */
  setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Get the stored authentication token
   * @returns The authentication token or null if not found
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if a token exists in session storage
   * @returns True if a token exists, false otherwise
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Remove the authentication token from session storage
   */
  clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get an observable that emits the current authentication status
   * @returns Observable that emits true when authenticated, false otherwise
   */
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }
}
