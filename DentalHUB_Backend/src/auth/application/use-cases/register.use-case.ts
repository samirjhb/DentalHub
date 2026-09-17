import { HttpException, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { TokenIssuerService } from '../services/token-issuer.service';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { AuthMapper } from '../mappers/auth.mapper';
import { Role } from '../../../shared/enums/role.enum';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenIssuer: TokenIssuerService,
  ) {}

  async execute(dto: RegisterAuthDto) {
    try {
      const existingUser = await this.authRepository.findByEmail(dto.email);
      if (existingUser) {
        throw new HttpException('El email ya está registrado', 400);
      }

      const plainToHash = await hash(dto.password, 10);
      // Objeto literal explícito: nunca se pasa el body completo, así no se
      // puede colar un `role` (u otro campo) desde la petición.
      const newUser = await this.authRepository.create({
        email: dto.email,
        name: dto.name,
        password: plainToHash,
        role: Role.PATIENT,
      });

      const { token, refreshToken } = await this.tokenIssuer.issueTokens(
        newUser,
      );

      return { user: AuthMapper.toResponse(newUser), token, refreshToken };
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException('El email ya está registrado', 400);
      }
      throw error;
    }
  }
}
