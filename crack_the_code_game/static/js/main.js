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


Vue.component('new_game_button',{
	methods: {
		new_game: function(){
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
	data: function(){
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


Vue.component('tester', {
	methods:{
		go_crack: function(){
			var key = []
			for(var elem of this.$el.getElementsByTagName('select')){
				key.push(elem.selectedIndex)
			}
			this.$root.crack(key)
		},
	},
	props: ['selects_count', 'max_color_count'],	
	template: '<div><select v-for="select_id in selects_count" :key="select_id" :id="select_id-1">' +
			  '<option v-for="item in (max_color_count+1)" :key="item">{{item-1}}</option>' +
			  '</select>' +
			  '<button v-if="selects_count > 0" v-on:click="go_crack">попробовать этот вариант</button></div>',
})

Vue.component('crack_result', {
	props: ['res'],
	computed: {
		res2class: function(){
			return this.res.crack_result.map(e=>{
				switch(e){
					case ValidationResult.ColorAndPlaceMatch:
						return 'full-match'
					case ValidationResult.ColorMatch:
						return 'partial-match'
				}
				return ''
			})
		},
	},
	template: '<div><span v-text="res.state"></span> - <div v-for="(item,index) in res2class" :key="index" class="crack-result" :class="item"></div></div>',
})


new Vue({
	el: '#main', // {{game}}
	template: '<div><new_game_button></new_game_button><br/>' +
			  '<div v-if="game.attempts_remind > -1">попыток осталось: {{game.attempts_remind}}</div>' +
			  '<tester style="display:inline" :selects_count=selects_count :max_color_count=max_color_count></tester>' +
			  '<div v-if="game.attempts && game.attempts.length > 0">' +
			  	'<div>ключ - результат</div>' +
				'<crack_result v-for="(res,index) in game.attempts" :key="index" :res=res></crack_result>' +
			  '</div>' + 
			  '</div>',
	data: {
		game: {},
		id: -1,
	},
	computed: {
		selects_count: function(){
			return this.$data.game.cell_count || 0
		},
		max_color_count: function(){
			return this.$data.game.max_color || 0
		},
	},
	methods: {
		new_game: function(data){
			this.$root.$data.game = data
			this.$root.$data.id = data.id
		},
		crack: function(state){
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
	}
})
