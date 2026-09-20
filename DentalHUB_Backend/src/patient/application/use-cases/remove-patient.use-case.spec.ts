import { ConflictException, NotFoundException } from '@nestjs/common';
import { RemovePatientUseCase } from './remove-patient.use-case';
import { InMemoryPatientRepository } from '../testing/in-memory-patient.repository';
import { InMemoryClinicalRecordRepository } from '../../../clinical-record/application/testing/in-memory-clinical-record.repository';
import { InMemoryAppointmentRepository } from '../../../appointment/application/testing/in-memory-appointment.repository';
import { InMemoryOdontogramRepository } from '../../../odontogram/application/testing/in-memory-odontogram.repository';
import { CreatePatientDto } from '../dto/create-patient.dto';

describe('RemovePatientUseCase', () => {
  let repository: InMemoryPatientRepository;
  let clinicalRecordRepository: InMemoryClinicalRecordRepository;
  let appointmentRepository: InMemoryAppointmentRepository;
  let odontogramRepository: InMemoryOdontogramRepository;
  let useCase: RemovePatientUseCase;

  const dto: CreatePatientDto = {
    name: 'Juan Pérez',
    rut: '12.345.678-9',
    cel: 56912345678,
    email: 'juan@test.com',
    record: 'DH-1',
    birthDate: '1990-01-15T00:00:00.000Z',
  };

  beforeEach(() => {
    repository = new InMemoryPatientRepository();
    clinicalRecordRepository = new InMemoryClinicalRecordRepository();
    appointmentRepository = new InMemoryAppointmentRepository();
    odontogramRepository = new InMemoryOdontogramRepository();
    useCase = new RemovePatientUseCase(
      repository,
      clinicalRecordRepository,
      appointmentRepository,
      odontogramRepository,
    );
  });

  it('removes an existing patient without associated records', async () => {
    const created = await repository.create(dto);

    const result = await useCase.execute(String(created._id));

    expect(result.message).toBe('Paciente eliminado exitosamente');
    expect(result.patientId).toBe(String(created._id));
    expect(await repository.findById(String(created._id))).toBeNull();
  });

  it('throws a 404 with the legacy message when the patient does not exist', async () => {
    await expect(useCase.execute('does-not-exist')).rejects.toThrow(
      NotFoundException,
    );
    await expect(useCase.execute('does-not-exist')).rejects.toMatchObject({
      message: 'Paciente con ID does-not-exist no encontrado',
    });
  });

  it('blocks deletion when the patient has clinical records', async () => {
    const created = await repository.create(dto);
    const patientId = String(created._id);
    clinicalRecordRepository.seedPatient(patientId);
    await clinicalRecordRepository.create({
      patient: patientId,
      dentist: 'Dr. Test',
      treatments: [
        { diagnosis: 'x', toothNumber: '11', treatment: 'x', price: 1000 },
      ],
    });

    await expect(useCase.execute(patientId)).rejects.toThrow(
      ConflictException,
    );
    expect(await repository.findById(patientId)).not.toBeNull();
  });

  it('blocks deletion when the patient has appointments', async () => {
    const created = await repository.create(dto);
    const patientId = String(created._id);
    appointmentRepository.seedPatient(patientId);
    appointmentRepository.seedDentist('dentist-1');
    await appointmentRepository.create({
      patient: patientId,
      dentist: 'dentist-1',
      startAt: new Date(),
      endAt: new Date(),
      durationMinutes: 30,
      reason: 'Control',
    });

    await expect(useCase.execute(patientId)).rejects.toThrow(
      ConflictException,
    );
  });

  it('blocks deletion when the patient has an odontogram', async () => {
    const created = await repository.create(dto);
    const patientId = String(created._id);
    await odontogramRepository.create(patientId, []);

    await expect(useCase.execute(patientId)).rejects.toThrow(
      ConflictException,
    );
  });
});
