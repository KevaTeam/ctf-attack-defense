function scrollTo(to, duration) {
	if (duration <= 0) return;
	element = (document.body.scrollTop === 0) ? document.documentElement : document.body;
	var perTick = (to - element.scrollTop) / duration * 10;
	setTimeout(function() {
		element.scrollTop = element.scrollTop + perTick;
		if (element.scrollTop === to) return;
		scrollTo(to, duration - 10);
	}, 10);
}

function scrollToElement(setup) {
	if (setup.element) element = setup.element;
	else if (setup.class) element = document.getElementsByClassName(setup.class)[0];
	else if (setup.id) element = document.getElementById(setup.id);
	else return
	var offsetToCenter = ((document.documentElement.clientHeight - element.clientHeight) / 2).toFixed()
	if (offsetToCenter < 0) offsetToCenter = 0
	var point = element.offsetTop - offsetToCenter;
	scrollTo(point, 200);
}

function showSignInWindow() {
	var signInWindow = document.getElementById('sign-in-window');
	var blackout = document.getElementById('blackout');
	[signInWindow, blackout].forEach(function(element, index) {
		element.style.visibility = 'visible';
		element.style.opacity = 1;
	});
}

function hideSignInWindow() {
	var signInWindow = document.getElementById('sign-in-window');
	var blackout = document.getElementById('blackout');
	[signInWindow, blackout].forEach(function(element, index) {
		element.style.opacity = 0;

		function displayNone() {
			element.style.visibility = 'hidden';
		}
		setTimeout(displayNone, 300)
	});
}

// Smooth scroll
var timer;
window.addEventListener('scroll', function() {
	clearTimeout(timer);
	if (!document.body.classList.contains('disable-hover')) {
		document.body.classList.add('disable-hover')
	}
	timer = setTimeout(function() {
		document.body.classList.remove('disable-hover')
	}, 500);
}, false);
