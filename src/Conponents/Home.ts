import fs = require('fs');
var notie = require('notie');
var Datastore = require('nedb');
var uniqid = require('uniqid');
var mousetrap = require('mousetrap');
var remote = require('electron').remote
const pathConfig = remote.app.getPath('appData') + '/hosty';


var Hosts = require('../Hosts');
var Settings = require('../Settings');

var dbHistory = new Datastore({ filename: pathConfig + '/history.db', autoload: true });

var hosts = new Hosts();
var prevKeyPress = null;

var home = {
    template: fs.readFileSync(remote.app.getAppPath()+'/build/home.html', 'UTF8'),
    data: function() {
        return {
            message: 'Vuejs power',
            hosts_datas: 'loading ....',
            history: 'loading',
            cfile: {
                'rev': 'Master',
            },
            master: null,
            settings: {},
            raw: false,
            ipEdited: null,
            ipAdd: null,
            domainAdd: null,
            domainEdited: null,
            hostObject: [],
            lineRemove: [],
            newDomain: null
        }
    },
    asyncData: function (resolve, reject) {
        var that = this
        hosts.read().then(
            (d) => {
                hosts.watch(() =>{
                    notie.confirm('File changed!', 'Reload !', 'Nop', function(){
                        that.reload();
                    });
                });
                resolve({
                    'hosts_datas': d,
                    master: d
                })
            },
            function error(d){
                reject(d)
            });

        dbHistory.find({}).sort({ created_at: -1 }).exec( function (err, docs) {
            resolve({history:docs})
        });
        Settings.read(function(settings){
            resolve({settings:settings})
        })
    },
    created: function () {

        mousetrap.bind(['command+s', 'ctrl+s'], (e) => {
            if( !this.raw ) {
                this.saveEditor(e);
            }
        })

        this.$watch('hosts_datas', (n, o) => {
            this['hostObject'] = []
            var lines = n.split("\n");
            for(var lineNumber in lines) {
                var line = lines[lineNumber];
                var ip = hosts.getIp(line)
                if(ip) {
                    ip = ip[0];
                    //on vire les éléments vide avec : filter(x=>!!x)
                    var domains = line.replace(ip,'').split(' ').filter(x=>!!x).map(function(v){
                        return {'domain': v};
                    });
                    this['hostObject'].push({
                        ip: ip,
                        lineNumber:lineNumber,
                        domains: domains
                    });
                }
            }
        })
    },
    methods: {
        addDomain: function(ip)
        {
            this.domainAdd = ip;
        },
        doneAddDomain: function(ip)
        {
            if (!this.domainAdd) {
                return;
            }
            this.domainAdd = null;
            if (this['newDomain']) {
                ip.domains.push({
                    domain: this['newDomain']
                });
            }
            this['newDomain'] = null;
        },
        cancelAddDomain: function (ip) {
            this.domainAdd = null;
            this['newDomain']= null;
        },
        editeIp: function(ip)
        {
            this.ipEdited = ip;
            this.ipBefore = ip.ip;
        },
        doneEditIp: function(ip)
        {
            if (!this.ipEdited) {
                return;
            }
            this.ipEdited = null;
            if (!ip.ip) {
                this['lineRemove'].push(ip.lineNumber);
                this.hostObject.$remove(ip);
            }
        },
        cancelEditIp: function (ip) {
            this.ipEdited = null;
            ip.ip = this.ipBefore;
        },
        editeDomain: function(domain)
        {
            this.domainEdited = domain;
            this.domainBefore = domain.domain;
        },
        doneEditDomain: function(ip, domain)
        {
            if (!this.domainEdited) {
                return;
            }
            this.domainEdited = null;
            if (!domain.domain) {
                ip.domains.$remove(domain);
                if( !ip.domains.length ) {
                    this['lineRemove'].push( ip.lineNumber )
                    this.hostObject.$remove(ip)
                }
            }
        },
        removeDomain: function(ip, domain)
        {
            ip.domains.$remove(domain);
            if( !ip.domains.length ) {
                this['lineRemove'].push( ip.lineNumber )
                this.hostObject.$remove(ip)
            }
        },
        cancelEditDomain: function (domain) {
            this.domainEdited = null;
            domain.domain = this.domainBefore;
        },
        load: function(index) {
            var doc = this.history[index];
            this.$children[0].model = doc['data'];
            this['hosts_datas'] = doc['data'];
            this.cfile = doc;
        },
        reload: function() {
            hosts.read().then((d)=>{
                this.$children[0].model = d;
                this.cfile = {
                    rev: 'Master'
                };
                this.master = d;
            })
        },
        remove: function(index) {
            var that = this;
            var doc = this.history[index];

            notie.confirm('Remove ' + doc['rev'] + ' ?', 'Yes !', 'Nop', function(){
                if( that.cfile.rev == doc['rev'] ) {
                    that.reload();
                }
                dbHistory.remove({ _id: doc['_id'] }, {}, function (err, numRemoved) {
                    that.history.splice(index, 1);
                });
            });

        },
        save: function(event) {
            var that = this

            hosts.write(this['hosts_datas']).then(
                function(d){
                    this['hosts_datas'] = d;
                    notie.alert(1, 'Success!', 0.5);

                    if( that.settings.history ) {
                        if( that.settings.historyNb < that.history.length ) {
                            var diff = that.history.length - that.settings.historyNb;
                            console.log(diff,that.settings.historyNb,  that.history.length)
                            var toRemove = [];
                            for( var i=that.settings.historyNb-1; i<=(that.history.length-1); i++  ) {
                                toRemove.push( that.history[i]._id )
                            }
                            dbHistory.remove({_id: { $in: toRemove }}, { multi: true }, function(err, numRemoved){
                                that.history.splice(that.settings.historyNb-1, diff);
                                dbHistory.insert({
                                    rev: uniqid(),
                                    created_at: new Date(),
                                    data: that['hosts_datas'],
                                }, function(err, newDoc){
                                    that.history.unshift(newDoc)
                                })
                            })
                        } else {
                            dbHistory.insert({
                                rev: uniqid(),
                                created_at: new Date(),
                                data: that['hosts_datas'],
                            }, function(err, newDoc){
                                that.history.unshift(newDoc)
                            })
                        }


                    }

                }, function(d) {
                    console.log('[ERROR]', d)
                }
            )
        },
        saveMe: function(event){
            var current = event.keyCode;
            if( current == 83 && (prevKeyPress == 91 || prevKeyPress == 17) ) {
                this.save(event);
            }
            prevKeyPress = current;
        },
        saveMeEditor: function(event){
            var current = event.keyCode;
            if( current == 83 && (prevKeyPress == 91 || prevKeyPress == 17) ) {
                this.saveEditor(event);
            }
            prevKeyPress = current;
        },
        saveEditor: function(event)
        {
            var linesHost = this.hosts_datas.split("\n");
            for( var ip of this.hostObject ) {
                var arrayDomains = ip.domains.map((v)=>v.domain);
                if( !arrayDomains.length ) {
                    linesHost.splice(ip.lineNumber, 1);
                } else {
                    linesHost[ip.lineNumber] = ip.ip + "\t\t" + arrayDomains.join(' ');
                }
            }
            for( var line of this['lineRemove']) {
                linesHost.splice(line, 1);
            }
            this.hosts_datas = linesHost.join("\n");
            this.save();
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

                    var cm: any = CodeMirror(vm.$el, {
                        mode: 'ruby',
                        lineNumbers: true,
                        lineWrapping:true,
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
    },
    directives: {
        'to-focus': function (value) {
            if (!value) {
                return;
            }
            var el = this.el;
            Vue.nextTick(function () {
                el.focus();
            });
        }
    }
}

module.exports = function(App) {
    var vm = App.extend(home);

    return vm;
}