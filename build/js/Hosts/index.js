var os = require('os');
var Mac = require('./mac');
var Linux = require('./linux');
var Hosts = (function () {
    function Hosts() {
        this.platform = os.platform();
        switch (this.platform) {
            case 'darwin':
                this.os = new Mac();
                break;
            case 'linux':
                this.os = new Linux();
                break;
                break;
        }
    }
    Hosts.prototype.read = function () {
        return this.os.read();
    };
    Hosts.prototype.write = function (data) {
        return this.os.write(data);
    };
    return Hosts;
})();
module.exports = Hosts;
