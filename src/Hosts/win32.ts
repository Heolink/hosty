var sudo = require('electron-sudo');
var Promise = require('promise');
var fs = require('fs');
import Mac = require('./mac');
var remote = require('electron').remote
const pathConfig = remote.app.getPath('appData') + '/hosty';

export class Win32 extends Mac.Mac {
    public file =  'C:\\Windows\\System32\\drivers\\etc\\hosts';


	public write(data: String) {
        var command = "mv ("+ pathConfig + "/hosts" +"' , " + this.file + ")";

        var options = {
            name: 'Hosty',
        }

        var that = this;
        that.clientSave = true;
        return new Promise( (resolve, reject) => {
            fs.writeFile(this.file, data, function(err) {
                if(err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

}
