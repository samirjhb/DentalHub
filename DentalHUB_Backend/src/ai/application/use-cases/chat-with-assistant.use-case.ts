import { Injectable } from '@nestjs/common';
import { AiChatGateway } from '../../domain/gateways/ai-chat.gateway';
import { ClaudeRequestDto } from '../dto/claude-request.dto';

@Injectable()
export class ChatWithAssistantUseCase {
  constructor(private readonly gateway: AiChatGateway) {}

  async execute(dto: ClaudeRequestDto) {
    return this.gateway.chat(dto);
  }
}
