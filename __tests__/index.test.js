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
const getNock = (pathData, pathExpectedFile, status = 200, encoding = 'utf-8') => nock(/ru\.hexlet\.io/)
  .persist()
  .get(pathData)
  .replyWithFile(status, pathExpectedFile, { 'Content-Type': encoding }, nockDebug('request %s %s ', 'GET', link), nockDebug('status %d %s', 200, 'OK'));

beforeAll(async () => {
  getNock(/\/courses/, getFixturePath('file1.html'));
  getNock(/\/assets\/professions\/nodejs.png/, getFixturePath('assets/professions/nodejs.png'), 200, null);
  getNock(/\/assets\/application.css/, getFixturePath('assets/application.css'), 200, null);
  getNock(/\/packs\/js\/runtime.js/, getFixturePath('packs/js/runtime.json'));
  getNock(/\/404/, getFixturePath('file1.html'), 404);
  getNock(/\/500/, getFixturePath('file1.html'), 500);
});
describe('page-loader: success', () => {
  beforeEach(async () => {
    currentPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });
  test('check HTML File', async () => {
    await getGeneralLogic(link, currentPath);
    const afterHTML = await fsp.readFile(getFixturePath('file2.html'), 'utf-8');
    const newFile = await fsp.readFile(path.join(currentPath, 'ru-hexlet-io-courses.html'), 'utf-8');
    expect(newFile).toBe(afterHTML);
  });
  test.each([
    ['assets/professions/nodejs.png', 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png'],
    ['assets/application.css', 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css', 'utf-8'],
    ['packs/js/runtime.json', 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js', 'utf-8'],
  ])('.check correct %s %s %s', async (pathFixture, pathItem, extension = null) => {
    await getGeneralLogic(link, currentPath);
    const expectedItem = await fsp.readFile(getFixturePath(pathFixture), extension);
    const pathFileItem = path.join(currentPath, pathItem);
    expect(await fsp.access(pathFileItem, fs.constants.F_OK)).toBeUndefined();
    expect(await fsp.readFile(pathFileItem, extension)).toEqual(expectedItem);
  });
});
describe('page-loader: error', () => {
  beforeEach(async () => {
    currentPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });
  test('write in file', async () => {
    const pathNewFile = path.join(currentPath, 'newFile');
    await fsp.writeFile(pathNewFile, '', 'utf-8');
    await expect(getGeneralLogic(link, pathNewFile)).rejects.toThrow();
  });
  test.each([
    ['https://ru.hexlet.io/404'],
    ['https://ru.hexlet.io/500'],
    [link, '/sys'],
    ['wrongLink'],
  ])('.check exist %s %s', async (currentLink, pathForTest = currentPath) => {
    await expect(getGeneralLogic(currentLink, pathForTest)).rejects.toThrow();
  });
});
