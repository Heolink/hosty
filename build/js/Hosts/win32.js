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
var Win32 = (function (_super) {
    __extends(Win32, _super);
    function Win32() {
        _super.apply(this, arguments);
        this.file = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
    }
    Win32.prototype.write = function (data) {
        var _this = this;
        var command = "mv (" + pathConfig + "/hosts" + "' , " + this.file + ")";
        var options = {
            name: 'Hosty'
        };
        var that = this;
        that.clientSave = true;
        return new Promise(function (resolve, reject) {
            fs.writeFile(_this.file, data, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    return Win32;
})(Mac.Mac);
exports.Win32 = Win32;
