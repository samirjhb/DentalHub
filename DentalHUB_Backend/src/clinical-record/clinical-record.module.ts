import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ClinicalRecord,
  ClinicalRecordSchema,
} from './infrastructure/persistence/mongo/clinical-record.schema';
import { PatientSchema } from 'src/patient/infrastructure/persistence/mongo/patient.schema';
import { ClinicalRecordController } from './infrastructure/controllers/clinical-record.controller';
import { ClinicalRecordRepository } from './domain/repositories/clinical-record.repository';
import { ClinicalRecordMongoRepository } from './infrastructure/persistence/mongo/clinical-record-mongo.repository';
import { CreateClinicalRecordUseCase } from './application/use-cases/create-clinical-record.use-case';
import { FindAllClinicalRecordsUseCase } from './application/use-cases/find-all-clinical-records.use-case';
import { FindClinicalRecordsWithFiltersUseCase } from './application/use-cases/find-clinical-records-with-filters.use-case';
import { FindClinicalRecordByIdUseCase } from './application/use-cases/find-clinical-record-by-id.use-case';
import { UpdateClinicalRecordUseCase } from './application/use-cases/update-clinical-record.use-case';
import { RemoveClinicalRecordUseCase } from './application/use-cases/remove-clinical-record.use-case';
import { UpdateTreatmentStatusUseCase } from './application/use-cases/update-treatment-status.use-case';
import { AddDepositUseCase } from './application/use-cases/add-deposit.use-case';
import { AddTreatmentUseCase } from './application/use-cases/add-treatment.use-case';
import { RemoveTreatmentUseCase } from './application/use-cases/remove-treatment.use-case';
import { CalculatePendingBalanceUseCase } from './application/use-cases/calculate-pending-balance.use-case';
import { CalculateTotalPendingBalanceUseCase } from './application/use-cases/calculate-total-pending-balance.use-case';
import { UpdateAppointmentDateUseCase } from './application/use-cases/update-appointment-date.use-case';
import { FindMyClinicalSummaryUseCase } from './application/use-cases/find-my-clinical-summary.use-case';
import { UploadClinicalAttachmentUseCase } from './application/use-cases/upload-clinical-attachment.use-case';
import { DeleteClinicalAttachmentUseCase } from './application/use-cases/delete-clinical-attachment.use-case';
import { StorageModule } from 'src/shared/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClinicalRecord.name, schema: ClinicalRecordSchema },
      // Registro independiente del modelo 'Patient' bajo el mismo token
      // literal que usa `patient.module.ts` — deliberado, ver comentario en
      // ese módulo.
      { name: 'Patient', schema: PatientSchema },
    ]),
    StorageModule,
  ],
  controllers: [ClinicalRecordController],
  providers: [
    { provide: ClinicalRecordRepository, useClass: ClinicalRecordMongoRepository },
    CreateClinicalRecordUseCase,
    FindAllClinicalRecordsUseCase,
    FindClinicalRecordsWithFiltersUseCase,
    FindClinicalRecordByIdUseCase,
    UpdateClinicalRecordUseCase,
    RemoveClinicalRecordUseCase,
    UpdateTreatmentStatusUseCase,
    AddDepositUseCase,
    AddTreatmentUseCase,
    RemoveTreatmentUseCase,
    CalculatePendingBalanceUseCase,
    CalculateTotalPendingBalanceUseCase,
    UpdateAppointmentDateUseCase,
    FindMyClinicalSummaryUseCase,
    UploadClinicalAttachmentUseCase,
    DeleteClinicalAttachmentUseCase,
  ],
  exports: [ClinicalRecordRepository],
})
export class ClinicalRecordModule {}
