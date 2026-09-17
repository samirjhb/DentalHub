// Wrapper mínimo, sin validación de dígito verificador (agregar eso sería una regla
// de negocio nueva, fuera de alcance de una migración de arquitectura pura).
export class Rut {
  private constructor(private readonly value: string) {}

  static create(value: string): Rut {
    return new Rut(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Rut | string): boolean {
    const otherValue = other instanceof Rut ? other.getValue() : other;
    return this.value === otherValue;
  }

  toString(): string {
    return this.value;
  }
}
