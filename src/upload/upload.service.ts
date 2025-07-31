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
      
      // Xác định loại file: ảnh hoặc pdf
      let resourceType: 'image' | 'raw' | 'auto' = 'auto';

      if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.mimetype === 'application/pdf') {
        resourceType = 'raw';
      } else {
        return reject(new Error('Chỉ hỗ trợ ảnh và PDF.'));
      }

      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: customFileName.replace(/\.[^/.]+$/, ''), // bỏ đuôi
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
