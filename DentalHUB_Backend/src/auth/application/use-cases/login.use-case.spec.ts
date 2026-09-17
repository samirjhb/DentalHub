import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { LoginUseCase } from './login.use-case';
import { TokenIssuerService } from '../services/token-issuer.service';
import { InMemoryAuthRepository } from '../testing/in-memory-auth.repository';
import { InMemoryRefreshTokenRepository } from '../testing/in-memory-refresh-token.repository';
import { Role } from '../../../shared/enums/role.enum';

describe('LoginUseCase', () => {
  let authRepository: InMemoryAuthRepository;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let useCase: LoginUseCase;

  beforeEach(async () => {
    authRepository = new InMemoryAuthRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const tokenIssuer = new TokenIssuerService(
      new JwtService({ secret: 'test-secret' }),
      new ConfigService({ JWT_REFRESH_EXPIRES_IN_DAYS: '7' }),
      refreshTokenRepository,
    );
    useCase = new LoginUseCase(authRepository, tokenIssuer);

    await authRepository.create({
      email: 'user@test.com',
      name: 'Test User',
      password: await hash('correct-password', 10),
      role: Role.PATIENT,
    });
  });

  it('throws USER_NOT_FOUND for an unknown email', async () => {
    await expect(
      useCase.execute({ email: 'nope@test.com', password: 'whatever' }),
    ).rejects.toMatchObject({ message: 'USER_NOT_FOUND', status: 404 });
  });

  it('throws PASSWORD_INCORRECT for a wrong password', async () => {
    await expect(
      useCase.execute({ email: 'user@test.com', password: 'wrong-password' }),
    ).rejects.toMatchObject({ message: 'PASSWORD_INCORRECT', status: 403 });
  });

  it('returns user, token and refreshToken on success, without the password', async () => {
    const result = await useCase.execute({
      email: 'user@test.com',
      password: 'correct-password',
    });

    expect(result.token).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe('user@test.com');
    expect((result.user as any).password).toBeUndefined();
  });
});
