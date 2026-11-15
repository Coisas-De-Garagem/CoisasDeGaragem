import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth-user.interface';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
    }),
  )
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: { buffer: Buffer },
  ) {
    if (!file?.buffer) throw new BadRequestException('Selecione uma foto.');
    return this.media.upload(user.userId, file.buffer);
  }

  // Fotos do catálogo são públicas; o bucket MinIO continua privado.
  @Get(':owner/:filename')
  @SkipThrottle()
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async read(
    @Param('owner') owner: string,
    @Param('filename') filename: string,
  ) {
    const stream = await this.media.read(owner, filename);
    return new StreamableFile(stream, {
      type: 'image/webp',
      disposition: 'inline',
    });
  }
}
