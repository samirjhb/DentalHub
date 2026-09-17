import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RegisterPaymentDto } from '../../application/dto/register-payment.dto';
import { FilterPaymentDto } from '../../application/dto/filter-payment.dto';
import { RegisterPaymentUseCase } from '../../application/use-cases/register-payment.use-case';
import { FindPaymentsUseCase } from '../../application/use-cases/find-payments.use-case';
import { CalculatePatientBalanceUseCase } from '../../application/use-cases/calculate-patient-balance.use-case';
import { CalculateTotalClinicBalanceUseCase } from '../../application/use-cases/calculate-total-clinic-balance.use-case';
import { FindPatientTreatmentsUseCase } from '../../application/use-cases/find-patient-treatments.use-case';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';

// Manejar dinero no es rol de HYGIENIST/DENTAL_ASSISTANT — a diferencia de
// clinical-record, donde sí tienen lectura de datos clínicos, acá quedan
// deliberadamente fuera.
const READ_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.RECEPTIONIST, Role.DENTIST];
const WRITE_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.RECEPTIONIST, Role.DENTIST];
// Saldo agregado de TODA la clínica es una métrica de gestión, no operativa.
const TOTAL_BALANCE_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN];

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly registerPaymentUseCase: RegisterPaymentUseCase,
    private readonly findPaymentsUseCase: FindPaymentsUseCase,
    private readonly calculatePatientBalanceUseCase: CalculatePatientBalanceUseCase,
    private readonly calculateTotalClinicBalanceUseCase: CalculateTotalClinicBalanceUseCase,
    private readonly findPatientTreatmentsUseCase: FindPatientTreatmentsUseCase,
  ) {}

  @Post('payments')
  @Roles(...WRITE_ROLES)
  @ApiOperation({ summary: 'Registrar un pago contra un tratamiento de una ficha clínica' })
  @ApiResponse({ status: 201, description: 'Pago registrado correctamente' })
  @ApiResponse({ status: 400, description: 'Monto inválido o tratamiento no encontrado' })
  @ApiResponse({ status: 404, description: 'Ficha clínica o usuario no encontrado' })
  registerPayment(@Body() dto: RegisterPaymentDto) {
    return this.registerPaymentUseCase.execute(dto);
  }

  @Get('payments')
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Listar pagos con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Listado de pagos' })
  findPayments(@Query() filter: FilterPaymentDto) {
    return this.findPaymentsUseCase.execute(filter);
  }

  @Get('patients/:patientId/balance')
  @Roles(...READ_ROLES)
  @ApiOperation({ summary: 'Saldo pendiente agregado de un paciente (todas sus fichas)' })
  @ApiResponse({ status: 200, description: 'Saldo calculado correctamente' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente' })
  getPatientBalance(@Param('patientId') patientId: string) {
    return this.calculatePatientBalanceUseCase.execute(patientId);
  }

  @Get('patients/:patientId/treatments')
  @Roles(...READ_ROLES)
  @ApiOperation({
    summary:
      'Tratamientos de un paciente con precio/abono/saldo — vista de solo dinero, ' +
      'para roles financieros que no tienen acceso a clinical-record (que expone ' +
      'diagnóstico/radiografías/observaciones clínicas)',
  })
  @ApiResponse({ status: 200, description: 'Listado obtenido correctamente' })
  @ApiParam({ name: 'patientId', description: 'ID del paciente' })
  getPatientTreatments(@Param('patientId') patientId: string) {
    return this.findPatientTreatmentsUseCase.execute(patientId);
  }

  @Get('balance/total')
  @Roles(...TOTAL_BALANCE_ROLES)
  @ApiOperation({ summary: 'Saldo pendiente agregado de toda la clínica' })
  @ApiResponse({ status: 200, description: 'Saldo calculado correctamente' })
  getTotalBalance() {
    return this.calculateTotalClinicBalanceUseCase.execute();
  }
}
