function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

$(document).ready(function(){
	var teams = ApiGame.teams();

	var rw = 80;
	var width = $('body').width();
	var centerX = (width - rw)/2;
	var centerY = ($('body').height() - rw)/2;
	var lenteams = teams.length;
	var rad = ($('body').height() - 2*rw)/2;

	$('body').append('<svg width="100%" height="100%"></svg>');

	var svg = d3.select("svg");

	var coords = []
	for(var i = 0; i < lenteams; i++){
		var x = Math.floor(Math.sin(2*3.14 * ((i + 0.5)/lenteams))*rad + centerX);
		var y = Math.floor(Math.cos(2*3.14 * ((i + 0.4)/lenteams))*rad + centerY);
		
		function countNearboard(y){
			return coords.filter(function(a) {
				var dy = a.y > y ? a.y - y : y - a.y;
				var dx = a.x > x ? a.x - x : x - a.x;
				return dy < rw + 10 || dx < rw + 10;
			}).length;
		}

		var di = 0.01;
		while(countNearboard(y) > 0 && di < 3){
			y = Math.floor(Math.cos((2*3.14) * ((i + di)/lenteams))*rad + centerY);
			if(di > 0){
				di += 0.05;
			}else{
				di = di*-1;
			}
		};
		coords.push({x: x, y: y});
	}
	coords = coords.sort(function(a,b){ return a.y > b.y; })
	
	for(var i = 0; i < lenteams-1; i++){
		coords[i + 1].y = coords[i].y + rw + 10;
	}
	
	var text_game_name = svg.append('text');
	text_game_name.html("SibirCTF 2016 / Tomsk");
	text_game_name.attr('x', 10);
	text_game_name.attr('y', 40);
	text_game_name.style("fill", 'lightblue');
	text_game_name.style("stroke", 'lightgreen');
	text_game_name.attr('stroke-width', "1");
	text_game_name.style("font-size","40px")
	text_game_name.style("font-weight","bold")

	for(var i = 0; i < lenteams; i++){
		coords[i].y;
		$('#place' + i).html();

		var line = svg.append('line');
		line.attr('x1', 0);
		line.attr('x2', width);
		line.attr('y1', coords[i].y - 5);
		line.attr('y2', coords[i].y - 5);
		line.attr('stroke', "lightgreen");
		line.attr('stroke-width', "1");
		
		var text = svg.append('text');
		text.html('' + (i+1));
		text.attr('x', 10);
		text.attr('y', coords[i].y + 50);
		text.style("fill", 'lightblue');
		text.style("stroke", 'lightgreen');
		text.attr('stroke-width', "1");
		text.style("font-size","40px")
		text.style("font-weight","bold")
		
		var text_team_name = svg.append('text');

		text_team_name.html(teams[i].name);
		text_team_name.attr('id', 'place' + i);
		text_team_name.attr('x', 50);
		text_team_name.attr('y', coords[i].y + 35);
		text_team_name.style("fill", 'lightblue');
		text_team_name.style("stroke", 'lightgreen');
		text_team_name.attr('stroke-width', "1");
		text_team_name.style("font-size","26px")
		text_team_name.style("font-weight","bold")
		
		var text_team_score = svg.append('text');
		text_team_score.html(teams[i].score ? teams[i].score : 0);
		text_team_score.attr('id', 'score' + i);
		text_team_score.attr('x', 50);
		text_team_score.attr('y', coords[i].y + 70);
		text_team_score.style("fill", 'lightblue');
		text_team_score.style("stroke", 'lightgreen');
		text_team_score.attr('stroke-width', "1");
		text_team_score.style("font-size","26px")
		text_team_score.style("font-weight","bold")
	}


	for(t in teams){
		teams[t].flags = [];
		for(var i = 0; i < lenteams; i++){
			var flag = svg.append('rect');
			teams[t].flags[i] = flag
			flag.style("fill", teams[t].color);
			flag.style("visibility", 'hidden');
			flag.attr("width", rw/2);
			flag.attr("height", rw/2);
			flag.attr("rx", 10);
			flag.attr("ry", 10);
			flag.attr("transform", "translate(" + coords[t].x + ", " + coords[t].y + ")");
		}
	}

	// init base teams
	for(t in teams){
		var g = svg.append('g')
		teams[t].name = teams[t].name
		teams[t].g = g;
		teams[t].x = coords[t].x;
		teams[t].y = coords[t].y;
		g.attr("transform", "translate(" + coords[t].x + ", " + coords[t].y + ")");
		g.attr('id', 'team' + t);
		img = g.append('svg:image')
		img.attr("xlink:href",teams[t].logo)
		img.attr("width", rw);
		img.attr("height", rw);
		img.attr("x", 0)
		img.attr("y", 0)
	}

	function getTeamByName(name){
		for(t in teams){
			if(teams[t].name == name)
				return teams[t]
		}
	}


	function sendFlags(from, to, num){
		var from = getTeamByName(from);
		var to = getTeamByName(to);
		// console.log(from.name + " -> " + to.name + " num = " + num)
		
		var val1 = "translate(" + (from.x + rw/4) + ", " + (from.y  + rw/4) + ")";
		from.flags[num].attr("transform", val1);
		from.flags[num].style("visibility", '');
		var val2 = "translate(" + (to.x  + rw/4) + ", " + (to.y + rw/4) + ")";
		from.flags[num].transition().duration(2000).attr("transform", val2);
	}

	// animation
	setInterval(function(){
		ApiGame.stat().done(function(stat){
			stat = stat.sort(function(a,b){ return a.score < b.score; })

			for(var i = 0; i < stat.length; i++){
				var flags = stat[i].flags;
				for(var i1 = 0; i1 < flags.length; i1++){
					if(flags[i1].from != stat[i].name && flags[i1].count > 0){
						sendFlags(flags[i1].from, stat[i].name, i);
					}
				}
			}

			setTimeout(function(){
				for(i in stat){
					var team = getTeamByName(stat[i].name);
					$('#place' + i).html(team.name);
					$('#score' + i).html(stat[i].score);
					for(var i1 = 0; i1 < lenteams; i1++){
						team.flags[i1].style("visibility", 'hidden');
					}
					team.x = coords[i].x;
					team.y = coords[i].y;
					team.g.transition().duration(2500).attr("transform", "translate(" + team.x + ", " + team.y + ")");
				}
				
			},2500);
			
		});
	}, 5000);
});

