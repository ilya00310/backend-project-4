/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { getLogicDataDownload } from './logicData.js';
import { getLogicPicturesDownload } from './logicPictures.js';

export class WebSite {
  downloadDataWebSite(link, pathNewFile) {
    return getLogicDataDownload(link, pathNewFile);
  }

  downloadPicture(pathFile, nameNewDir, link) {
    return getLogicPicturesDownload(pathFile, nameNewDir, link);
  }
}
