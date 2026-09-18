import { GetRevenueReportUseCase } from './get-revenue-report.use-case';
import { InMemoryReportsRepository } from '../testing/in-memory-reports.repository';

describe('GetRevenueReportUseCase', () => {
  let repository: InMemoryReportsRepository;
  let useCase: GetRevenueReportUseCase;

  beforeEach(() => {
    repository = new InMemoryReportsRepository();
    useCase = new GetRevenueReportUseCase(repository);
  });

  it('returns zeros when there are no payments in range', async () => {
    const result = await useCase.execute({});
    expect(result).toEqual({
      totalRevenue: 0,
      byMethod: { EFECTIVO: 0, TARJETA: 0, TRANSFERENCIA: 0 },
    });
  });

  it('sums payments and breaks them down by method within the date range', async () => {
    repository.seedPayment({
      amount: 30000,
      method: 'EFECTIVO',
      paidAt: new Date('2026-01-10'),
    });
    repository.seedPayment({
      amount: 20000,
      method: 'TARJETA',
      paidAt: new Date('2026-01-15'),
    });
    // Fuera de rango — no debe contarse.
    repository.seedPayment({
      amount: 50000,
      method: 'TRANSFERENCIA',
      paidAt: new Date('2025-12-01'),
    });

    const result = await useCase.execute({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });

    expect(result.totalRevenue).toBe(50000);
    expect(result.byMethod).toEqual({
      EFECTIVO: 30000,
      TARJETA: 20000,
      TRANSFERENCIA: 0,
    });
  });
});
