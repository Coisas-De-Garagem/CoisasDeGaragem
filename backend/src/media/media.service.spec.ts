import sharp from 'sharp';
import { Readable } from 'node:stream';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { compressImage } from './image-compression';
import { MediaService } from './media.service';

const owner = 'e4df8f46-cf7d-4562-aaf4-429327512874';

describe('Compressed image storage', () => {
  it('converts a camera-sized PNG to bounded WebP without EXIF', async () => {
    const source = await sharp({
      create: { width: 2400, height: 1800, channels: 3, background: '#3498db' },
    })
      .png()
      .toBuffer();
    const output = await compressImage(source);
    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe('webp');
    expect(metadata.width).toBeLessThanOrEqual(1600);
    expect(metadata.height).toBeLessThanOrEqual(1600);
    expect(output.length).toBeLessThanOrEqual(512 * 1024);
    expect(metadata.exif).toBeUndefined();
  });

  it('rejects SVG, arbitrary content and oversized input', async () => {
    await expect(
      compressImage(
        Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"></svg>',
        ),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      compressImage(Buffer.from('not an image')),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      compressImage(Buffer.alloc(10 * 1024 * 1024 + 1)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores processed bytes once per owner/content key and returns a stable application URL', async () => {
    const client = {
      putObject: jest
        .fn<
          Promise<object>,
          [string, string, Buffer, number, Record<string, string>]
        >()
        .mockResolvedValue({}),
    };
    const service = new MediaService(
      new ConfigService({
        PUBLIC_API_URL: 'https://api.example/api/v1',
        MINIO_BUCKET: 'garage',
      }),
    );
    Object.defineProperty(service, 'client', { value: client });
    const source = await sharp({
      create: { width: 80, height: 60, channels: 3, background: '#abc' },
    })
      .png()
      .toBuffer();
    const first = await service.upload(owner, source);
    const second = await service.upload(owner, source);
    expect(first.url).toBe(second.url);
    expect(first.url).toMatch(/^https:\/\/api.example\/api\/v1\/media\//);
    const [bucket, key, bytes, length, metadata] =
      client.putObject.mock.calls[0];
    expect(bucket).toBe('garage');
    expect(key).toMatch(new RegExp('^' + owner + '/[a-f0-9]{64}\\.webp$'));
    expect((await sharp(bytes).metadata()).format).toBe('webp');
    expect(length).toBe(bytes.length);
    expect(metadata['Content-Type']).toBe('image/webp');
  });

  it('does not write an invalid upload and reports storage failures', async () => {
    const client = {
      putObject: jest.fn().mockRejectedValue(new Error('storage down')),
    };
    const service = new MediaService(new ConfigService());
    Object.defineProperty(service, 'client', { value: client });
    await expect(
      service.upload(owner, Buffer.from('bad')),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(client.putObject).not.toHaveBeenCalled();
    const image = await sharp({
      create: { width: 10, height: 10, channels: 3, background: '#fff' },
    })
      .png()
      .toBuffer();
    await expect(service.upload(owner, image)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('returns not found for missing photos and rejects invalid object paths before contacting storage', async () => {
    const client = {
      getObject: jest.fn().mockRejectedValue({ code: 'NoSuchKey' }),
    };
    const service = new MediaService(new ConfigService());
    Object.defineProperty(service, 'client', { value: client });
    await expect(service.read('../private', 'anything')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(client.getObject).not.toHaveBeenCalled();
    await expect(
      service.read(owner, 'a'.repeat(64) + '.webp'),
    ).rejects.toBeInstanceOf(NotFoundException);
    client.getObject.mockResolvedValue(Readable.from(Buffer.from('image')));
    expect(await service.read(owner, 'a'.repeat(64) + '.webp')).toBeInstanceOf(
      Readable,
    );
  });
});
