/// <reference path='../typings/tsd.d.ts' />

import fs = require('fs');
import Vue = require('vue');
var VueRouter = require('vue-router')
var moment = require('moment');
var VueAsyncData = require('vue-async-data')
var remote = require('electron').remote
const pathConfig = remote.app.getPath('appData') + '/hosty';


Vue.use(VueRouter);
Vue.use(VueAsyncData);

var App = Vue.extend({})
var router = new VueRouter()

var HomeConponent = require('./js/Conponents/Home')(App);
var ConfigConponent = require('./js/Conponents/Config')(App);

App.filter('moment', function (value, format) {
    return moment(value).format(format);
})

router.map({
    '/': {
        component: HomeConponent
    },
    '/config': {
        component: ConfigConponent
    }
})

router.start(App, '#app')

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.save').addEventListener('click', function(){
        router.app.$children[0].save()
    });
})
