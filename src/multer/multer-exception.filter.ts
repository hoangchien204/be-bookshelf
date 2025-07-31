import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { MulterError } from 'multer';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception.code === 'LIMIT_FILE_SIZE') {
    response.status(413).json({
        statusCode: 413,
        message: 'File quá lớn. Vui lòng tải file nhỏ hơn.',
        error: 'Payload Too Large',
    });
    } else {
    response.status(Number(400)).json({
        statusCode: 400,
        message: exception.message,
        error: 'Bad Request',
    });
    }
  }
}
