function fetch_json(url, callback){
	fetch(url)
		.then((response)=>{
		return response.json()
	})
		.then(e=>callback(e));
}

Vue.component('new_game_button',{
	methods: {
		new_game: function(){
			param = '?' +
					'cell_count=' + this.$data.cell_count + '&' +
					'max_color=' + this.$data.max_color;

			that = this
			fetch_json('/api/new/' + param, (data)=>{
				that.$root.new_game(data);
			})
		}
	},
	data: function(){
		return {
			'cell_count': 3,
			'max_color': 4,
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
			document.t = this
			this.$root.crack(key)
		},
	},
	props: ['selects_count', 'max_color_count'],	
	template: '<div><select v-for="select_id in selects_count" :key="select_id" :id="select_id-1">' +
			  '<option v-for="item in (max_color_count+1)" :key="item">{{item-1}}</option>' +
			  '</select>' +
			  '<button v-if="selects_count > 0" v-on:click="go_crack">попробовать этот вариант</button></div>',
//				  '<button v-if="selects_count > 0" v-on:click="go_crack">try it</button></div>',
})

Vue.component('crack_result', {
	props: ['res'],
	computed: {
		res2class: function(){
			return this.res.data.map(e=>{
				switch(e){
					case '*':
						return 'full-match'
					case '+':
						return 'partial-match'
				}
				return ''
			})
		},
	},
	template: '<div><span v-text="res.variant"></span> - <div v-for="(item,index) in res2class" :key="index" class="crack-result" :class="item"></div></div>',
})


new Vue({
	el: '#main', // {{game}}
	template: '<div><new_game_button></new_game_button><br/>' +
			  '<div v-if="game.attempts_remind > -1">попыток осталось: {{game.attempts_remind}}</div>' +
			  '<tester style="display:inline" :selects_count=selects_count :max_color_count=max_color_count></tester>' +
			  '<div v-if="game.crack_result">' +
			  	'<div>ключ - результат</div>' +
				'<crack_result v-for="(res,index) in crack_result_list" :key="index" :res=res></crack_result>' +
			  '</div>' + 
			  '</div>',
	data: {
		game: {},
		id: -1,
		crack_result_list: [],
	},
	computed: {
		selects_count: function(){
			return this.$data.game.cell_count || 0;
		},
		max_color_count: function(){
			return this.$data.game.max_color || 0;
		},
	},
	methods: {
		new_game: function(data){
			this.$root.$data.game = data;
			this.$root.$data.id = data.id;
			this.crack_result_list = [];
		},
		crack: function(state){
			that = this
			var variant = state.join(',')
			fetch_json('/api/' + this.$data.id + '/crack/?state=' + variant, (data)=>{
				that.$data.game = data
				that.$data.crack_result_list.push({
					variant: variant, 
					data: data.crack_result
				})
				var g = data


				if (g.attempts_remind <= 0){
					alert('Ты проиграл(а) :(\nНе расстраивайся, попробуй еще раз!');
				} 

				var win_condition = g.crack_result.length == g.cell_count && g.crack_result.every(e=>e == '*')
				if(win_condition){
					alert('Ты победил(а)!')
				} 
			})
		}
	}
})
