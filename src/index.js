/* eslint-disable import/prefer-default-export */
import path from 'path';
import axios from 'axios';
import { convertStr, defaultDebug } from './utils.js';
import { getLogicPicturesDownload } from './logicPictures.js';

const getUrlWithoutProtocol = (link) => {
  const myURL = new URL(link);
  return `${myURL.host}${myURL.pathname}`;
};
const getNameNewDir = (link, extension = '.html') => {
  const URLWithoutProtocol = getUrlWithoutProtocol(link);
  const nameNewDir = `${convertStr(URLWithoutProtocol)}${extension}`;
  return nameNewDir;
};
export const getGeneralLogic = (link, pathDirNewFile = process.cwd()) => {
  let pathNewFile;
  try {
    pathNewFile = path.join(pathDirNewFile, getNameNewDir(link));
  } catch (err) {
    return Promise.reject(err);
  }
  const nameNewDir = getNameNewDir(link, '_files');
  defaultDebug('link %s', link);
  return axios.get(link)
    .then(({ data }) => getLogicPicturesDownload(link, pathNewFile, nameNewDir, data))
    .then(() => pathNewFile);
};
