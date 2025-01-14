export class PageAlignmentService {
  private targetWidh: number;
  private targetHeight: number;
  private targetRatio: number;

  public constructor(targetWidth: number, targetHeight: number) {
    this.targetHeight = targetHeight;
    this.targetWidh = targetWidth;
    this.targetRatio = targetWidth / targetHeight;
  }

  public calculateOffsets(originalWidth: number, originalHeight: number) {
    const originalRatio = originalWidth / originalHeight;
    const offset = { scale: 1, xPadding: 0, yPadding: 0 };
    if (originalRatio > this.targetRatio) {
      // Original image is wider than thumbnail
      offset.scale = this.targetWidh / originalWidth;
      offset.xPadding = 0;
      offset.yPadding = (this.targetHeight - originalHeight * offset.scale) / 2;
    } else {
      offset.scale = this.targetHeight / originalHeight;
      offset.xPadding = (this.targetWidh - originalWidth * offset.scale) / 2;
      offset.yPadding = 0;
    }
    return offset;
  }
}
