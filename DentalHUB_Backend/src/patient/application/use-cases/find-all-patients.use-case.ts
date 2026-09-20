import { HttpException, Injectable } from '@nestjs/common';
import { PatientRepository } from '../../domain/repositories/patient.repository';
import { PatientMapper } from '../mappers/patient.mapper';
import { FindPatientsQueryDto } from '../dto/find-patients-query.dto';
import {
  buildPaginatedResult,
  isPaginationRequested,
  resolvePagination,
} from '../../../shared/pagination/pagination.util';

@Injectable()
export class FindAllPatientsUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(query?: FindPatientsQueryDto) {
    try {
      if (isPaginationRequested(query)) {
        const { page, limit, skip } = resolvePagination(query);
        const [patients, total] = await Promise.all([
          this.patientRepository.findAllWithRelations(skip, limit),
          this.patientRepository.count(),
        ]);
        return buildPaginatedResult(
          patients.map((patient) => PatientMapper.toResponse(patient)),
          total,
          page,
          limit,
        );
      }

      const patients = await this.patientRepository.findAllWithRelations();
      return {
        message: 'Pacientes encontrados',
        patients: patients.map((patient) => PatientMapper.toResponse(patient)),
      };
    } catch (error) {
      throw new HttpException(
        'Error al buscar pacientes: ' + error.message,
        500,
      );
    }
  }
}
