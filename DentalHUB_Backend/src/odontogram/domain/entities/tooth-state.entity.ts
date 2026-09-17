export enum ToothStatus {
  SANO = 'Sano',
  CARIADO = 'Cariado',
  OBTURADO = 'Obturado',
  AUSENTE = 'Ausente',
  CORONA = 'Corona',
  ENDODONCIA = 'Endodoncia',
  IMPLANTE = 'Implante',
  FRACTURADO = 'Fracturado',
  SELLANTE = 'Sellante',
  EXTRACCION_INDICADA = 'ExtraccionIndicada',
}

export class ToothState {
  constructor(
    public readonly toothNumber: string,
    public status: ToothStatus = ToothStatus.SANO,
    public observations?: string,
    public updatedAt?: Date,
  ) {}
}
