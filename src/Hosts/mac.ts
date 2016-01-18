var chokidar = require('chokidar');
var sudo = require('electron-sudo');
var fs = require('fs');
var Promise = require('promise');
var remote = require('electron').remote
const pathConfig = remote.app.getPath('appData') + '/hosty';

var InterfaceHosts = require('./interfaceHosts');

export class Mac implements InterfaceHosts {

    static file =  '/etc/hosts'

    public clientSave = false;

    public read() {
        var command = 'node ./fs.js read "' + Mac.file + '"';

        var options = {
            name: 'Hosts manager',
        }

        return new Promise(function(resolve, reject){
            sudo.exec(command, options, function(error, success){
                if( error ) {
                    reject(error);
                }
                resolve(success);
            });
        });
    }

    public write(data: String) {
        return new Promise(function(resolve, reject){
            fs.writeFile(pathConfig + '/tmp.txt', data, function(err) {
                if(err) {
                    return console.log(err);
                }
                var command = 'node ./fs.js write "' + Mac.file + '"  "' + pathConfig + '/tmp.txt"';
                var options = {
                    name: 'Hosts manager',
                }

                var that = this;
                that.clientSave = true;

                    sudo.exec(command, options, function(error, success){
                        if( error ) {
                            reject(error);
                        }

                        resolve(success);
                    });

            });
        });


    }

    public watch(callback: Function)
    {
        var that = this
        chokidar.watch(Mac.file, {ignored: /[\/\\]\./}).on('change', (event, path) => {
            if( that.clientSave ) {
                that.clientSave = false;
            } else {
                callback()
            }
        });
    }

}
