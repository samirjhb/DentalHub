import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreatePrescriptionDto } from '../../application/dto/create-prescription.dto';
import { FilterPrescriptionDto } from '../../application/dto/filter-prescription.dto';
import { CreatePrescriptionUseCase } from '../../application/use-cases/create-prescription.use-case';
import { FindPrescriptionsUseCase } from '../../application/use-cases/find-prescriptions.use-case';
import { FindPrescriptionByIdUseCase } from '../../application/use-cases/find-prescription-by-id.use-case';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';

// Emitir una receta es acto médico — solo DENTIST, más los admins por si
// necesitan corregir algo administrativamente (mismo criterio que otros
// módulos: admins pueden todo). Lectura = mismo set que clinical-record's
// READ_ROLES (CLINICAL_ROLES en el frontend) — RECEPTIONIST y PATIENT fuera.
const WRITE_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.DENTIST];
const READ_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
];

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Prescripciones')
@Controller('prescriptions')
export class PrescriptionController {
  constructor(
    private readonly createPrescriptionUseCase: CreatePrescriptionUseCase,
    private readonly findPrescriptionsUseCase: FindPrescriptionsUseCase,
    private readonly findPrescriptionByIdUseCase: FindPrescriptionByIdUseCase,
  ) {}

  @Post()
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Emitir una receta (valida paciente, odontólogo y ficha clínica opcional)' })
  @ApiResponse({ status: 201, description: 'Receta emitida correctamente' })
  @ApiResponse({ status: 404, description: 'Paciente, odontólogo o ficha clínica no encontrados' })
  create(@Body() dto: CreatePrescriptionDto) {
    return this.createPrescriptionUseCase.execute(dto);
  }

  @Get()
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Listar recetas con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Listado de recetas' })
  findAll(@Query() filter: FilterPrescriptionDto) {
    return this.findPrescriptionsUseCase.execute(filter);
  }

  @Get(':id')
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Obtener una receta puntual' })
  @ApiResponse({ status: 200, description: 'Receta encontrada' })
  @ApiResponse({ status: 404, description: 'Receta no encontrada' })
  @ApiParam({ name: 'id', description: 'ID de la receta' })
  findOne(@Param('id') id: string) {
    return this.findPrescriptionByIdUseCase.execute(id);
  }
}
