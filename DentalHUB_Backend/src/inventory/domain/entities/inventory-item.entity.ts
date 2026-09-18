export class InventoryItem {
  constructor(
    public readonly _id: unknown,
    public name: string,
    public unit: string,
    public currentStock: number,
    public minStock: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
