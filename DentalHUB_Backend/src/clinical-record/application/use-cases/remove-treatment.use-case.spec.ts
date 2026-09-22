import { BadRequestException } from '@nestjs/common';
import { RemoveTreatmentUseCase } from './remove-treatment.use-case';
import { InMemoryClinicalRecordRepository } from '../testing/in-memory-clinical-record.repository';
import { InMemoryOdontogramRepository } from '../../../odontogram/application/testing/in-memory-odontogram.repository';
import { OdontogramToothSyncService } from '../services/odontogram-tooth-sync.service';
import { ToothStatus } from '../../../odontogram/domain/entities/tooth-state.entity';
import { CreateClinicalRecordDto } from '../dto/create-clinical-record.dto';

describe('RemoveTreatmentUseCase', () => {
  let repository: InMemoryClinicalRecordRepository;
  let odontogramRepository: InMemoryOdontogramRepository;
  let useCase: RemoveTreatmentUseCase;

  beforeEach(() => {
    repository = new InMemoryClinicalRecordRepository();
    odontogramRepository = new InMemoryOdontogramRepository();
    useCase = new RemoveTreatmentUseCase(
      repository,
      new OdontogramToothSyncService(repository, odontogramRepository),
    );
    repository.seedPatient('patient-1');
    odontogramRepository.seedPatient('patient-1');
  });

  it('removes a non-last treatment and keeps the record', async () => {
    const dto: CreateClinicalRecordDto = {
      patient: 'patient-1',
      dentist: 'Dr. Fase3',
      treatments: [
        { diagnosis: 'Caries', toothNumber: '36', treatment: 'Endodoncia', price: 100000 },
        { diagnosis: 'Sarro', toothNumber: '11', treatment: 'Limpieza', price: 30000 },
      ],
    };
    const created = await repository.create(dto);

    const result = await useCase.execute(String(created._id), 0);

    expect(result.treatments).toHaveLength(1);
    expect(result.treatments[0].diagnosis).toBe('Sarro');
  });

  it('rejects removing the last treatment and leaves the record untouched', async () => {
    const dto: CreateClinicalRecordDto = {
      patient: 'patient-1',
      dentist: 'Dr. Fase3',
      treatments: [
        { diagnosis: 'Caries', toothNumber: '36', treatment: 'Endodoncia', price: 100000 },
      ],
    };
    const created = await repository.create(dto);
    const id = String(created._id);

    await expect(useCase.execute(id, 0)).rejects.toThrow(BadRequestException);
    const record = await repository.findById(id);
    expect(record).not.toBeNull();
    expect(record!.treatments).toHaveLength(1);
  });

  it('reverts the removed tooth to Sano when no other treatment diagnoses it', async () => {
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

    await useCase.execute(String(created._id), 1); // saca el tratamiento de la pieza 11

    const odontogram = await odontogramRepository.findByPatientId('patient-1');
    expect(odontogram!.teeth.find((t) => t.toothNumber === '11')!.status).toBe(
      ToothStatus.SANO,
    );
    // La pieza que sigue teniendo tratamiento no se toca.
    expect(odontogram!.teeth.find((t) => t.toothNumber === '36')!.status).toBe(
      ToothStatus.CARIADO,
    );
  });

  it('does not revert the tooth when another clinical record still diagnoses it', async () => {
    await odontogramRepository.create('patient-1', [
      { toothNumber: '36', status: ToothStatus.CARIADO } as any,
      { toothNumber: '11', status: ToothStatus.SELLANTE } as any,
    ]);
    // Otra ficha del mismo paciente también diagnostica la pieza 11.
    await repository.create({
      patient: 'patient-1',
      dentist: 'Dr. Fase3',
      treatments: [
        { diagnosis: 'Sellante', toothNumber: '11', treatment: 'Sellante preventivo', price: 15000 },
      ],
    });
    const created = await repository.create({
      patient: 'patient-1',
      dentist: 'Dr. Fase3',
      treatments: [
        { diagnosis: 'Caries', toothNumber: '36', treatment: 'Endodoncia', price: 100000 },
        { diagnosis: 'Sarro', toothNumber: '11', treatment: 'Limpieza', price: 30000 },
      ],
    });

    await useCase.execute(String(created._id), 1);

    const odontogram = await odontogramRepository.findByPatientId('patient-1');
    expect(odontogram!.teeth.find((t) => t.toothNumber === '11')!.status).toBe(
      ToothStatus.SELLANTE,
    );
  });
});
