import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PatientLookupPort, PatientLookupResult } from '../../../domain/ports/patient-lookup.port';
import { PatientDocument } from 'src/patient/infrastructure/persistence/mongo/patient.schema';

@Injectable()
export class PatientLookupMongoAdapter extends PatientLookupPort {
  constructor(
    @InjectModel('Patient')
    private readonly patientModel: Model<PatientDocument>,
  ) {
    super();
  }

  async findById(patientId: string): Promise<PatientLookupResult | null> {
    const doc = await this.patientModel.findById(patientId);
    if (!doc) return null;
    return { name: doc.name, email: doc.email };
  }
}
