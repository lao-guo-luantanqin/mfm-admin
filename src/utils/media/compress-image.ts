import Compressor from "compressorjs";

export type CompressOptions = {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
};

/** H5 端压缩图片，对齐旧版 mfm-property-project-image edit.vue */
export function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const { quality = 0.8, maxWidth = 1920, maxHeight = 1920 } = options;
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality,
      maxWidth,
      maxHeight,
      convertSize: 2 * 1024 * 1024,
      success(result) {
        resolve(
          new File([result], file.name, {
            type: result.type,
            lastModified: Date.now()
          })
        );
      },
      error(err) {
        reject(err);
      }
    });
  });
}
