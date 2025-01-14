import { Poppler } from 'node-poppler';
import { platform } from 'os';
import path from 'path';
import { existsSync } from 'fs';
import { getExtLibDir, isDevMode } from '../server';

type FileFormat = 'png' | 'jpg';

export const PopplerService = () => {
  let libPath;

  switch (platform()) {
    case 'win32':
      //libPath = path.join(__dirname, '../../', '/poppler/bin/');
      if (isDevMode()) {
        // path to the poppler in the extlib directory when running with npm run develop
        libPath = path.join(getExtLibDir(), '/poppler/win32/Library/bin');
      } else {
        // the path in the build and packed electron app
        libPath = path.join(getExtLibDir(), '../', '/poppler/bin/');
        if (!existsSync(libPath)) {
          // the path in the electron develop (npm run start) mode
          libPath = path.join(getExtLibDir(), '/poppler/bin/');
        }
      }
      break;
    default:
      if (process.env['POPPLER_DIR']?.includes(';')) {
        const libPaths = process.env['POPPLER_DIR']?.split(';') || [];

        // Homebrew intel/silicon has different destination so added support for
        // ";" delimiter in env file to provide multiple paths
        libPaths.some((tmpLibPath) => {
          if (existsSync(tmpLibPath + 'pdfinfo')) {
            libPath = tmpLibPath;

            return true;
          }
          return false;
        });
      } else {
        libPath = process.env['POPPLER_DIR'];
      }
  }

  const popplerDir = libPath ? libPath : process.env['POPPLER_DIR'] || '/usr/bin';

  const poppler = new Poppler(popplerDir);
  const fileFormat: FileFormat = (process.env.EXPORT_FORMAT as FileFormat) || 'jpg';

  return {
    getTotalPages: async (targetFile: string, password?: string) => {
      const options: any = {
        printAsJson: true,
      };

      if (password) {
        options.userPassword = password;
      }

      const pdfInfo: any = await poppler.pdfInfo(targetFile, options);

      return parseInt(pdfInfo.pages, 10);
    },
    createImage: async (
      targetFile: string,
      thumbnailPath: string,
      pageNumber: number,
      password?: string,
    ) => {
      const imageOptions: any = {
        firstPageToConvert: pageNumber,
        lastPageToConvert: pageNumber,
      };

      if (password) {
        imageOptions.userPassword = password;
      }

      switch (fileFormat) {
        case 'jpg':
          imageOptions.jpegFile = true;
          imageOptions.jpegOptions = `quality=${process.env.EXPORT_JPEG_QUALITY || 1},optimize=n`;
          break;

        case 'png':
          imageOptions.pngFile = true;
          break;
      }

      await poppler.pdfToCairo(targetFile, thumbnailPath, imageOptions);
    },
    extractText: async (
      targetFile: string,
      pageNumber: number,
      password?: string,
    ): Promise<string> => {
      const options: any = {
        firstPageToConvert: pageNumber,
        lastPageToConvert: pageNumber,
      };

      if (password) {
        options.userPassword = password;
      }

      let textContent: any = (await poppler.pdfToText(targetFile, undefined, options)) || '';

      // Remove non latin characters but keep puncuation marks and numbers
      // prettier-ignore
      textContent = textContent.replace(
                "\p{Latin}|[.,;,:,-,\,,?,!,&,\",„,“,',`,\n]|[0-9]",
                ''
            );
      return textContent.toString();
    },
    extractBoundingBoxXML: async (
      targetFile: string,
      pageNumber: number,
      password?: string,
    ): Promise<string | Error> => {
      const options: any = {
        firstPageToConvert: pageNumber,
        lastPageToConvert: pageNumber,
        boundingBoxXhtml: true,
      };

      if (password) {
        options.userPassword = password;
      }

      const textContent: any = (await poppler.pdfToText(targetFile, undefined, options)) || '';

      /* Remove non latin characters but keep puncuation marks and numbers
                               prettier-ignore
                              textContent = textContent.replace(
                                  "\p{Latin}|[.,;,:,-,\,,?,!,&,\",„,“,',`,\n]|[0-9]",
                                  ""
                              );
                              */
      return textContent;
    },
  };
};
