import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { CreatePatientDto } from '../../application/dto/create-patient.dto';
import { UpdatePatientDto } from '../../application/dto/update-patient.dto';
import { CreatePatientUseCase } from '../../application/use-cases/create-patient.use-case';
import { FindAllPatientsUseCase } from '../../application/use-cases/find-all-patients.use-case';
import { FindPatientByIdUseCase } from '../../application/use-cases/find-patient-by-id.use-case';
import { UpdatePatientUseCase } from '../../application/use-cases/update-patient.use-case';
import { RemovePatientUseCase } from '../../application/use-cases/remove-patient.use-case';

const STAFF_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
];
const WRITE_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.RECEPTIONIST];

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Registro de Paciente')
@Controller('patient')
export class PatientController {
  constructor(
    private readonly createPatientUseCase: CreatePatientUseCase,
    private readonly findAllPatientsUseCase: FindAllPatientsUseCase,
    private readonly findPatientByIdUseCase: FindPatientByIdUseCase,
    private readonly updatePatientUseCase: UpdatePatientUseCase,
    private readonly removePatientUseCase: RemovePatientUseCase,
  ) {}

  @Post()
  @Roles(...WRITE_ROLES)
  async create(@Body() createPatientDto: CreatePatientDto) {
    return await this.createPatientUseCase.execute(createPatientDto);
  }

  @Get()
  @Roles(...STAFF_ROLES)
  async findAll() {
    return await this.findAllPatientsUseCase.execute();
  }

  @Get(':id')
  @Roles(...STAFF_ROLES)
  async findOne(@Param('id') id: string) {
    return await this.findPatientByIdUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(...WRITE_ROLES)
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.updatePatientUseCase.execute(id, updatePatientDto);
  }

  @Delete(':id')
  @Roles(...WRITE_ROLES)
  remove(@Param('id') id: string) {
    return this.removePatientUseCase.execute(id);
  }
}
