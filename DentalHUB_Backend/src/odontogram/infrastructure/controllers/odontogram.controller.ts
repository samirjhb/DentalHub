import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateOdontogramDto } from '../../application/dto/create-odontogram.dto';
import { UpdateToothDto } from '../../application/dto/update-tooth.dto';
import { UpdateGeneralObservationsDto } from '../../application/dto/update-general-observations.dto';
import { CreateOdontogramUseCase } from '../../application/use-cases/create-odontogram.use-case';
import { FindOdontogramByPatientUseCase } from '../../application/use-cases/find-odontogram-by-patient.use-case';
import { UpdateToothUseCase } from '../../application/use-cases/update-tooth.use-case';
import { UpdateGeneralObservationsUseCase } from '../../application/use-cases/update-general-observations.use-case';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';

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
@ApiTags('Odontograma')
@Controller('odontogram')
export class OdontogramController {
  constructor(
    private readonly createOdontogramUseCase: CreateOdontogramUseCase,
    private readonly findOdontogramByPatientUseCase: FindOdontogramByPatientUseCase,
    private readonly updateToothUseCase: UpdateToothUseCase,
    private readonly updateGeneralObservationsUseCase: UpdateGeneralObservationsUseCase,
  ) {}

  @Post()
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Crear el odontograma de un paciente (32 piezas en Sano)' })
  @ApiResponse({ status: 201, description: 'Odontograma creado correctamente' })
  @ApiResponse({ status: 400, description: 'Ya existe un odontograma para este paciente' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  create(@Body() createOdontogramDto: CreateOdontogramDto) {
    return this.createOdontogramUseCase.execute(createOdontogramDto);
  }

  @Get('patient/:patientId')
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Obtener el odontograma de un paciente' })
  @ApiResponse({ status: 200, description: 'Odontograma encontrado' })
  @ApiResponse({ status: 404, description: 'El paciente aún no tiene odontograma' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.findOdontogramByPatientUseCase.execute(patientId);
  }

  @Patch('patient/:patientId/teeth/:toothNumber')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Actualizar el estado de una pieza dental específica' })
  @ApiResponse({ status: 200, description: 'Pieza actualizada correctamente' })
  @ApiResponse({ status: 400, description: 'Pieza dental no válida' })
  @ApiResponse({ status: 404, description: 'El paciente aún no tiene odontograma' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente' })
  @ApiParam({ name: 'toothNumber', description: 'Código FDI de la pieza (ej. 36)' })
  updateTooth(
    @Param('patientId') patientId: string,
    @Param('toothNumber') toothNumber: string,
    @Body() updateToothDto: UpdateToothDto,
  ) {
    return this.updateToothUseCase.execute(patientId, toothNumber, updateToothDto);
  }

  @Patch('patient/:patientId')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Actualizar las observaciones generales del odontograma' })
  @ApiResponse({ status: 200, description: 'Observaciones actualizadas correctamente' })
  @ApiResponse({ status: 404, description: 'El paciente aún no tiene odontograma' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente' })
  updateGeneralObservations(
    @Param('patientId') patientId: string,
    @Body() dto: UpdateGeneralObservationsDto,
  ) {
    return this.updateGeneralObservationsUseCase.execute(
      patientId,
      dto.observations,
    );
  }
}
