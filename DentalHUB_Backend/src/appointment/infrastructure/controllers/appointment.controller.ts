import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateAppointmentDto } from '../../application/dto/create-appointment.dto';
import { RescheduleAppointmentDto } from '../../application/dto/reschedule-appointment.dto';
import { UpdateAppointmentStatusDto } from '../../application/dto/update-appointment-status.dto';
import { FilterAppointmentDto } from '../../application/dto/filter-appointment.dto';
import { FilterMyAppointmentDto } from '../../application/dto/filter-my-appointment.dto';
import { RequestAppointmentDto } from '../../application/dto/request-appointment.dto';
import { CreateAppointmentUseCase } from '../../application/use-cases/create-appointment.use-case';
import { FindAllAppointmentsUseCase } from '../../application/use-cases/find-all-appointments.use-case';
import { FindAppointmentByIdUseCase } from '../../application/use-cases/find-appointment-by-id.use-case';
import { UpdateAppointmentStatusUseCase } from '../../application/use-cases/update-appointment-status.use-case';
import { RescheduleAppointmentUseCase } from '../../application/use-cases/reschedule-appointment.use-case';
import { FindMyAppointmentsUseCase } from '../../application/use-cases/find-my-appointments.use-case';
import { RequestAppointmentUseCase } from '../../application/use-cases/request-appointment.use-case';
import { CancelMyAppointmentUseCase } from '../../application/use-cases/cancel-my-appointment.use-case';
import { AppointmentOwnershipGuard } from '../guards/appointment-ownership.guard';
import { Appointment } from '../../domain/entities/appointment.entity';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { CurrentPatientId } from 'src/shared/decorators/current-patient-id.decorator';

const WRITE_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
];

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Agenda de Citas')
@Controller('appointment')
export class AppointmentController {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly findAllAppointmentsUseCase: FindAllAppointmentsUseCase,
    private readonly findAppointmentByIdUseCase: FindAppointmentByIdUseCase,
    private readonly updateAppointmentStatusUseCase: UpdateAppointmentStatusUseCase,
    private readonly rescheduleAppointmentUseCase: RescheduleAppointmentUseCase,
    private readonly findMyAppointmentsUseCase: FindMyAppointmentsUseCase,
    private readonly requestAppointmentUseCase: RequestAppointmentUseCase,
    private readonly cancelMyAppointmentUseCase: CancelMyAppointmentUseCase,
  ) {}

  @Post()
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Crear una cita (valida paciente, odontólogo y solapamiento de horario)' })
  @ApiResponse({ status: 201, description: 'Cita creada correctamente' })
  @ApiResponse({ status: 400, description: 'El odontólogo ya tiene una cita en ese horario' })
  @ApiResponse({ status: 404, description: 'Paciente u odontólogo no encontrado' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.createAppointmentUseCase.execute(createAppointmentDto);
  }

  // Declarada antes de GET/POST/:id para que Nest no la capture con el param dinámico.
  @Get('me')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Listar mis propias citas (portal de pacientes)' })
  findMine(
    @CurrentPatientId() patientId: string,
    @Query() filter: FilterMyAppointmentDto,
  ) {
    return this.findMyAppointmentsUseCase.execute(patientId, filter);
  }

  @Post('me')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Solicitar una cita propia (portal de pacientes)' })
  requestMine(
    @CurrentPatientId() patientId: string,
    @Body() dto: RequestAppointmentDto,
  ) {
    return this.requestAppointmentUseCase.execute(patientId, dto);
  }

  @Patch('me/:id/cancel')
  @Roles(Role.PATIENT)
  @UseGuards(AppointmentOwnershipGuard)
  @ApiOperation({ summary: 'Cancelar una cita propia (portal de pacientes)' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  cancelMine(@Req() request: { appointment: Appointment }) {
    return this.cancelMyAppointmentUseCase.execute(request.appointment);
  }

  @Get()
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Listar citas con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Listado de citas' })
  findAll(@Query() filter: FilterAppointmentDto) {
    return this.findAllAppointmentsUseCase.execute(filter);
  }

  @Get(':id')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Obtener una cita puntual' })
  @ApiResponse({ status: 200, description: 'Cita encontrada' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  findOne(@Param('id') id: string) {
    return this.findAppointmentByIdUseCase.execute(id);
  }

  @Patch(':id/status')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Cambiar el estado de una cita' })
  @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.updateAppointmentStatusUseCase.execute(id, dto);
  }

  @Patch(':id/reschedule')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Reprogramar una cita (vuelve a validar solapamiento)' })
  @ApiResponse({ status: 200, description: 'Cita reprogramada correctamente' })
  @ApiResponse({ status: 400, description: 'El odontólogo ya tiene otra cita en ese horario' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la cita' })
  reschedule(
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.rescheduleAppointmentUseCase.execute(id, dto);
  }
}
