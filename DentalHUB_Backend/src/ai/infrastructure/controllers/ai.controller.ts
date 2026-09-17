import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ClaudeRequestDto } from '../../application/dto/claude-request.dto';
import { ChatWithAssistantUseCase } from '../../application/use-cases/chat-with-assistant.use-case';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
)
@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly chatWithAssistantUseCase: ChatWithAssistantUseCase) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat con el asistente dental AI' })
  @ApiResponse({
    status: 200,
    description: 'Respuesta del asistente dental AI',
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida',
  })
  @ApiResponse({
    status: 500,
    description: 'Error del servidor',
  })
  async chatWithClaude(@Body() claudeRequestDto: ClaudeRequestDto) {
    return this.chatWithAssistantUseCase.execute(claudeRequestDto);
  }
}
