import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { MailService } from '../../../shared/mail/mail.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

// Mensaje único, exista o no el email — nunca hay que revelar si una cuenta
// existe (evita enumeración de usuarios), mismo principio de seguridad que
// ya documenta LogoutUseCase para el reuso de refresh tokens.
const GENERIC_SUCCESS_MESSAGE =
  'Si el correo existe, te enviamos un enlace para restablecer tu contraseña';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: ForgotPasswordDto) {
    const user = await this.authRepository.findByEmail(dto.email);

    if (user) {
      const plainToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(plainToken).digest('hex');
      const expiresAt = this.expiryDate();

      // Si ya había un link pedido antes, queda sin efecto — evita que
      // circulen varios links válidos a la vez para la misma cuenta.
      await this.passwordResetTokenRepository.invalidateAllForUser(user._id);
      await this.passwordResetTokenRepository.create(
        user._id,
        tokenHash,
        expiresAt,
      );

      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ??
        'http://localhost:4200';
      const resetUrl = `${frontendUrl}/authentication/reset-password?token=${plainToken}`;

      try {
        await this.mailService.sendPasswordResetEmail(user.email, resetUrl);
      } catch (error) {
        // Nunca debe filtrar al cliente que el email sí existía por culpa de
        // un fallo de Resend (cuota, credenciales) — se loguea para diagnóstico.
        this.logger.error(
          `No se pudo enviar el email de reseteo a ${user.email}`,
          error,
        );
      }
    }

    return { message: GENERIC_SUCCESS_MESSAGE };
  }

  private expiryDate(): Date {
    const minutes = Number(
      this.configService.get<string>('PASSWORD_RESET_EXPIRES_IN_MINUTES') ??
        30,
    );
    return new Date(Date.now() + minutes * 60_000);
  }
}
