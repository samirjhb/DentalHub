import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { StorageNotConfiguredException } from './exceptions/storage-not-configured.exception';

export type CloudinaryResourceType = 'image' | 'raw' | 'auto';

export interface UploadFileOptions {
  folder?: string;
  resourceType?: CloudinaryResourceType;
}

export interface UploadedFileResult {
  url: string;
  publicId: string;
}

// Cloudinary requiere firma HMAC-SHA1 de los parámetros para subidas
// autenticadas server-side — a diferencia de MailService (que le pega a la
// API de Resend con fetch crudo), reimplementar esa firma a mano acá sería
// innecesariamente riesgoso, así que se usa el SDK oficial.
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private configured = false;

  constructor(private readonly configService: ConfigService) {}

  private ensureConfigured(): void {
    if (this.configured) return;

    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn(
        'CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET no configuradas — no se pueden subir archivos',
      );
      throw new StorageNotConfiguredException();
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    this.configured = true;
  }

  async uploadFile(
    buffer: Buffer,
    options: UploadFileOptions = {},
  ): Promise<UploadedFileResult> {
    this.ensureConfigured();

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: options.resourceType ?? 'auto',
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error('Cloudinary no devolvió resultado'));
            return;
          }
          resolve(uploadResult);
        },
      );
      stream.end(buffer);
    });

    return { url: result.secure_url, publicId: result.public_id };
  }

  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'raw' = 'image',
  ): Promise<void> {
    this.ensureConfigured();
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }
}
