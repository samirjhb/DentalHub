// El sistema no maneja zonas horarias por request (no hay campo de "sede"
// ni de timezone por usuario) — se asume una única clínica en Chile, mismo
// huso ya hardcodeado en mail.service.ts para el email de recordatorio de
// citas. Chile observa horario de verano (GMT-3 en verano, GMT-4 en
// invierno), por eso la conversión usa Intl en vez de un offset fijo.
export const CLINIC_TIME_ZONE = 'America/Santiago';

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface ZonedDateParts {
  year: number;
  month: number; // 1-12
  day: number;
  dayOfWeek: number; // 0 = domingo ... 6 = sábado
}

// Año/mes/día/día-de-semana de un instante, tal como se ven desde
// `timeZone` — puede diferir del UTC del instante (ej. 02:00 UTC puede ser
// todavía "ayer" en America/Santiago).
export function getZonedDateParts(
  instant: Date,
  timeZone: string = CLINIC_TIME_ZONE,
): ZonedDateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const parts = formatter.formatToParts(instant);
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    dayOfWeek: WEEKDAY_INDEX[map.weekday],
  };
}

// Convierte una hora de reloj "HH:mm" del día calendario `dayAnchor` al
// instante UTC real que corresponde a esa hora en `timeZone`. `dayAnchor`
// se toma tal cual en año/mes/día (vía getters UTC si es un Date) — pensado
// para anchors ya resueltos como marcadores de día puro (ej. un string de
// fecha "YYYY-MM-DD" convertido a Date, o el resultado de getZonedDateParts),
// nunca para un instante real que haya que reinterpretar por zona.
export function zonedTimeToUtc(
  dayAnchor: { year: number; month: number; day: number } | Date,
  hhmm: string,
  timeZone: string = CLINIC_TIME_ZONE,
): Date {
  const { year, month, day } =
    dayAnchor instanceof Date
      ? {
          year: dayAnchor.getUTCFullYear(),
          month: dayAnchor.getUTCMonth() + 1,
          day: dayAnchor.getUTCDate(),
        }
      : dayAnchor;
  const [hours, minutes] = hhmm.split(':').map(Number);
  const naiveUtc = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
  const offsetMinutes = getTimeZoneOffsetMinutes(new Date(naiveUtc), timeZone);
  return new Date(naiveUtc - offsetMinutes * 60_000);
}

// Minutos que hay que sumarle a UTC para obtener la hora local de
// `timeZone` en el instante dado (ej. Santiago en verano => -180).
function getTimeZoneOffsetMinutes(instant: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(instant);
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return (asUtc - instant.getTime()) / 60_000;
}
