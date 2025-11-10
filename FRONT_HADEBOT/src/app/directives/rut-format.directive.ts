import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Directive({
  selector: '[rutFormat]',
  standalone: true
})
export class RutFormatDirective {
  /**
   * Validador que se puede usar en FormControl para validar RUT chileno
   * @returns ValidatorFn que verifica si el RUT es válido
   */
  static validateRut(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // No validar si está vacío
      }
      
      const isValid = RutFormatDirective.isValidRut(control.value);
      return isValid ? null : { invalidRut: true };
    };
  }
  constructor(
    private el: ElementRef,
    private control: NgControl
  ) {
    // Agregar el validador personalizado al control
    if (this.control.control) {
      const validators = this.control.control.validator 
        ? [this.control.control.validator, RutFormatDirective.validateRut()] 
        : RutFormatDirective.validateRut();
      
      this.control.control.setValidators(validators);
      this.control.control.updateValueAndValidity();
    }
  }

  @HostListener('input', ['$event']) 
  onInputChange(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Eliminar todos los caracteres no numéricos y K/k
    value = value.replace(/[^0-9kK]/g, '');
    
    // Aplicar formato RUT (XX.XXX.XXX-X)
    let formattedValue = '';
    
    if (value.length > 1) {
      // Separar el dígito verificador
      const dv = value.slice(-1);
      let body = value.slice(0, -1);
      
      // Aplicar puntos cada 3 dígitos desde la derecha
      while (body.length > 3) {
        formattedValue = '.' + body.slice(-3) + formattedValue;
        body = body.slice(0, -3);
      }
      
      formattedValue = body + formattedValue;
      
      // Añadir el guión y el dígito verificador
      formattedValue = formattedValue + '-' + dv;
    } else {
      formattedValue = value;
    }
    
    // Actualizar el valor en el control del formulario
    this.control.control?.setValue(formattedValue, { emitEvent: false });
    
    // Actualizar el valor en el input
    input.value = formattedValue;
  }
  
  @HostListener('blur')
  onBlur() {
    const value = this.control.value;
    if (value) {
      // Validar formato completo al salir del campo
      const isValid = RutFormatDirective.isValidRut(value);
      
      if (!isValid) {
        // Marcar como inválido si no cumple con el formato o el dígito verificador
        this.control.control?.setErrors({ 'invalidRut': true });
      }
    }
  }
  
  /**
   * Verifica si un RUT chileno es válido, tanto en formato como en dígito verificador
   * @param rut RUT a validar en formato XX.XXX.XXX-X
   * @returns true si el RUT es válido, false en caso contrario
   */
  static isValidRut(rut: string): boolean {
    // Verificar que tenga el formato correcto (XX.XXX.XXX-X)
    const rutRegex = /^(\d{1,3}(\.\d{3})*)-([0-9kK])$/;
    if (!rutRegex.test(rut)) {
      return false;
    }
    
    // Extraer cuerpo y dígito verificador
    const [body, dv] = rut.split('-');
    const cleanBody = body.replace(/\./g, '');
    const dvToCheck = dv.toUpperCase();
    
    // Calcular dígito verificador
    const calculatedDV = RutFormatDirective.calculateDV(cleanBody);
    
    // Comparar dígito verificador calculado con el proporcionado
    return calculatedDV === dvToCheck;
  }
  
  /**
   * Calcula el dígito verificador de un RUT chileno
   * @param rutBody Cuerpo del RUT sin puntos ni guión
   * @returns Dígito verificador calculado
   */
  static calculateDV(rutBody: string): string {
    const reversed = rutBody.split('').reverse().join('');
    let sum = 0;
    let multiplier = 0;
    
    for (let i = 0; i < reversed.length; i++) {
      multiplier = i % 6 + 2;
      sum += parseInt(reversed.charAt(i)) * multiplier;
    }
    
    const remainder = sum % 11;
    const dv = 11 - remainder;
    
    if (dv === 11) return '0';
    if (dv === 10) return 'K';
    return dv.toString();
  }
}
