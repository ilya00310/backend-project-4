/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { getLogicDataDownload } from './fakeLogicData.js';
import { getLogicPicturesDownload } from '../src/logicPictures.js';

export class FakeWebsite {
  constructor(data) {
    this.data = data;
  }

  downloadDataWebSite(link, pathNewFile, nameNewDir, webSite) {
    return getLogicDataDownload(link, pathNewFile, nameNewDir, webSite);
  }

  downloadPicture(pathFile, nameNewDir, link) {
    return getLogicPicturesDownload(pathFile, nameNewDir, link);
  }
}
