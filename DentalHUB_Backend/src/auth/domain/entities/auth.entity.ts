import { Role } from '../../../shared/enums/role.enum';

export class Auth {
  constructor(
    public readonly _id: unknown,
    public email: string,
    public password: string,
    public name: string,
    public role: Role,
    public patientId?: unknown,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
