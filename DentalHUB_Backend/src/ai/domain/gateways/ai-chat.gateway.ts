import { ClaudeRequestDto } from '../../application/dto/claude-request.dto';

export abstract class AiChatGateway {
  abstract chat(dto: ClaudeRequestDto): Promise<{
    success: boolean;
    content: { type: string; text: string }[];
  }>;
}
