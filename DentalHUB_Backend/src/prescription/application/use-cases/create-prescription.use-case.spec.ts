import { NotFoundException } from '@nestjs/common';
import { CreatePrescriptionUseCase } from './create-prescription.use-case';
import { InMemoryPrescriptionRepository } from '../testing/in-memory-prescription.repository';

describe('CreatePrescriptionUseCase', () => {
  let repository: InMemoryPrescriptionRepository;
  let useCase: CreatePrescriptionUseCase;

  beforeEach(() => {
    repository = new InMemoryPrescriptionRepository();
    useCase = new CreatePrescriptionUseCase(repository);
  });

  const baseDto = {
    patient: 'patient-1',
    dentist: 'dentist-1',
    medications: [
      { name: 'Amoxicilina', dosage: '500mg', frequency: 'cada 8 horas', duration: '7 días' },
    ],
  };

  it('throws NotFoundException when the patient does not exist', async () => {
    repository.seedDentist('dentist-1');
    await expect(useCase.execute(baseDto)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when the dentist does not exist', async () => {
    repository.seedPatient('patient-1');
    await expect(useCase.execute(baseDto)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when the optional clinicalRecord does not exist', async () => {
    repository.seedPatient('patient-1');
    repository.seedDentist('dentist-1');
    await expect(
      useCase.execute({ ...baseDto, clinicalRecord: 'record-1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates the prescription when patient and dentist exist', async () => {
    repository.seedPatient('patient-1');
    repository.seedDentist('dentist-1');

    const result = await useCase.execute(baseDto);

    expect(result.medications).toHaveLength(1);
    expect(result.medications[0].name).toBe('Amoxicilina');
    expect(result.clinicalRecord).toBeUndefined();
  });

  it('creates the prescription with a valid optional clinicalRecord', async () => {
    repository.seedPatient('patient-1');
    repository.seedDentist('dentist-1');
    repository.seedClinicalRecord('record-1');

    const result = await useCase.execute({ ...baseDto, clinicalRecord: 'record-1' });

    expect(result.clinicalRecord).toBe('record-1');
  });
});
