function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

$(document).ready(function(){
	console.log(ApiGame.teams());
	var teams = ApiGame.teams();


	for(t in teams){
		$('body').append("<div class='teamicon' style='background-color: " + getRandomColor() + ";' id='team" + t + "'>" + teams[t].name + "</div>");
	}
	
	setInterval(function(){
		for(t in teams){
			var x = Math.floor(Math.random()*($('body').height() - 140)) + 70;
			var y = Math.floor(Math.random()*($('body').width() - 140)) + 70;
			$('#team' + t).css({
				'top': x + 'px',
				'left': y + 'px'
			});
		}
	}, 1000);
	
});

