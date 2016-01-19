var fs = require('fs');
var notie = require('notie');
var Datastore = require('nedb');
var remote = require('electron').remote;
var pathConfig = remote.app.getPath('appData') + '/hosty';
var Settings = require('../Settings');
var config = {
    template: fs.readFileSync(remote.app.getAppPath() + '/build/config.html', 'UTF8'),
    data: function () {
        return {
            settings: {
                _name: 'settings',
                historyNb: 10
            }
        };
    },
    asyncData: function (resolve, reject) {
        Settings.read(function (doc) {
            resolve({ settings: doc });
        });
    },
    methods: {
        save: function () {
            Settings.write(this.settings, function (err, ok) {
                if (!err) {
                    notie.alert(1, 'Success!', 0.5);
                }
            });
        }
    }
};
module.exports = config;
