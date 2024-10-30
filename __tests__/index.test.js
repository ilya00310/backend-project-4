import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import nock from 'nock';
import getGeneralLogic from '../index.js';

const { promises: fsp } = fs;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getFixturePath = (fileName) => path.resolve(__dirname, '..', '__fixtures__', fileName);

nock.disableNetConnect();
let currentPath;
const link = 'https://ru.hexlet.io/courses';
const getNock = (pathData, pathExpectedFile, status = 200, encoding = 'utf-8') => nock(/ru\.hexlet\.io/)
  .persist()
  .get(pathData)
  .replyWithFile(status, pathExpectedFile, { 'Content-Type': encoding });

const fixturesInfo = [
  { regexPath: /\/courses/, fixturePath: 'file1.html' },
  {
    regexPath: /\/assets\/professions\/nodejs.png/, fixturePath: 'assets/professions/nodejs.png', encodingFile: null, itemPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
  },
  {
    regexPath: /\/assets\/application.css/, fixturePath: 'assets/application.css', encodingFile: null, encodingLink: 'utf-8', itemPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css',
  },
  {
    regexPath: /\/packs\/js\/runtime.js/, fixturePath: 'packs/js/runtime.json', encodingLink: 'utf-8', itemPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js',
  },
  {
    regexPath: /\/404/, fixturePath: 'file1.html', status: 404, linkPath: 'https://ru.hexlet.io/404',
  },
  {
    regexPath: /\/500/, fixturePath: 'file1.html', status: 500, linkPath: 'https://ru.hexlet.io/500',
  }];
beforeAll(async () => {
  fixturesInfo.map(({
    regexPath, fixturePath, encodingFile, status,
  }) => getNock(regexPath, getFixturePath(fixturePath), status, encodingFile));
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
  test.each(fixturesInfo.filter((item) => item.itemPath).map(({ fixturePath, itemPath }) => [fixturePath, itemPath]))('.check correct %s %s %s', async (pathFixture, pathItem, extension = null) => {
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
    ...fixturesInfo.filter((item) => item.linkPath)
      .map(({ linkPath }) => [linkPath]),
    [link, '/sys'],
    ['wrongLink'],
  ])('.check exist %s %s', async (currentLink, pathForTest = currentPath) => {
    await expect(getGeneralLogic(currentLink, pathForTest)).rejects.toThrow();
  });
});
