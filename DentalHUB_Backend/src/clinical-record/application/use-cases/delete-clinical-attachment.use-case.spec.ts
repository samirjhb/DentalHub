import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeleteClinicalAttachmentUseCase } from './delete-clinical-attachment.use-case';
import { UploadClinicalAttachmentUseCase } from './upload-clinical-attachment.use-case';
import { InMemoryClinicalRecordRepository } from '../testing/in-memory-clinical-record.repository';
import { CloudinaryService } from '../../../shared/storage/cloudinary.service';

describe('DeleteClinicalAttachmentUseCase', () => {
  let repository: InMemoryClinicalRecordRepository;
  let cloudinary: { uploadFile: jest.Mock; deleteFile: jest.Mock };
  let uploadUseCase: UploadClinicalAttachmentUseCase;
  let deleteUseCase: DeleteClinicalAttachmentUseCase;

  const fakeFile = {
    buffer: Buffer.from('fake'),
    originalname: 'radiografia.jpg',
    mimetype: 'image/jpeg',
    size: 1234,
  } as Express.Multer.File;

  beforeEach(async () => {
    repository = new InMemoryClinicalRecordRepository();
    cloudinary = {
      uploadFile: jest.fn().mockResolvedValue({
        url: 'https://res.cloudinary.com/demo/image/upload/v1/x.jpg',
        publicId: 'clinical-records/1/x',
      }),
      deleteFile: jest.fn().mockResolvedValue(undefined),
    };
    uploadUseCase = new UploadClinicalAttachmentUseCase(
      repository,
      cloudinary as unknown as CloudinaryService,
    );
    deleteUseCase = new DeleteClinicalAttachmentUseCase(
      repository,
      cloudinary as unknown as CloudinaryService,
    );

    repository.seedPatient('patient-1');
    await repository.create({
      patient: 'patient-1',
      dentist: 'Dr. Test',
      treatments: [
        { diagnosis: 'Caries', toothNumber: '11', treatment: 'Obturación', price: 10000 },
      ],
    } as any);
  });

  it('throws NotFoundException when the clinical record does not exist', async () => {
    await expect(
      deleteUseCase.execute('missing-id', 'att-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when the attachment does not exist', async () => {
    await expect(deleteUseCase.execute('1', 'missing-att')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deletes the attachment and calls Cloudinary with the right publicId/resourceType', async () => {
    const uploaded = await uploadUseCase.execute('1', fakeFile, undefined, 'staff-1');
    const attachmentId = String(uploaded.attachments![0]._id);

    const result = await deleteUseCase.execute('1', attachmentId);

    expect(cloudinary.deleteFile).toHaveBeenCalledWith(
      'clinical-records/1/x',
      'image',
    );
    expect(result.attachments).toEqual([]);
  });

  it('still deletes the record from Mongo/in-memory when Cloudinary deletion fails', async () => {
    const uploaded = await uploadUseCase.execute('1', fakeFile, undefined, 'staff-1');
    const attachmentId = String(uploaded.attachments![0]._id);
    cloudinary.deleteFile.mockRejectedValueOnce(new Error('Cloudinary caído'));

    const result = await deleteUseCase.execute('1', attachmentId);

    expect(result.attachments).toEqual([]);
  });
});
