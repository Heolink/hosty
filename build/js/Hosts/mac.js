var chokidar = require('chokidar');
var sudo = require('electron-sudo');
var Promise = require('promise');
var InterfaceHosts = require('./interfaceHosts');
var Mac = (function () {
    function Mac() {
        this.clientSave = false;
    }
    Mac.prototype.read = function () {
        var command = 'cat ' + Mac.file;
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
        var command = 'echo "' + data + '" | sudo tee /etc/hosts';
        var options = {
            name: 'Hosts manager'
        };
        var that = this;
        that.clientSave = true;
        return new Promise(function (resolve, reject) {
            sudo.exec(command, options, function (error, success) {
                if (error) {
                    reject(error);
                }
                resolve(success);
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
