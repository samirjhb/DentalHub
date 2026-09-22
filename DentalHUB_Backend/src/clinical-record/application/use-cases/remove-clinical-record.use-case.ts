import { Injectable, NotFoundException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { OdontogramToothSyncService } from '../services/odontogram-tooth-sync.service';

@Injectable()
export class RemoveClinicalRecordUseCase {
  constructor(
    private readonly repository: ClinicalRecordRepository,
    private readonly odontogramToothSyncService: OdontogramToothSyncService,
  ) {}

  async execute(id: string) {
    // Se busca ANTES de borrar: hace falta el paciente y las piezas
    // diagnosticadas en esta ficha para saber qué revertir después.
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
    }

    const deleted = await this.repository.deleteById(id);
    if (!deleted) {
      throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
    }

    await this.odontogramToothSyncService.revertOrphanedTeeth(
      String(record.patient),
      record.treatments.map((t) => t.toothNumber),
    );

    return {
      deleted: true,
      message: `Ficha clínica con ID ${id} eliminada correctamente`,
    };
  }
}
