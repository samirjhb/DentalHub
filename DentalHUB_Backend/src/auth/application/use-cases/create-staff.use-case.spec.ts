import { ForbiddenException, HttpException } from '@nestjs/common';
import { CreateStaffUseCase } from './create-staff.use-case';
import { InMemoryAuthRepository } from '../testing/in-memory-auth.repository';
import { Role } from '../../../shared/enums/role.enum';

describe('CreateStaffUseCase', () => {
  let repository: InMemoryAuthRepository;
  let useCase: CreateStaffUseCase;

  beforeEach(() => {
    repository = new InMemoryAuthRepository();
    useCase = new CreateStaffUseCase(repository);
  });

  it('allows a CLINIC_ADMIN to create a non-SUPER_ADMIN account', async () => {
    const result = await useCase.execute(
      {
        email: 'dr@clinica.cl',
        name: 'Dra. Lopez',
        password: 'Clave123',
        role: Role.DENTIST,
      },
      Role.CLINIC_ADMIN,
    );

    expect(result.user.role).toBe(Role.DENTIST);
  });

  it('blocks a CLINIC_ADMIN from creating a SUPER_ADMIN account', async () => {
    await expect(
      useCase.execute(
        {
          email: 'admin@clinica.cl',
          name: 'Admin',
          password: 'Clave123',
          role: Role.SUPER_ADMIN,
        },
        Role.CLINIC_ADMIN,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows a SUPER_ADMIN to create another SUPER_ADMIN account', async () => {
    const result = await useCase.execute(
      {
        email: 'admin@clinica.cl',
        name: 'Admin',
        password: 'Clave123',
        role: Role.SUPER_ADMIN,
      },
      Role.SUPER_ADMIN,
    );

    expect(result.user.role).toBe(Role.SUPER_ADMIN);
  });

  it('throws when the email is already registered', async () => {
    await repository.create({
      email: 'dr@clinica.cl',
      name: 'Dra. Lopez',
      password: 'hashed',
      role: Role.DENTIST,
    });

    await expect(
      useCase.execute(
        {
          email: 'dr@clinica.cl',
          name: 'Otro',
          password: 'Clave123',
          role: Role.DENTIST,
        },
        Role.SUPER_ADMIN,
      ),
    ).rejects.toThrow(HttpException);
  });
});
