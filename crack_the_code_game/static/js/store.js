const default_api = {
	headers: new Headers({'Content-Type': 'application/json'}),
	method: 'GET',
}


const API = {
	new_game: Object.assign({}, default_api, {
		url: ()=>'/api/game/'
	}),
	get_game: Object.assign({}, default_api, {
		url: (id)=>`/api/game/${id}/`,
	}),
	validate: Object.assign({}, default_api, {
		url: (id)=>`/api/game/${id}/`,
		method: 'POST',
	}),
}


const ValidationResult = {
    ColorAndPlaceMatch: 0,
    ColorMatch: 1,
}


const GameStageEnum = {
	INIT: 0,
	GAME: 1,
	AFTER_GAME: 2,
}


const store = new Vuex.Store({
	state: {
		game_stage: GameStageEnum.INIT,
		game: {},
		colors: [],
		active_variant: -1,
		current_attempt: [],
	},
	getters: {
		is_variant_active(state){
			return (id) => state.active_variant == id
		},
		id2color(state){
			return (id) => {
				if (id > -1 && id < state.colors.length){
					return state.colors[id]
				}
				return 'white'
			}
		},
		result_id_to_color(state){
			return (id) => {
				switch(id){
					case ValidationResult.ColorAndPlaceMatch:
						return 'white'
					case ValidationResult.ColorMatch:
						return 'black'
					default:
						return 'gray'
				}
			}
		},
		current_attempt_colors(state, getters){
			return state.current_attempt.map(id=>getters.id2color(id))
		},
		ready2validate(state){
			return state.current_attempt.every(val => val > -1 && val < state.game.variants_count)
		},
	},
	mutations: { // sync
		new_game(state, payload){
			state.game = Object.assign({}, state.game, payload)
			state.game_stage = GameStageEnum.GAME
			state.colors = gen_colors(state.game.variants_count)

		},
		reset_current_attempt(state, payload){
			state.current_attempt.splice(0)
			while(state.current_attempt.length < state.game.cell_count){
				state.current_attempt.push(-1)
			}
		},
		make_active(state, payload){
			state.active_variant = payload.id
		},
		colorize(state, payload){
			Vue.set(state.current_attempt, payload.id, state.active_variant)
		},
		update_attempts_remind(state, payload){
			state.game.attempts_remind = payload
		},
		push_state(state, payload){
			state.game.attempts.push(payload)
		},
	},
	actions: { // async
		new_game({commit, state}, payload){
			param = '?' +
					'cell_count=' + payload.cell_count + '&' +
					'variants_count=' + payload.variants_count + '&' +
					'max_attempts=' + payload.max_attempts

			let settings = API.new_game
			return fetch(settings.url() + param, {settings})
				.then((response)=>response.json())
				.then((data)=>{
					commit('new_game', data)
					commit('reset_current_attempt')
				}).catch((error)=>console.log(error))
		},
		validate({commit, state, dispatch, getters}, payload){
			if (! getters.ready2validate){
				alert('Выбери цвет и перекрась поля для первой попытки :)')
				return
			}

			let str_state = state.current_attempt.join(',')
			let settings = API.validate

			return fetch(settings.url(state.game.id), Object.assign({}, settings,
				{body: JSON.stringify({state: str_state})}))
				.then((response)=>response.json())
				.then((data)=>{
 					commit('push_state', {
						state: state.current_attempt.slice(0),
						result: data.validation_result,
					})
					commit('update_attempts_remind', data.attempts_remind)
					commit('reset_current_attempt')

					let win_condition = data.validation_result.length == state.game.cell_count &&
						data.validation_result.every(e=>e == ValidationResult.ColorAndPlaceMatch)
					if(win_condition){
						return dispatch('win_game')
					}

					if (data.attempts_remind <= 0){
						return dispatch('lose_game')
					}
				})
				.catch((error)=>console.log(error))
		},
		colorize({commit}, payload){
			commit({
				type: 'colorize',
				id: payload.id,
			})
		},
		lose_game({dispatch}, payload){
			alert('Ты проиграл(а) :(\nНе расстраивайся, попробуй еще раз!')
			dispatch('end_game')
		},
		win_game({dispatch}, payload){
			alert('Ты победил(а)!')
			dispatch('end_game')
		},
		end_game(context){
			context.state.game_stage = GameStageEnum.AFTER_GAME
		}
	}
})