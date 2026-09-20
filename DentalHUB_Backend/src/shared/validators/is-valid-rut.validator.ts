import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Mismo algoritmo (formato + dígito verificador módulo 11) que
// RutFormatDirective.isValidRut en el frontend — se replica acá para que el
// backend no dependa únicamente de la validación del cliente.
function calculateDV(rutBody: string): string {
  const reversed = rutBody.split('').reverse().join('');
  let sum = 0;

  for (let i = 0; i < reversed.length; i++) {
    const multiplier = (i % 6) + 2;
    sum += parseInt(reversed.charAt(i), 10) * multiplier;
  }

  const remainder = sum % 11;
  const dv = 11 - remainder;

  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
}

export function isValidRut(rut: string): boolean {
  const rutRegex = /^(\d{1,3}(\.\d{3})*)-([0-9kK])$/;
  if (!rutRegex.test(rut)) {
    return false;
  }

  const [body, dv] = rut.split('-');
  const cleanBody = body.replace(/\./g, '');
  const dvToCheck = dv.toUpperCase();

  return calculateDV(cleanBody) === dvToCheck;
}

@ValidatorConstraint({ name: 'isValidRut', async: false })
class IsValidRutConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && isValidRut(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} no es un RUT chileno válido (formato XX.XXX.XXX-X con dígito verificador correcto)`;
  }
}

export function IsValidRut(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRutConstraint,
    });
  };
}
