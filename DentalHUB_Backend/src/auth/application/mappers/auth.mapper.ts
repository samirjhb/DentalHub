import { Auth } from '../../domain/entities/auth.entity';
import { AuthDocument } from '../../infrastructure/persistence/mongo/auth.schema';

export class AuthMapper {
  static toDomain(doc: AuthDocument): Auth {
    return new Auth(
      doc._id,
      doc.email,
      doc.password,
      doc.name,
      doc.role,
      doc.patientId,
      (doc as unknown as { createdAt?: Date }).createdAt,
      (doc as unknown as { updatedAt?: Date }).updatedAt,
    );
  }

  // Nunca incluye `password` — mismo comportamiento que el
  // `delete safeUser.password` de antes de esta migración.
  static toResponse(entity: Auth) {
    return {
      _id: entity._id,
      email: entity.email,
      name: entity.name,
      role: entity.role,
      patientId: entity.patientId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
