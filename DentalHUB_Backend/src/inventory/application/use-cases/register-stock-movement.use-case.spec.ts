import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RegisterStockMovementUseCase } from './register-stock-movement.use-case';
import { InMemoryInventoryRepository } from '../testing/in-memory-inventory.repository';
import { StockMovementType } from '../../domain/entities/stock-movement-type.enum';

describe('RegisterStockMovementUseCase', () => {
  let repository: InMemoryInventoryRepository;
  let useCase: RegisterStockMovementUseCase;

  beforeEach(() => {
    repository = new InMemoryInventoryRepository();
    useCase = new RegisterStockMovementUseCase(repository);
  });

  it('throws NotFoundException when the item does not exist', async () => {
    await expect(
      useCase.execute('missing-item', {
        type: StockMovementType.ENTRADA,
        quantity: 10,
        registeredBy: 'user-1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('increments currentStock on ENTRADA', async () => {
    const item = await repository.create({
      name: 'Guantes',
      unit: 'cajas',
      currentStock: 5,
      minStock: 2,
    });

    const result = await useCase.execute(String(item._id), {
      type: StockMovementType.ENTRADA,
      quantity: 10,
      registeredBy: 'user-1',
    });

    expect(result.item.currentStock).toBe(15);
    expect(result.movement.type).toBe('ENTRADA');
  });

  it('decrements currentStock on SALIDA', async () => {
    const item = await repository.create({
      name: 'Guantes',
      unit: 'cajas',
      currentStock: 10,
      minStock: 2,
    });

    const result = await useCase.execute(String(item._id), {
      type: StockMovementType.SALIDA,
      quantity: 4,
      registeredBy: 'user-1',
    });

    expect(result.item.currentStock).toBe(6);
  });

  it('rejects a SALIDA that would leave stock negative', async () => {
    const item = await repository.create({
      name: 'Guantes',
      unit: 'cajas',
      currentStock: 3,
      minStock: 2,
    });

    await expect(
      useCase.execute(String(item._id), {
        type: StockMovementType.SALIDA,
        quantity: 5,
        registeredBy: 'user-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('does not lose either movement when two concurrent ENTRADA/SALIDA run', async () => {
    const item = await repository.create({
      name: 'Guantes',
      unit: 'cajas',
      currentStock: 10,
      minStock: 2,
    });

    await Promise.all([
      useCase.execute(String(item._id), {
        type: StockMovementType.ENTRADA,
        quantity: 5,
        registeredBy: 'user-1',
      }),
      useCase.execute(String(item._id), {
        type: StockMovementType.SALIDA,
        quantity: 3,
        registeredBy: 'user-2',
      }),
    ]);

    const updated = await repository.findById(String(item._id));
    expect(updated?.currentStock).toBe(12);
  });
});
