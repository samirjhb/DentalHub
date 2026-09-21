import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { CurrentUserId } from 'src/shared/decorators/current-user-id.decorator';
import { CurrentUserRole } from 'src/shared/decorators/current-user-role.decorator';
import { GetWeeklyScheduleUseCase } from '../../application/use-cases/get-weekly-schedule.use-case';
import { UpsertWeeklyScheduleUseCase } from '../../application/use-cases/upsert-weekly-schedule.use-case';
import { ListDateExceptionsUseCase } from '../../application/use-cases/list-date-exceptions.use-case';
import { CreateDateExceptionUseCase } from '../../application/use-cases/create-date-exception.use-case';
import { DeleteDateExceptionUseCase } from '../../application/use-cases/delete-date-exception.use-case';
import { GetAvailableSlotsUseCase } from '../../application/use-cases/get-available-slots.use-case';
import { UpsertWeeklyScheduleDto } from '../../application/dto/upsert-weekly-schedule.dto';
import { CreateDateExceptionDto } from '../../application/dto/create-date-exception.dto';
import { AvailableSlotsQueryDto } from '../../application/dto/available-slots-query.dto';

const READ_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
];
const MANAGE_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.DENTIST];

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Disponibilidad de Odontólogos')
@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly getWeeklyScheduleUseCase: GetWeeklyScheduleUseCase,
    private readonly upsertWeeklyScheduleUseCase: UpsertWeeklyScheduleUseCase,
    private readonly listDateExceptionsUseCase: ListDateExceptionsUseCase,
    private readonly createDateExceptionUseCase: CreateDateExceptionUseCase,
    private readonly deleteDateExceptionUseCase: DeleteDateExceptionUseCase,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
  ) {}

  // Declarada antes de 'schedule/:dentistId' para no ser capturada por el
  // param dinámico — mismo criterio que AppointmentController con 'me'.
  @Get('available-slots')
  @Roles(...READ_ROLES, Role.PATIENT)
  @ApiOperation({ summary: 'Horarios disponibles de un odontólogo en una fecha' })
  getAvailableSlots(@Query() query: AvailableSlotsQueryDto) {
    return this.getAvailableSlotsUseCase.execute(query);
  }

  @Get('schedule/:dentistId')
  @Roles(...READ_ROLES, Role.PATIENT)
  @ApiOperation({ summary: 'Horario semanal de un odontólogo' })
  @ApiParam({ name: 'dentistId', description: 'ID del odontólogo' })
  getSchedule(@Param('dentistId') dentistId: string) {
    return this.getWeeklyScheduleUseCase.execute(dentistId);
  }

  @Put('schedule/:dentistId')
  @Roles(...MANAGE_ROLES)
  @ApiOperation({ summary: 'Reemplaza el horario semanal de un odontólogo' })
  @ApiParam({ name: 'dentistId', description: 'ID del odontólogo' })
  upsertSchedule(
    @Param('dentistId') dentistId: string,
    @Body() dto: UpsertWeeklyScheduleDto,
    @CurrentUserId() requesterId: string,
    @CurrentUserRole() requesterRole: Role,
  ) {
    return this.upsertWeeklyScheduleUseCase.execute(
      dentistId,
      dto,
      requesterId,
      requesterRole,
    );
  }

  @Get('exceptions/:dentistId')
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Lista los bloqueos puntuales de un odontólogo' })
  @ApiParam({ name: 'dentistId', description: 'ID del odontólogo' })
  listExceptions(@Param('dentistId') dentistId: string) {
    return this.listDateExceptionsUseCase.execute(dentistId);
  }

  @Post('exceptions/:dentistId')
  @Roles(...MANAGE_ROLES)
  @ApiOperation({ summary: 'Bloquea una fecha (o rango horario) puntual' })
  @ApiParam({ name: 'dentistId', description: 'ID del odontólogo' })
  createException(
    @Param('dentistId') dentistId: string,
    @Body() dto: CreateDateExceptionDto,
    @CurrentUserId() requesterId: string,
    @CurrentUserRole() requesterRole: Role,
  ) {
    return this.createDateExceptionUseCase.execute(
      dentistId,
      dto,
      requesterId,
      requesterRole,
    );
  }

  @Delete('exceptions/:dentistId/:exceptionId')
  @Roles(...MANAGE_ROLES)
  @ApiOperation({ summary: 'Elimina un bloqueo puntual' })
  @ApiParam({ name: 'dentistId', description: 'ID del odontólogo' })
  @ApiParam({ name: 'exceptionId', description: 'ID del bloqueo' })
  deleteException(
    @Param('dentistId') dentistId: string,
    @Param('exceptionId') exceptionId: string,
    @CurrentUserId() requesterId: string,
    @CurrentUserRole() requesterRole: Role,
  ) {
    return this.deleteDateExceptionUseCase.execute(
      dentistId,
      exceptionId,
      requesterId,
      requesterRole,
    );
  }
}
