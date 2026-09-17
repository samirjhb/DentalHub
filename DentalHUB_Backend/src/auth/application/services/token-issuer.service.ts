import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';
import { Auth } from '../../domain/entities/auth.entity';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';

// Firma el access token y emite + persiste (hasheado) un refresh token nuevo.
// Punto único usado por Register/Login/Refresh para no triplicar esta lógica.
@Injectable()
export class TokenIssuerService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private refreshTokenExpiryDate(): Date {
    const days = Number(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN_DAYS') ?? 7,
    );
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  async issueTokens(
    user: Auth,
  ): Promise<{ token: string; refreshToken: string }> {
    const payload = { id: user._id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    const refreshToken = randomBytes(64).toString('hex');
    await this.refreshTokenRepository.create(
      user._id,
      this.hashToken(refreshToken),
      this.refreshTokenExpiryDate(),
    );

    return { token, refreshToken };
  }
}
