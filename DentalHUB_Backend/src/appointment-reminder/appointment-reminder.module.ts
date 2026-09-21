import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientSchema } from 'src/patient/infrastructure/persistence/mongo/patient.schema';
import { AuthSchema } from 'src/auth/infrastructure/persistence/mongo/auth.schema';
import { AppointmentModule } from 'src/appointment/appointment.module';
import { MailModule } from 'src/shared/mail/mail.module';
import { PatientLookupPort } from './domain/ports/patient-lookup.port';
import { DentistLookupPort } from './domain/ports/dentist-lookup.port';
import { PatientLookupMongoAdapter } from './infrastructure/persistence/mongo/patient-lookup-mongo.adapter';
import { DentistLookupMongoAdapter } from './infrastructure/persistence/mongo/dentist-lookup-mongo.adapter';
import { SendAppointmentRemindersUseCase } from './application/use-cases/send-appointment-reminders.use-case';
import { AppointmentReminderCron } from './infrastructure/cron/appointment-reminder.cron';

@Module({
  imports: [
    // Registro independiente de 'Patient'/'Auth' bajo los mismos tokens
    // literales que ya usa appointment.module.ts — ni PatientModule ni
    // AuthModule exportan su repositorio hoy, así que en vez de agregarles
    // un export solo para esto, este módulo lee directamente lo mínimo que
    // necesita (nombre + email) a través de PatientLookupPort/DentistLookupPort.
    MongooseModule.forFeature([
      { name: 'Patient', schema: PatientSchema },
      { name: 'Auth', schema: AuthSchema },
    ]),
    // AppointmentModule sí exporta AppointmentRepository.
    AppointmentModule,
    MailModule,
  ],
  providers: [
    { provide: PatientLookupPort, useClass: PatientLookupMongoAdapter },
    { provide: DentistLookupPort, useClass: DentistLookupMongoAdapter },
    SendAppointmentRemindersUseCase,
    AppointmentReminderCron,
  ],
})
export class AppointmentReminderModule {}
