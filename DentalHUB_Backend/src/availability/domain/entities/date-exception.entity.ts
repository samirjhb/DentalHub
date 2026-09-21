export class DateException {
  constructor(
    public readonly _id: unknown,
    public dentist: unknown,
    public date: Date,
    public allDay: boolean,
    public startTime?: string,
    public endTime?: string,
    public reason?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
