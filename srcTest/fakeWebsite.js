/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { logicDataDownload } from './fakeLogicData.js';
import { getLogicPicturesDownload } from '../src/logicPictures.js';

export class FakeWebsite {
  constructor(data) {
    this.data = data;
  }

  downloadDataWebSite(link, pathForDownload) {
    return logicDataDownload(link, pathForDownload, this);
  }

  downloadPicture(pathFile, pathDir, link) {
    return getLogicPicturesDownload(pathFile, pathDir, link);
  }
}
