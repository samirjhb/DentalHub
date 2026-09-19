import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PasswordResetTokenRepository } from '../../../domain/repositories/password-reset-token.repository';
import { PasswordResetTokenRecord } from '../../../domain/entities/password-reset-token.entity';
import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from './password-reset-token.schema';

@Injectable()
export class PasswordResetTokenMongoRepository extends PasswordResetTokenRepository {
  constructor(
    @InjectModel(PasswordResetToken.name)
    private readonly passwordResetTokenModel: Model<PasswordResetTokenDocument>,
  ) {
    super();
  }

  async findByHash(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
    const doc = await this.passwordResetTokenModel.findOne({ tokenHash });
    if (!doc) return null;
    return new PasswordResetTokenRecord(
      doc.user,
      doc.tokenHash,
      doc.expiresAt,
      doc.used,
    );
  }

  async create(
    userId: unknown,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.passwordResetTokenModel.create({
      user: userId,
      tokenHash,
      expiresAt,
    });
  }

  async markUsed(tokenHash: string): Promise<void> {
    await this.passwordResetTokenModel.updateOne(
      { tokenHash },
      { used: true },
    );
  }

  async invalidateAllForUser(userId: unknown): Promise<void> {
    await this.passwordResetTokenModel.updateMany(
      { user: userId, used: false },
      { used: true },
    );
  }
}
