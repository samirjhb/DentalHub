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
import { RegisterAuthDto } from '../../application/dto/register-auth.dto';
import { LoginAuthDto } from '../../application/dto/login-auth.dto';
import { CreateStaffDto } from '../../application/dto/create-staff-auth.dto';
import { UpdateStaffDto } from '../../application/dto/update-staff-auth.dto';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { FindStaffQueryDto } from '../../application/dto/find-staff-query.dto';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { CreateStaffUseCase } from '../../application/use-cases/create-staff.use-case';
import { UpdateStaffUseCase } from '../../application/use-cases/update-staff.use-case';
import { FindStaffByRoleUseCase } from '../../application/use-cases/find-staff-by-role.use-case';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';

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
  handleLogin(@Body() loginBody: LoginAuthDto) {
    return this.loginUseCase.execute(loginBody);
  }

  @Post('staff')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
  createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.createStaffUseCase.execute(createStaffDto);
  }

  @Get('staff')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.RECEPTIONIST, Role.DENTIST)
  findStaff(@Query() query: FindStaffQueryDto) {
    return this.findStaffByRoleUseCase.execute(query.role);
  }

  @Patch('staff/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.CLINIC_ADMIN)
  updateStaff(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.updateStaffUseCase.execute(id, updateStaffDto);
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
}
