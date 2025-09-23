import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUD_KEY'),
      api_secret: this.configService.get<string>('CLOUD_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    customFileName: string,
  ): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      let resourceType: 'image' | 'raw' | 'auto' = 'auto';

      if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.mimetype === 'application/pdf') {
        resourceType = 'raw';
      } else if (file.mimetype === 'application/epub+zip') {
        resourceType = 'raw';
      } else {
        return reject(new Error('Chỉ hỗ trợ ảnh, PDF và EPUB.'));
      }
      let publicId = customFileName.replace(/\.[^/.]+$/, '');
      if (file.mimetype === 'application/epub+zip') {
        publicId += '.epub';
      }

      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: resourceType,
          overwrite: true,
          access_mode: 'public',
        },
        (error: any, result: UploadApiResponse | undefined) => {
          if (error) {
            if (error.message?.includes('File size too large')) {
              return reject(
                new Error('File quá lớn. Vui lòng chọn file nhỏ hơn 100MB.'),
              );
            }
            return reject(error);
          }

          if (result?.secure_url) {
            return resolve({ url: result.secure_url });
          }

          return reject(new Error('Không thể upload file.'));
        },
      );

      const readableStream = Readable.from(file.buffer);
      readableStream.pipe(stream);
    });
  }

}
