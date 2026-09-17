import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { BillingRepository } from '../../domain/repositories/billing.repository';
import { RegisterPaymentDto } from '../dto/register-payment.dto';
import { PaymentMapper } from '../mappers/payment.mapper';

@Injectable()
export class RegisterPaymentUseCase {
  constructor(private readonly repository: BillingRepository) {}

  async execute(dto: RegisterPaymentDto) {
    const record = await this.repository.findClinicalRecordById(
      dto.clinicalRecord,
    );
    if (!record) {
      throw new NotFoundException(
        `Ficha clínica con ID ${dto.clinicalRecord} no encontrada`,
      );
    }

    if (!record.treatments || dto.treatmentIndex >= record.treatments.length) {
      throw new BadRequestException(
        `Tratamiento con índice ${dto.treatmentIndex} no encontrado`,
      );
    }

    const registeredByExists = await this.repository.verifyRegisteredByExists(
      dto.registeredBy,
    );
    if (!registeredByExists) {
      throw new NotFoundException(
        `Usuario con ID ${dto.registeredBy} no encontrado`,
      );
    }

    const updatedRecord = await this.repository.incrementTreatmentDeposit(
      dto.clinicalRecord,
      dto.treatmentIndex,
      dto.amount,
    );

    const payment = await this.repository.create({
      clinicalRecord: dto.clinicalRecord,
      treatmentIndex: dto.treatmentIndex,
      patient: record.patient,
      amount: dto.amount,
      method: dto.method,
      registeredBy: dto.registeredBy,
      observations: dto.observations,
    });

    return {
      payment: PaymentMapper.toResponse(payment),
      clinicalRecord: updatedRecord,
    };
  }
}
