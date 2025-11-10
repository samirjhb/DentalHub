import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { NgFor, NgIf, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AiChatService, ChatMessage } from '../../../services/ai-chat.service';

// La interfaz ChatMessage ahora se importa desde el servicio AiChatService

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MaterialModule,
    NgFor,
    NgIf,
    CommonModule,
    FormsModule,
    TablerIconsModule,
    DatePipe
  ],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss']
})
export class AppChatComponent implements OnInit, AfterViewChecked {
  // Referencias al elemento de mensajes para auto-scroll
  @ViewChild('scrollMe') private messagesContainer: ElementRef;
  
  // Propiedades del chat
  messages: ChatMessage[] = [];
  currentMessage: string = '';
  isTyping: boolean = false;
  selectedImage: File | null = null;
  selectedImageUrl: string | null = null;
  
  // Sugerencias de preguntas frecuentes
  suggestions: string[] = [
    '¿Cómo cepillar correctamente?',
    '¿Cuándo debo visitar al dentista?',
    '¿Qué hacer en caso de dolor dental?',
    '¿Cómo prevenir caries?',
    '¿Puedes analizar esta radiografía dental?'
  ];
  
  // Base de conocimiento para el chatbot
  private knowledgeBase: Record<string, string[]> = {
    saludos: [
      'Hola, soy HadeBot, tu asistente dental virtual. ¿En qué puedo ayudarte hoy?',
      '¡Bienvenido! Soy HadeBot, estoy aquí para resolver tus dudas sobre salud dental.',
      'Hola, soy el asistente virtual de la clínica. ¿Tienes alguna consulta dental?'
    ],
    cepillado: [
      'Para un cepillado correcto, debes:<br>1. Usar un cepillo de cerdas suaves<br>2. Cepillar en un ángulo de 45 grados hacia la encía<br>3. Realizar movimientos cortos y suaves<br>4. Cepillar todas las superficies: externa, interna y masticatoria<br>5. No olvidar cepillar la lengua<br>6. El cepillado debe durar al menos 2 minutos<br>7. Cepillarse al menos 2 veces al día'
    ],
    visita_dentista: [
      'Se recomienda visitar al dentista cada 6 meses para una revisión y limpieza profesional. Sin embargo, si presentas dolor, sangrado de encías, sensibilidad o cualquier otra molestia, debes acudir inmediatamente sin esperar a tu cita programada.'
    ],
    dolor_dental: [
      'En caso de dolor dental:<br>1. Enjuaga con agua tibia con sal<br>2. Usa hilo dental para remover posibles restos de comida<br>3. Toma un analgésico de venta libre siguiendo las indicaciones<br>4. Aplica una compresa fría en la mejilla<br>5. Evita alimentos muy fríos, calientes o duros<br>6. Contacta a tu dentista lo antes posible para una evaluación'
    ],
    prevencion_caries: [
      'Para prevenir caries:<br>1. Cepilla tus dientes al menos dos veces al día con pasta fluorada<br>2. Usa hilo dental diariamente<br>3. Limita el consumo de alimentos azucarados y bebidas ácidas<br>4. Visita al dentista regularmente<br>5. Considera selladores dentales para niños<br>6. Usa enjuague bucal con flúor<br>7. Mantén una buena hidratación bebiendo agua'
    ],
    hilo_dental: [
      'El uso correcto del hilo dental incluye:<br>1. Usar aproximadamente 45 cm de hilo<br>2. Enrollar la mayor parte en un dedo y un poco en el dedo de la otra mano<br>3. Sostener el hilo con firmeza entre los pulgares e índices<br>4. Guiar suavemente el hilo entre los dientes con movimientos de zigzag<br>5. Curvar el hilo alrededor de cada diente formando una "C"<br>6. Deslizar de arriba a abajo contra el diente y bajo la línea de la encía<br>7. Usar una sección limpia de hilo para cada diente'
    ],
    blanqueamiento: [
      'El blanqueamiento dental es un procedimiento estético que aclara el tono de los dientes. Existen opciones profesionales en consultorio y tratamientos caseros supervisados por el dentista. Los métodos de consultorio son más rápidos y efectivos, mientras que los caseros son más graduales. Es importante consultar con tu dentista antes de cualquier tratamiento, ya que no todos los tipos de manchas responden al blanqueamiento y algunas personas pueden experimentar sensibilidad.'
    ],
    sensibilidad: [
      'La sensibilidad dental puede tratarse con:<br>1. Pastas dentales específicas para dientes sensibles<br>2. Cepillos de cerdas suaves<br>3. Evitar alimentos muy fríos o calientes<br>4. Aplicación profesional de flúor o selladores<br>5. Tratamientos de conducto en casos severos<br>Si experimentas sensibilidad, consulta con tu dentista para determinar la causa exacta y el mejor tratamiento.'
    ],
    implantes: [
      'Los implantes dentales son raíces artificiales de titanio que se colocan en el hueso maxilar para reemplazar dientes perdidos. Sobre ellos se coloca una corona que simula un diente natural. Son una solución permanente con alta tasa de éxito (95-98%) y pueden durar toda la vida con el cuidado adecuado. El procedimiento requiere cirugía y un periodo de osteointegración de 3-6 meses.'
    ],
    ortodoncia: [
      'La ortodoncia es la especialidad dental que corrige la posición de los dientes y maxilares. Existen diferentes opciones como brackets metálicos, cerámicos, linguales y alineadores transparentes. El tratamiento puede durar entre 18-36 meses dependiendo de la complejidad. Además de mejorar la estética, la ortodoncia corrige problemas de mordida y facilita la higiene dental.'
    ],
    default: [
      'Lo siento, no tengo información específica sobre eso. ¿Puedo ayudarte con otro tema dental? También puedes contactar directamente con la clínica para consultas más específicas.',
      'Esa es una buena pregunta, pero necesitaría más información. ¿Podrías ser más específico o preguntar sobre otro tema dental?',
      'No tengo suficiente información sobre eso en este momento. Te recomendaría consultar directamente con tu dentista para una respuesta más precisa.'
    ]
  };
  
