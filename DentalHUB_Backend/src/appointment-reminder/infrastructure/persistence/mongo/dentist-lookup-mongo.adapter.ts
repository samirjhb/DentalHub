import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DentistLookupPort, DentistLookupResult } from '../../../domain/ports/dentist-lookup.port';
import { AuthDocument } from 'src/auth/infrastructure/persistence/mongo/auth.schema';

@Injectable()
export class DentistLookupMongoAdapter extends DentistLookupPort {
  constructor(
    @InjectModel('Auth')
    private readonly authModel: Model<AuthDocument>,
  ) {
    super();
  }

  async findById(dentistId: string): Promise<DentistLookupResult | null> {
    const doc = await this.authModel.findById(dentistId);
    if (!doc) return null;
    return { name: doc.name };
  }
}
