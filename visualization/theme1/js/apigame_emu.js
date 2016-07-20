window.ApiGame = new function (){
	this.description = "API request for get statistics (Emulation)";
	var self = this;
	self.cache = {};
	self.cache.teams = [
		{
			'name': 'yozik',
			'logo': 'images/yozik.png',
			'color': 'white'
		},
		{
			'name': 'keva',
			'logo': 'images/keva.png',
			'color': 'yellow'
		},
		{
			'name': 'leetmore',
			'logo': 'images/leetmore.png',
			'color': 'pink'
		},
		{
			'name': 'brizz',
			'logo': 'images/brizz.png',
			'color': 'red'
		},
		{
			'name': 'censored',
			'logo': 'images/censored.png',
			'color': 'green'
		},
		{
			'name': 'curiosity',
			'logo': 'images/curiosity.png',
			'color': 'grey'
		},
		{
			'name': 'ufologists',
			'logo': 'images/ufologists.png',
			'color': 'purple'
		},
		{
			'name': 'honeypot',
			'logo': 'images/honeypot.png'
		},
		{
			'name': 'SUSlo.PAS',
			'logo': 'images/SUSlo.PAS.png',
			'color': 'lightgray'
		},
	];
	
	self.cache.stat = []

	for(i in self.cache.teams){
		var stat = {
			'name': self.cache.teams[i].name,
			'score': 0,
			'flags': []
		};
		
		for(i1 in self.cache.teams){
			stat['flags'].push({
				'from': self.cache.teams[i1].name,
				'count': 0
			});
		}
		self.cache.stat.push(stat)
	}

	self.teams = function(){
		return self.cache.teams
	};
	
	self.stat = function(){
		var d = $.Deferred();
		// emulation network
		setTimeout(function(){
			d.resolve(self.cache.stat);
			for(i in self.cache.stat){
				var diff = Math.floor(Math.random()*100);
				self.cache.stat[i].score += diff;
				
				for(i1 in self.cache.stat[i].flags){
					self.cache.stat[i].flags[i1].count = Math.floor(Math.random()*10) < 7 ? 0 : 1;
				}
			}
		}, 100);
		return d; 
	};
};



