import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsDateRangeDto } from '../../application/dto/reports-date-range.dto';
import { GetRevenueReportUseCase } from '../../application/use-cases/get-revenue-report.use-case';
import { GetTreatmentsReportUseCase } from '../../application/use-cases/get-treatments-report.use-case';
import { GetAppointmentsReportUseCase } from '../../application/use-cases/get-appointments-report.use-case';
import { GetNewPatientsReportUseCase } from '../../application/use-cases/get-new-patients-report.use-case';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';

// Métricas de gestión, no operativas — idéntico criterio que
// TOTAL_BALANCE_ROLES de billing.controller.ts. Un solo gate para los 4
// endpoints, no hace falta una matriz más granular en un módulo de solo lectura.
const REPORTS_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN];

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...REPORTS_ROLES)
@ApiTags('Reportes')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly getRevenueReportUseCase: GetRevenueReportUseCase,
    private readonly getTreatmentsReportUseCase: GetTreatmentsReportUseCase,
    private readonly getAppointmentsReportUseCase: GetAppointmentsReportUseCase,
    private readonly getNewPatientsReportUseCase: GetNewPatientsReportUseCase,
  ) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Ingresos cobrados en el rango, desglosados por método de pago' })
  @ApiResponse({ status: 200, description: 'Resumen de ingresos' })
  getRevenue(@Query() filter: ReportsDateRangeDto) {
    return this.getRevenueReportUseCase.execute(filter);
  }

  @Get('treatments')
  @ApiOperation({ summary: 'Tratamientos por estado en el rango, a través de todas las fichas' })
  @ApiResponse({ status: 200, description: 'Resumen de tratamientos' })
  getTreatments(@Query() filter: ReportsDateRangeDto) {
    return this.getTreatmentsReportUseCase.execute(filter);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Citas por estado y por odontólogo en el rango' })
  @ApiResponse({ status: 200, description: 'Resumen de citas' })
  getAppointments(@Query() filter: ReportsDateRangeDto) {
    return this.getAppointmentsReportUseCase.execute(filter);
  }

  @Get('patients/new')
  @ApiOperation({ summary: 'Pacientes nuevos registrados en el rango' })
  @ApiResponse({ status: 200, description: 'Conteo de pacientes nuevos' })
  getNewPatients(@Query() filter: ReportsDateRangeDto) {
    return this.getNewPatientsReportUseCase.execute(filter);
  }
}
