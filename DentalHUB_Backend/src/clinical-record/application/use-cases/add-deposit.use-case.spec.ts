import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AddDepositUseCase } from './add-deposit.use-case';
import { InMemoryClinicalRecordRepository } from '../testing/in-memory-clinical-record.repository';
import { CreateClinicalRecordDto } from '../dto/create-clinical-record.dto';

describe('AddDepositUseCase', () => {
  let repository: InMemoryClinicalRecordRepository;
  let useCase: AddDepositUseCase;

  beforeEach(() => {
    repository = new InMemoryClinicalRecordRepository();
    useCase = new AddDepositUseCase(repository);
    repository.seedPatient('patient-1');
  });

  const seedRecord = async (price: number, deposit = 0) => {
    const dto: CreateClinicalRecordDto = {
      patient: 'patient-1',
      dentist: 'Dr. Fase3',
      treatments: [
        { diagnosis: 'Caries', toothNumber: '36', treatment: 'Endodoncia', price, deposit },
      ],
    };
    const created = await repository.create(dto);
    return String(created._id);
  };

  it('throws NotFoundException when the record does not exist', async () => {
    await expect(useCase.execute('missing', 1000)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws BadRequestException when the amount is not positive', async () => {
    const id = await seedRecord(100000);
    await expect(useCase.execute(id, 0)).rejects.toThrow(BadRequestException);
  });

  it('increments the deposit when within the treatment price', async () => {
    const id = await seedRecord(100000, 20000);

    const result = await useCase.execute(id, 30000);

    expect(result.treatments[0].deposit).toBe(50000);
    expect(result.treatments[0].status).toBe('Pendiente');
  });

  it('marks the treatment as Completado when the deposit reaches the price', async () => {
    const id = await seedRecord(50000);

    const result = await useCase.execute(id, 50000);

    expect(result.treatments[0].status).toBe('Completado');
  });

  it('rejects a deposit that exceeds the treatment price', async () => {
    const id = await seedRecord(100000, 80000);

    await expect(useCase.execute(id, 50000)).rejects.toThrow(
      BadRequestException,
    );
  });
});
