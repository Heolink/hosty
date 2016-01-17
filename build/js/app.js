/// <reference path='../typings/tsd.d.ts' />
var Vue = require('vue');
var notie = require('notie');
var VueAsyncData = require('vue-async-data');
var Hosts = require('./js/Hosts');
// Add the listener
document.addEventListener('DOMContentLoaded', function () {
    Vue.use(VueAsyncData);
    var hosts = new Hosts();
    var prevKeyPress = null;
    new Vue({
        el: '#app',
        data: function () {
            return {
                message: 'Vuejs power',
                'hosts_datas': 'loading ....'
            };
        },
        asyncData: function (resolve, reject) {
            hosts.read().then(function success(d) {
                resolve({
                    'hosts_datas': d
                });
            }, function error(d) {
                reject(d);
            });
        },
        methods: {
            save: function (event) {
                hosts.write(this['hosts_datas']).then(function (d) {
                    this['hosts_datas'] = d;
                    notie.alert(1, 'Success!', 0.5);
                }, function (d) {
                    console.log('[ERROR]', d);
                });
            },
            saveMe: function (event) {
                var current = event.keyCode;
                if (current == 83 && prevKeyPress == 91) {
                    this.save(event);
                }
                prevKeyPress = current;
            }
        }
    });
});
