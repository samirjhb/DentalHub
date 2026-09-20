import { FindStaffByRoleUseCase } from './find-staff-by-role.use-case';
import { InMemoryAuthRepository } from '../testing/in-memory-auth.repository';
import { Role } from '../../../shared/enums/role.enum';

describe('FindStaffByRoleUseCase', () => {
  let repository: InMemoryAuthRepository;
  let useCase: FindStaffByRoleUseCase;

  beforeEach(async () => {
    repository = new InMemoryAuthRepository();
    useCase = new FindStaffByRoleUseCase(repository);
    for (let i = 0; i < 4; i++) {
      await repository.create({
        email: `dr${i}@clinica.cl`,
        name: `Dr ${i}`,
        password: 'hashed',
        role: Role.DENTIST,
      });
    }
    await repository.create({
      email: 'paciente@clinica.cl',
      name: 'Paciente',
      password: 'hashed',
      role: Role.PATIENT,
    });
  });

  it('returns the legacy { staff } shape (incl. PATIENT) when no page/limit is given', async () => {
    const result: any = await useCase.execute();

    expect(result.staff).toHaveLength(5);
  });

  it('filters by role without pagination', async () => {
    const result: any = await useCase.execute({ role: Role.DENTIST });

    expect(result.staff).toHaveLength(4);
    expect(result.staff.every((u: any) => u.role === Role.DENTIST)).toBe(true);
  });

  it('excludes a role without pagination', async () => {
    const result: any = await useCase.execute({ excludeRole: Role.PATIENT });

    expect(result.staff).toHaveLength(4);
    expect(result.staff.some((u: any) => u.role === Role.PATIENT)).toBe(false);
  });

  it('combines excludeRole with pagination', async () => {
    const result: any = await useCase.execute({
      excludeRole: Role.PATIENT,
      page: 1,
      limit: 2,
    });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(4);
    expect(result.data.some((u: any) => u.role === Role.PATIENT)).toBe(false);
  });

  it('returns an empty page when requesting beyond the last page', async () => {
    const result: any = await useCase.execute({ page: 10, limit: 2 });

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(5);
  });
});
