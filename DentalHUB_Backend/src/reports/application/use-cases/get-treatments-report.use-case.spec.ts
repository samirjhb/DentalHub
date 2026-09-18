import { GetTreatmentsReportUseCase } from './get-treatments-report.use-case';
import { InMemoryReportsRepository } from '../testing/in-memory-reports.repository';

describe('GetTreatmentsReportUseCase', () => {
  let repository: InMemoryReportsRepository;
  let useCase: GetTreatmentsReportUseCase;

  beforeEach(() => {
    repository = new InMemoryReportsRepository();
    useCase = new GetTreatmentsReportUseCase(repository);
  });

  it('counts treatments by status within the date range', async () => {
    repository.seedTreatment({ status: 'Completado', createdAt: new Date('2026-02-05') });
    repository.seedTreatment({ status: 'Completado', createdAt: new Date('2026-02-10') });
    repository.seedTreatment({ status: 'Pendiente', createdAt: new Date('2026-02-12') });
    // Fuera de rango — no debe contarse.
    repository.seedTreatment({ status: 'Cancelado', createdAt: new Date('2026-01-01') });

    const result = await useCase.execute({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
    });

    expect(result.total).toBe(3);
    expect(result.byStatus).toEqual({ Completado: 2, Pendiente: 1 });
  });
});
