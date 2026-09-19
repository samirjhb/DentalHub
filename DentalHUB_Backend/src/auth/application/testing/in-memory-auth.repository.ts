import {
  AuthRepository,
  CreateAuthData,
  UpdateAuthData,
} from '../../domain/repositories/auth.repository';
import { Auth } from '../../domain/entities/auth.entity';
import { Role } from '../../../shared/enums/role.enum';

export class InMemoryAuthRepository extends AuthRepository {
  private users: Auth[] = [];
  private nextId = 1;
  // Ids de paciente "existentes" para que verifyPatientExists tenga algo contra qué chequear en tests.
  public seededPatientIds = new Set<string>();

  async findByEmail(email: string): Promise<Auth | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findById(id: string): Promise<Auth | null> {
    return this.users.find((u) => u._id === id) ?? null;
  }

  async countByRole(role: Role): Promise<number> {
    return this.users.filter((u) => u.role === role).length;
  }

  async create(data: CreateAuthData): Promise<Auth> {
    const user = new Auth(
      String(this.nextId++),
      data.email,
      data.password,
      data.name,
      data.role,
      undefined,
      new Date(),
      new Date(),
    );
    this.users.push(user);
    return user;
  }

  async findByRole(role?: Role): Promise<Auth[]> {
    return role ? this.users.filter((u) => u.role === role) : this.users;
  }

  async update(id: string, data: UpdateAuthData): Promise<Auth | null> {
    const user = this.users.find((u) => u._id === id);
    if (!user) return null;
    if (data.name !== undefined) user.name = data.name;
    if (data.role !== undefined) user.role = data.role;
    return user;
  }

  async findByPatientId(patientId: string): Promise<Auth | null> {
    return this.users.find((u) => u.patientId === patientId) ?? null;
  }

  async linkPatient(authId: string, patientId: string): Promise<Auth | null> {
    const user = this.users.find((u) => u._id === authId);
    if (!user) return null;
    user.patientId = patientId;
    return user;
  }

  async verifyPatientExists(patientId: string): Promise<boolean> {
    return this.seededPatientIds.has(patientId);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const user = this.users.find((u) => u._id === id);
    if (!user) return;
    user.password = hashedPassword;
  }
}
