import { RefreshTokenRecord } from '../entities/refresh-token.entity';

export abstract class RefreshTokenRepository {
  abstract findByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  abstract create(
    userId: unknown,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  abstract markRevoked(
    tokenHash: string,
    replacedByTokenHash?: string,
  ): Promise<void>;
  abstract revokeAllForUser(userId: unknown): Promise<void>;
}
