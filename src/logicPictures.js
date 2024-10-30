/* eslint-disable import/prefer-default-export */
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Listr from 'listr';
import { convertStr, defaultDebug } from './utils.js';

const { promises: fsp } = fs;
const getPathImg = (url) => (path.extname(url.pathname) ? path.join(url.host, url.pathname) : `${path.join(url.host, url.pathname)}.html`);

const changedItems = (htmlItems, linkURL, pathNewFile, nameNewDir, loadFile) => {
  const pathNewDir = path.join(pathNewFile, '..', nameNewDir);
  return htmlItems.reduce((acc, htmlItem) => {
    const tag = htmlItem[0];
    const attribute = htmlItem[1];
    const itemFilter = Object.values(loadFile(`${tag}`)).filter((item) => item.attribs);
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
            loadFile(`${tag}[${attribute} = "${item.attribs[`${attribute}`]}"]`).attr(`${attribute}`, path.join(nameNewDir, nameFilePicture));
            return Promise.resolve();
          }),
      }]);
    });
    return [...acc, ...newTasks].flat();
  }, []);
};

export const getLogicPicturesDownload = async (link, pathNewFile, nameNewDir, data) => {
  const pathNewDir = path.join(pathNewFile, '..', nameNewDir);
  defaultDebug('newPath %s', pathNewDir);
  return fsp.mkdir(pathNewDir)
    .then(() => {
      const linkURL = new URL(link);
      const $ = cheerio.load(data);
      const htmlItems = [['img', 'src'], ['link', 'href'], ['script', 'src']];
      const listrTasks = changedItems(htmlItems, linkURL, pathNewFile, nameNewDir, $);
      const a = new Listr(listrTasks, { concurrent: true });
      return a.run()
        .then(() => fsp.writeFile(pathNewFile, $.html(), 'utf-8'));
    });
};
