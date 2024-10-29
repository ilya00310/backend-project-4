/* eslint-disable import/prefer-default-export */
import path from 'path';
import { convertStr, defaultDebug } from './utils.js';
import { getLogicDataDownload } from './logicData.js';
import { getLogicPicturesDownload } from './logicPictures.js';
import { getOutputError } from './logicOutputError.js';

export const getURL = (link, extension = '.html') => {
  const myURL = new URL(link);
  const URLWithoutProtocol = `${myURL.host}${myURL.pathname}`;
  const correctURL = `${convertStr(URLWithoutProtocol)}${extension}`;
  return correctURL;
};
export const getGeneralLogic = (link, pathDirNewFile = process.cwd()) => {
  let pathNewFile;
  try {
    pathNewFile = path.join(pathDirNewFile, getURL(link));
  } catch (err) {
    return Promise.reject()
      .catch(() => {
        throw new Error(`${link} invalid URL`);
      });
  }
  const nameNewDir = getURL(link, '_files');
  defaultDebug('link %s', link);
  return getLogicDataDownload(link, pathDirNewFile)
    .then((data) => getLogicPicturesDownload(link, pathNewFile, nameNewDir, data))
    .then(() => pathNewFile)
    .catch((err) => {
      defaultDebug('direction %s', err);
      return getOutputError(err, pathNewFile, pathDirNewFile)
        .then((correctErr) => {
          throw new Error(correctErr);
        });
    });
};
