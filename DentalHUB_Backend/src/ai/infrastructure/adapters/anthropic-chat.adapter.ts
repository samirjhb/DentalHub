import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AiChatGateway } from '../../domain/gateways/ai-chat.gateway';
import { ClaudeRequestDto } from '../../application/dto/claude-request.dto';

const SYSTEM_PROMPT =
  'Eres un asistente dental especializado. Tu objetivo es proporcionar información precisa y útil sobre salud bucal, tratamientos dentales y prácticas de higiene oral. Puedes analizar imágenes de radiografías dentales, fotografías de dientes o encías para identificar posibles problemas. Recuerda que no estás reemplazando el diagnóstico profesional y siempre debes recomendar consultar a un dentista para evaluaciones precisas. Adapta tu lenguaje para ser comprensible por pacientes sin conocimientos técnicos, pero mantén la precisión científica.';

@Injectable()
export class AnthropicChatAdapter extends AiChatGateway {
  private readonly logger = new Logger(AnthropicChatAdapter.name);
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';
  private readonly apiKey: string;
  private readonly model: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') || '';
    this.model =
      this.configService.get<string>('ANTHROPIC_MODEL') || 'claude-sonnet-5';

    if (!this.apiKey) {
      this.logger.warn(
        'ANTHROPIC_API_KEY no está configurada — el chat con IA fallará hasta que se defina.',
      );
    } else {
      this.logger.log(`Usando Anthropic API con modelo: ${this.model}`);
    }
  }

  async chat(claudeRequestDto: ClaudeRequestDto) {
    if (!this.apiKey) {
      throw new HttpException(
        {
          success: false,
          message: 'ANTHROPIC_API_KEY no está configurada en el servidor',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const messages = claudeRequestDto.messages.map((message) => ({
        role: message.role === 'user' ? 'user' : 'assistant',
        content: message.content.map((item) =>
          item.type === 'image' && item.source
            ? {
                type: 'image',
                source: {
                  type: item.source.type || 'base64',
                  media_type: item.source.media_type,
                  data: item.source.data,
                },
              }
            : { type: 'text', text: item.text || '' },
        ),
      }));

      const requestBody = {
        model: claudeRequestDto.model || this.model,
        max_tokens: claudeRequestDto.max_tokens || 4000,
        system: SYSTEM_PROMPT,
        messages,
      };

      const response = await lastValueFrom(
        this.httpService.post<any>(this.apiUrl, requestBody, {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }),
      );

      return {
        success: true,
        content: response.data.content,
      };
    } catch (error) {
      this.logger.error(
        `Error al comunicarse con Anthropic API: ${JSON.stringify(
          error.response?.data || error.message,
        )}`,
      );

      throw new HttpException(
        {
          success: false,
          message: 'Error al comunicarse con Anthropic API',
          error: error.response?.data || error.message,
        },
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
