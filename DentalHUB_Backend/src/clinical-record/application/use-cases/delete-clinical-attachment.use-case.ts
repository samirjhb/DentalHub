import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { CloudinaryService } from '../../../shared/storage/cloudinary.service';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

@Injectable()
export class DeleteClinicalAttachmentUseCase {
  private readonly logger = new Logger(DeleteClinicalAttachmentUseCase.name);

  constructor(
    private readonly repository: ClinicalRecordRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async execute(clinicalRecordId: string, attachmentId: string) {
    const record = await this.repository.findById(clinicalRecordId);
    if (!record) {
      throw new NotFoundException(
        `Ficha clínica con ID ${clinicalRecordId} no encontrada`,
      );
    }

    const attachment = record.attachments?.find(
      (a) => String(a._id) === attachmentId,
    );
    if (!attachment) {
      throw new BadRequestException(`Adjunto con ID ${attachmentId} no encontrado`);
    }

    try {
      await this.cloudinary.deleteFile(attachment.publicId, attachment.resourceType);
    } catch (error) {
      // Bloquear el borrado en Mongo cuando falla Cloudinary dejaría al
      // staff con un adjunto "fantasma" que no puede eliminar nunca más si
      // la falla es persistente (ej. credenciales revocadas). Un archivo
      // huérfano en Cloudinary es un costo de storage menor y silencioso —
      // se loguea y se borra igual el registro.
      this.logger.error(
        `No se pudo borrar ${attachment.publicId} en Cloudinary`,
        error,
      );
    }

    const updated = await this.repository.removeAttachment(
      clinicalRecordId,
      attachmentId,
    );
    return ClinicalRecordMapper.toResponse(updated!);
  }
}
