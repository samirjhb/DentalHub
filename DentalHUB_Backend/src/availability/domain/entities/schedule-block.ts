// dayOfWeek sigue el mismo criterio que Date#getUTCDay(): 0 = domingo ... 6 = sábado.
// startTime/endTime son horas de reloj "HH:mm" (24h), relativas al día de la
// semana — no son instantes absolutos, por eso no se guardan como Date.
export interface ScheduleBlock {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}
