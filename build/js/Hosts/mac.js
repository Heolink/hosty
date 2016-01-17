var sudo = require('electron-sudo');
var Promise = require('promise');
var InterfaceHosts = require('./interfaceHosts');
var Mac = (function () {
    function Mac() {
    }
    Mac.prototype.read = function () {
        var command = 'cat /etc/hosts';
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
        return new Promise(function (resolve, reject) {
            sudo.exec(command, options, function (error, success) {
                if (error) {
                    reject(error);
                }
                resolve(success);
            });
        });
    };
    return Mac;
})();
module.exports = Mac;
