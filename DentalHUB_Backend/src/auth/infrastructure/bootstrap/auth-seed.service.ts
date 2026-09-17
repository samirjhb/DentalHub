import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { Role } from '../../../shared/enums/role.enum';

// Bootstrap de arranque (OnModuleInit), no un caso de uso disparado por HTTP:
// no tiene controller ni DTO propio, corre una vez por proceso al levantar
// la app.
@Injectable()
export class AuthSeedService implements OnModuleInit {
  private readonly logger = new Logger(AuthSeedService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const existingAdmins = await this.authRepository.countByRole(
      Role.SUPER_ADMIN,
    );
    if (existingAdmins > 0) return;

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    if (!adminEmail || !adminPassword) {
      this.logger.warn(
        'No existe ningún SUPER_ADMIN y ADMIN_EMAIL/ADMIN_PASSWORD no están configurados: se omite el bootstrap.',
      );
      return;
    }

    const password = await hash(adminPassword, 10);
    await this.authRepository.create({
      email: adminEmail,
      name: 'Super Admin',
      password,
      role: Role.SUPER_ADMIN,
    });
    this.logger.warn(`SUPER_ADMIN inicial creado para ${adminEmail}.`);
  }
}
