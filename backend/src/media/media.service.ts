import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { createHash } from 'node:crypto';
import { compressImage } from './image-compression';

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly logger = new Logger(MediaService.name);
  private client?: Client;
  private readonly bucket: string;
  private readonly publicApi: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get<string>('MINIO_BUCKET') || 'coisasdegaragem';
    this.publicApi = (
      config.get<string>('PUBLIC_API_URL') || 'http://localhost:3000/api/v1'
    ).replace(/\/$/, '');
    const endpoint = config.get<string>('MINIO_ENDPOINT');
    const accessKey = config.get<string>('MINIO_ACCESS_KEY');
    const secretKey = config.get<string>('MINIO_SECRET_KEY');
    if (endpoint && accessKey && secretKey) {
      const useSSL = config.get<string>('MINIO_USE_SSL') === 'true';
      this.client = new Client({
        endPoint: endpoint,
        accessKey,
        secretKey,
        useSSL,
        port: Number(config.get<string>('MINIO_PORT') || (useSSL ? 443 : 9000)),
        region: 'us-east-1',
      });
    }
  }

  async onModuleInit() {
    if (!this.client) {
      this.logger.warn(
        'MinIO não configurado: envio e leitura de fotos indisponíveis.',
      );
      return;
    }
    if (!(await this.client.bucketExists(this.bucket)))
      await this.client.makeBucket(this.bucket, 'us-east-1');
  }

  private storage(): Client {
    if (!this.client)
      throw new ServiceUnavailableException(
        'Armazenamento de fotos não configurado.',
      );
    return this.client;
  }

  async upload(owner: string, buffer: Buffer) {
    const compressed = await compressImage(buffer);
    const hash = createHash('sha256').update(compressed).digest('hex');
    const filename = hash + '.webp';
    const key = owner + '/' + filename;
    try {
      // O mesmo arquivo do mesmo usuário usa uma única chave (sem duplicar objetos).
      await this.storage().putObject(
        this.bucket,
        key,
        compressed,
        compressed.length,
        {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      );
    } catch {
      throw new ServiceUnavailableException(
        'Não foi possível armazenar a foto. Tente novamente.',
      );
    }
    return {
      url: this.publicApi + '/media/' + key,
      originalBytes: buffer.length,
      storedBytes: compressed.length,
    };
  }

  async read(owner: string, filename: string) {
    if (
      !/^[a-f0-9-]{36}$/i.test(owner) ||
      !/^[a-f0-9]{64}\.webp$/.test(filename)
    )
      throw new NotFoundException();
    try {
      return await this.storage().getObject(
        this.bucket,
        owner + '/' + filename,
      );
    } catch (error: unknown) {
      const code =
        error !== null && typeof error === 'object' && 'code' in error
          ? String(error.code)
          : '';
      if (['NoSuchKey', 'NoSuchObject', 'NotFound'].includes(code))
        throw new NotFoundException();
      throw new ServiceUnavailableException(
        'Não foi possível carregar a foto.',
      );
    }
  }
}
