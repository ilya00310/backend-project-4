/* eslint-disable import/prefer-default-export */
import path from 'path';
import { WebSite } from './webSite.js';

export const downloadDataWebsite = (link, pathDownload, webSite = new WebSite()) => {
  const myURL = new URL(link);
  const URLWithoutProtocol = `${myURL.host}${myURL.pathname}`;
  const correctURL = `${URLWithoutProtocol.replace(/\W/g, '-')}.html`;
  const newPath = path.join(pathDownload, correctURL);
  return webSite.downloadDataWebSite(link, newPath)
    .then(() => Promise.resolve(newPath));
};
