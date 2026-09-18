export class Medication {
  constructor(
    public name: string,
    public dosage: string,
    public frequency: string,
    public duration: string,
    public instructions?: string,
  ) {}
}
