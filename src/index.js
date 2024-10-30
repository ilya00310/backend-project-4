/* eslint-disable import/prefer-default-export */
import path from 'path';
import axios from 'axios';
import { convertStr, defaultDebug } from './utils.js';
import { getLogicPicturesDownload } from './logicPictures.js';

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
    return Promise.reject(err);
  }
  const nameNewDir = getURL(link, '_files');
  defaultDebug('link %s', link);
  return axios.get(link)
    .then(({ data }) => getLogicPicturesDownload(link, pathNewFile, nameNewDir, data))
    .then(() => pathNewFile)
    .catch((err) => {
      defaultDebug('direction %s', err);
      throw new Error(err);
    });
};
