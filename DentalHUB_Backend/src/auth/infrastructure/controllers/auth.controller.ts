import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RegisterAuthDto } from '../../application/dto/register-auth.dto';
import { LoginAuthDto } from '../../application/dto/login-auth.dto';
import { CreateStaffDto } from '../../application/dto/create-staff-auth.dto';
import { UpdateStaffDto } from '../../application/dto/update-staff-auth.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { FindStaffQueryDto } from '../../application/dto/find-staff-query.dto';
import { GrantPatientAccessDto } from '../../application/dto/grant-patient-access.dto';
import { ForgotPasswordDto } from '../../application/dto/forgot-password.dto';
import { ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { CreateStaffUseCase } from '../../application/use-cases/create-staff.use-case';
import { UpdateStaffUseCase } from '../../application/use-cases/update-staff.use-case';
import { FindStaffByRoleUseCase } from '../../application/use-cases/find-staff-by-role.use-case';
import { GrantPatientAccessUseCase } from '../../application/use-cases/grant-patient-access.use-case';
import { FindPatientAccessUseCase } from '../../application/use-cases/find-patient-access.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { CurrentUserRole } from 'src/shared/decorators/current-user-role.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly createStaffUseCase: CreateStaffUseCase,
    private readonly updateStaffUseCase: UpdateStaffUseCase,
    private readonly findStaffByRoleUseCase: FindStaffByRoleUseCase,
    private readonly grantPatientAccessUseCase: GrantPatientAccessUseCase,
    private readonly findPatientAccessUseCase: FindPatientAccessUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('register')
  async handleRegister(@Body() registerBody: RegisterAuthDto) {
    try {
      return await this.registerUseCase.execute(registerBody);
    } catch (error) {
      console.log('Error en Registar usuario', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          error.message || 'Error al registrar usuario',
          error.status || 500,
        );
      }
    }
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  handleLogin(@Body() loginBody: LoginAuthDto) {
    return this.loginUseCase.execute(loginBody);
  }

  @Post('staff')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
  createStaff(
    @Body() createStaffDto: CreateStaffDto,
    @CurrentUserRole() requesterRole: Role,
  ) {
    return this.createStaffUseCase.execute(createStaffDto, requesterRole);
  }

  // PATIENT incluido a propósito: el Portal de Pacientes reutiliza este
  // mismo endpoint (filtrado por ?role=DENTIST) para poblar el selector de
  // odontólogo al solicitar una cita — mismo directorio de staff que ya usa
  // la Agenda, sin datos clínicos/financieros de por medio.
  @Get('staff')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.RECEPTIONIST, Role.DENTIST, Role.PATIENT)
  findStaff(@Query() query: FindStaffQueryDto) {
    return this.findStaffByRoleUseCase.execute(query.role);
  }

  @Patch('staff/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
  updateStaff(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @CurrentUserRole() requesterRole: Role,
  ) {
    return this.updateStaffUseCase.execute(id, updateStaffDto, requesterRole);
  }

  @Post('patient-access')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.RECEPTIONIST)
  grantPatientAccess(@Body() grantPatientAccessDto: GrantPatientAccessDto) {
    return this.grantPatientAccessUseCase.execute(grantPatientAccessDto);
  }

  @Get('patient-access/:patientId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.RECEPTIONIST)
  findPatientAccess(@Param('patientId') patientId: string) {
    return this.findPatientAccessUseCase.execute(patientId);
  }

  // Sin guard a propósito: el access token puede estar vencido justo cuando se
  // necesita refrescar; el refresh token del body es la credencial real de esta ruta.
  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(refreshTokenDto);
  }

  // Sin guard por el mismo motivo que /refresh: el refresh token es la credencial.
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.logoutUseCase.execute(refreshTokenDto.refreshToken);
  }

  // Sin guard a propósito: quien olvidó su contraseña no tiene sesión.
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(forgotPasswordDto);
  }

  // Sin guard por el mismo motivo: el token de reseteo del body es la credencial.
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(resetPasswordDto);
  }
}
