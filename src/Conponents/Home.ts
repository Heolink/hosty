import fs = require('fs');
import {unzipSync} from "zlib";
var notie = require('notie');
var Datastore = require('nedb');
var uniqid = require('uniqid');
var mousetrap = require('mousetrap');
var CodeMirror = require('codemirror');
require('codemirror/mode/ruby/ruby');
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
            raw: true,
            ipEdited: null,
            ipAdd: null,
            domainAdd: null,
            domainEdited: null,
            hostObject: [],
            lineRemove: [],
            newDomain: null,
            newIp: null,
            newIpDomain: null,
            filterDomain: null,
            filterIp: null,
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
            resolve({
                settings:settings,
                raw: (settings.defaultView == 'raw') ? true : false
            })
        })
    },
    created: function () {

        mousetrap.bind(['command+s', 'ctrl+s'], (e) => {

            this.save(e);

        })

        this.$watch('hosts_datas', (n, o) => {
            this['hostObject'] = []
            var lines = n.split("\n");
            for(var lineNumber in lines) {
                var line = lines[lineNumber].trim();
                if( line.match(/^#/) ) {
                    var cleanLine = line.replace(/^#+/,'').trim();
                    var ipComented = hosts.getIp(cleanLine);

                    if( ipComented ) {
                        ipComented = ipComented[0];
                        var domains = cleanLine.replace(ipComented,'').split(' ').filter( (x, k)=>{
                            if( !x ) {
                                return false;
                            }
                            if(x.match(/#/) ) {
                                return false;
                            }
                            return true;

                        }).map(function(v, k){
                            return {'domain': v.trim(),'comment':true};
                        });
                        this['hostObject'].push({
                            ip: ipComented,
                            lineNumber:lineNumber,
                            domains: domains,
                            comment: true
                        });
                    }
                }
                var ip = hosts.getIp(line)
                if(ip) {
                    ip = ip[0];
                    //on vire les éléments vide avec : filter(x=>!!x)
                    var inComment :any = false;
                    var domains = line.replace(ip,'').split(' ').filter( (x, k)=>{
                        if( !x ) {
                            return false;
                        }
                        if(x.match(/#/) ) {
                            inComment = k;
                            return false;
                        }
                        return true;

                    }).map(function(v, k){
                        var c = false;
                        if( inComment !== false && k >= inComment ) {
                            c = true;
                        }
                        return {'domain': v.trim(),'comment':c};
                    });
                    this['hostObject'].push({
                        ip: ip,
                        lineNumber:lineNumber,
                        domains: domains
                    });
                }
            }
        });

    },
    methods: {
        filterDomains: function( ip )
        {
            if( !this.filterDomain && !this['filterIp'] ) {
                return true;
            }

            if( this['filterIp'] ) {
                var re = new RegExp(this['filterIp'],'i');
                if( !ip.ip.match( re ) ) {
                    return false;
                }
            }

            if( !this.filterDomain ) {
                return true;
            }

            var i = ip.domains.filter( (v) => {
                var re = new RegExp(this.filterDomain,'i');
                if(  v.domain.match(re) ) {
                    return true;
                } else {
                    return false;
                }
            })
            if( i.length ) {
                return true;
            }
            return false;
        },
        cancelFilter: function()
        {
          this['filterDomain'] = null
        },
        doneAddIp: function()
        {
            if( !this['newIp'] || !this['newIpDomain'] || !hosts.getIp(this['newIp'])) {
                this.cancelAddIp();
                return;
            }
            var already = false;
            var newIp = {
                ip: this['newIp'],
                new: true,
                domains: [
                    {
                        domain: this['newIpDomain']
                    }
                ]
            }
            for( var ip of this.hostObject) {
                if( ip.ip == this['newIp'] ) {
                    already = true;
                    for( var domain of ip.domains) {
                        if( domain.domain == this['newIpDomain'] ) {
                            this.cancelAddIp();
                            return;
                        }
                    }
                    ip.domains.push({
                        domain: this['newIpDomain']
                    });
                    break;
                }
            }
            if( !already ) {
                this.hostObject.push(newIp);
            }
            this.cancelAddIp();
            this.saveEditor();
            notie.alert(1, 'Success!', 0.5);
        },
        cancelAddIp: function()
        {
            this['newIp'] = null;
            this.newIpDomain = null;
        },
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
            this.saveEditor();
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
            this.saveEditor();
        },
        cancelEditIp: function (ip) {
            this.ipEdited = null;
            ip.ip = this.ipBefore;
        },
        removeIp: function(ip)
        {
            this['lineRemove'].push( ip.lineNumber )
            this.hostObject.$remove(ip)
            this.saveEditor();
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
                    this.removeIp(ip)
                }
            }
            this.saveEditor();
        },
        removeDomain: function(ip, domain)
        {
            ip.domains.$remove(domain);
            if( !ip.domains.length ) {
                this['lineRemove'].push( ip.lineNumber )
                this.hostObject.$remove(ip)
            }
            this.saveEditor();
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
        saveEditor: function()
        {
            var linesHost = this.hosts_datas.split("\n");
            for( var ip of this.hostObject ) {
                var arrayDomains = ip.domains.map((v)=>v.domain);

                if( !arrayDomains.length ) {
                    linesHost.splice(ip.lineNumber, 1);
                } else {
                    var comment = (ip.comment) ? '#' : '';

                    if( !ip.new ) {
                        linesHost[ip.lineNumber] = comment + ip.ip + "\t\t" + arrayDomains.join(' ');
                    } else {
                        var s = comment + ip.ip + "\t\t" + arrayDomains.join(' ');
                        linesHost.push(s);
                    }

                }
            }
            for( var line of this['lineRemove']) {
                linesHost.splice(line, 1);
            }
            this.hosts_datas = linesHost.join("\n");
            this['lineRemove'] = [];
            //this.save();
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
                        theme: 'monokai',
                    });

                    cm.getInputField().classList.add('mousetrap')

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

                    this.cm = cm;
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
            Vue.nextTick( () => {
                el.focus();
                if( el.tagName == 'CODEMIRROR' && this['vm'].$children[0].cm) {
                    this['vm'].$children[0].cm.refresh()
                }
            });
        }
    }
}

module.exports = function(App) {
    var vm = App.extend(home);
    return vm;
}