/* eslint-disable import/prefer-default-export */
import path from 'path';
import { getURL } from './utils.js';
import { getLogicDataDownload } from './logicData.js';
import { getLogicPicturesDownload } from './logicPictures.js';

export const getGeneralLogic = (link, pathDirectory) => {
  const pathNewFile = path.join(pathDirectory, getURL(link));
  const nameNewDir = getURL(link, '_files');
  return getLogicDataDownload(link, pathNewFile)
    .then(() => getLogicPicturesDownload(link, pathNewFile, nameNewDir))
    .then(() => pathNewFile);
};
