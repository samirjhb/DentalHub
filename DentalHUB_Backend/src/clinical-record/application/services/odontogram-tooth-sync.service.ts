import { Injectable } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { OdontogramRepository } from '../../../odontogram/domain/repositories/odontogram.repository';
import { ToothStatus } from '../../../odontogram/domain/entities/tooth-state.entity';

// El odontograma es un documento aparte de las fichas clínicas — nada lo
// sincroniza automáticamente cuando se borra una ficha o un tratamiento
// puntual, así que una pieza diagnosticada por un tratamiento eliminado
// quedaba con el color viejo para siempre. Este servicio revierte a 'Sano'
// las piezas que ya no tienen NINGÚN tratamiento activo (en ninguna ficha
// del paciente) que las diagnostique — si otra ficha sigue mencionando esa
// pieza, se deja como está.
@Injectable()
export class OdontogramToothSyncService {
  constructor(
    private readonly clinicalRecordRepository: ClinicalRecordRepository,
    private readonly odontogramRepository: OdontogramRepository,
  ) {}

  async revertOrphanedTeeth(
    patientId: string,
    toothNumbers: string[],
  ): Promise<void> {
    const uniqueTeeth = [...new Set(toothNumbers.filter(Boolean))];
    if (uniqueTeeth.length === 0) return;

    const records = await this.clinicalRecordRepository.findByPatient(patientId);
    const stillDiagnosed = new Set(
      records.flatMap((record) =>
        record.treatments
          .filter((t) => t.diagnosis && t.toothNumber)
          .map((t) => t.toothNumber),
      ),
    );

    const orphaned = uniqueTeeth.filter((tooth) => !stillDiagnosed.has(tooth));

    for (const toothNumber of orphaned) {
      // Si el paciente no tiene odontograma, o la pieza ya está en 'Sano',
      // updateTooth devuelve null sin lanzar — no hay nada que revertir.
      await this.odontogramRepository.updateTooth(
        patientId,
        toothNumber,
        ToothStatus.SANO,
      );
    }
  }
}
