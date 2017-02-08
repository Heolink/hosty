import * as types from '../mutation-types'
import Host from '../../Hosts'
import os from 'os'

const state = {
    code: null,
    tmpFile: null,
    backupFile: null,
    isBackup: false,
    modified: false,
    sessionFlash: {}
}

const mutations = {
    [types.SET_HOST](state, data) {
        state.code = data
    },
    [types.SET_TMP_FILE](state, data) {
        state.tmpFile = data
    },
    [types.SET_BACKUP_FILE](state, data) {
        state.backupFile = data
    },
    [types.SET_BACKUP](state, data) {
        state.isBackup = data
    },
    [types.SET_MODIFIED](state, data) {
        state.modified = data
    },
    [types.SET_FLASH](state, data) {
        state.sessionFlash = Object.assign(state.sessionFlash, data)
    },
    [types.REMOVE_FLASH](state, data) {
        delete state.sessionFlash[data]
    },
}

const actions = {
    setHost: ({
        commit
    }, data) => {
        commit(types.SET_HOST, data)
    },
    setTmpFile: ({
        commit
    }, data) => {
        commit(types.SET_TMP_FILE, data)
    },
    setBackupFile: ({
        commit
    }, data) => {
        commit(types.SET_BACKUP_FILE, data)
    },
    setBackup: ({
        commit
    }, data) => {
        commit(types.SET_BACKUP, data)
    },
    save: ({
        commit,
        dispatch,
        getters
    }) => {
        let host = new Host();
        dispatch('globalLoaderShow')

        host.write(getters.code).then(() => {
            dispatch('setModified', false)
            dispatch('globalLoaderHide')
        }).catch((err) => {
            dispatch('globalLoaderHide')
        })
    },
    read: ({
        commit,
        dispatch
    }, cb) => {
        dispatch('globalLoaderShow')
        let host = new Host();
        host.read().then((d) => {
            dispatch('setHost', d)
            dispatch('setFlash', { read: true })
            dispatch('setModified', false)
            dispatch('globalLoaderHide')
            cb()
        })
    },
    backup: ({
        commit,
        dispatch,
        state
    }, cb) => {
        dispatch('globalLoaderShow')
        let host = new Host();
        host.cp(state.backupFile).then((d) => {
            dispatch('setBackup', true)
            dispatch('globalLoaderHide')
            cb()
        })
    },
    restoreBackup: ({
        commit,
        dispatch
    }) => {
        dispatch('globalLoaderShow')
        let host = new Host();
        host.restoreBackup().then((d) => {
            dispatch('setHost', d)
            dispatch('globalLoaderHide')
            cb()
        })
    },
    setModified: ({
        commit
    }, data) => {
        commit(types.SET_MODIFIED, data)
    },
    setFlash: ({commit}, data) => {
        commit(types.SET_FLASH, data)
    },
    readFlash: ({commit, state}, key) => {
        let value = state.sessionFlash[key]
        if( !value ) return undefined
        commit(types.REMOVE_FLASH, key)
        return value
    },

}

const getters = {
    code: (state) => state.code,
    tmpFile: (state) => state.tmpFile,
    backupFile: (state) => state.backupFile,
    modified: (state) => state.modified,
    isBackup: (state) => state.isBackup,

}

export default {
    state,
    mutations,
    actions,
    getters
}