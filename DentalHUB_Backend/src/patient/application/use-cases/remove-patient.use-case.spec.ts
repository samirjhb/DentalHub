import { NotFoundException } from '@nestjs/common';
import { RemovePatientUseCase } from './remove-patient.use-case';
import { InMemoryPatientRepository } from '../testing/in-memory-patient.repository';
import { CreatePatientDto } from '../dto/create-patient.dto';

describe('RemovePatientUseCase', () => {
  let repository: InMemoryPatientRepository;
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
    useCase = new RemovePatientUseCase(repository);
  });

  it('removes an existing patient and returns the legacy envelope shape', async () => {
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
});
