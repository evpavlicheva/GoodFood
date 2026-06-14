/**
 * Resize and re-compress an image (as a data: URL) so it stays small enough
 * to live happily in localStorage alongside the rest of the menu. Photos
 * straight from a phone camera can be several MB — base64-encoding that
 * easily blows past the ~5MB localStorage quota after just one or two dishes.
 *
 * Scales down to `maxDimension` on the longest side and re-encodes as JPEG.
 */
export function resizeImageDataUrl(
  dataUrl: string,
  maxDimension = 800,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    // If anything goes wrong, fall back to the original image rather than
    // blocking the upload entirely.
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
