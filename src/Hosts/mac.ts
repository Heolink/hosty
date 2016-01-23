var chokidar = require('chokidar');
var sudo = require('electron-sudo');
var Promise = require('promise');
var fs = require('fs');
var remote = require('electron').remote
const pathConfig = remote.app.getPath('appData') + '/hosty';

var InterfaceHosts = require('./interfaceHosts');

export class Mac implements InterfaceHosts {

    public file =  '/etc/hosts'

    public clientSave = false;

    public read() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.file, {encoding:'UTF8'}, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    public write(data: String) {
        var command = 'mv "'+pathConfig +'/hosts" ' + this.file;

        var options = {
            name: 'Hosty',
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

    public watch(callback: Function)
    {
        var that = this
        chokidar.watch(this.file, {ignored: /[\/\\]\./}).on('change', (event, path) => {
            if( that.clientSave ) {
                that.clientSave = false;
            } else {
                callback()
            }
        });
    }

}
