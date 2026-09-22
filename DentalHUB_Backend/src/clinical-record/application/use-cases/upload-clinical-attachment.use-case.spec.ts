import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UploadClinicalAttachmentUseCase } from './upload-clinical-attachment.use-case';
import { InMemoryClinicalRecordRepository } from '../testing/in-memory-clinical-record.repository';
import { CloudinaryService } from '../../../shared/storage/cloudinary.service';

describe('UploadClinicalAttachmentUseCase', () => {
  let repository: InMemoryClinicalRecordRepository;
  let cloudinary: { uploadFile: jest.Mock; deleteFile: jest.Mock };
  let useCase: UploadClinicalAttachmentUseCase;

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
        publicId: 'clinical-records/rec-1/x',
      }),
      deleteFile: jest.fn(),
    };
    useCase = new UploadClinicalAttachmentUseCase(
      repository,
      cloudinary as unknown as CloudinaryService,
    );

    repository.seedPatient('patient-1');
    await repository.create({
      patient: 'patient-1',
      dentist: 'Dr. Test',
      treatments: [
        {
          diagnosis: 'Caries',
          toothNumber: '11',
          treatment: 'Obturación',
          price: 10000,
        },
      ],
    } as any);
  });

  it('throws NotFoundException when the clinical record does not exist', async () => {
    await expect(
      useCase.execute('missing-id', fakeFile, undefined, 'staff-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects an out-of-range treatmentIndex without calling Cloudinary', async () => {
    await expect(
      useCase.execute('1', fakeFile, 5, 'staff-1'),
    ).rejects.toThrow(BadRequestException);
    expect(cloudinary.uploadFile).not.toHaveBeenCalled();
  });

  it('uploads and persists a general attachment (no treatmentIndex)', async () => {
    const result = await useCase.execute('1', fakeFile, undefined, 'staff-1');
    expect(result.attachments).toHaveLength(1);
    expect(result.attachments![0]).toMatchObject({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/x.jpg',
      fileName: 'radiografia.jpg',
      mimeType: 'image/jpeg',
    });
  });

  it('uploads a PDF as resource_type raw', async () => {
    const pdfFile = {
      ...fakeFile,
      originalname: 'laboratorio.pdf',
      mimetype: 'application/pdf',
    } as Express.Multer.File;

    await useCase.execute('1', pdfFile, undefined, 'staff-1');

    expect(cloudinary.uploadFile).toHaveBeenCalledWith(
      pdfFile.buffer,
      expect.objectContaining({ resourceType: 'raw' }),
    );
  });

  it('does not persist an attachment when the Cloudinary upload fails', async () => {
    cloudinary.uploadFile.mockRejectedValueOnce(new Error('Cloudinary caído'));

    await expect(
      useCase.execute('1', fakeFile, undefined, 'staff-1'),
    ).rejects.toThrow('Cloudinary caído');

    const record = await repository.findById('1');
    expect(record!.attachments).toEqual([]);
  });
});
