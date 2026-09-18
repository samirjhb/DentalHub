import { StockMovementType } from './stock-movement-type.enum';

export class StockMovement {
  constructor(
    public readonly _id: unknown,
    public item: unknown,
    public type: StockMovementType,
    public quantity: number,
    public registeredBy: unknown,
    public movementDate: Date,
    public reason?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
