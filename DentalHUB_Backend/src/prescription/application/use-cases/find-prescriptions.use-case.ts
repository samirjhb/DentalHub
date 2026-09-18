import { Injectable } from '@nestjs/common';
import { PrescriptionRepository } from '../../domain/repositories/prescription.repository';
import { FilterPrescriptionDto } from '../dto/filter-prescription.dto';
import { PrescriptionMapper } from '../mappers/prescription.mapper';

@Injectable()
export class FindPrescriptionsUseCase {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(filter: FilterPrescriptionDto) {
    const prescriptions = await this.repository.findAll(filter);
    return prescriptions.map((p) => PrescriptionMapper.toResponse(p));
  }
}
