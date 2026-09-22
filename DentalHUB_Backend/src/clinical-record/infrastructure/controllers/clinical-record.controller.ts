import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CreateClinicalRecordDto } from '../../application/dto/create-clinical-record.dto';
import { UploadAttachmentDto } from '../../application/dto/upload-attachment.dto';
import { UpdateClinicalRecordDto } from '../../application/dto/update-clinical-record.dto';
import { UpdateStatusDto } from '../../application/dto/update-status.dto';
import { AddDepositDto } from '../../application/dto/add-deposit.dto';
import { UpdateAppointmentDateDto } from '../../application/dto/update-appointment-date.dto';
import { AddTreatmentDto } from '../../application/dto/add-treatment.dto';
import { FilterClinicalRecordDto } from '../../application/dto/filter-clinical-record.dto';
import { FindAllClinicalRecordsQueryDto } from '../../application/dto/find-all-clinical-records-query.dto';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { CreateClinicalRecordUseCase } from '../../application/use-cases/create-clinical-record.use-case';
import { FindAllClinicalRecordsUseCase } from '../../application/use-cases/find-all-clinical-records.use-case';
import { FindClinicalRecordsWithFiltersUseCase } from '../../application/use-cases/find-clinical-records-with-filters.use-case';
import { FindClinicalRecordByIdUseCase } from '../../application/use-cases/find-clinical-record-by-id.use-case';
import { UpdateClinicalRecordUseCase } from '../../application/use-cases/update-clinical-record.use-case';
import { RemoveClinicalRecordUseCase } from '../../application/use-cases/remove-clinical-record.use-case';
import { UpdateTreatmentStatusUseCase } from '../../application/use-cases/update-treatment-status.use-case';
import { AddDepositUseCase } from '../../application/use-cases/add-deposit.use-case';
import { AddTreatmentUseCase } from '../../application/use-cases/add-treatment.use-case';
import { RemoveTreatmentUseCase } from '../../application/use-cases/remove-treatment.use-case';
import { CalculatePendingBalanceUseCase } from '../../application/use-cases/calculate-pending-balance.use-case';
import { CalculateTotalPendingBalanceUseCase } from '../../application/use-cases/calculate-total-pending-balance.use-case';
import { UpdateAppointmentDateUseCase } from '../../application/use-cases/update-appointment-date.use-case';
import { FindMyClinicalSummaryUseCase } from '../../application/use-cases/find-my-clinical-summary.use-case';
import { UploadClinicalAttachmentUseCase } from '../../application/use-cases/upload-clinical-attachment.use-case';
import { DeleteClinicalAttachmentUseCase } from '../../application/use-cases/delete-clinical-attachment.use-case';
import { CurrentPatientId } from 'src/shared/decorators/current-patient-id.decorator';
import { CurrentUserId } from 'src/shared/decorators/current-user-id.decorator';

const READ_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
];
const WRITE_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.DENTIST];

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Ficha Clínica')
@Controller('clinical-record')
export class ClinicalRecordController {
  constructor(
    private readonly createClinicalRecordUseCase: CreateClinicalRecordUseCase,
    private readonly findAllClinicalRecordsUseCase: FindAllClinicalRecordsUseCase,
    private readonly findClinicalRecordsWithFiltersUseCase: FindClinicalRecordsWithFiltersUseCase,
    private readonly findClinicalRecordByIdUseCase: FindClinicalRecordByIdUseCase,
    private readonly updateClinicalRecordUseCase: UpdateClinicalRecordUseCase,
    private readonly removeClinicalRecordUseCase: RemoveClinicalRecordUseCase,
    private readonly updateTreatmentStatusUseCase: UpdateTreatmentStatusUseCase,
    private readonly addDepositUseCase: AddDepositUseCase,
    private readonly addTreatmentUseCase: AddTreatmentUseCase,
    private readonly removeTreatmentUseCase: RemoveTreatmentUseCase,
    private readonly calculatePendingBalanceUseCase: CalculatePendingBalanceUseCase,
    private readonly calculateTotalPendingBalanceUseCase: CalculateTotalPendingBalanceUseCase,
    private readonly updateAppointmentDateUseCase: UpdateAppointmentDateUseCase,
    private readonly findMyClinicalSummaryUseCase: FindMyClinicalSummaryUseCase,
    private readonly uploadClinicalAttachmentUseCase: UploadClinicalAttachmentUseCase,
    private readonly deleteClinicalAttachmentUseCase: DeleteClinicalAttachmentUseCase,
  ) {}

