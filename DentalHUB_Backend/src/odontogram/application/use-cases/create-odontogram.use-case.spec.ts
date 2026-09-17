import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOdontogramUseCase } from './create-odontogram.use-case';
import { InMemoryOdontogramRepository } from '../testing/in-memory-odontogram.repository';
import { ToothStatus } from '../../domain/entities/tooth-state.entity';

describe('CreateOdontogramUseCase', () => {
  let repository: InMemoryOdontogramRepository;
  let useCase: CreateOdontogramUseCase;

  beforeEach(() => {
    repository = new InMemoryOdontogramRepository();
    useCase = new CreateOdontogramUseCase(repository);
  });

  it('throws NotFoundException when the patient does not exist', async () => {
    await expect(useCase.execute({ patient: 'patient-1' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates an odontogram with all 32 teeth set to Sano', async () => {
    repository.seedPatient('patient-1');

    const result = await useCase.execute({ patient: 'patient-1' });

    expect(result.teeth).toHaveLength(32);
    expect(result.teeth.every((t) => t.status === ToothStatus.SANO)).toBe(
      true,
    );
    expect(result.teeth.map((t) => t.toothNumber)).toContain('11');
    expect(result.teeth.map((t) => t.toothNumber)).toContain('48');
  });

  it('rejects creating a second odontogram for the same patient', async () => {
    repository.seedPatient('patient-1');
    await useCase.execute({ patient: 'patient-1' });

    await expect(useCase.execute({ patient: 'patient-1' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
