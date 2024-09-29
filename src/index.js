/* eslint-disable import/prefer-default-export */
import path from 'path';
import { WebSite } from './webSite.js';
import { getURL } from './utils.js';

export const getGeneralLogic = (link, pathDirectory, webSite = new WebSite()) => {
  const pathNewFile = path.join(pathDirectory, getURL(link));
  const nameNewDir = getURL(link, '_files');
  return webSite.downloadDataWebSite(link, pathNewFile)
    .then(() => webSite.downloadPicture(pathNewFile, nameNewDir, link))
    .then(() => pathNewFile);
};
