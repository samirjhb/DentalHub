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

      const requestBody = {
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
          maxOutputTokens: claudeRequestDto.max_tokens || 4000,
          temperature: 0.7,
        },
      };

      const response = await this.postWithRetry(url, requestBody);

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

  // Google devuelve 503 (modelo con alta demanda) o 403 SERVICE_DISABLED
  // (propagación de activación de API) de forma intermitente en proyectos
  // nuevos, ambos transitorios — reintentamos un par de veces antes de fallar.
  private async postWithRetry(url: string, body: unknown, attempt = 1): Promise<any> {
    try {
      return await lastValueFrom(
        this.httpService.post<any>(url, body, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    } catch (error) {
      const status = error.response?.status;
      const reason = error.response?.data?.error?.details?.find(
        (d: any) => d.reason,
      )?.reason;
      const isTransient = status === 503 || reason === 'SERVICE_DISABLED';

      if (isTransient && attempt < 3) {
        const delayMs = attempt * 800;
        this.logger.warn(
          `Gemini respondió ${status} (intento ${attempt}/3), reintentando en ${delayMs}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.postWithRetry(url, body, attempt + 1);
      }

      throw error;
    }
  }
}
