import { FindClinicalRecordsWithFiltersUseCase } from './find-clinical-records-with-filters.use-case';
import { InMemoryClinicalRecordRepository } from '../testing/in-memory-clinical-record.repository';
import { CreateClinicalRecordDto } from '../dto/create-clinical-record.dto';

describe('FindClinicalRecordsWithFiltersUseCase', () => {
  let repository: InMemoryClinicalRecordRepository;
  let useCase: FindClinicalRecordsWithFiltersUseCase;

  beforeEach(async () => {
    repository = new InMemoryClinicalRecordRepository();
    useCase = new FindClinicalRecordsWithFiltersUseCase(repository);
    repository.seedPatient('patient-1');
    for (let i = 0; i < 5; i++) {
      const dto: CreateClinicalRecordDto = {
        patient: 'patient-1',
        dentist: 'Dr. Test',
        treatments: [
          { diagnosis: 'x', toothNumber: '11', treatment: 'x', price: 1000 },
        ],
      };
      await repository.create(dto);
    }
  });

  it('returns the legacy raw array when no page/limit is given', async () => {
    const result = await useCase.execute({});

    expect(Array.isArray(result)).toBe(true);
    expect((result as any[])).toHaveLength(5);
  });

  it('returns a paginated envelope for an intermediate page', async () => {
    const result: any = await useCase.execute({ page: 1, limit: 2 });

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(3);
  });

  it('returns a partial last page', async () => {
    const result: any = await useCase.execute({ page: 3, limit: 2 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(5);
  });
});
