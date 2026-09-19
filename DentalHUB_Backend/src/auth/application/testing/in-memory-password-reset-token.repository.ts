import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { PasswordResetTokenRecord } from '../../domain/entities/password-reset-token.entity';

export class InMemoryPasswordResetTokenRepository extends PasswordResetTokenRepository {
  private tokens: {
    userId: unknown;
    tokenHash: string;
    expiresAt: Date;
    used: boolean;
  }[] = [];

  async findByHash(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
    const found = this.tokens.find((t) => t.tokenHash === tokenHash);
    if (!found) return null;
    return new PasswordResetTokenRecord(
      found.userId,
      found.tokenHash,
      found.expiresAt,
      found.used,
    );
  }

  async create(
    userId: unknown,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    this.tokens.push({ userId, tokenHash, expiresAt, used: false });
  }

  async markUsed(tokenHash: string): Promise<void> {
    const found = this.tokens.find((t) => t.tokenHash === tokenHash);
    if (!found) return;
    found.used = true;
  }

  async invalidateAllForUser(userId: unknown): Promise<void> {
    this.tokens
      .filter((t) => t.userId === userId && !t.used)
      .forEach((t) => (t.used = true));
  }
}
