/// <reference path='../typings/tsd.d.ts' />

import fs = require('fs');
import Vue = require('vue');
var notie = require('notie');
var Datastore = require('nedb');
var moment = require('moment');
var uniqid = require('uniqid');
var VueAsyncData = require('vue-async-data')
var Hosts = require('./js/Hosts');
var remote = require('electron').remote
const pathConfig = remote.app.getPath('appData') + '/hosty';

var  dbHistory = new Datastore({ filename: pathConfig + '/history.db', autoload: true });



// Add the listener
document.addEventListener('DOMContentLoaded', function () {


    Vue.use(VueAsyncData);
    var hosts = new Hosts();
    var prevKeyPress = null;

    Vue.filter('moment', function (value, format) {
        return moment(value).format(format);
    })

    var myVue = new Vue({
        el: '#app',
        data: function() {
            return {
                message: 'Vuejs power',
                hosts_datas: 'loading ....',
                files: 'loading',
                cfile: {
                    'rev': 'Master',
                }
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
                        'hosts_datas': d
                    })
            },
                function error(d){
                    reject(d)
            });

            dbHistory.find({}).sort({ created_at: 1 }).exec( function (err, docs) {
                resolve({files:docs})
            });
        },
        methods: {
            load: function(index) {
                var doc = this.files[index];
                this.$children[0].model = doc.data;
                this.cfile = doc;
            },
            reload: function() {
                hosts.read().then((d)=>{
                    this.$children[0].model = d;
                    this.cfile = {
                        rev: 'Master'
                    };
                })
            },
            remove: function(index) {
                var that = this;
                var doc = this.files[index];

                notie.confirm('Remove ' + doc.rev + ' ?', 'Yes !', 'Nop', function(){
                    if( that.cfile.rev == doc.rev ) {
                        that.reload();
                    }
                    dbHistory.remove({ _id: doc._id }, {}, function (err, numRemoved) {
                        that.files.splice(index, 1);
                    });
                });

            },
            save: function(event) {
                var that = this
                dbHistory.insert({
                    rev: uniqid(),
                    created_at: new Date(),
                    data: this['hosts_datas'],
                }, function(err, newDoc){
                    that.files.push(newDoc)
                })

                hosts.write(this['hosts_datas']).then(
                    function(d){
                        this['hosts_datas'] = d;
                        notie.alert(1, 'Success!', 0.5);
                }, function(d) {
                        console.log('[ERROR]', d)
                    }
                )
            },
            saveMe: function(event){
                var current = event.keyCode;
                if( current == 83 && prevKeyPress == 91 ) {
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
        }
    })



})


