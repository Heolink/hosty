var sudo = require('electron-sudo');
var Promise = require('promise');
var fs = require('fs');
import Mac = require('./mac');
var remote = require('electron').remote
const pathConfig = remote.app.getPath('appData') + '/hosty';

export class Linux extends Mac.Mac {

}
