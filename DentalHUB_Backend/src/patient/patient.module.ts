import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Patient,
  PatientSchema,
} from './infrastructure/persistence/mongo/patient.schema';
import { PatientController } from './infrastructure/controllers/patient.controller';
import { PatientRepository } from './domain/repositories/patient.repository';
import { PatientMongoRepository } from './infrastructure/persistence/mongo/patient-mongo.repository';
import { CreatePatientUseCase } from './application/use-cases/create-patient.use-case';
import { FindAllPatientsUseCase } from './application/use-cases/find-all-patients.use-case';
import { FindPatientByIdUseCase } from './application/use-cases/find-patient-by-id.use-case';
import { UpdatePatientUseCase } from './application/use-cases/update-patient.use-case';
import { RemovePatientUseCase } from './application/use-cases/remove-patient.use-case';
import { ClinicalRecordModule } from 'src/clinical-record/clinical-record.module';
import { AppointmentModule } from 'src/appointment/appointment.module';
import { OdontogramModule } from 'src/odontogram/odontogram.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        // Sigue siendo el token literal 'Patient' — clinical-record depende de
        // este nombre exacto para su propio registro independiente del modelo.
        name: Patient.name,
        schema: PatientSchema,
      },
    ]),
    // Solo para que RemovePatientUseCase pueda verificar referencias
    // asociadas (fichas/citas/odontograma) antes de borrar un paciente —
    // ninguno de estos módulos importa PatientModule, no hay ciclo.
    ClinicalRecordModule,
    AppointmentModule,
    OdontogramModule,
  ],
  controllers: [PatientController],
  providers: [
    { provide: PatientRepository, useClass: PatientMongoRepository },
    CreatePatientUseCase,
    FindAllPatientsUseCase,
    FindPatientByIdUseCase,
    UpdatePatientUseCase,
    RemovePatientUseCase,
  ],
})
export class PatientModule {}
