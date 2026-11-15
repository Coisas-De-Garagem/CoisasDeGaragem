import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [PassportModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
