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


Vue.component('rules', {
	template:`<div>
		<hr>
		<p>Правила:</p>
		<p>Нужно подобрать правильную последовательность цифр.</p>
		<p>В случае, если цифра верная и стоит на правильной позиции - белый круг</p>
		<p>В случае, если цифра верная, но стоит на неправильной позиции - черный круг</p>
		<hr>
	</div>`
})

Vue.component('new_game_button',{
	methods: {
		new_game(){
			param = '?' +
					'cell_count=' + this.$data.cell_count + '&' +
					'max_color=' + this.$data.max_color

			that = this
			var settings = API.new_game
			fetch(settings.url() + param, {settings})
				.then((response)=>response.json())
				.then((data)=>{
					that.$root.new_game(data)
				})
				.catch((error)=>console.log(error))
		}
	},
	data(){
		return {
			cell_count: 3,
			max_color: 4,
		}
	},
	template: '<div>' +
			  'количество ячеек:<input v-model="cell_count"></input><br/>' +
			  'максимальная цифра в ячейке:<input v-model="max_color"></input><br/>' +
			  '<button v-on:click="new_game">Новая игра</button></div>',
})


Vue.component('variant', {
	props: {
		init_id: {},
		init_color: {default: 'white'},
	},
	data(){
		return {
			class_: '',
			id: this.init_id,
			color: this.init_color,
		}
	},
	template: `<div class="variant"
		:style="{
			'background-color': color
		}"
		:class="class_"
	></div>`,
})


Vue.component('variants', {
	props:['colors'],
	methods: {
		make_variant_active(e, id) {
			for(let child of this.$children){
				if (child.$data.id == id){
					child.$data.class_ = 'active'
					continue
				}
				child.class_ = ''
			}
		},
	},
	template: `<div class="variants">
	<variant
		v-for="(color,id) in colors"
		:key="id"
		@click.native="make_variant_active($event, id)"
		:init_color="color"
		:init_id="id"
	/>
	</div>`,
})


Vue.component('attempt', {
	props: {
		count: {default: 5},
		result: {default: ()=>[]}, // should be factory
	},
	computed: {
	},
	template: `<div class="attempt">
		<div>
			<variant v-for="id in count" :key="id" :init_id="id"/>
		</div>
		<div v-if="result.length > 0">
			<div><hr/></div>
			<variant v-for="e in result" :init_color="e && 'white' || 'black'"/>
		</div>
	</div>`
})


Vue.component('detect-button', {
	template: `<div id="detect-button">
		проверить
	</div>`
})

Vue.component('game', {
	props: ['colors', 'attempts'],
	template: `<div id="game-container">
		<hr/>
		<variants :colors="colors"/>
		<hr/>
		<div id="attempts-container">
			<attempt/>
			<detect-button/>
			<div id="attempts-history-container">
				<attempt v-for="att in attempts" :key="att" :result="[1,0,0]"/>
			</div>
		</div>
	</div>`,
})


const app = new Vue({
	el: '#main',
	data: {
		colors: ['red', 'green', 'blue', 'yellow', 'violet', 'cyan','white'],
		game: {},
		id: -1,
		game_stage: GameStageEnum.INIT,
	},
	computed: {
		selects_count(){
			return this.$data.game.cell_count || 0
		},
		max_color_count(){
			return this.$data.game.max_color || 0
		},
		game_stage_enum(){
			return GameStageEnum
		},
	},
	methods: {
		new_game(data){
			this.$root.$data.game = data
			this.$root.$data.id = data.id
			this.$root.$data.game_stage = GameStageEnum.GAME
		},
		crack(state){
			that = this
			var str_state = state.join(',')
			var settings = API.validate
			fetch(settings.url(this.$data.id), Object.assign({}, settings,
				{body: JSON.stringify({state: str_state})}))
				.then((response)=>response.json())
				.then((data)=>{
					that.$data.game.attempts.push({
						state: state,
						crack_result: data.crack_result,
					})
					that.$data.game.attempts_remind = data.attempts_remind


					if (data.attempts_remind < 0){
						alert('Ты проиграл(а) :(\nНе расстраивайся, попробуй еще раз!')
						return
					}

					var win_condition = data.crack_result.length == that.$data.game.cell_count &&
						data.crack_result.every(e=>e == ValidationResult.ColorAndPlaceMatch)
					if(win_condition){
						alert('Ты победил(а)!')
					}
				})
				.catch((error)=>console.log(error))
		}
	},
	template: `<div>
	<rules v-if="game_stage == game_stage_enum.INIT"/>
	<new_game_button v-if="game_stage != game_stage_enum.GAME"/>
	<game :colors="colors" :attempts="20" v-if="game_stage == game_stage_enum.GAME"/>
	</div>`,
})
