import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { TokenIssuerService } from '../services/token-issuer.service';
import { InMemoryAuthRepository } from '../testing/in-memory-auth.repository';
import { InMemoryRefreshTokenRepository } from '../testing/in-memory-refresh-token.repository';
import { Role } from '../../../shared/enums/role.enum';

describe('RefreshTokenUseCase', () => {
  let authRepository: InMemoryAuthRepository;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let tokenIssuer: TokenIssuerService;
  let useCase: RefreshTokenUseCase;

  beforeEach(async () => {
    authRepository = new InMemoryAuthRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    tokenIssuer = new TokenIssuerService(
      new JwtService({ secret: 'test-secret' }),
      new ConfigService({ JWT_REFRESH_EXPIRES_IN_DAYS: '7' }),
      refreshTokenRepository,
    );
    useCase = new RefreshTokenUseCase(
      authRepository,
      refreshTokenRepository,
      tokenIssuer,
    );

    await authRepository.create({
      email: 'user@test.com',
      name: 'Test User',
      password: 'hashed',
      role: Role.PATIENT,
    });
  });

  it('throws REFRESH_TOKEN_INVALID for an unknown token', async () => {
    await expect(
      useCase.execute({ refreshToken: 'does-not-exist' }),
    ).rejects.toMatchObject({ message: 'REFRESH_TOKEN_INVALID', status: 401 });
  });

  it('rotates a valid token into a new pair', async () => {
    const user = await authRepository.findByEmail('user@test.com');
    const { refreshToken: original } = await tokenIssuer.issueTokens(user!);

    const result = await useCase.execute({ refreshToken: original });

    expect(result.token).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe(original);
  });

  it('detects reuse of an already-rotated token and revokes every session', async () => {
    const user = await authRepository.findByEmail('user@test.com');
    const { refreshToken: original } = await tokenIssuer.issueTokens(user!);

    const { refreshToken: rotated } = await useCase.execute({
      refreshToken: original,
    });

    // Reusing the old (already-rotated) token is a replay signal.
    await expect(
      useCase.execute({ refreshToken: original }),
    ).rejects.toMatchObject({ message: 'REFRESH_TOKEN_REUSED', status: 401 });

    // The reuse detection must have revoked the freshly-rotated token too.
    await expect(
      useCase.execute({ refreshToken: rotated }),
    ).rejects.toMatchObject({ message: 'REFRESH_TOKEN_REUSED', status: 401 });
  });
});
