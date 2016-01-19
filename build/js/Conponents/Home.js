var fs = require('fs');
var notie = require('notie');
var Datastore = require('nedb');
var uniqid = require('uniqid');
var remote = require('electron').remote;
var pathConfig = remote.app.getPath('appData') + '/hosty';
var Hosts = require('../Hosts');
var Settings = require('../Settings');
var dbHistory = new Datastore({ filename: pathConfig + '/history.db', autoload: true });
var hosts = new Hosts();
var prevKeyPress = null;
var home = {
    template: fs.readFileSync(remote.app.getAppPath() + '/build/home.html', 'UTF8'),
    data: function () {
        return {
            message: 'Vuejs power',
            hosts_datas: 'loading ....',
            history: 'loading',
            cfile: {
                'rev': 'Master'
            },
            master: null,
            settings: {}
        };
    },
    asyncData: function (resolve, reject) {
        var that = this;
        hosts.read().then(function (d) {
            hosts.watch(function () {
                notie.confirm('File changed!', 'Reload !', 'Nop', function () {
                    that.reload();
                });
            });
            resolve({
                'hosts_datas': d,
                master: d
            });
        }, function error(d) {
            reject(d);
        });
        dbHistory.find({}).sort({ created_at: -1 }).exec(function (err, docs) {
            resolve({ history: docs });
        });
        Settings.read(function (settings) {
            resolve({ settings: settings });
        });
    },
    methods: {
        load: function (index) {
            var doc = this.history[index];
            this.$children[0].model = doc['data'];
            this.cfile = doc;
        },
        reload: function () {
            var _this = this;
            hosts.read().then(function (d) {
                _this.$children[0].model = d;
                _this.cfile = {
                    rev: 'Master'
                };
                _this.master = d;
            });
        },
        remove: function (index) {
            var that = this;
            var doc = this.history[index];
            notie.confirm('Remove ' + doc['rev'] + ' ?', 'Yes !', 'Nop', function () {
                if (that.cfile.rev == doc['rev']) {
                    that.reload();
                }
                dbHistory.remove({ _id: doc['_id'] }, {}, function (err, numRemoved) {
                    that.history.splice(index, 1);
                });
            });
        },
        save: function (event) {
            var that = this;
            hosts.write(this['hosts_datas']).then(function (d) {
                this['hosts_datas'] = d;
                notie.alert(1, 'Success!', 0.5);
                if (that.settings.history) {
                    if (that.settings.historyNb < that.history.length) {
                        var diff = that.history.length - that.settings.historyNb;
                        console.log(diff, that.settings.historyNb, that.history.length);
                        var toRemove = [];
                        for (var i = that.settings.historyNb - 1; i <= (that.history.length - 1); i++) {
                            toRemove.push(that.history[i]._id);
                        }
                        dbHistory.remove({ _id: { $in: toRemove } }, { multi: true }, function (err, numRemoved) {
                            that.history.splice(that.settings.historyNb - 1, diff);
                            dbHistory.insert({
                                rev: uniqid(),
                                created_at: new Date(),
                                data: that['hosts_datas']
                            }, function (err, newDoc) {
                                that.history.unshift(newDoc);
                            });
                        });
                    }
                    else {
                        dbHistory.insert({
                            rev: uniqid(),
                            created_at: new Date(),
                            data: that['hosts_datas']
                        }, function (err, newDoc) {
                            that.history.unshift(newDoc);
                        });
                    }
                }
            }, function (d) {
                console.log('[ERROR]', d);
            });
        },
        saveMe: function (event) {
            var current = event.keyCode;
            if (current == 83 && (prevKeyPress == 91 || prevKeyPress == 17)) {
                this.save(event);
            }
            prevKeyPress = current;
        }
    },
    components: {
        codemirror: {
            replace: false,
            props: ['model'],
            ready: function () {
                this.$nextTick(this.initCodeMirror);
            },
            methods: {
                initCodeMirror: function () {
                    var vm = this;
                    var cm = CodeMirror(vm.$el, {
                        mode: 'ruby',
                        lineNumbers: true,
                        lineWrapping: true,
                        theme: 'monokai'
                    });
                    cm.on('change', function () {
                        vm.$set('model', cm.getValue());
                        // Add { silent: true }  as 3rd arg?
                    });
                    // Set the initial value
                    cm.setValue(vm.model);
                    this.$watch('model', function (value) {
                        if (value !== cm.getValue()) {
                            cm.setValue(value);
                        }
                    });
                }
            }
        }
    }
};
module.exports = home;
