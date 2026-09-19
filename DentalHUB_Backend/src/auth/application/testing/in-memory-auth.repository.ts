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
}
