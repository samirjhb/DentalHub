import { HttpException, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { TokenIssuerService } from '../services/token-issuer.service';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { AuthMapper } from '../mappers/auth.mapper';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenIssuer: TokenIssuerService,
  ) {}

  async execute(dto: LoginAuthDto) {
    const findUser = await this.authRepository.findByEmail(dto.email);
    if (!findUser) throw new HttpException('USER_NOT_FOUND', 404);

    const checkPassword = await compare(dto.password, findUser.password);
    if (!checkPassword) throw new HttpException('PASSWORD_INCORRECT', 403);

    const { token, refreshToken } = await this.tokenIssuer.issueTokens(
      findUser,
    );

    return { user: AuthMapper.toResponse(findUser), token, refreshToken };
  }
}
