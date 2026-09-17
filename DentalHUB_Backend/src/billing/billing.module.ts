import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './infrastructure/persistence/mongo/payment.schema';
import {
  ClinicalRecord,
  ClinicalRecordSchema,
} from 'src/clinical-record/infrastructure/persistence/mongo/clinical-record.schema';
import { AuthSchema } from 'src/auth/infrastructure/persistence/mongo/auth.schema';
import { BillingController } from './infrastructure/controllers/billing.controller';
import { BillingRepository } from './domain/repositories/billing.repository';
import { BillingMongoRepository } from './infrastructure/persistence/mongo/billing-mongo.repository';
import { RegisterPaymentUseCase } from './application/use-cases/register-payment.use-case';
import { FindPaymentsUseCase } from './application/use-cases/find-payments.use-case';
import { CalculatePatientBalanceUseCase } from './application/use-cases/calculate-patient-balance.use-case';
import { CalculateTotalClinicBalanceUseCase } from './application/use-cases/calculate-total-clinic-balance.use-case';
import { FindPatientTreatmentsUseCase } from './application/use-cases/find-patient-treatments.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      // Registro independiente de 'ClinicalRecord'/'Auth' bajo los mismos
      // tokens literales que ya usan clinical-record/odontogram/appointment —
      // evita acoplarse a los repositorios de esos módulos.
      { name: ClinicalRecord.name, schema: ClinicalRecordSchema },
      { name: 'Auth', schema: AuthSchema },
    ]),
  ],
  controllers: [BillingController],
  providers: [
    { provide: BillingRepository, useClass: BillingMongoRepository },
    RegisterPaymentUseCase,
    FindPaymentsUseCase,
    CalculatePatientBalanceUseCase,
    CalculateTotalClinicBalanceUseCase,
    FindPatientTreatmentsUseCase,
  ],
})
export class BillingModule {}
