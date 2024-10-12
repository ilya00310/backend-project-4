import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import nock from 'nock';
import debug from 'debug';
import getGeneralLogic from '../index.js';

const { promises: fsp } = fs;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getFixturePath = (fileName) => path.resolve(__dirname, '..', '__fixtures__', fileName);

nock.disableNetConnect();
let currentPath;
const link = 'https://ru.hexlet.io/courses';
const nockDebug = debug('page-loader: nock.');
const getNock = (pathData, pathExpectedFile, status = 200) => nock(/ru\.hexlet\.io/)
  .persist()
  .get(pathData)
  .replyWithFile(status, pathExpectedFile, { 'Content-Type': 'utf-8' }, nockDebug('request %s %s ', 'GET', link), nockDebug('status %d %s', 200, 'OK'));
beforeEach(async () => {
  currentPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});
beforeAll(async () => {
  getNock(/\/courses/, getFixturePath('file1.txt'));
  getNock(/\/assets\/professions\/nodejs.png/, getFixturePath('file1.txt'));
  getNock(/\/assets\/application.css/, getFixturePath('file1.txt'));
  getNock(/\/packs\/js\/runtime.js/, getFixturePath('file1.txt'));
  getNock(/\/404/, getFixturePath('file1.txt'), 404);
  getNock(/\/500/, getFixturePath('file1.txt'), 500);
});
describe('page-loader', () => {
  test('page-loader: success', async () => {
    const expectedImg = await fsp.readFile(getFixturePath('assets/professions/nodejs.png'), null);
    const pathDownloadSite = await getGeneralLogic(link, currentPath);
    const regex = /\/tmp\/page-loader-X*\w*\/ru-hexlet-io-courses\.html/;
    const pathFilePicture = '/tmp/page-loader-XXXXXXxAoQtp/ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png';
    const afterHTML = await fsp.readFile(getFixturePath('file2.txt'), 'utf-8');
    const newFile = await fsp.readFile(pathDownloadSite, 'utf-8');
    expect(await fsp.stat(pathFilePicture)).not.toBeUndefined();
    expect(newFile).toBe(afterHTML);
    expect(pathDownloadSite).toMatch(regex);
    expect(await fsp.readFile(pathFilePicture, null)).toEqual(expectedImg);
  });
  test('page-loader: error', async () => {
    const pathCloseDir = '/home/ilya/backend-project-4/__fixtures__/sys';
    const pathNewFile = path.join(currentPath, 'newFile');
    await fsp.writeFile(pathNewFile, '', 'utf-8');
    await (() => expect(getGeneralLogic(link, pathNewFile)).toThrow());
    await (() => expect(getGeneralLogic('https://ru.hexlet.io/404', currentPath)).toThrow());
    await (() => expect(getGeneralLogic('https://ru.hexlet.io/500', currentPath)).toThrow());
    await (() => expect(getGeneralLogic(link, '/wrongPath')).toThrow());
    await (() => expect(getGeneralLogic(link, pathCloseDir)).toThrow());
  });
});
