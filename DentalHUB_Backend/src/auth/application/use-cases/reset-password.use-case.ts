import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { hash } from 'bcrypt';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const stored = await this.passwordResetTokenRepository.findByHash(
      tokenHash,
    );

    if (!stored || stored.used || stored.expiresAt < new Date()) {
      throw new BadRequestException(
        'El enlace de recuperación es inválido o expiró',
      );
    }

    const hashedPassword = await hash(dto.newPassword, 10);
    await this.authRepository.updatePassword(
      String(stored.userId),
      hashedPassword,
    );
    await this.passwordResetTokenRepository.markUsed(tokenHash);
    // Cierra cualquier sesión activa con la contraseña vieja.
    await this.refreshTokenRepository.revokeAllForUser(stored.userId);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
