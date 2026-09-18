import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Prescription,
  PrescriptionSchema,
} from './infrastructure/persistence/mongo/prescription.schema';
import { PatientSchema } from 'src/patient/infrastructure/persistence/mongo/patient.schema';
import { AuthSchema } from 'src/auth/infrastructure/persistence/mongo/auth.schema';
import {
  ClinicalRecord,
  ClinicalRecordSchema,
} from 'src/clinical-record/infrastructure/persistence/mongo/clinical-record.schema';
import { PrescriptionController } from './infrastructure/controllers/prescription.controller';
import { PrescriptionRepository } from './domain/repositories/prescription.repository';
import { PrescriptionMongoRepository } from './infrastructure/persistence/mongo/prescription-mongo.repository';
import { CreatePrescriptionUseCase } from './application/use-cases/create-prescription.use-case';
import { FindPrescriptionsUseCase } from './application/use-cases/find-prescriptions.use-case';
import { FindPrescriptionByIdUseCase } from './application/use-cases/find-prescription-by-id.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prescription.name, schema: PrescriptionSchema },
      // Registro independiente de 'Patient'/'Auth'/'ClinicalRecord' bajo los
      // mismos tokens literales que ya usan clinical-record/appointment/billing —
      // evita acoplarse a los repositorios de esos módulos.
      { name: 'Patient', schema: PatientSchema },
      { name: 'Auth', schema: AuthSchema },
      { name: ClinicalRecord.name, schema: ClinicalRecordSchema },
    ]),
  ],
  controllers: [PrescriptionController],
  providers: [
    { provide: PrescriptionRepository, useClass: PrescriptionMongoRepository },
    CreatePrescriptionUseCase,
    FindPrescriptionsUseCase,
    FindPrescriptionByIdUseCase,
  ],
})
export class PrescriptionModule {}
