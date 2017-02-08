import * as types from '../mutation-types'

const state = {
  globalLoader: false
}

const mutations = {
  [types.GLOBAL_LOADER_SHOW] (state) {
    state.globalLoader = true
  },
  [types.GLOBAL_LOADER_HIDE] (state) {
    state.globalLoader = false
  }
}

const actions = {
    globalLoaderShow: ({ commit }) => {
        commit(types.GLOBAL_LOADER_SHOW)
    },
    globalLoaderHide: ({ commit }) => {
        commit(types.GLOBAL_LOADER_HIDE)
    },
}

const getters = {
    globalLoaderDisplay: (state) => state.globalLoader
}

export default {
  state,
  mutations,
  actions,
  getters
}
