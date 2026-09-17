import { Payment } from '../../domain/entities/payment.entity';

export class PaymentMapper {
  static toResponse(entity: Payment) {
    return {
      _id: entity._id,
      clinicalRecord: entity.clinicalRecord,
      treatmentIndex: entity.treatmentIndex,
      patient: entity.patient,
      amount: entity.amount,
      method: entity.method,
      registeredBy: entity.registeredBy,
      paidAt: entity.paidAt,
      observations: entity.observations,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
