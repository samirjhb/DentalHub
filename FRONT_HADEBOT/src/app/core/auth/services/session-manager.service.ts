import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionManagerService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
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
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Store the refresh token in session storage
   * @param refreshToken The refresh token to store
   */
  setRefreshToken(refreshToken: string): void {
    sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Get the stored refresh token
   * @returns The refresh token or null if not found
   */
  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get an observable that emits the current authentication status
   * @returns Observable that emits true when authenticated, false otherwise
   */
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Decode the stored JWT's role claim, set by the backend on login/register.
   * @returns The role string, or null if there is no token or it can't be decoded
   */
  getRole(): string | null {
    return this.decodeTokenClaim('role');
  }

  /**
   * Decode the stored JWT's email claim.
   * @returns The email string, or null if there is no token or it can't be decoded
   */
  getEmail(): string | null {
    return this.decodeTokenClaim('email');
  }

  private decodeTokenClaim(claim: 'role' | 'email'): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded[claim] ?? null;
    } catch {
      return null;
    }
  }
}
