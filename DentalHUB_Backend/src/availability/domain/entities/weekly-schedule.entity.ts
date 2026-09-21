import { ScheduleBlock } from './schedule-block';

export class WeeklySchedule {
  constructor(
    public readonly _id: unknown,
    public dentist: unknown,
    public blocks: ScheduleBlock[],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
