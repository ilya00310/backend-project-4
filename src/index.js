/* eslint-disable import/prefer-default-export */
import path from 'path';
import { getURL, defaultDebug } from './utils.js';
import { getLogicDataDownload } from './logicData.js';
import { getLogicPicturesDownload } from './logicPictures.js';
import { getOutputError } from './logicOutputError.js';

export const getGeneralLogic = (link, pathDirectory) => {
  const pathNewFile = path.join(pathDirectory, getURL(link));
  const pathDirNewFile = path.join(pathNewFile, '..');
  const nameNewDir = getURL(link, '_files');
  defaultDebug('link %s', link);
  return getLogicDataDownload(link, pathNewFile, pathDirNewFile)
    .then(() => getLogicPicturesDownload(link, pathNewFile, nameNewDir))
    .then(() => pathNewFile)
    .catch((err) => {
      defaultDebug('direction %s', err);
      return getOutputError(err, pathNewFile, pathDirNewFile)
        .then((correctErr) => {
          console.error(correctErr);
          process.exit(1);
        });
    });
};
