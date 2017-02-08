import Host from './Hosts'
import store from './vuex/store'

export default [
  {
    path: '/',
    name: 'home',
    component: require('components/Home'),
    beforeEnter: (route, redirect, next) => {
        if (!store.getters.isBackup) {
            store.dispatch('backup', () => {
                store.dispatch('read', () => {
                    next()
                })
            })
        } else {
            store.dispatch('read', () => {
                next()
            })
        }
    }
  },
  {
    path: '*',
    redirect: '/'
  }
]
