Vue.component('rules', {
	template:`<div>
		<hr>
		<p>Правила:</p>
		<p>Нужно подобрать правильную последовательность цветов.</p>
		<p>Подсказками выступают индикаторы.</p>
		<p>В случае, если цвет верный и стоит на правильной позиции - белый индикатор.</p>
		<p>В случае, если цвет верный, но стоит на неправильной позиции - черный индикатор.</p>
		<p>Если ни то, ни другое - индикатор серый.</p>
		<hr>
	</div>`
})

Vue.component('new_game_button',{
	methods: {
		new_game(){
			this.$store.dispatch({
				type: 'new_game',
				cell_count: this.$data.cell_count,
				variants_count: this.$data.variants_count,
				max_attempts: this.$data.max_attempts,
			})
		}
	},
	data(){
		return {
			cell_count: 3,
			variants_count: 4,
			max_attempts: 8,
		}
	},
	template: `<div>
			   <p>С этими настройками можно поиграться:</p>
			   <p>Количество ячеек: <input type="number" v-model="cell_count"></input></p>
			   <p>Количество вариантов цветов: <input type="number" v-model="variants_count"></input></p>
			   <p>Количество попыток: <input type="number" v-model="max_attempts"></input></p>
			   <p><button @click="new_game">Новая игра</button></p>
			   </div>`,
})


Vue.component('variant', {
	props: {
		color: {default: 'white'},
	},
	template: `<div class="variant"
		:style="{
			'background-color': color
		}"
	></div>`,
})


Vue.component('variants', {
	methods: {
		make_variant_active(e, id) {
			this.$store.commit({
				type: 'make_active',
				id: id,
			})
		},
	},
	computed: {
		color_and_class(){
			return this.$store.state.colors.map((e, id)=>({
					color: e,
					class: (this.$store.getters.is_variant_active(id)) ? 'active' : '', 
			}))
		},
	},
	template: `<div class="variants">
	<variant
		v-for="(obj,id) in color_and_class"
		:key="id"
		@click.native="make_variant_active($event, id)"
		:color="obj.color"
		:class="obj.class"
	/>
	</div>`,
})


Vue.component('attempt', {
	props: {
		is_current: {default: false},
		colors: {default: ()=>[]},
		result: {default: ()=>[]}, // should be factory
	},
	methods: {
		colorize(id){
			this.$store.dispatch({
				type: 'colorize',
				id: id,
			})
		},
	},
	template: `<div class="attempt">
		<div>
			<variant
				v-for="(color,id) in colors"
				:color="color"
				:key="id"
				@click.native="colorize(id)"
				/>
		</div>
		<div v-if="is_current == false"><hr/></div>
		<div v-if="is_current == false" class="results">
			<variant v-for="(color,id) in result" :key="id" :color="color"/>
		</div>
	</div>`
})


Vue.component('validate-button', {
	methods: {
		validate(){
			if (this.$store.state.game_stage == GameStageEnum.GAME){
 				this.$store.dispatch('validate')
			} else {
				alert('Новая игра еще не начата')
			}
		}
	},
	template: `<div id="validate-button" @click="validate">
		проверить
	</div>`
})


Vue.component('game', {
	computed: {
		attempts_history(){
			let length = this.$store.state.game.cell_count

			return this.$store.state.game.attempts.slice(0).reverse().map(attempt=>{
				Array.prototype.push.apply(
					attempt.result,
					Array(length - attempt.result.length).fill(-1))
				return {
					colors: attempt.state.map(id=>this.$store.getters.id2color(id)),
					result: attempt.result.map(id=>this.$store.getters.result_id_to_color(id)),
				}
			})
		},
		current_attempt_colors(){
			return this.$store.getters.current_attempt_colors
		},
		attempts_remind(){
			return this.$store.state.game.attempts_remind
		},
	},
	template: `<div id="game-container">
		<hr/>
		<variants/>
		<div>попыток осталось: {{attempts_remind}}</div>
		<hr/>
		<div id="attempts-container">
			<attempt is_current="true" :colors="current_attempt_colors"/>
			<validate-button/>
			<div id="attempts-history-container">
				<attempt v-for="(att, id) in attempts_history" :key="id"
					:colors="att.colors"
					:result="att.result"
					/>
			</div>
		</div>
	</div>`,
})


const app = new Vue({
	el: '#main',
	store,
	computed: Object.assign(
		{
			game_stage_enum(){
				return GameStageEnum
			}
		},
		Vuex.mapState([
			'game',
			'game_stage'
			]),
	),
	template: `<div>
	<rules v-if="game_stage == game_stage_enum.INIT"/>
	<new_game_button v-if="game_stage != game_stage_enum.GAME"/>
	<game :attempts="2" v-if="game_stage != game_stage_enum.INIT"/>
	</div>`,
})
