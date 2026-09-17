import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RegisterPaymentUseCase } from './register-payment.use-case';
import { InMemoryBillingRepository } from '../testing/in-memory-billing.repository';
import { PaymentMethod } from '../../domain/entities/payment-method.enum';

describe('RegisterPaymentUseCase', () => {
  let repository: InMemoryBillingRepository;
  let useCase: RegisterPaymentUseCase;

  beforeEach(() => {
    repository = new InMemoryBillingRepository();
    useCase = new RegisterPaymentUseCase(repository);
  });

  const baseDto = {
    clinicalRecord: 'record-1',
    treatmentIndex: 0,
    amount: 50000,
    method: PaymentMethod.EFECTIVO,
    registeredBy: 'user-1',
  };

  it('throws NotFoundException when the clinical record does not exist', async () => {
    await expect(useCase.execute(baseDto)).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when the treatment index is out of range', async () => {
    repository.seedClinicalRecord('record-1', {
      _id: 'record-1',
      patient: 'patient-1',
      dentist: 'Dr. Test',
      treatments: [{ diagnosis: 'x', toothNumber: '11', treatment: 'x', price: 100000, status: 'Pendiente', deposit: 0 }],
    });
    repository.seedUser('user-1');

    await expect(
      useCase.execute({ ...baseDto, treatmentIndex: 5 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException when registeredBy does not exist', async () => {
    repository.seedClinicalRecord('record-1', {
      _id: 'record-1',
      patient: 'patient-1',
      dentist: 'Dr. Test',
      treatments: [{ diagnosis: 'x', toothNumber: '11', treatment: 'x', price: 100000, status: 'Pendiente', deposit: 0 }],
    });

    await expect(useCase.execute(baseDto)).rejects.toThrow(NotFoundException);
  });

  it('registers the payment and increments the treatment deposit', async () => {
    repository.seedClinicalRecord('record-1', {
      _id: 'record-1',
      patient: 'patient-1',
      dentist: 'Dr. Test',
      treatments: [{ diagnosis: 'x', toothNumber: '11', treatment: 'x', price: 100000, status: 'Pendiente', deposit: 0 }],
    });
    repository.seedUser('user-1');

    const result = await useCase.execute(baseDto);

    expect(result.payment.amount).toBe(50000);
    expect(result.clinicalRecord.treatments[0].deposit).toBe(50000);
    expect(result.clinicalRecord.treatments[0].status).toBe('Pendiente');
  });

  it('marks the treatment as Completado when the deposit reaches the price', async () => {
    repository.seedClinicalRecord('record-1', {
      _id: 'record-1',
      patient: 'patient-1',
      dentist: 'Dr. Test',
      treatments: [{ diagnosis: 'x', toothNumber: '11', treatment: 'x', price: 50000, status: 'Pendiente', deposit: 0 }],
    });
    repository.seedUser('user-1');

    const result = await useCase.execute(baseDto);

    expect(result.clinicalRecord.treatments[0].status).toBe('Completado');
  });
});
