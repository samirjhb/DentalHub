import { ToothState } from './tooth-state.entity';

export class Odontogram {
  constructor(
    public readonly _id: unknown,
    public readonly patient: unknown,
    public teeth: ToothState[],
    public generalObservations?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
