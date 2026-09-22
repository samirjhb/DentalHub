import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import {
  CloudinaryService,
  CloudinaryResourceType,
} from '../../../shared/storage/cloudinary.service';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

const PDF_MIME_TYPE = 'application/pdf';

@Injectable()
export class UploadClinicalAttachmentUseCase {
  constructor(
    private readonly repository: ClinicalRecordRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async execute(
    clinicalRecordId: string,
    file: Express.Multer.File,
    treatmentIndex: number | undefined,
    uploadedBy: string,
  ) {
    const record = await this.repository.findById(clinicalRecordId);
    if (!record) {
      throw new NotFoundException(
        `Ficha clínica con ID ${clinicalRecordId} no encontrada`,
      );
    }

    // Se valida ANTES de llamar a Cloudinary — evita gastar la subida si el
    // índice es inválido.
    if (
      treatmentIndex !== undefined &&
      treatmentIndex >= record.treatments.length
    ) {
      throw new BadRequestException(
        `Tratamiento con índice ${treatmentIndex} no encontrado`,
      );
    }

    const resourceType: CloudinaryResourceType =
      file.mimetype === PDF_MIME_TYPE ? 'raw' : 'image';

    // Si uploadFile lanza (credenciales faltantes, error de red/API de
    // Cloudinary), la excepción se propaga tal cual y NO se agrega ningún
    // attachment — no queda un registro fantasma en Mongo.
    const uploaded = await this.cloudinary.uploadFile(file.buffer, {
      folder: `clinical-records/${clinicalRecordId}`,
      resourceType,
    });

    const updated = await this.repository.addAttachment(clinicalRecordId, {
      url: uploaded.url,
      publicId: uploaded.publicId,
      resourceType,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy,
      uploadedAt: new Date(),
      treatmentIndex,
    });
    return ClinicalRecordMapper.toResponse(updated!);
  }
}
