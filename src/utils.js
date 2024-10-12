/* eslint-disable import/prefer-default-export  */
import debug from 'debug';

export const convertStr = (str, condition = /\W/g) => str.replace(condition, '-');

export const defaultDebug = debug('page-loader');
