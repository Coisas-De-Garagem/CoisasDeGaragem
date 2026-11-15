import sharp from 'sharp';
import { BadRequestException } from '@nestjs/common';

export async function compressImage(input: Buffer) {
  if (!input.length || input.length > 10 * 1024 * 1024) {
    throw new BadRequestException('Envie uma imagem de até 10 MB.');
  }
  try {
    const metadata = await sharp(input, {
      limitInputPixels: 24_000_000,
    }).metadata();
    if (
      !['jpeg', 'png', 'webp'].includes(metadata.format || '') ||
      (metadata.pages || 1) > 1
    ) {
      throw new BadRequestException(
        'Use uma imagem estática JPG, PNG ou WebP.',
      );
    }
    // WebP já é comprimido: gzip adicional não traz economia relevante.
    // A rotação é aplicada antes de remover metadados EXIF (incluindo GPS).
    for (const [dimension, quality] of [
      [1600, 70],
      [1280, 55],
      [960, 40],
    ]) {
      const output = await sharp(input, { limitInputPixels: 24_000_000 })
        .rotate()
        .resize({
          width: dimension,
          height: dimension,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 6 })
        .toBuffer();
      if (output.length <= 512 * 1024) return output;
    }
    throw new BadRequestException(
      'A imagem não pôde ser reduzida para até 512 KB. Escolha outra foto.',
    );
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException(
      'Imagem inválida, danificada ou com resolução excessiva.',
    );
  }
}
