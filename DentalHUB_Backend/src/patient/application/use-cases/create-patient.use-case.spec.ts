import { HttpException } from '@nestjs/common';
import { CreatePatientUseCase } from './create-patient.use-case';
import { InMemoryPatientRepository } from '../testing/in-memory-patient.repository';
import { CreatePatientDto } from '../dto/create-patient.dto';

describe('CreatePatientUseCase', () => {
  let repository: InMemoryPatientRepository;
  let useCase: CreatePatientUseCase;

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
    useCase = new CreatePatientUseCase(repository);
  });

  it('creates a patient and returns the legacy envelope shape', async () => {
    const result = await useCase.execute(dto);

    expect(result.message).toBe('Paciente registrado exitosamente');
    expect(result.patient.rut).toBe('12.345.678-9');
    expect(result.patient.name).toBe('Juan Pérez');
    expect(result.patient._id).toBeDefined();
  });

  it('rejects a duplicate RUT with the exact legacy message and status', async () => {
    await useCase.execute(dto);

    await expect(useCase.execute(dto)).rejects.toThrow(HttpException);
    await expect(useCase.execute(dto)).rejects.toMatchObject({
      message: 'Ya existe un paciente con este RUT',
      status: 400,
    });
  });
});
