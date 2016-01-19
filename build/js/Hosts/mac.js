var chokidar = require('chokidar');
var sudo = require('electron-sudo');
var Promise = require('promise');
var fs = require('fs');
var remote = require('electron').remote;
var pathConfig = remote.app.getPath('appData') + '/hosty';
var InterfaceHosts = require('./interfaceHosts');
var Mac = (function () {
    function Mac() {
        this.clientSave = false;
    }
    Mac.prototype.read = function () {
        return new Promise(function (resolve, reject) {
            fs.readFile(Mac.file, { encoding: 'UTF8' }, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    };
    Mac.prototype.write = function (data) {
        var command = 'mv "' + pathConfig + '/hosts" ' + Mac.file;
        var options = {
            name: 'Hosty'
        };
        var that = this;
        that.clientSave = true;
        return new Promise(function (resolve, reject) {
            fs.writeFile(pathConfig + '/hosts', data, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    sudo.exec(command, options, function (error, success) {
                        if (error) {
                            reject(error);
                        }
                        resolve(success);
                    });
                }
            });
        });
    };
    Mac.prototype.watch = function (callback) {
        var that = this;
        chokidar.watch(Mac.file, { ignored: /[\/\\]\./ }).on('change', function (event, path) {
            if (that.clientSave) {
                that.clientSave = false;
            }
            else {
                callback();
            }
        });
    };
    Mac.file = '/etc/hosts';
    return Mac;
})();
exports.Mac = Mac;
