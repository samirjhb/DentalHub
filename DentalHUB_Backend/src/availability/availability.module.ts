import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WeeklySchedule,
  WeeklyScheduleSchema,
} from './infrastructure/persistence/mongo/weekly-schedule.schema';
import {
  DateException,
  DateExceptionSchema,
} from './infrastructure/persistence/mongo/date-exception.schema';
import { AuthSchema } from 'src/auth/infrastructure/persistence/mongo/auth.schema';
import { AppointmentSchema } from 'src/appointment/infrastructure/persistence/mongo/appointment.schema';
import { AvailabilityRepository } from './domain/repositories/availability.repository';
import { AvailabilityMongoRepository } from './infrastructure/persistence/mongo/availability-mongo.repository';
import { AvailabilityController } from './infrastructure/controllers/availability.controller';
import { SlotCalculatorService } from './application/services/slot-calculator.service';
import { GetWeeklyScheduleUseCase } from './application/use-cases/get-weekly-schedule.use-case';
import { UpsertWeeklyScheduleUseCase } from './application/use-cases/upsert-weekly-schedule.use-case';
import { ListDateExceptionsUseCase } from './application/use-cases/list-date-exceptions.use-case';
import { CreateDateExceptionUseCase } from './application/use-cases/create-date-exception.use-case';
import { DeleteDateExceptionUseCase } from './application/use-cases/delete-date-exception.use-case';
import { GetAvailableSlotsUseCase } from './application/use-cases/get-available-slots.use-case';
import { VerifyDentistAvailabilityUseCase } from './application/use-cases/verify-dentist-availability.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeeklySchedule.name, schema: WeeklyScheduleSchema },
      { name: DateException.name, schema: DateExceptionSchema },
      // Registro independiente de 'Auth'/'Appointment' bajo los mismos
      // tokens literales que ya usa appointment.module.ts para 'Patient'/'Auth'
      // — evita importar AppointmentModule y una dependencia circular, ya
      // que AppointmentModule importa AvailabilityModule (ver A.5 del plan).
      { name: 'Auth', schema: AuthSchema },
      { name: 'Appointment', schema: AppointmentSchema },
    ]),
  ],
  controllers: [AvailabilityController],
  providers: [
    { provide: AvailabilityRepository, useClass: AvailabilityMongoRepository },
    SlotCalculatorService,
    GetWeeklyScheduleUseCase,
    UpsertWeeklyScheduleUseCase,
    ListDateExceptionsUseCase,
    CreateDateExceptionUseCase,
    DeleteDateExceptionUseCase,
    GetAvailableSlotsUseCase,
    VerifyDentistAvailabilityUseCase,
  ],
  exports: [AvailabilityRepository, VerifyDentistAvailabilityUseCase],
})
export class AvailabilityModule {}
