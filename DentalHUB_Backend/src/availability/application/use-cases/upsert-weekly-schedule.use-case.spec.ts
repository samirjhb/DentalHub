import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpsertWeeklyScheduleUseCase } from './upsert-weekly-schedule.use-case';
import { InMemoryAvailabilityRepository } from '../testing/in-memory-availability.repository';
import { Role } from '../../../shared/enums/role.enum';

describe('UpsertWeeklyScheduleUseCase', () => {
  let repository: InMemoryAvailabilityRepository;
  let useCase: UpsertWeeklyScheduleUseCase;

  const blocks = [{ dayOfWeek: 1, startTime: '09:00', endTime: '13:00' }];

  beforeEach(() => {
    repository = new InMemoryAvailabilityRepository();
    useCase = new UpsertWeeklyScheduleUseCase(repository);
    repository.seedDentist('dentist-1');
  });

  it('throws NotFoundException when the dentist does not exist', async () => {
    await expect(
      useCase.execute('ghost', { blocks }, 'ghost', Role.DENTIST),
    ).rejects.toThrow(NotFoundException);
  });

  it('allows a dentist to edit their own schedule', async () => {
    const result = await useCase.execute('dentist-1', { blocks }, 'dentist-1', Role.DENTIST);
    expect(result.blocks).toEqual(blocks);
  });

  it('allows CLINIC_ADMIN to edit any dentist schedule', async () => {
    const result = await useCase.execute('dentist-1', { blocks }, 'admin-1', Role.CLINIC_ADMIN);
    expect(result.blocks).toEqual(blocks);
  });

  it('rejects a dentist editing another dentist schedule', async () => {
    await expect(
      useCase.execute('dentist-1', { blocks }, 'dentist-2', Role.DENTIST),
    ).rejects.toThrow(ForbiddenException);
  });
});