  @Post()
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Crear una nueva ficha clínica' })
  @ApiResponse({
    status: 201,
    description: 'Ficha clínica creada correctamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  create(@Body() createClinicalRecordDto: CreateClinicalRecordDto) {
    return this.createClinicalRecordUseCase.execute(createClinicalRecordDto);
  }

  @Get()
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Obtener todas las fichas clínicas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de fichas clínicas obtenida correctamente',
  })
  findAll(@Query() query: FindAllClinicalRecordsQueryDto) {
    return this.findAllClinicalRecordsUseCase.execute(query);
  }

  @Get('filter')
  @Roles(...READ_ROLES)
  @ApiOperation({
    summary: 'Filtrar fichas clínicas por diferentes criterios',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de fichas clínicas filtrada correctamente',
  })
  findWithFilters(@Query() filterDto: FilterClinicalRecordDto) {
    return this.findClinicalRecordsWithFiltersUseCase.execute(filterDto);
  }

  // Declarada antes de :id para que Nest no la capture con el param dinámico.
  @Get('me/summary')
  @Roles(Role.PATIENT)
  @ApiOperation({
    summary:
      'Mi resumen de historial clínico (portal de pacientes) — sin ' +
      'radiografías ni observaciones internas del staff',
  })
  findMySummary(@CurrentPatientId() patientId: string) {
    return this.findMyClinicalSummaryUseCase.execute(patientId);
  }

  @Get(':id')
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Obtener una ficha clínica por ID' })
  @ApiResponse({ status: 200, description: 'Ficha clínica encontrada' })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  findOne(@Param('id') id: string) {
    return this.findClinicalRecordByIdUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Actualizar una ficha clínica' })
  @ApiResponse({
    status: 200,
    description: 'Ficha clínica actualizada correctamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  update(
    @Param('id') id: string,
    @Body() updateClinicalRecordDto: UpdateClinicalRecordDto,
  ) {
    return this.updateClinicalRecordUseCase.execute(id, updateClinicalRecordDto);
  }

  @Delete(':id')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Eliminar una ficha clínica' })
  @ApiResponse({
    status: 200,
    description: 'Ficha clínica eliminada correctamente',
  })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.removeClinicalRecordUseCase.execute(id);
  }

  @Patch(':id/treatments/:treatmentIndex/status')
  @Roles(...WRITE_ROLES)
  @ApiOperation({
    summary: 'Actualizar el estado de un tratamiento específico',
  })
  @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Estado no válido' })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  @ApiParam({
    name: 'treatmentIndex',
    description: 'Índice del tratamiento a actualizar',
  })
  updateStatus(
    @Param('id') id: string,
    @Param('treatmentIndex') treatmentIndex: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.updateTreatmentStatusUseCase.execute(
      id,
      updateStatusDto.status,
      treatmentIndex,
    );
  }

  @Post(':id/treatments/:treatmentIndex/deposit')
  @Roles(...WRITE_ROLES)
  @ApiOperation({
    summary: 'Registrar un abono a un tratamiento específico',
  })
  @ApiResponse({ status: 200, description: 'Abono registrado correctamente' })
  @ApiResponse({ status: 400, description: 'Monto inválido' })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  @ApiParam({
    name: 'treatmentIndex',
    description: 'Índice del tratamiento a actualizar',
  })
  addDeposit(
    @Param('id') id: string,
    @Param('treatmentIndex') treatmentIndex: number,
    @Body() addDepositDto: AddDepositDto,
  ) {
    return this.addDepositUseCase.execute(
      id,
      addDepositDto.amount,
      treatmentIndex,
    );
  }

  @Post(':id/treatments')
  @Roles(...WRITE_ROLES)
  @ApiOperation({
    summary: 'Agregar un nuevo tratamiento a una ficha clínica existente',
  })
  @ApiResponse({
    status: 201,
    description: 'Tratamiento agregado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  addTreatment(
    @Param('id') id: string,
    @Body() addTreatmentDto: AddTreatmentDto,
  ) {
    return this.addTreatmentUseCase.execute(id, addTreatmentDto);
  }

  @Delete(':id/treatments/:treatmentIndex')
  @Roles(...WRITE_ROLES)
  @ApiOperation({
    summary: 'Eliminar un tratamiento específico de una ficha clínica',
  })
  @ApiResponse({
    status: 200,
    description: 'Tratamiento eliminado correctamente',
  })
  @ApiResponse({ status: 400, description: 'Tratamiento no encontrado' })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  @ApiParam({
    name: 'treatmentIndex',
    description: 'Índice del tratamiento a eliminar',
  })
  removeTreatment(
    @Param('id') id: string,
    @Param('treatmentIndex') treatmentIndex: number,
  ) {
    return this.removeTreatmentUseCase.execute(id, treatmentIndex);
  }

  @Get(':id/treatments/:treatmentIndex/balance')
  @Roles(...READ_ROLES)
  @ApiOperation({
    summary: 'Calcular el saldo pendiente de un tratamiento específico',
  })
  @ApiResponse({ status: 200, description: 'Saldo calculado correctamente' })
  @ApiResponse({ status: 400, description: 'Tratamiento no encontrado' })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  @ApiParam({
    name: 'treatmentIndex',
    description: 'Índice del tratamiento',
  })
  calculatePendingBalance(
    @Param('id') id: string,
    @Param('treatmentIndex') treatmentIndex: number,
  ) {
    return this.calculatePendingBalanceUseCase.execute(id, treatmentIndex);
  }

  @Get(':id/balance')
  @Roles(...READ_ROLES)
  @ApiOperation({
    summary: 'Calcular el saldo pendiente total de una ficha clínica',
  })
  @ApiResponse({
    status: 200,
    description: 'Saldo total calculado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  calculateTotalPendingBalance(@Param('id') id: string) {
    return this.calculateTotalPendingBalanceUseCase.execute(id);
  }

  @Patch(':id/treatments/:treatmentIndex/appointment-date')
  @Roles(...WRITE_ROLES)
  @ApiOperation({
    summary: 'Actualizar la fecha de cita de un tratamiento específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Fecha de cita actualizada correctamente',
  })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  @ApiParam({
    name: 'treatmentIndex',
    description: 'Índice del tratamiento a actualizar',
  })
  updateAppointmentDate(
    @Param('id') id: string,
    @Param('treatmentIndex') treatmentIndex: number,
    @Body() updateAppointmentDateDto: UpdateAppointmentDateDto,
  ) {
    return this.updateAppointmentDateUseCase.execute(
      id,
      updateAppointmentDateDto.date,
      treatmentIndex,
    );
  }

  @Post(':id/attachments')
  @Roles(...WRITE_ROLES)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        treatmentIndex: { type: 'number' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  @ApiOperation({
    summary: 'Subir un adjunto (radiografía, foto o PDF) a una ficha clínica',
  })
  @ApiResponse({ status: 201, description: 'Adjunto subido correctamente' })
  @ApiResponse({ status: 400, description: 'Archivo faltante, tipo no permitido o tratamiento inválido' })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAttachmentDto,
    @CurrentUserId() userId: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debe adjuntar un archivo (imagen JPG/PNG/WEBP o PDF, máximo 10MB)',
      );
    }
    return this.uploadClinicalAttachmentUseCase.execute(
      id,
      file,
      dto.treatmentIndex,
      userId,
    );
  }

  @Delete(':id/attachments/:attachmentId')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Eliminar un adjunto de una ficha clínica' })
  @ApiResponse({ status: 200, description: 'Adjunto eliminado correctamente' })
  @ApiResponse({ status: 400, description: 'Adjunto no encontrado' })
  @ApiResponse({ status: 404, description: 'Ficha clínica no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la ficha clínica' })
  @ApiParam({ name: 'attachmentId', description: 'ID del adjunto' })
  deleteAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.deleteClinicalAttachmentUseCase.execute(id, attachmentId);
  }
}
