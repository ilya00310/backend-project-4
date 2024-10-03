/* eslint-disable import/prefer-default-export */
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { convertStr } from './utils.js';

const { promises: fsp } = fs;
const getPathImg = (url) => (path.extname(url.pathname) ? path.join(url.host, url.pathname) : `${path.join(url.host, url.pathname)}.html`);

const changedItems = (tag, attribute, linkURL, pathNewFile, nameNewDir, loadFile) => {
  const itemFilter = Object.values(loadFile(`${tag}`)).filter((item) => item.attribs);
  const pathNewDir = path.join(pathNewFile, '..', nameNewDir);
  return itemFilter.map((item) => {
    const newURL = new URL(item.attribs[`${attribute}`], linkURL.origin);
    const pathImg = getPathImg(newURL);
    const nameFilePicture = convertStr(pathImg, /\/|\.(?=.*[.])/g);
    if (newURL.host !== linkURL.host) {
      return Promise.resolve();
    }
    return axios.get(newURL.href, { responseType: 'arraybuffer' })
      .then((loadImg) => fsp.writeFile(path.join(pathNewDir, nameFilePicture), loadImg.data, 'utf-8'))
      .then(() => {
        loadFile(`${tag}[${attribute} = "${item.attribs[`${attribute}`]}"]`).attr(`${attribute}`, path.join(nameNewDir, nameFilePicture));
        return Promise.resolve();
      });
  });
};

export const getLogicPicturesDownload = async (link, pathNewFile, nameNewDir) => {
  const pathNewDir = path.join(pathNewFile, '..', nameNewDir);
  return fsp.mkdir(pathNewDir)
    .then(() => {
      const linkURL = new URL(link);
      return fsp.readFile(pathNewFile, 'utf-8')
        .then((data) => {
          const $ = cheerio.load(data);
          const promisesImg = changedItems('img', 'src', linkURL, pathNewFile, nameNewDir, $);
          const promisesLink = changedItems('link', 'href', linkURL, pathNewFile, nameNewDir, $);
          const promisesScript = changedItems('script', 'src', linkURL, pathNewFile, nameNewDir, $);
          return Promise.all([...promisesImg, ...promisesLink, ...promisesScript])
            .then(() => fsp.writeFile(pathNewFile, $.html(), 'utf-8'))
            .then(() => Promise.resolve());
        });
    });
};
