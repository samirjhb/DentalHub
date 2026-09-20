import { Auth } from '../entities/auth.entity';
import { Role } from '../../../shared/enums/role.enum';

export interface CreateAuthData {
  email: string;
  name: string;
  password: string;
  role: Role;
}

export interface UpdateAuthData {
  name?: string;
  role?: Role;
}

export abstract class AuthRepository {
  abstract findByEmail(email: string): Promise<Auth | null>;
  abstract findById(id: string): Promise<Auth | null>;
  abstract countByRole(role: Role): Promise<number>;
  abstract create(data: CreateAuthData): Promise<Auth>;
  // Usado por el selector de personal de la Agenda de Citas (ej. listar odontólogos).
  abstract findByRole(
    role?: Role,
    excludeRole?: Role,
    skip?: number,
    limit?: number,
  ): Promise<Auth[]>;
  // Conteo para paginación de /auth/staff — nombre distinto de countByRole
  // (arriba) a propósito: esa es una cuenta exacta por rol usada por
  // auth-seed.service.ts, con otra firma/semántica.
  abstract countStaff(role?: Role, excludeRole?: Role): Promise<number>;
  // Solo nombre/rol — el email no se edita acá (identidad de login) y la
  // contraseña tiene su propio flujo (no cubierto por esta pantalla).
  abstract update(id: string, data: UpdateAuthData): Promise<Auth | null>;
  // Flujo dedicado de "olvidé mi contraseña" — deliberadamente separado de
  // `update`/`UpdateAuthData` (que es la superficie de "editar nombre/rol"
  // desde Administración, con otra autorización) para no mezclar ambos casos.
  abstract updatePassword(id: string, hashedPassword: string): Promise<void>;
  // Portal de Pacientes: vínculo Auth<->Patient.
  abstract findByPatientId(patientId: string): Promise<Auth | null>;
  abstract linkPatient(authId: string, patientId: string): Promise<Auth | null>;
  // Chequeo de existencia contra el token literal 'Patient', registrado en
  // AuthModule sin depender del PatientRepository del módulo `patient`
  // (mismo patrón ya usado por appointment/billing/clinical-record).
  abstract verifyPatientExists(patientId: string): Promise<boolean>;
}
