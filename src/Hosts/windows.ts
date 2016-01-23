var sudo = require('electron-sudo');
var Promise = require('promise');
var fs = require('fs');
import Mac = require('./mac');
var remote = require('electron').remote
const pathConfig = remote.app.getPath('appData') + '/hosty';

export class Windows extends Mac.Mac {
    static file =  'C:\\windows\\system32\\driver\\etc\\hosts';
}
