import { Auth } from '../entities/auth.entity';
import { Role } from '../../../shared/enums/role.enum';

export interface CreateAuthData {
  email: string;
  name: string;
  password: string;
  role: Role;
}

export abstract class AuthRepository {
  abstract findByEmail(email: string): Promise<Auth | null>;
  abstract findById(id: string): Promise<Auth | null>;
  abstract countByRole(role: Role): Promise<number>;
  abstract create(data: CreateAuthData): Promise<Auth>;
  // Usado por el selector de personal de la Agenda de Citas (ej. listar odontólogos).
  abstract findByRole(role?: Role): Promise<Auth[]>;
}