  constructor(
    private aiChatService: AiChatService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit() {
    // Mensaje de bienvenida al iniciar el chat
    setTimeout(() => {
      this.addBotMessage(this.getRandomResponse('saludos'));
    }, 500);
  }
  
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  
  // Método para enviar un mensaje del usuario
  sendMessage() {
    if (this.currentMessage.trim() === '' && !this.selectedImage) return;
    
    // Agregar mensaje del usuario
    this.addUserMessage(this.currentMessage, this.selectedImageUrl);
    
    // Guardar el mensaje y limpiar el input
    const userMessage = this.currentMessage;
    this.currentMessage = '';
    
    // Simular que el bot está escribiendo
    this.isTyping = true;
    
    // Si hay una imagen seleccionada, la enviamos junto con el mensaje
    if (this.selectedImage) {
      this.sendMessageWithImage(userMessage, this.selectedImage);
    } else {
      // Si no hay imagen, enviamos solo el mensaje de texto
      this.sendTextMessage(userMessage);
    }
    
    // Limpiar la imagen seleccionada
    this.selectedImage = null;
    this.selectedImageUrl = null;
  }
  
  // Método para enviar un mensaje de texto a Claude
  private sendTextMessage(message: string) {
    this.aiChatService.sendMessage(message, this.messages).subscribe({
      next: (response) => {
        this.isTyping = false;
        this.handleClaudeResponse(response);
      },
      error: (error) => {
        this.isTyping = false;
        console.error('Error al enviar mensaje a Claude:', error);
        this.snackBar.open('Error al comunicarse con el asistente AI', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        // Fallback a la respuesta local si hay un error
        this.respondToMessageLocally(message);
      }
    });
  }
  
  // Método para enviar un mensaje con imagen a Claude
  private sendMessageWithImage(message: string, image: File) {
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = () => {
      // Extraer la parte base64 de la cadena data URL
      const base64Image = reader.result?.toString().split(',')[1];
      
      if (base64Image) {
        this.aiChatService.sendMessageWithImage(message, base64Image, this.messages).subscribe({
          next: (response) => {
            this.isTyping = false;
            this.handleClaudeResponse(response);
          },
          error: (error) => {
            this.isTyping = false;
            console.error('Error al enviar imagen a Claude:', error);
            this.snackBar.open('Error al procesar la imagen', 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            // Fallback a la respuesta local si hay un error
            this.respondToMessageLocally(message);
          }
        });
      } else {
        this.isTyping = false;
        this.snackBar.open('Error al procesar la imagen', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        // Fallback a la respuesta local si hay un error
        this.respondToMessageLocally(message);
      }
    };
    reader.onerror = (error) => {
      this.isTyping = false;
      console.error('Error al leer la imagen:', error);
      this.snackBar.open('Error al procesar la imagen', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      // Fallback a la respuesta local si hay un error
      this.respondToMessageLocally(message);
    };
  }
  
  // Método para manejar la respuesta de Claude
  private handleClaudeResponse(response: any) {
    try {
      // Extraer el texto de la respuesta de Claude
      const responseText = response.content[0].text;
      this.addBotMessage(responseText);
    } catch (error) {
      console.error('Error al procesar la respuesta de Claude:', error);
      this.snackBar.open('Error al procesar la respuesta del asistente', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      // Usar una respuesta genérica en caso de error
      this.addBotMessage(this.getRandomResponse('default'));
    }
  }
  
  // Método para seleccionar una sugerencia
  selectSuggestion(suggestion: string) {
    this.currentMessage = suggestion;
    this.sendMessage();
  }
  
  // Método para agregar un mensaje del usuario
  private addUserMessage(text: string, imageUrl?: string | null) {
    this.messages.push({
      text: text,
      sender: 'user',
      time: new Date(),
      imageUrl: imageUrl || undefined
    });
  }
  
  // Método para agregar un mensaje del bot
  private addBotMessage(text: string) {
    this.messages.push({
      text: text,
      sender: 'bot',
      time: new Date()
    });
  }
  
  // Método para responder localmente al mensaje del usuario (fallback si Claude falla)
  private respondToMessageLocally(message: string) {
    const lowerMessage = message.toLowerCase();
    
    // Determinar la categoría de la pregunta
    if (this.containsAny(lowerMessage, ['hola', 'buenos días', 'buenas tardes', 'saludos', 'hey'])) {
      this.addBotMessage(this.getRandomResponse('saludos'));
    }
    else if (this.containsAny(lowerMessage, ['cepillar', 'cepillado', 'cepillo', 'lavar dientes', 'limpieza dental'])) {
      this.addBotMessage(this.getRandomResponse('cepillado'));
    }
    else if (this.containsAny(lowerMessage, ['visita', 'dentista', 'consulta', 'revisión', 'chequeo', 'cuándo ir', 'cuándo visitar'])) {
      this.addBotMessage(this.getRandomResponse('visita_dentista'));
    }
    else if (this.containsAny(lowerMessage, ['dolor', 'duele', 'molestia', 'muela', 'emergencia'])) {
      this.addBotMessage(this.getRandomResponse('dolor_dental'));
    }
    else if (this.containsAny(lowerMessage, ['caries', 'prevenir', 'prevención', 'evitar caries', 'proteger'])) {
      this.addBotMessage(this.getRandomResponse('prevencion_caries'));
    }
    else if (this.containsAny(lowerMessage, ['hilo', 'hilo dental', 'seda dental', 'usar hilo'])) {
      this.addBotMessage(this.getRandomResponse('hilo_dental'));
    }
    else if (this.containsAny(lowerMessage, ['blanquear', 'blanqueamiento', 'dientes blancos', 'aclarar', 'blanquear dientes'])) {
      this.addBotMessage(this.getRandomResponse('blanqueamiento'));
    }
    else if (this.containsAny(lowerMessage, ['sensibilidad', 'sensible', 'dientes sensibles', 'duele con frío', 'duele con calor'])) {
      this.addBotMessage(this.getRandomResponse('sensibilidad'));
    }
    else if (this.containsAny(lowerMessage, ['implante', 'implantes', 'diente artificial', 'reemplazo'])) {
      this.addBotMessage(this.getRandomResponse('implantes'));
    }
    else if (this.containsAny(lowerMessage, ['ortodoncia', 'brackets', 'alineadores', 'invisalign', 'frenos'])) {
      this.addBotMessage(this.getRandomResponse('ortodoncia'));
    }
    else if (this.containsAny(lowerMessage, ['radiografía', 'imagen', 'foto', 'analizar', 'ver'])) {
      this.addBotMessage('Para analizar correctamente una radiografía o imagen dental, necesito que me la envíes. Puedes usar el botón de adjuntar imagen junto al campo de mensaje. Una vez que reciba la imagen, podré darte un análisis detallado.');
    }
    else {
      this.addBotMessage(this.getRandomResponse('default'));
    }
  }
  
  // Método para seleccionar una imagen
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
      
      // Crear una URL para previsualizar la imagen
      this.selectedImageUrl = URL.createObjectURL(this.selectedImage);
      
      // Si es una imagen muy grande, mostrar advertencia
      if (this.selectedImage.size > 5 * 1024 * 1024) { // 5MB
        this.snackBar.open('La imagen es muy grande y puede afectar el rendimiento', 'Entendido', {
          duration: 5000
        });
      }
    }
  }
  
  // Método para eliminar la imagen seleccionada
  removeSelectedImage() {
    this.selectedImage = null;
    if (this.selectedImageUrl) {
      URL.revokeObjectURL(this.selectedImageUrl);
      this.selectedImageUrl = null;
    }
  }
  
  // Método para verificar si un mensaje contiene alguna de las palabras clave
  private containsAny(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }
  
  // Método para obtener una respuesta aleatoria de una categoría
  private getRandomResponse(category: string): string {
    const responses = this.knowledgeBase[category] || this.knowledgeBase['default'];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }
  
  // Método para hacer scroll al último mensaje
  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
