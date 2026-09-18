import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ReportsRepository,
  DateRangeFilter,
  RevenueSummary,
  RevenueByMethod,
  TreatmentsSummary,
  AppointmentsSummary,
} from '../../../domain/repositories/reports.repository';
import { PaymentDocument } from 'src/billing/infrastructure/persistence/mongo/payment.schema';
import { ClinicalRecordDocument } from 'src/clinical-record/infrastructure/persistence/mongo/clinical-record.schema';
import { AppointmentDocument } from 'src/appointment/infrastructure/persistence/mongo/appointment.schema';
import { PatientDocument } from 'src/patient/infrastructure/persistence/mongo/patient.schema';

@Injectable()
export class ReportsMongoRepository extends ReportsRepository {
  constructor(
    @InjectModel('Payment')
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel('ClinicalRecord')
    private readonly clinicalRecordModel: Model<ClinicalRecordDocument>,
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel('Patient')
    private readonly patientModel: Model<PatientDocument>,
  ) {
    super();
  }

  // Filtra a nivel de query de Mongo ANTES de traer documentos — mismo
  // patrón que appointment-mongo.repository.ts.findAll(), no el find() sin
  // filtro de billing (ese caso no tiene rango de fechas; estos 4 sí, y se
  // usan repetidamente desde un selector de fechas en el frontend).
  private dateFilter(
    field: string,
    filter: DateRangeFilter,
  ): Record<string, unknown> {
    if (!filter.startDate && !filter.endDate) return {};
    return {
      [field]: {
        ...(filter.startDate ? { $gte: filter.startDate } : {}),
        ...(filter.endDate ? { $lte: filter.endDate } : {}),
      },
    };
  }

  async getRevenueSummary(filter: DateRangeFilter): Promise<RevenueSummary> {
    const query = this.dateFilter('paidAt', filter);
    const payments = await this.paymentModel.find(query);
    const byMethod: RevenueByMethod = { EFECTIVO: 0, TARJETA: 0, TRANSFERENCIA: 0 };
    let totalRevenue = 0;
    for (const payment of payments) {
      totalRevenue += payment.amount;
      const method = payment.method as keyof RevenueByMethod;
      byMethod[method] = (byMethod[method] || 0) + payment.amount;
    }
    return { totalRevenue, byMethod };
  }

  async getTreatmentsSummary(filter: DateRangeFilter): Promise<TreatmentsSummary> {
    // Se filtra por la fecha de creación de la FICHA (siempre presente,
    // `timestamps:true`) — el `appointmentDate` de cada tratamiento es
    // opcional y no serviría como filtro confiable para todos los registros.
    const query = this.dateFilter('createdAt', filter);
    const records = await this.clinicalRecordModel.find(query);
    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const record of records) {
      for (const treatment of record.treatments) {
        byStatus[treatment.status] = (byStatus[treatment.status] || 0) + 1;
        total++;
      }
    }
    return { byStatus, total };
  }

  async getAppointmentsSummary(
    filter: DateRangeFilter,
  ): Promise<AppointmentsSummary> {
    const query = this.dateFilter('startAt', filter);
    const appointments = await this.appointmentModel.find(query);
    const byStatus: Record<string, number> = {};
    const byDentistMap = new Map<string, number>();
    for (const appointment of appointments) {
      byStatus[appointment.status] = (byStatus[appointment.status] || 0) + 1;
      const dentistId = String(appointment.dentist);
      byDentistMap.set(dentistId, (byDentistMap.get(dentistId) || 0) + 1);
    }
    const byDentist = Array.from(byDentistMap.entries()).map(([dentist, count]) => ({
      dentist,
      count,
    }));
    return { byStatus, byDentist, total: appointments.length };
  }

  async getNewPatientsCount(filter: DateRangeFilter): Promise<{ count: number }> {
    const query = this.dateFilter('createdAt', filter);
    const count = await this.patientModel.countDocuments(query);
    return { count };
  }
}
