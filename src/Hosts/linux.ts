var sudo = require('electron-sudo');
var Promise = require('promise');
var fs = require('fs');
import Mac = require('./mac');
var remote = require('electron').remote
const pathConfig = remote.app.getPath('appData') + '/hosty';

export class Linux extends Mac.Mac {
    public write(data: String) {
        var command = 'mv '+pathConfig +'/hosts ' + Linux.file;

        var options = {
            name: 'Hosts manager',
        }

        var that = this;
        that.clientSave = true;
        return new Promise(function(resolve, reject){
            fs.writeFile(pathConfig + '/hosts', data, function(err) {
                if(err) {
                    reject(err);
                } else {
                    sudo.exec(command, options, function(error, success){
                        if( error ) {
                            reject(error);
                        }

                        resolve(success);
                    });      
                }
                                      
            });       
        });
    }
}
