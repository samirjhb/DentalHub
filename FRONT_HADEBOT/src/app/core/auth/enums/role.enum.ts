// Copia mínima del enum real de roles, que vive en el backend:
// DentalHUB_Backend/src/shared/enums/role.enum.ts
// No hay tooling de monorepo (nx/workspaces) que permita importar ese archivo
// de forma segura entre dos apps desplegadas por separado — se duplica a mano
// y hay que mantenerla sincronizada si el backend agrega/quita roles.
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  DENTIST = 'DENTIST',
  HYGIENIST = 'HYGIENIST',
  DENTAL_ASSISTANT = 'DENTAL_ASSISTANT',
  PATIENT = 'PATIENT',
}
