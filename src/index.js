/* eslint-disable import/prefer-default-export */

import { downloadDataWebsite } from './logicDownloadWebSite.js';

export const getGeneralLogic = (link, pathDownload, webSite) => {
  const newPath = downloadDataWebsite(link, pathDownload, webSite);
  return newPath;
};
