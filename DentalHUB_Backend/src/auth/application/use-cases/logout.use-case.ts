import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { TokenIssuerService } from '../services/token-issuer.service';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenIssuer: TokenIssuerService,
  ) {}

  // Revoca el refresh token. Idempotente a propósito: no revela si el token
  // existía o no (evita dar pistas a quien intente enumerar tokens).
  async execute(refreshToken: string) {
    const tokenHash = this.tokenIssuer.hashToken(refreshToken);
    await this.refreshTokenRepository.markRevoked(tokenHash);
    return { message: 'Sesión cerrada' };
  }
}
