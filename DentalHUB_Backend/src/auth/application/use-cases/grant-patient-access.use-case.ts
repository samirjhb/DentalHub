import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { GrantPatientAccessDto } from '../dto/grant-patient-access.dto';
import { AuthMapper } from '../mappers/auth.mapper';
import { Role } from '../../../shared/enums/role.enum';

@Injectable()
export class GrantPatientAccessUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(dto: GrantPatientAccessDto) {
    const patientExists = await this.authRepository.verifyPatientExists(
      dto.patientId,
    );
    if (!patientExists) {
      throw new NotFoundException(
        `Paciente con ID ${dto.patientId} no encontrado`,
      );
    }

    const existingLink = await this.authRepository.findByPatientId(
      dto.patientId,
    );
    if (existingLink) {
      if (existingLink.email === dto.email) {
        return { user: AuthMapper.toResponse(existingLink) };
      }
      throw new ConflictException(
        'Este paciente ya tiene una cuenta de acceso vinculada',
      );
    }

    const existingByEmail = await this.authRepository.findByEmail(dto.email);

    if (!existingByEmail) {
      if (!dto.password) {
        throw new BadRequestException(
          'Se requiere una contraseña para crear la cuenta de acceso',
        );
      }
      const hashedPassword = await hash(dto.password, 10);
      const newUser = await this.authRepository.create({
        email: dto.email,
        name: dto.email,
        password: hashedPassword,
        role: Role.PATIENT,
      });
      const linked = await this.authRepository.linkPatient(
        String(newUser._id),
        dto.patientId,
      );
      return { user: AuthMapper.toResponse(linked!) };
    }

    if (existingByEmail.role !== Role.PATIENT) {
      throw new BadRequestException(
        'Este email pertenece a una cuenta de personal',
      );
    }

    if (existingByEmail.patientId) {
      throw new ConflictException(
        'Este email ya está vinculado a otro paciente',
      );
    }

    const linked = await this.authRepository.linkPatient(
      String(existingByEmail._id),
      dto.patientId,
    );
    return { user: AuthMapper.toResponse(linked!) };
  }
}
