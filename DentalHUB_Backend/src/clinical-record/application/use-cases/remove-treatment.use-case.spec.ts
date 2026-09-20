import { BadRequestException } from '@nestjs/common';
import { RemoveTreatmentUseCase } from './remove-treatment.use-case';
import { InMemoryClinicalRecordRepository } from '../testing/in-memory-clinical-record.repository';
import { CreateClinicalRecordDto } from '../dto/create-clinical-record.dto';

describe('RemoveTreatmentUseCase', () => {
  let repository: InMemoryClinicalRecordRepository;
  let useCase: RemoveTreatmentUseCase;

  beforeEach(() => {
    repository = new InMemoryClinicalRecordRepository();
    useCase = new RemoveTreatmentUseCase(repository);
    repository.seedPatient('patient-1');
  });

  it('removes a non-last treatment and keeps the record', async () => {
    const dto: CreateClinicalRecordDto = {
      patient: 'patient-1',
      dentist: 'Dr. Fase3',
      treatments: [
        { diagnosis: 'Caries', toothNumber: '36', treatment: 'Endodoncia', price: 100000 },
        { diagnosis: 'Sarro', toothNumber: '11', treatment: 'Limpieza', price: 30000 },
      ],
    };
    const created = await repository.create(dto);

    const result = await useCase.execute(String(created._id), 0);

    expect(result.treatments).toHaveLength(1);
    expect(result.treatments[0].diagnosis).toBe('Sarro');
  });

  it('rejects removing the last treatment and leaves the record untouched', async () => {
    const dto: CreateClinicalRecordDto = {
      patient: 'patient-1',
      dentist: 'Dr. Fase3',
      treatments: [
        { diagnosis: 'Caries', toothNumber: '36', treatment: 'Endodoncia', price: 100000 },
      ],
    };
    const created = await repository.create(dto);
    const id = String(created._id);

    await expect(useCase.execute(id, 0)).rejects.toThrow(BadRequestException);
    const record = await repository.findById(id);
    expect(record).not.toBeNull();
    expect(record!.treatments).toHaveLength(1);
  });
});
