var Datastore = require('nedb');
var remote = require('electron').remote;
var pathConfig = remote.app.getPath('appData') + '/hosty';
var dbSettings = new Datastore({ filename: pathConfig + '/settings.db', autoload: true });
var Setting = (function () {
    function Setting() {
        this.data = {
            historyNb: 10,
            history: true,
            defaultView: 'raw'
        };
        this.key = 'settings';
    }
    Setting.prototype.read = function (callback) {
        var _this = this;
        dbSettings.findOne({ _name: this.key }).exec(function (err, doc) {
            if (doc) {
                _this.data = Vue.util.extend(_this.data, doc);
            }
            callback(_this.data);
        });
    };
    Setting.prototype.write = function (data, callback) {
        if (data.historyNb > 0) {
            data.history = true;
        }
        else {
            data.history = false;
        }
        data.historyNb = parseInt(data.historyNb);
        dbSettings.update({ _name: this.key }, data, { upsert: true }, function (err, ok) {
            callback(err, ok);
        });
    };
    return Setting;
})();
module.exports = new Setting();
