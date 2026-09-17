import { HttpException, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { CreateStaffDto } from '../dto/create-staff-auth.dto';
import { AuthMapper } from '../mappers/auth.mapper';

@Injectable()
export class CreateStaffUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(dto: CreateStaffDto) {
    try {
      const existingUser = await this.authRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new HttpException('El email ya está registrado', 400);
      }

      const plainToHash = await hash(dto.password, 10);
      const newUser = await this.authRepository.create({
        email: dto.email,
        name: dto.name,
        password: plainToHash,
        role: dto.role,
      });

      return { user: AuthMapper.toResponse(newUser) };
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException('El email ya está registrado', 400);
      }
      throw error;
    }
  }
}
