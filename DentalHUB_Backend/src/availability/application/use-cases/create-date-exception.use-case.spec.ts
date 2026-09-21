import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateDateExceptionUseCase } from './create-date-exception.use-case';
import { InMemoryAvailabilityRepository } from '../testing/in-memory-availability.repository';
import { Role } from '../../../shared/enums/role.enum';

describe('CreateDateExceptionUseCase', () => {
  let repository: InMemoryAvailabilityRepository;
  let useCase: CreateDateExceptionUseCase;

  const dto = { date: '2026-01-10', allDay: true };

  beforeEach(() => {
    repository = new InMemoryAvailabilityRepository();
    useCase = new CreateDateExceptionUseCase(repository);
    repository.seedDentist('dentist-1');
  });

  it('throws NotFoundException when the dentist does not exist', async () => {
    await expect(
      useCase.execute('ghost', dto, 'ghost', Role.DENTIST),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects a dentist creating an exception for another dentist', async () => {
    await expect(
      useCase.execute('dentist-1', dto, 'dentist-2', Role.DENTIST),
    ).rejects.toThrow(ForbiddenException);
  });

  it('creates the exception when the dentist manages their own schedule', async () => {
    const result = await useCase.execute('dentist-1', dto, 'dentist-1', Role.DENTIST);
    expect(result.allDay).toBe(true);
    expect(result.dentist).toBe('dentist-1');
  });
});
