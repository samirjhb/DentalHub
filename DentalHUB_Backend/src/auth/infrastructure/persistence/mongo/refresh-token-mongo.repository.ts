import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { RefreshTokenRecord } from '../../../domain/entities/refresh-token.entity';
import { RefreshToken, RefreshTokenDocument } from './refresh-token.schema';

@Injectable()
export class RefreshTokenMongoRepository extends RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {
    super();
  }

  async findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const doc = await this.refreshTokenModel.findOne({ tokenHash });
    if (!doc) return null;
    return new RefreshTokenRecord(
      doc.user,
      doc.tokenHash,
      doc.expiresAt,
      doc.revoked,
      doc.replacedByTokenHash,
    );
  }

  async create(
    userId: unknown,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.refreshTokenModel.create({ user: userId, tokenHash, expiresAt });
  }

  async markRevoked(
    tokenHash: string,
    replacedByTokenHash?: string,
  ): Promise<void> {
    await this.refreshTokenModel.updateOne(
      { tokenHash },
      replacedByTokenHash
        ? { revoked: true, replacedByTokenHash }
        : { revoked: true },
    );
  }

  async revokeAllForUser(userId: unknown): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { user: userId, revoked: false },
      { revoked: true },
    );
  }
}
