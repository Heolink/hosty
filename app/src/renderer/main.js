import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'
import Router from 'vue-router'
import jQuery from 'jquery'
import { remote } from 'electron'

import '../../semantic/dist/semantic.css'
import '../../semantic/dist/semantic.js'
import '../../semantic/dist/components/menu.css'
import '../../semantic/dist/components/dropdown.css'
import '../../semantic/dist/components/dropdown.js'

import store from 'renderer/vuex/store'
import GlobalLoader from 'components/GlobalLoader'
import App from './App'
import routes from './routes'

Vue.use(Electron)
Vue.use(Resource)
Vue.use(Router)
Vue.config.debug = true


const router = new Router({
  //scrollBehavior: () => ({ y: 0 }),
  routes
})

store.dispatch('setTmpFile', remote.app.getPath('userData') + '/hosts.tmp' )
store.dispatch('setBackupFile', remote.app.getPath('userData') + '/hosts.backup' )

/* eslint-disable no-new */
new Vue({
  store,
  components: {
    GlobalLoader,
  },
  router,
  ...App
}).$mount('#app')
