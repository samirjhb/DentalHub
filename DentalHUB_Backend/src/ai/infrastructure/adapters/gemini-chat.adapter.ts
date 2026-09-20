import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AiChatGateway } from '../../domain/gateways/ai-chat.gateway';
import { ClaudeRequestDto } from '../../application/dto/claude-request.dto';

const SYSTEM_PROMPT =
  'Eres un asistente dental especializado. Tu objetivo es proporcionar información precisa y útil sobre salud bucal, tratamientos dentales y prácticas de higiene oral. Puedes analizar imágenes de radiografías dentales, fotografías de dientes o encías para identificar posibles problemas. Recuerda que no estás reemplazando el diagnóstico profesional y siempre debes recomendar consultar a un dentista para evaluaciones precisas. Adapta tu lenguaje para ser comprensible por pacientes sin conocimientos técnicos, pero mantén la precisión científica.';

@Injectable()
export class GeminiChatAdapter extends AiChatGateway {
  private readonly logger = new Logger(GeminiChatAdapter.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.model =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-3.6-flash';

    if (!this.apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY no está configurada — el chat con IA fallará hasta que se defina.',
      );
    } else {
      this.logger.log(`Usando Gemini API con modelo: ${this.model}`);
    }
  }

  async chat(claudeRequestDto: ClaudeRequestDto) {
    if (!this.apiKey) {
      throw new HttpException(
        {
          success: false,
          message: 'GEMINI_API_KEY no está configurada en el servidor',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const contents = claudeRequestDto.messages.map((message) => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: message.content.map((item) =>
          item.type === 'image' && item.source
            ? {
                inline_data: {
                  mime_type: item.source.media_type,
                  data: item.source.data,
                },
              }
            : { text: item.text || '' },
        ),
      }));

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${
        claudeRequestDto.model || this.model
      }:generateContent?key=${this.apiKey}`;

      const response = await lastValueFrom(
        this.httpService.post<any>(
          url,
          {
            contents,
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            generationConfig: {
              maxOutputTokens: claudeRequestDto.max_tokens || 4000,
              temperature: 0.7,
            },
          },
          { headers: { 'Content-Type': 'application/json' } },
        ),
      );

      const text =
        response.data.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text || '')
          .join('') || 'No se pudo obtener una respuesta';

      return {
        success: true,
        content: [{ type: 'text', text }],
      };
    } catch (error) {
      this.logger.error(
        `Error al comunicarse con Gemini API: ${JSON.stringify(
          error.response?.data || error.message,
        )}`,
      );

      throw new HttpException(
        {
          success: false,
          message: 'Error al comunicarse con Gemini API',
          error: error.response?.data || error.message,
        },
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
