import sharp from 'sharp';

export class ImageResizeService {
  public targetWidth: number;
  public targetHeight: number;

  public constructor(targetWidth: number, targetHeight: number) {
    this.targetHeight = targetHeight;
    this.targetWidth = targetWidth;
  }

  public async calculateAverageColor(imagePath: string) {
    const { data } = await sharp(imagePath)
      .resize(1, 1)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const averageColor = {
      r: data[0],
      g: data[1],
      b: data[2],
      alpha: 1,
    };

    return averageColor;
  }

  public async calculateDominantColor(imagePath: string) {
    const { data, info } = await sharp(imagePath)
      .resize(100, 100)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const colorCount: Record<string, number> = {};

    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const colorKey = `${r}:${g}:${b}`;

      colorCount[colorKey] = (colorCount[colorKey] || 0) + 1;
    }

    const dominantColorKey = Object.keys(colorCount).reduce((a, b) =>
      colorCount[a] > colorCount[b] ? a : b,
    );

    // Correct the split delimiter to ':'
    const [r, g, b] = dominantColorKey.split(':').map(Number);

    return { r, g, b, alpha: 1 };
  }

  public async resizeImage(filePath: string, targetFilePath: string) {
    //const averageColor = await this.calculateAverageColor(filePath);
    const dominantColor = await this.calculateDominantColor(filePath);

    return sharp(filePath)
      .resize({
        fit: 'contain',
        //background: { r: 0, g: 255, b: 255, alpha: 1 },
        //background: averageColor,
        background: dominantColor,
        width: this.targetWidth,
        height: this.targetHeight,
        withoutEnlargement: false,
        withoutReduction: false,
        position: 'centre',
      })
      .toFormat('jpg', {
        quality: 48,
      })
      .toFile(targetFilePath);
  }
}
