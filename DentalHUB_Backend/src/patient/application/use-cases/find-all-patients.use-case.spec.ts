import { FindAllPatientsUseCase } from './find-all-patients.use-case';
import { InMemoryPatientRepository } from '../testing/in-memory-patient.repository';
import { CreatePatientDto } from '../dto/create-patient.dto';

describe('FindAllPatientsUseCase', () => {
  let repository: InMemoryPatientRepository;
  let useCase: FindAllPatientsUseCase;

  const makeDto = (i: number): CreatePatientDto => ({
    name: `Paciente ${i}`,
    rut: `12.345.67${i}-5`,
    cel: 56912345670 + i,
    email: `paciente${i}@test.com`,
    record: `DH-00${i}`,
    birthDate: '1990-01-01T00:00:00.000Z',
  });

  beforeEach(async () => {
    repository = new InMemoryPatientRepository();
    useCase = new FindAllPatientsUseCase(repository);
    for (let i = 0; i < 5; i++) {
      await repository.create(makeDto(i));
    }
  });

  it('returns the legacy full-array shape when no page/limit is given', async () => {
    const result = await useCase.execute();

    expect(result).toHaveProperty('message', 'Pacientes encontrados');
    expect((result as any).patients).toHaveLength(5);
  });

  it('returns a paginated envelope for an intermediate page', async () => {
    const result: any = await useCase.execute({ page: 1, limit: 2 });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(3);
  });

  it('returns a partial last page', async () => {
    const result: any = await useCase.execute({ page: 3, limit: 2 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(5);
  });

  it('returns an empty page when requesting beyond the last page', async () => {
    const result: any = await useCase.execute({ page: 10, limit: 2 });

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(5);
  });
});
