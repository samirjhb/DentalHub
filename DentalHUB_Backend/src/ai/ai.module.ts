import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiController } from './infrastructure/controllers/ai.controller';
import { AiChatGateway } from './domain/gateways/ai-chat.gateway';
import { OllamaChatAdapter } from './infrastructure/adapters/ollama-chat.adapter';
import { AnthropicChatAdapter } from './infrastructure/adapters/anthropic-chat.adapter';
import { GeminiChatAdapter } from './infrastructure/adapters/gemini-chat.adapter';
import { ChatWithAssistantUseCase } from './application/use-cases/chat-with-assistant.use-case';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [AiController],
  providers: [
    {
      provide: AiChatGateway,
      useFactory: (httpService: HttpService, configService: ConfigService) => {
        switch (configService.get<string>('AI_PROVIDER')) {
          case 'ollama':
            return new OllamaChatAdapter(httpService, configService);
          case 'anthropic':
            return new AnthropicChatAdapter(httpService, configService);
          case 'gemini':
          default:
            return new GeminiChatAdapter(httpService, configService);
        }
      },
      inject: [HttpService, ConfigService],
    },
    ChatWithAssistantUseCase,
  ],
})
export class AiModule {}
