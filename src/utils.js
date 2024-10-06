/* eslint-disable import/prefer-default-export  */
import debug from 'debug';

export const convertStr = (str, condition = /\W/g) => str.replace(condition, '-');
export const getURL = (link, extension = '.html') => {
  const myURL = new URL(link);
  const URLWithoutProtocol = `${myURL.host}${myURL.pathname}`;
  const correctURL = `${convertStr(URLWithoutProtocol)}${extension}`;
  return correctURL;
};
export const defaultDebug = debug('page-loader');
