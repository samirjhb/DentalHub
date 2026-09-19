import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Auth, AuthSchema } from './infrastructure/persistence/mongo/auth.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './infrastructure/persistence/mongo/refresh-token.schema';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from './infrastructure/persistence/mongo/password-reset-token.schema';
import { PatientSchema } from '../patient/infrastructure/persistence/mongo/patient.schema';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthRepository } from './domain/repositories/auth.repository';
import { RefreshTokenRepository } from './domain/repositories/refresh-token.repository';
import { PasswordResetTokenRepository } from './domain/repositories/password-reset-token.repository';
import { AuthMongoRepository } from './infrastructure/persistence/mongo/auth-mongo.repository';
import { RefreshTokenMongoRepository } from './infrastructure/persistence/mongo/refresh-token-mongo.repository';
import { PasswordResetTokenMongoRepository } from './infrastructure/persistence/mongo/password-reset-token-mongo.repository';
import { AuthSeedService } from './infrastructure/bootstrap/auth-seed.service';
import { MailModule } from '../shared/mail/mail.module';
import { TokenIssuerService } from './application/services/token-issuer.service';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { CreateStaffUseCase } from './application/use-cases/create-staff.use-case';
import { UpdateStaffUseCase } from './application/use-cases/update-staff.use-case';
import { FindStaffByRoleUseCase } from './application/use-cases/find-staff-by-role.use-case';
import { GrantPatientAccessUseCase } from './application/use-cases/grant-patient-access.use-case';
import { FindPatientAccessUseCase } from './application/use-cases/find-patient-access.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { jwtConstanst } from '../shared/security/jwt.constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
      // Registro independiente de 'Patient' bajo el mismo token literal que ya
      // usan appointment/billing/clinical-record — evita acoplarse al PatientRepository.
      { name: 'Patient', schema: PatientSchema },
    ]),
    JwtModule.register({
      secret: jwtConstanst.secret,
      signOptions: { expiresIn: jwtConstanst.accessTokenExpiresIn },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    { provide: AuthRepository, useClass: AuthMongoRepository },
    { provide: RefreshTokenRepository, useClass: RefreshTokenMongoRepository },
    {
      provide: PasswordResetTokenRepository,
      useClass: PasswordResetTokenMongoRepository,
    },
    TokenIssuerService,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    CreateStaffUseCase,
    UpdateStaffUseCase,
    FindStaffByRoleUseCase,
    GrantPatientAccessUseCase,
    FindPatientAccessUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    AuthSeedService,
  ],
})
export class AuthModule {}
