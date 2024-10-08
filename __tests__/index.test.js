import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import nock from 'nock';
import debug from 'debug';
import getGeneralLogic from '../index.js';
import { getURL } from '../src/utils.js';

const { promises: fsp } = fs;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getFixturePath = (fileName) => path.resolve(__dirname, '..', '__fixtures__', fileName);

nock.disableNetConnect();
let expectedHTML;
let afterHTML;
let expectedImg;
let currentPath;
let pathNewFile;
let pathCloseDir;
const link = 'https://ru.hexlet.io/courses';
const nockDebug = debug('page-loader: nock.');
const getNock = (pathData, expectedData, status = 200, host = /ru\.hexlet\.io/) => nock(host)
  .get(pathData)
  .times(Infinity)
  .reply(status, expectedData, nockDebug('request %s %s ', 'GET', link), nockDebug('status %d %s', 200, 'OK'));
beforeEach(async () => {
  currentPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  pathNewFile = path.join(currentPath, 'newFile');
  await fsp.writeFile(pathNewFile, '', 'utf-8');
  pathCloseDir = path.join(currentPath, 'closeDir');
  await fsp.mkdir(pathCloseDir, { recursive: true });
  await fsp.chmod(pathCloseDir, 0o400);
});
beforeAll(async () => {
  expectedHTML = await fsp.readFile(getFixturePath('file1.txt'), 'utf-8');
  afterHTML = await fsp.readFile(getFixturePath('file2.txt'), 'utf-8');
  expectedImg = await fsp.readFile(getFixturePath('assets/professions/nodejs.png'), null);
  getNock(/\/courses/, expectedHTML);
  getNock(/\/assets\/professions\/nodejs.png/, expectedImg);
  getNock(/\/assets\/application.css/, expectedHTML);
  getNock(/\/packs\/js\/runtime.js/);
  getNock(/\/404/, expectedHTML, 404);
  getNock(/\/500/, expectedHTML, 500);
});
describe('page-loader', () => {
  test('Check success', async () => {
    const pathDownloadSite = await getGeneralLogic(link, currentPath);
    const newFile = await fsp.readFile(pathDownloadSite, 'utf-8');
    const regex = /\/tmp\/page-loader-X*\w*\/ru-hexlet-io-courses\.html/;
    const pathFilePicture = path.join(pathDownloadSite, '..', getURL(link, '_files'), 'ru-hexlet-io-assets-professions-nodejs.png');
    fsp.stat(pathFilePicture).catch((err) => expect(err).toBeUndefined());
    expect(newFile).toBe(afterHTML);
    expect(pathDownloadSite).toMatch(regex);
    fsp.readFile(pathFilePicture, null).then((fileInfo) => expect(fileInfo).toEqual(expectedImg));
  });
  test('page-loader error', async () => {
    test.each([
      ['https://ru.hexlet.io/404', currentPath],
      ['https://ru.hexlet.io/500', currentPath],
      [link, '/wrongPath'],
      [link, pathNewFile],
      [link, pathCloseDir],
    ])('.check error(%s %s)', async (currentLink, pathDir) => {
      try {
        await expect(getGeneralLogic(currentLink, pathDir));
      } catch (error) {
        expect(error).toThrow();
      }
    });
  });
});
