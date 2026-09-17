import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Auth, AuthSchema } from './infrastructure/persistence/mongo/auth.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './infrastructure/persistence/mongo/refresh-token.schema';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthRepository } from './domain/repositories/auth.repository';
import { RefreshTokenRepository } from './domain/repositories/refresh-token.repository';
import { AuthMongoRepository } from './infrastructure/persistence/mongo/auth-mongo.repository';
import { RefreshTokenMongoRepository } from './infrastructure/persistence/mongo/refresh-token-mongo.repository';
import { AuthSeedService } from './infrastructure/bootstrap/auth-seed.service';
import { TokenIssuerService } from './application/services/token-issuer.service';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { CreateStaffUseCase } from './application/use-cases/create-staff.use-case';
import { FindStaffByRoleUseCase } from './application/use-cases/find-staff-by-role.use-case';
import { jwtConstanst } from '../shared/security/jwt.constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.register({
      secret: jwtConstanst.secret,
      signOptions: { expiresIn: jwtConstanst.accessTokenExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: AuthRepository, useClass: AuthMongoRepository },
    { provide: RefreshTokenRepository, useClass: RefreshTokenMongoRepository },
    TokenIssuerService,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    CreateStaffUseCase,
    FindStaffByRoleUseCase,
    AuthSeedService,
  ],
})
export class AuthModule {}
