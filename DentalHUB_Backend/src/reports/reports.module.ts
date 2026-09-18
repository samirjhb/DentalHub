import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/billing/infrastructure/persistence/mongo/payment.schema';
import {
  ClinicalRecord,
  ClinicalRecordSchema,
} from 'src/clinical-record/infrastructure/persistence/mongo/clinical-record.schema';
import {
  Appointment,
  AppointmentSchema,
} from 'src/appointment/infrastructure/persistence/mongo/appointment.schema';
import { PatientSchema } from 'src/patient/infrastructure/persistence/mongo/patient.schema';
import { ReportsController } from './infrastructure/controllers/reports.controller';
import { ReportsRepository } from './domain/repositories/reports.repository';
import { ReportsMongoRepository } from './infrastructure/persistence/mongo/reports-mongo.repository';
import { GetRevenueReportUseCase } from './application/use-cases/get-revenue-report.use-case';
import { GetTreatmentsReportUseCase } from './application/use-cases/get-treatments-report.use-case';
import { GetAppointmentsReportUseCase } from './application/use-cases/get-appointments-report.use-case';
import { GetNewPatientsReportUseCase } from './application/use-cases/get-new-patients-report.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      // 4 bindings independientes bajo los MISMOS tokens literales que ya
      // registran sus módulos dueños (billing/clinical-record/appointment/
      // patient) — mismo patrón usado 3 veces en el proyecto, ahora
      // concentrado en un único módulo de solo lectura. Reports no tiene
      // ningún contrato de TypeScript hacia esos módulos: si su forma
      // cambia, nada avisa aquí — deuda de acoplamiento ya aceptada en menor
      // escala, cuadruplicada en este módulo. Documentado, no accidental.
      { name: Payment.name, schema: PaymentSchema },
      { name: ClinicalRecord.name, schema: ClinicalRecordSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: 'Patient', schema: PatientSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [
    { provide: ReportsRepository, useClass: ReportsMongoRepository },
    GetRevenueReportUseCase,
    GetTreatmentsReportUseCase,
    GetAppointmentsReportUseCase,
    GetNewPatientsReportUseCase,
  ],
})
export class ReportsModule {}
