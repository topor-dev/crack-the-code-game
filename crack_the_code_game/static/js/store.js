const store = new Vuex.Store({
	state: {
		test: 0,
	},
	mutations: {
		incr(state, payload){
			state.test += (payload || 1)
		},
	},
	getters: {
		get_test: state=> state.test + '<<',
	},
	actions: {
		inc(context){
			context.commit('incr')
		},
		inc2({commit}, payload){
			commit('incr', payload)
		},
	}
})