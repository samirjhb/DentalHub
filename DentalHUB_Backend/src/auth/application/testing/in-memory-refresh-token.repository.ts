import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { RefreshTokenRecord } from '../../domain/entities/refresh-token.entity';

export class InMemoryRefreshTokenRepository extends RefreshTokenRepository {
  private tokens: {
    userId: unknown;
    tokenHash: string;
    expiresAt: Date;
    revoked: boolean;
    replacedByTokenHash?: string;
  }[] = [];

  async findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const found = this.tokens.find((t) => t.tokenHash === tokenHash);
    if (!found) return null;
    return new RefreshTokenRecord(
      found.userId,
      found.tokenHash,
      found.expiresAt,
      found.revoked,
      found.replacedByTokenHash,
    );
  }

  async create(
    userId: unknown,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    this.tokens.push({ userId, tokenHash, expiresAt, revoked: false });
  }

  async markRevoked(
    tokenHash: string,
    replacedByTokenHash?: string,
  ): Promise<void> {
    const found = this.tokens.find((t) => t.tokenHash === tokenHash);
    if (!found) return;
    found.revoked = true;
    if (replacedByTokenHash) found.replacedByTokenHash = replacedByTokenHash;
  }

  async revokeAllForUser(userId: unknown): Promise<void> {
    this.tokens
      .filter((t) => t.userId === userId && !t.revoked)
      .forEach((t) => (t.revoked = true));
  }
}
