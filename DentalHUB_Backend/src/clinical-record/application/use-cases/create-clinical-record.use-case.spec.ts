import { NotFoundException } from '@nestjs/common';
import { CreateClinicalRecordUseCase } from './create-clinical-record.use-case';
import { InMemoryClinicalRecordRepository } from '../testing/in-memory-clinical-record.repository';
import { CreateClinicalRecordDto } from '../dto/create-clinical-record.dto';

describe('CreateClinicalRecordUseCase', () => {
  let repository: InMemoryClinicalRecordRepository;
  let useCase: CreateClinicalRecordUseCase;

  const dto: CreateClinicalRecordDto = {
    patient: 'patient-1',
    dentist: 'Dr. Fase3',
    treatments: [
      { diagnosis: 'Caries', toothNumber: '36', treatment: 'Endodoncia', price: 100000 },
    ],
  };

  beforeEach(() => {
    repository = new InMemoryClinicalRecordRepository();
    useCase = new CreateClinicalRecordUseCase(repository);
  });

  it('throws NotFoundException with the legacy message when the patient does not exist', async () => {
    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    await expect(useCase.execute(dto)).rejects.toMatchObject({
      message: 'Paciente con ID patient-1 no encontrado',
    });
  });

  it('creates a clinical record when the patient exists', async () => {
    repository.seedPatient('patient-1');

    const result = await useCase.execute(dto);

    expect(result.patient).toBe('patient-1');
    expect(result.dentist).toBe('Dr. Fase3');
    expect(result.treatments).toHaveLength(1);
    expect(result.treatments[0].diagnosis).toBe('Caries');
  });
});
