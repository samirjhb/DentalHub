import { FindPaymentsUseCase } from './find-payments.use-case';
import { InMemoryBillingRepository } from '../testing/in-memory-billing.repository';
import { PaymentMethod } from '../../domain/entities/payment-method.enum';

describe('FindPaymentsUseCase', () => {
  let repository: InMemoryBillingRepository;
  let useCase: FindPaymentsUseCase;

  beforeEach(async () => {
    repository = new InMemoryBillingRepository();
    useCase = new FindPaymentsUseCase(repository);
    for (let i = 0; i < 5; i++) {
      await repository.create({
        clinicalRecord: 'record-1',
        treatmentIndex: 0,
        patient: 'patient-1',
        amount: 1000,
        method: PaymentMethod.EFECTIVO,
        registeredBy: 'user-1',
      });
    }
  });

  it('returns the legacy { payments } shape when no page/limit is given', async () => {
    const result: any = await useCase.execute({});

    expect(result.payments).toHaveLength(5);
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

  it('returns an empty page when requesting beyond the last page', async () => {
    const result: any = await useCase.execute({ page: 10, limit: 2 });

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(5);
  });
});
