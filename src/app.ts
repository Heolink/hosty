/// <reference path='../typings/tsd.d.ts' />

import fs = require('fs');
import Vue = require('vue');
var VueRouter = require('vue-router')
var moment = require('moment');
var VueAsyncData = require('vue-async-data')
var remote = require('electron').remote
const pathConfig = remote.app.getPath('appData') + '/hosty';

var HomeConponent = require('./js/Conponents/Home');
var ConfigConponent = require('./js/Conponents/Config');

Vue.use(VueRouter);
Vue.use(VueAsyncData);

var App = Vue.extend({})
var router = new VueRouter()

App.filter('moment', function (value, format) {
    return moment(value).format(format);
})

var Home = App.extend(HomeConponent)
var Config = App.extend(ConfigConponent)

router.map({
    '/': {
        component: Home
    },
    '/config': {
        component: Config
    }
})

router.start(App, '#app')
