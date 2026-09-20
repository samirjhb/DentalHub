import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SessionManagerService } from './session-manager.service';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  CREDENCIALES_INVALIDAS: 'Email o contraseña incorrectos',
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

constructor(
  private http: HttpClient,
  private sessionManager: SessionManagerService
) { }

async registerService(data: any) {
  try {
   const response: any = await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/register`, data));
   console.log(response);
   
   // Store the tokens in session storage
   if (response && response.token) {
     this.sessionManager.setToken(response.token);
   }
   if (response && response.refreshToken) {
     this.sessionManager.setRefreshToken(response.refreshToken);
   }

   return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Extract error message from the response
    let errorMessage = 'Error en el registro';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Throw the error with the message so it can be caught by the component
    throw { message: errorMessage, originalError: error };
  }
}

async loginService(data: any) {
  try {
    const response: any = await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/login`, data));
    console.log(response);
    
    // Store the tokens in session storage
    if (response && response.token) {
      this.sessionManager.setToken(response.token);
    }
    if (response && response.refreshToken) {
      this.sessionManager.setRefreshToken(response.refreshToken);
    }

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Extract error message from the response
    let errorMessage = 'Error en el inicio de sesión';
    if (error.error && error.error.message) {
      errorMessage = LOGIN_ERROR_MESSAGES[error.error.message] || error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Throw the error with the message so it can be caught by the component
    throw { message: errorMessage, originalError: error };
  }
}

async forgotPasswordService(email: string) {
  try {
    return await firstValueFrom(
      this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email }),
    );
  } catch (error: any) {
    const errorMessage = error.error?.message || error.message || 'Error al solicitar el enlace de recuperación';
    throw { message: errorMessage, originalError: error };
  }
}

async resetPasswordService(token: string, newPassword: string) {
  try {
    return await firstValueFrom(
      this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword }),
    );
  } catch (error: any) {
    const errorMessage = error.error?.message || error.message || 'Error al restablecer la contraseña';
    throw { message: errorMessage, originalError: error };
  }
}

logout() {
  // Revocar el refresh token en el backend (best-effort, no bloquea la UI) antes
  // de limpiar la sesión local.
  const refreshToken = this.sessionManager.getRefreshToken();
  if (refreshToken) {
    this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe({
      error: () => {}
    });
  }
  this.sessionManager.clearToken();
}

isAuthenticated() {
  return this.sessionManager.isAuthenticated();
}

}
