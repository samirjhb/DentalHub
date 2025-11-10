import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SessionManagerService } from '../../../services/session-manager.service';

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
   
   // Store the token in session storage
   if (response && response.token) {
     this.sessionManager.setToken(response.token);
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
    
    // Store the token in session storage
    if (response && response.token) {
      this.sessionManager.setToken(response.token);
    }
    
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Extract error message from the response
    let errorMessage = 'Error en el inicio de sesión';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Throw the error with the message so it can be caught by the component
    throw { message: errorMessage, originalError: error };
  }
}

logout() {
  // Clear the token from session storage
  this.sessionManager.clearToken();
}

isAuthenticated() {
  return this.sessionManager.isAuthenticated();
}

}
