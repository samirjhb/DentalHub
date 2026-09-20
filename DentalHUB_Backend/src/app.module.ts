import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PatientModule } from './patient/patient.module';
import { DiagnosticEvaluationModule } from './diagnostic-evaluation/diagnostic-evaluation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './shared/security/jwt.strategy';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ClinicalRecordModule } from './clinical-record/clinical-record.module';
import { AiModule } from './ai/ai.module';
import { OdontogramModule } from './odontogram/odontogram.module';
import { AppointmentModule } from './appointment/appointment.module';
import { BillingModule } from './billing/billing.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION_TEST),
    PatientModule,
    DiagnosticEvaluationModule,
    AuthModule,
    WhatsappModule,
    ClinicalRecordModule,
    AiModule,
    OdontogramModule,
    AppointmentModule,
    BillingModule,
    PrescriptionModule,
    InventoryModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
