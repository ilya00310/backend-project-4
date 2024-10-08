/* eslint-disable import/prefer-default-export */
import path from 'path';
import { getURL, defaultDebug } from './utils.js';
import { getLogicDataDownload } from './logicData.js';
import { getLogicPicturesDownload } from './logicPictures.js';
import { getOutputError } from './logicOutputError.js';

export const getGeneralLogic = (link, pathDirNewFile = process.cwd()) => {
  const pathNewFile = path.join(pathDirNewFile, getURL(link));
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
          throw new Error();
        });
    });
};
