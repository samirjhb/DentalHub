import { Odontogram } from '../../domain/entities/odontogram.entity';
import { ToothState, ToothStatus } from '../../domain/entities/tooth-state.entity';
import {
  OdontogramDocument,
  Tooth,
} from '../../infrastructure/persistence/mongo/odontogram.schema';

export class OdontogramMapper {
  static toDomain(doc: OdontogramDocument): Odontogram {
    return new Odontogram(
      doc._id,
      doc.patient,
      (doc.teeth ?? []).map(
        (t: Tooth) =>
          new ToothState(
            t.toothNumber,
            t.status as ToothStatus,
            t.observations,
            t.updatedAt,
          ),
      ),
      doc.generalObservations,
      (doc as unknown as { createdAt?: Date }).createdAt,
      (doc as unknown as { updatedAt?: Date }).updatedAt,
    );
  }

  static toResponse(entity: Odontogram) {
    return {
      _id: entity._id,
      patient: entity.patient,
      teeth: entity.teeth.map((t) => ({
        toothNumber: t.toothNumber,
        status: t.status,
        observations: t.observations,
        updatedAt: t.updatedAt,
      })),
      generalObservations: entity.generalObservations,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
