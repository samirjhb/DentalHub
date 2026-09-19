import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository';

@Injectable()
export class FindPatientAccessUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(patientId: string) {
    const linkedAuth = await this.authRepository.findByPatientId(patientId);
    if (!linkedAuth) {
      return { linked: false };
    }
    return { linked: true, email: linkedAuth.email, authId: linkedAuth._id };
  }
}
