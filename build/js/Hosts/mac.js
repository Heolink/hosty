var chokidar = require('chokidar');
var sudo = require('electron-sudo');
var fs = require('fs');
var Promise = require('promise');
var remote = require('electron').remote;
var pathConfig = remote.app.getPath('appData') + '/hosty';
var InterfaceHosts = require('./interfaceHosts');
var Mac = (function () {
    function Mac() {
        this.clientSave = false;
    }
    Mac.prototype.read = function () {
        var command = 'node ./fs.js read "' + Mac.file + '"';
        var options = {
            name: 'Hosts manager'
        };
        return new Promise(function (resolve, reject) {
            sudo.exec(command, options, function (error, success) {
                if (error) {
                    reject(error);
                }
                resolve(success);
            });
        });
    };
    Mac.prototype.write = function (data) {
        return new Promise(function (resolve, reject) {
            fs.writeFile(pathConfig + '/tmp.txt', data, function (err) {
                if (err) {
                    return console.log(err);
                }
                var command = 'node ./fs.js write "' + Mac.file + '"  "' + pathConfig + '/tmp.txt"';
                var options = {
                    name: 'Hosts manager'
                };
                var that = this;
                that.clientSave = true;
                sudo.exec(command, options, function (error, success) {
                    if (error) {
                        reject(error);
                    }
                    resolve(success);
                });
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
