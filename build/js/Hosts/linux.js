var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var sudo = require('electron-sudo');
var Promise = require('promise');
var fs = require('fs');
var Mac = require('./mac');
var remote = require('electron').remote;
var pathConfig = remote.app.getPath('appData') + '/hosty';
var Linux = (function (_super) {
    __extends(Linux, _super);
    function Linux() {
        _super.apply(this, arguments);
    }
    Linux.prototype.write = function (data) {
        var command = 'mv ' + pathConfig + '/hosts ' + Linux.file;
        var options = {
            name: 'Hosts manager'
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
    return Linux;
})(Mac.Mac);
exports.Linux = Linux;
