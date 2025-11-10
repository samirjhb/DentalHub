import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  time: Date;
  imageUrl?: string;
}

// Interfaces que coinciden exactamente con el DTO del backend
interface ContentItem {
  type: string;
  text?: string;
  source?: {
    type: string;
    media_type: string;
    data: string;
  };
}

interface MessageItem {
  role: string;
  content: ContentItem[];
}

interface ClaudeRequest {
  messages: MessageItem[];
  model?: string;
  max_tokens?: number;
}

interface ClaudeResponse {
  success: boolean;
  content: Array<{
    type: string;
    text: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl = `${environment.apiUrl}/ai`; // Ruta para el servicio de IA

  constructor(private http: HttpClient) { }

  // Método para enviar un mensaje de texto
  sendMessage(message: string, conversation: ChatMessage[]): Observable<any> {
    // Preparar mensajes en el formato que espera el backend
    const messages = this.formatConversation(conversation, message);
    
    const requestBody: ClaudeRequest = {
      messages: messages,
      max_tokens: 2000
    };

    console.log('Enviando solicitud al backend:', JSON.stringify(requestBody));
    return this.http.post<ClaudeResponse>(`${this.apiUrl}/chat`, requestBody);
  }

  // Método para enviar un mensaje con imagen
  sendMessageWithImage(message: string, imageBase64: string, conversation: ChatMessage[]): Observable<any> {
    // Preparar mensajes en el formato que espera el backend
    const messages = this.formatConversation(conversation, message, imageBase64);
    
    const requestBody: ClaudeRequest = {
      messages: messages,
      max_tokens: 2000
    };

    console.log('Enviando solicitud con imagen al backend:', JSON.stringify(requestBody));
    return this.http.post<ClaudeResponse>(`${this.apiUrl}/chat`, requestBody);
  }

  // Método para formatear la conversación en el formato que espera el backend
  private formatConversation(conversation: ChatMessage[], newMessage: string, imageBase64?: string): MessageItem[] {
    const messages: MessageItem[] = [];
    
    // Si hay conversación previa, añadir solo el último mensaje del asistente
    if (conversation.length > 0) {
      // Encontrar el último mensaje del asistente
      for (let i = conversation.length - 1; i >= 0; i--) {
        if (conversation[i].sender === 'bot') {
          messages.push({
            role: 'assistant',
            content: [{
              type: 'text',
              text: conversation[i].text
            }]
          });
          break;
        }
      }
    }
    
    // Agregar el nuevo mensaje del usuario
    const userMessage: MessageItem = {
      role: 'user',
      content: [{
        type: 'text',
        text: newMessage
      }]
    };
    
    // Si hay una imagen, añadirla al mensaje
    if (imageBase64) {
      userMessage.content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: imageBase64
        }
      });
    }
    
    messages.push(userMessage);
    
    return messages;
  }
}
