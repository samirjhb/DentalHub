import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateStaffUseCase } from './update-staff.use-case';
import { InMemoryAuthRepository } from '../testing/in-memory-auth.repository';
import { Role } from '../../../shared/enums/role.enum';

describe('UpdateStaffUseCase', () => {
  let repository: InMemoryAuthRepository;
  let useCase: UpdateStaffUseCase;

  beforeEach(() => {
    repository = new InMemoryAuthRepository();
    useCase = new UpdateStaffUseCase(repository);
  });

  it('throws NotFoundException when the target does not exist', async () => {
    await expect(
      useCase.execute('missing', { name: 'x' }, Role.SUPER_ADMIN),
    ).rejects.toThrow(NotFoundException);
  });

  it('allows a CLINIC_ADMIN to edit a non-SUPER_ADMIN account', async () => {
    const created = await repository.create({
      email: 'dr@clinica.cl',
      name: 'Dra. Lopez',
      password: 'hashed',
      role: Role.DENTIST,
    });

    const result = await useCase.execute(
      String(created._id),
      { name: 'Dra. Lopez Actualizada' },
      Role.CLINIC_ADMIN,
    );

    expect(result.user.name).toBe('Dra. Lopez Actualizada');
  });

  it('blocks a CLINIC_ADMIN from editing an existing SUPER_ADMIN account', async () => {
    const created = await repository.create({
      email: 'admin@clinica.cl',
      name: 'Admin',
      password: 'hashed',
      role: Role.SUPER_ADMIN,
    });

    await expect(
      useCase.execute(String(created._id), { name: 'Otro nombre' }, Role.CLINIC_ADMIN),
    ).rejects.toThrow(ForbiddenException);
  });

  it('blocks a CLINIC_ADMIN from promoting an account to SUPER_ADMIN', async () => {
    const created = await repository.create({
      email: 'dr@clinica.cl',
      name: 'Dra. Lopez',
      password: 'hashed',
      role: Role.DENTIST,
    });

    await expect(
      useCase.execute(
        String(created._id),
        { role: Role.SUPER_ADMIN },
        Role.CLINIC_ADMIN,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows a SUPER_ADMIN to edit another SUPER_ADMIN account', async () => {
    const created = await repository.create({
      email: 'admin@clinica.cl',
      name: 'Admin',
      password: 'hashed',
      role: Role.SUPER_ADMIN,
    });

    const result = await useCase.execute(
      String(created._id),
      { name: 'Admin renombrado' },
      Role.SUPER_ADMIN,
    );

    expect(result.user.name).toBe('Admin renombrado');
  });
});
