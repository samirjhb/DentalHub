import { FindInventoryItemsUseCase } from './find-inventory-items.use-case';
import { InMemoryInventoryRepository } from '../testing/in-memory-inventory.repository';

describe('FindInventoryItemsUseCase', () => {
  let repository: InMemoryInventoryRepository;
  let useCase: FindInventoryItemsUseCase;

  beforeEach(async () => {
    repository = new InMemoryInventoryRepository();
    useCase = new FindInventoryItemsUseCase(repository);
    for (let i = 0; i < 5; i++) {
      await repository.create({
        name: `Insumo ${i}`,
        unit: 'unidades',
        currentStock: 10,
        minStock: 2,
      });
    }
  });

  it('returns the legacy raw array when no page/limit is given', async () => {
    const result = await useCase.execute();

    expect(Array.isArray(result)).toBe(true);
    expect((result as any[])).toHaveLength(5);
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
