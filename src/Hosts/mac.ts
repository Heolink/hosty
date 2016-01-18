var chokidar = require('chokidar');
var sudo = require('electron-sudo');
var Promise = require('promise');

var InterfaceHosts = require('./interfaceHosts');

export class Mac implements InterfaceHosts {

    static file =  '/etc/hosts'

    public clientSave = false;

    public read() {
        var command = 'cat ' + Mac.file;

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
        var command = 'echo "'+data+'" | sudo tee ' + Mac.file;

        var options = {
            name: 'Hosts manager',
        }

        var that = this;
        that.clientSave = true;
        return new Promise(function(resolve, reject){
            sudo.exec(command, options, function(error, success){
                if( error ) {
                    reject(error);
                }

                resolve(success);
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
