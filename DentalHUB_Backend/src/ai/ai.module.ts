import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './infrastructure/controllers/ai.controller';
import { AiChatGateway } from './domain/gateways/ai-chat.gateway';
import { OllamaChatAdapter } from './infrastructure/adapters/ollama-chat.adapter';
import { ChatWithAssistantUseCase } from './application/use-cases/chat-with-assistant.use-case';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [AiController],
  providers: [
    { provide: AiChatGateway, useClass: OllamaChatAdapter },
    ChatWithAssistantUseCase,
  ],
})
export class AiModule {}
