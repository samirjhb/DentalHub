import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOdontogramUseCase } from './create-odontogram.use-case';
import { UpdateToothUseCase } from './update-tooth.use-case';
import { InMemoryOdontogramRepository } from '../testing/in-memory-odontogram.repository';
import { ToothStatus } from '../../domain/entities/tooth-state.entity';

describe('UpdateToothUseCase', () => {
  let repository: InMemoryOdontogramRepository;
  let createUseCase: CreateOdontogramUseCase;
  let useCase: UpdateToothUseCase;

  beforeEach(async () => {
    repository = new InMemoryOdontogramRepository();
    createUseCase = new CreateOdontogramUseCase(repository);
    useCase = new UpdateToothUseCase(repository);
    repository.seedPatient('patient-1');
    await createUseCase.execute({ patient: 'patient-1' });
  });

  it('throws NotFoundException when the patient has no odontogram', async () => {
    await expect(
      useCase.execute('unknown-patient', '36', {
        status: ToothStatus.CARIADO,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException for an invalid tooth number', async () => {
    await expect(
      useCase.execute('patient-1', '99', { status: ToothStatus.CARIADO }),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates only the targeted tooth, leaving the other 31 untouched', async () => {
    const result = await useCase.execute('patient-1', '36', {
      status: ToothStatus.CARIADO,
      observations: 'Caries interproximal',
    });

    const tooth36 = result.teeth.find((t) => t.toothNumber === '36')!;
    expect(tooth36.status).toBe(ToothStatus.CARIADO);
    expect(tooth36.observations).toBe('Caries interproximal');

    const otherTeeth = result.teeth.filter((t) => t.toothNumber !== '36');
    expect(otherTeeth.every((t) => t.status === ToothStatus.SANO)).toBe(true);
  });
});
