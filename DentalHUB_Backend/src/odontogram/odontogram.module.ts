import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Odontogram,
  OdontogramSchema,
} from './infrastructure/persistence/mongo/odontogram.schema';
import { PatientSchema } from 'src/patient/infrastructure/persistence/mongo/patient.schema';
import { OdontogramController } from './infrastructure/controllers/odontogram.controller';
import { OdontogramRepository } from './domain/repositories/odontogram.repository';
import { OdontogramMongoRepository } from './infrastructure/persistence/mongo/odontogram-mongo.repository';
import { CreateOdontogramUseCase } from './application/use-cases/create-odontogram.use-case';
import { FindOdontogramByPatientUseCase } from './application/use-cases/find-odontogram-by-patient.use-case';
import { UpdateToothUseCase } from './application/use-cases/update-tooth.use-case';
import { UpdateGeneralObservationsUseCase } from './application/use-cases/update-general-observations.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Odontogram.name, schema: OdontogramSchema },
      // Registro independiente del modelo 'Patient' bajo el mismo token
      // literal que usan `patient.module.ts` y `clinical-record.module.ts`.
      { name: 'Patient', schema: PatientSchema },
    ]),
  ],
  controllers: [OdontogramController],
  providers: [
    { provide: OdontogramRepository, useClass: OdontogramMongoRepository },
    CreateOdontogramUseCase,
    FindOdontogramByPatientUseCase,
    UpdateToothUseCase,
    UpdateGeneralObservationsUseCase,
  ],
  exports: [OdontogramRepository],
})
export class OdontogramModule {}
