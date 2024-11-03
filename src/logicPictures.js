/* eslint-disable import/prefer-default-export */
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Listr from 'listr';
import { convertStr, defaultDebug } from './utils.js';

const { promises: fsp } = fs;
const getPathImg = (url) => (path.extname(url.pathname) ? path.join(url.host, url.pathname) : `${path.join(url.host, url.pathname)}.html`);

const writeItems = (htmlItems, linkURL, pathNewFile, nameNewDir, data) => {
  const $ = cheerio.load(data);
  const pathNewDir = path.join(pathNewFile, '..', nameNewDir);
  return htmlItems.reduce((acc, htmlItem) => {
    const tag = htmlItem[0];
    const attribute = htmlItem[1];
    const itemFilter = Object.values($(`${tag}`)).filter((item) => item.attribs);
    const newTasks = itemFilter.map((item) => {
      const newURL = new URL(item.attribs[`${attribute}`], linkURL.origin);
      defaultDebug('new URL %s', newURL);
      const pathImg = getPathImg(newURL);
      const nameFilePicture = convertStr(pathImg, /\/|\.(?=.*[.])/g);
      if (newURL.host !== linkURL.host || !item.attribs[`${attribute}`]) {
        return [];
      }
      return ([{
        title: newURL.href,
        task: () => axios.get(newURL.href, { responseType: 'arraybuffer' })
          .then((loadImg) => fsp.writeFile(path.join(pathNewDir, nameFilePicture), loadImg.data, 'utf-8'))
          .then(() => {
            $(`${tag}[${attribute} = "${item.attribs[`${attribute}`]}"]`).attr(`${attribute}`, path.join(nameNewDir, nameFilePicture));
          }),
      }]);
    });
    return [...acc, ...newTasks].flat();
  }, []);
};
const getCorrectFile = (htmlItems, linkURL, nameNewDir, data) => {
  const $ = cheerio.load(data);
  return htmlItems.reduce((acc, htmlItem) => {
    const tag = htmlItem[0];
    const attribute = htmlItem[1];
    const itemFilter = Object.values(acc(tag)).filter((item) => item.attribs);
    itemFilter.map((item) => {
      const newURL = new URL(item.attribs[`${attribute}`], linkURL.origin);
      defaultDebug('new URL %s', newURL);
      const pathImg = getPathImg(newURL);
      const nameFilePicture = convertStr(pathImg, /\/|\.(?=.*[.])/g);
      if (newURL.host !== linkURL.host || !item.attribs[`${attribute}`]) {
        return '';
      }
      acc(`${tag}[${attribute} = "${item.attribs[`${attribute}`]}"]`).attr(`${attribute}`, path.join(nameNewDir, nameFilePicture));
      return '';
    });
    return acc;
  }, $);
};
export const getLogicPicturesDownload = async (link, pathNewFile, nameNewDir, data) => {
  const pathNewDir = path.join(pathNewFile, '..', nameNewDir);
  defaultDebug('newPath %s', pathNewDir);
  return fsp.mkdir(pathNewDir)
    .then(() => {
      const linkURL = new URL(link);
      const htmlItems = [['img', 'src'], ['link', 'href'], ['script', 'src']];
      const listrTasks = writeItems(htmlItems, linkURL, pathNewFile, nameNewDir, data);
      const correctFile = getCorrectFile(htmlItems, linkURL, nameNewDir, data).html();
      const newListr = new Listr(listrTasks, { concurrent: true });
      return newListr.run()
        .then(() => fsp.writeFile(pathNewFile, correctFile, 'utf-8'));
    });
};
