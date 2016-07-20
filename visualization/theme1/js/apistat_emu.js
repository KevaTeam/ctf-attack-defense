window.ApiStat = new function (){
	this.description = "API request for get statistics (Emulation)";
	var self = this;
	self.cache = {};
	self.cache.teams = [
		{ 'name': 'team1' },
		{ 'name': 'team2' },
		{ 'name': 'team3' },
		{ 'name': 'team4' },
		{ 'name': 'team5' },
		{ 'name': 'team6' },
	];
	
	
	
	self.teams = function(){
		return self.cache.teams
	};
};



