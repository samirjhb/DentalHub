import { compare } from 'bcrypt';
import { createHash } from 'crypto';
import { ResetPasswordUseCase } from './reset-password.use-case';
import { InMemoryAuthRepository } from '../testing/in-memory-auth.repository';
import { InMemoryPasswordResetTokenRepository } from '../testing/in-memory-password-reset-token.repository';
import { InMemoryRefreshTokenRepository } from '../testing/in-memory-refresh-token.repository';
import { Role } from '../../../shared/enums/role.enum';

describe('ResetPasswordUseCase', () => {
  let authRepository: InMemoryAuthRepository;
  let passwordResetTokenRepository: InMemoryPasswordResetTokenRepository;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let useCase: ResetPasswordUseCase;
  let userId: unknown;

  const PLAIN_TOKEN = 'a-plain-reset-token';
  const TOKEN_HASH = createHash('sha256').update(PLAIN_TOKEN).digest('hex');

  beforeEach(async () => {
    authRepository = new InMemoryAuthRepository();
    passwordResetTokenRepository = new InMemoryPasswordResetTokenRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    useCase = new ResetPasswordUseCase(
      authRepository,
      passwordResetTokenRepository,
      refreshTokenRepository,
    );

    const user = await authRepository.create({
      email: 'user@test.com',
      name: 'Test User',
      password: 'old-hashed-password',
      role: Role.PATIENT,
    });
    userId = user._id;
  });

  it('rejects a token that does not exist', async () => {
    await expect(
      useCase.execute({ token: 'does-not-exist', newPassword: 'NewPass123' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects an expired token', async () => {
    await passwordResetTokenRepository.create(
      userId,
      TOKEN_HASH,
      new Date(Date.now() - 1000),
    );

    await expect(
      useCase.execute({ token: PLAIN_TOKEN, newPassword: 'NewPass123' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a token that was already used', async () => {
    await passwordResetTokenRepository.create(
      userId,
      TOKEN_HASH,
      new Date(Date.now() + 60_000),
    );
    await passwordResetTokenRepository.markUsed(TOKEN_HASH);

    await expect(
      useCase.execute({ token: PLAIN_TOKEN, newPassword: 'NewPass123' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('updates the password, consumes the token, and revokes existing sessions', async () => {
    await passwordResetTokenRepository.create(
      userId,
      TOKEN_HASH,
      new Date(Date.now() + 60_000),
    );
    await refreshTokenRepository.create(
      userId,
      'some-refresh-hash',
      new Date(Date.now() + 1_000_000),
    );

    const result = await useCase.execute({
      token: PLAIN_TOKEN,
      newPassword: 'NewPass123',
    });

    expect(result.message).toBeDefined();

    const updatedUser = await authRepository.findById(String(userId));
    expect(await compare('NewPass123', updatedUser!.password)).toBe(true);

    const consumedToken = await passwordResetTokenRepository.findByHash(
      TOKEN_HASH,
    );
    expect(consumedToken!.used).toBe(true);

    const revokedSession = await refreshTokenRepository.findByHash(
      'some-refresh-hash',
    );
    expect(revokedSession!.revoked).toBe(true);
  });

  it('rejects reusing the same token twice', async () => {
    await passwordResetTokenRepository.create(
      userId,
      TOKEN_HASH,
      new Date(Date.now() + 60_000),
    );

    await useCase.execute({ token: PLAIN_TOKEN, newPassword: 'NewPass123' });

    await expect(
      useCase.execute({ token: PLAIN_TOKEN, newPassword: 'AnotherPass456' }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
