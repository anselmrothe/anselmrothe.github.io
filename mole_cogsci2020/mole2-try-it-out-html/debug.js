
debug_navigation_buttons = function() {
	// text and buttons in #navigation

	navigation = document.getElementById('navigation');
	navigation.innerHTML = '';
	navigation.appendChild(document.createTextNode(version));
	navigation.appendChild(document.createElement('br'));
	navigation.appendChild(document.createTextNode('== debug mode only =='));
	navigation.appendChild(document.createElement('br'));

	var butt = document.createElement('button');
	butt.innerHTML = 'skip intro';
	butt.addEventListener ("click", function(e) {
		e.preventDefault(); // try to inhibit mturk from submitting the hit after any button click
		DBUG_SKIP_INTRO	= true;
		main();
	});
	navigation.appendChild(butt);

	var butt = document.createElement('button');
	butt.innerHTML = 'auto play on/off';
	butt.addEventListener ("click", function(e) {
		e.preventDefault(); // try to inhibit mturk from submitting the hit after any button click
		DBUG_AUTO = !DBUG_AUTO;
	});
	navigation.appendChild(butt);

	var butt = document.createElement('button');
	butt.innerHTML = 'fast';
	butt.addEventListener ("click", function(e) {
		e.preventDefault(); // try to inhibit mturk from submitting the hit after any button click
		DBUG_FAST = .1;
	});
	navigation.appendChild(butt);
	

	// navigation.appendChild(document.createElement('br'));
	navigation.appendChild(document.createTextNode('replace current pattern with:'));

	for (var i = 0; i < patterns.length; i++) {
		var pattern = patterns[i];
		var butt = document.createElement('button');
		butt.innerHTML = pattern.name;
		butt.id = i; // doesn't play a role beyond storing the id; retrieved during click event as 'this.id'
		butt.addEventListener ("click", function(e) {
			e.preventDefault(); // try to inhibit mturk from submitting the hit after any button click
		  pattern_id = this.id; // overwrite global variable 'pattern_id'
		  console.log('enforced pattern_id: ' + String(this.id));
		});
		navigation.appendChild(butt);
	}
}
