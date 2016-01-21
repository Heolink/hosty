/// <reference path='../typings/tsd.d.ts' />
var Vue = require('vue');
var VueRouter = require('vue-router');
var moment = require('moment');
var VueAsyncData = require('vue-async-data');
var remote = require('electron').remote;
var pathConfig = remote.app.getPath('appData') + '/hosty';
Vue.use(VueRouter);
Vue.use(VueAsyncData);
var App = Vue.extend({});
var router = new VueRouter();
var HomeConponent = require('./js/Conponents/Home')(App);
var ConfigConponent = require('./js/Conponents/Config')(App);
App.filter('moment', function (value, format) {
    return moment(value).format(format);
});
var Config = App.extend(ConfigConponent);
router.map({
    '/': {
        component: HomeConponent
    },
    '/config': {
        component: ConfigConponent
    }
});
router.start(App, '#app');
