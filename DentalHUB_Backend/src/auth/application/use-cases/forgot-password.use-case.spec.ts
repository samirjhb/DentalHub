import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { ForgotPasswordUseCase } from './forgot-password.use-case';
import { InMemoryAuthRepository } from '../testing/in-memory-auth.repository';
import { InMemoryPasswordResetTokenRepository } from '../testing/in-memory-password-reset-token.repository';
import { MailService } from '../../../shared/mail/mail.service';
import { Role } from '../../../shared/enums/role.enum';

describe('ForgotPasswordUseCase', () => {
  let authRepository: InMemoryAuthRepository;
  let passwordResetTokenRepository: InMemoryPasswordResetTokenRepository;
  let mailService: { sendPasswordResetEmail: jest.Mock };
  let useCase: ForgotPasswordUseCase;

  beforeEach(async () => {
    authRepository = new InMemoryAuthRepository();
    passwordResetTokenRepository = new InMemoryPasswordResetTokenRepository();
    mailService = { sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined) };
    useCase = new ForgotPasswordUseCase(
      authRepository,
      passwordResetTokenRepository,
      mailService as unknown as MailService,
      new ConfigService({
        FRONTEND_URL: 'http://localhost:4200',
        PASSWORD_RESET_EXPIRES_IN_MINUTES: '30',
      }),
    );

    await authRepository.create({
      email: 'user@test.com',
      name: 'Test User',
      password: 'hashed',
      role: Role.PATIENT,
    });
  });

  it('returns the same generic message whether or not the email exists', async () => {
    const existing = await useCase.execute({ email: 'user@test.com' });
    const nonExisting = await useCase.execute({ email: 'ghost@test.com' });

    expect(existing.message).toBe(nonExisting.message);
  });

  it('sends the reset email and persists only the token hash when the user exists', async () => {
    await useCase.execute({ email: 'user@test.com' });

    expect(mailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    const [to, url] = mailService.sendPasswordResetEmail.mock.calls[0];
    expect(to).toBe('user@test.com');

    const plainToken = new URL(url).searchParams.get('token')!;
    const user = await authRepository.findByEmail('user@test.com');
    const stored = await passwordResetTokenRepository.findByHash(
      createHash('sha256').update(plainToken).digest('hex'),
    );

    expect(stored).not.toBeNull();
    expect(stored!.userId).toBe(user!._id);
  });

  it('does not send any email when the address does not exist', async () => {
    await useCase.execute({ email: 'ghost@test.com' });
    expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('invalidates a previously issued token when a new one is requested', async () => {
    await useCase.execute({ email: 'user@test.com' });
    const firstUrl = mailService.sendPasswordResetEmail.mock.calls[0][1];
    const firstToken = new URL(firstUrl).searchParams.get('token')!;
    const firstHash = createHash('sha256').update(firstToken).digest('hex');

    await useCase.execute({ email: 'user@test.com' });

    const firstRecord = await passwordResetTokenRepository.findByHash(firstHash);
    expect(firstRecord!.used).toBe(true);
  });
});
