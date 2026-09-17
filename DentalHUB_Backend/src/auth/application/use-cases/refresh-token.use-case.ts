import { HttpException, Injectable } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { TokenIssuerService } from '../services/token-issuer.service';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenIssuer: TokenIssuerService,
  ) {}

  // Rota el refresh token. Si el token presentado ya estaba revocado (reuso de
  // un token viejo tras rotación, típico de robo/replay), se asume sesión
  // comprometida y se revocan todos los refresh tokens activos del usuario.
  async execute(dto: RefreshTokenDto) {
    const tokenHash = this.tokenIssuer.hashToken(dto.refreshToken);
    const stored = await this.refreshTokenRepository.findByHash(tokenHash);

    if (!stored || stored.expiresAt < new Date()) {
      throw new HttpException('REFRESH_TOKEN_INVALID', 401);
    }

    if (stored.revoked) {
      await this.refreshTokenRepository.revokeAllForUser(stored.userId);
      throw new HttpException('REFRESH_TOKEN_REUSED', 401);
    }

    const user = await this.authRepository.findById(String(stored.userId));
    if (!user) throw new HttpException('USER_NOT_FOUND', 404);

    const { token, refreshToken } = await this.tokenIssuer.issueTokens(user);

    await this.refreshTokenRepository.markRevoked(
      tokenHash,
      this.tokenIssuer.hashToken(refreshToken),
    );

    return { token, refreshToken };
  }
}
