import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Appointment,
  AppointmentSchema,
} from './infrastructure/persistence/mongo/appointment.schema';
import { PatientSchema } from 'src/patient/infrastructure/persistence/mongo/patient.schema';
import { AuthSchema } from 'src/auth/infrastructure/persistence/mongo/auth.schema';
import { AppointmentController } from './infrastructure/controllers/appointment.controller';
import { AppointmentRepository } from './domain/repositories/appointment.repository';
import { AppointmentMongoRepository } from './infrastructure/persistence/mongo/appointment-mongo.repository';
import { CreateAppointmentUseCase } from './application/use-cases/create-appointment.use-case';
import { FindAllAppointmentsUseCase } from './application/use-cases/find-all-appointments.use-case';
import { FindAppointmentByIdUseCase } from './application/use-cases/find-appointment-by-id.use-case';
import { UpdateAppointmentStatusUseCase } from './application/use-cases/update-appointment-status.use-case';
import { RescheduleAppointmentUseCase } from './application/use-cases/reschedule-appointment.use-case';
import { FindMyAppointmentsUseCase } from './application/use-cases/find-my-appointments.use-case';
import { RequestAppointmentUseCase } from './application/use-cases/request-appointment.use-case';
import { CancelMyAppointmentUseCase } from './application/use-cases/cancel-my-appointment.use-case';
import { AppointmentOwnershipGuard } from './infrastructure/guards/appointment-ownership.guard';
import { AvailabilityModule } from 'src/availability/availability.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      // Registro independiente de 'Patient'/'Auth' bajo los mismos tokens literales
      // que ya usan clinical-record/odontogram — evita acoplarse a los repositorios
      // de esos módulos.
      { name: 'Patient', schema: PatientSchema },
      { name: 'Auth', schema: AuthSchema },
    ]),
    // Para validar que la cita caiga dentro del horario del odontólogo — el
    // sentido de la dependencia es único (Appointment -> Availability),
    // AvailabilityModule no importa este módulo (registra su propio
    // 'Appointment' de forma independiente, ver availability.module.ts).
    AvailabilityModule,
  ],
  controllers: [AppointmentController],
  providers: [
    { provide: AppointmentRepository, useClass: AppointmentMongoRepository },
    CreateAppointmentUseCase,
    FindAllAppointmentsUseCase,
    FindAppointmentByIdUseCase,
    UpdateAppointmentStatusUseCase,
    RescheduleAppointmentUseCase,
    FindMyAppointmentsUseCase,
    RequestAppointmentUseCase,
    CancelMyAppointmentUseCase,
    AppointmentOwnershipGuard,
  ],
  exports: [AppointmentRepository],
})
export class AppointmentModule {}
