import { PasswordResetTokenRecord } from '../entities/password-reset-token.entity';

export abstract class PasswordResetTokenRepository {
  abstract findByHash(
    tokenHash: string,
  ): Promise<PasswordResetTokenRecord | null>;
  abstract create(
    userId: unknown,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  abstract markUsed(tokenHash: string): Promise<void>;
  // Invalida (marca used) cualquier token sin usar del usuario — se llama antes
  // de crear uno nuevo, así un pedido repetido de reseteo deja sin efecto los
  // links anteriores en vez de dejar varios válidos circulando a la vez.
  abstract invalidateAllForUser(userId: unknown): Promise<void>;
}
