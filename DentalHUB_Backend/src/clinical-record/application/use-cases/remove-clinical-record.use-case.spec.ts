import { NotFoundException } from '@nestjs/common';
import { RemoveClinicalRecordUseCase } from './remove-clinical-record.use-case';
import { InMemoryClinicalRecordRepository } from '../testing/in-memory-clinical-record.repository';
import { InMemoryOdontogramRepository } from '../../../odontogram/application/testing/in-memory-odontogram.repository';
import { OdontogramToothSyncService } from '../services/odontogram-tooth-sync.service';
import { ToothStatus } from '../../../odontogram/domain/entities/tooth-state.entity';
import { CreateClinicalRecordDto } from '../dto/create-clinical-record.dto';

describe('RemoveClinicalRecordUseCase', () => {
  let repository: InMemoryClinicalRecordRepository;
  let odontogramRepository: InMemoryOdontogramRepository;
  let useCase: RemoveClinicalRecordUseCase;

  beforeEach(() => {
    repository = new InMemoryClinicalRecordRepository();
    odontogramRepository = new InMemoryOdontogramRepository();
    useCase = new RemoveClinicalRecordUseCase(
      repository,
      new OdontogramToothSyncService(repository, odontogramRepository),
    );
    repository.seedPatient('patient-1');
    odontogramRepository.seedPatient('patient-1');
  });

  it('throws NotFoundException when the clinical record does not exist', async () => {
    await expect(useCase.execute('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deletes the clinical record and reverts its teeth to Sano', async () => {
    await odontogramRepository.create('patient-1', [
      { toothNumber: '36', status: ToothStatus.CARIADO } as any,
      { toothNumber: '11', status: ToothStatus.SELLANTE } as any,
    ]);
    const dto: CreateClinicalRecordDto = {
      patient: 'patient-1',
      dentist: 'Dr. Fase3',
      treatments: [
        { diagnosis: 'Caries', toothNumber: '36', treatment: 'Endodoncia', price: 100000 },
        { diagnosis: 'Sarro', toothNumber: '11', treatment: 'Limpieza', price: 30000 },
      ],
    };
    const created = await repository.create(dto);
    const id = String(created._id);

    const result = await useCase.execute(id);

    expect(result.deleted).toBe(true);
    expect(await repository.findById(id)).toBeNull();
    const odontogram = await odontogramRepository.findByPatientId('patient-1');
    expect(odontogram!.teeth.find((t) => t.toothNumber === '36')!.status).toBe(
      ToothStatus.SANO,
    );
    expect(odontogram!.teeth.find((t) => t.toothNumber === '11')!.status).toBe(
      ToothStatus.SANO,
    );
  });

  it('does not revert a tooth still diagnosed by another clinical record', async () => {
    await odontogramRepository.create('patient-1', [
      { toothNumber: '11', status: ToothStatus.SELLANTE } as any,
    ]);
    // Ficha que se va a borrar.
    const toDelete = await repository.create({
      patient: 'patient-1',
      dentist: 'Dr. Fase3',
      treatments: [
        { diagnosis: 'Sarro', toothNumber: '11', treatment: 'Limpieza', price: 30000 },
      ],
    });
    // Otra ficha del mismo paciente sigue diagnosticando la misma pieza.
    await repository.create({
      patient: 'patient-1',
      dentist: 'Dr. Fase3',
      treatments: [
        { diagnosis: 'Sellante', toothNumber: '11', treatment: 'Sellante preventivo', price: 15000 },
      ],
    });

    await useCase.execute(String(toDelete._id));

    const odontogram = await odontogramRepository.findByPatientId('patient-1');
    expect(odontogram!.teeth.find((t) => t.toothNumber === '11')!.status).toBe(
      ToothStatus.SELLANTE,
    );
  });
});
