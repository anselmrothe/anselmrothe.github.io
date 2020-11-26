// mole2-try-it-out-html 
// - HTML only (no flask) version
// - no "description" part
// - no data stored

DBUG_INFO = false;
DBUG_AUTO = false;
DBUG_FAST = false;
DBUG_COORDS = false;
DBUG_MOUSE = false;
DBUG_SCORE = false;
DBUG_SKIP_MENU = false;
DBUG_SKIP_INTRO = false;
DBUG_SKIP_PREDICTION = false;
DBUG_SKIP_INTRO_GENERATION = false;
DBUG_SKIP_GENERATION = false;
DBUG_NAVIGATION = false;

// DBUG_INFO = true;
// DBUG_AUTO = true;
// DBUG_FAST = .1;
// DBUG_FAST = .01;
// DBUG_COORDS = true;
// DBUG_MOUSE = true;
// DBUG_SCORE = true;
DBUG_SKIP_MENU = true;
// DBUG_SKIP_INTRO = true;
// DBUG_SKIP_PREDICTION = true;
// DBUG_SKIP_INTRO_GENERATION = true;
// DBUG_SKIP_GENERATION = true;
// DBUG_NAVIGATION = true;

DBUG = (
	DBUG_INFO ||
	DBUG_AUTO ||
	DBUG_FAST ||
	DBUG_COORDS ||
	DBUG_MOUSE ||
	DBUG_SCORE ||
	DBUG_SKIP_MENU ||
	DBUG_SKIP_INTRO ||
	DBUG_SKIP_PREDICTION ||
	DBUG_SKIP_INTRO_GENERATION ||
	DBUG_SKIP_GENERATION ||
	DBUG_NAVIGATION
)

init_variables = function() {
	// SETTINGS
	version = 'v4.3';
	subject_id = 'no_subject_id_yet';
	url_mole_png = 'mole.png';
	grass_background = false;
	background_type = grass_background? 'grass' : 'gray';
	steps_per_pattern = 10;
	n_trials_generate_easy = 2;
	n_trials_generate_hard = 2;
	box1_size = 200; // overwritten in canvas_resize_and_draw();
	durations = {
		hiding: 1,
		hole_grow: 1,
		mole_show: 1.5,
		delay_score: .01,
		show_score: 1,
		hole_shrink: 1
	}
	progressbox = {
		size: 7,
		gap: 2,
		slim_width: function() {return(Math.min(7, 40/n_trials))}
	}

	// INITIALIZE VARIABLES AND OBJECTS
	timeline = [];
	records = [];
	// patterns = []; // created in patterns.js
	pattern_id = -1; // first pattern is 0
	pattern_ids_randomized = [];
	step = 0;
	trial = -1; // first trial is 0
	n_trials = patterns.length;
	show_progressboxes = false;
	intro_draw_score = false;
	timeline_paused = false;
	animation_running = false;
	hole_size_now = 0;
	hole_grow_start_time = 0;
	hole_shrink_start_time = 0;
	hole_color = grass_background? '#565656' : 'darkgray';
	instructions = '';
	score = 0;
	all_scores = [];
	all_scores_this_pattern = [];
	easy_or_difficult = '';
	prediction = {
		visible: false,
		x: 0,
		y: 0,
		size: 10
	}
	mole = {
		visible: false,
		x: 0,
		y: 0,
		size: 11
	}
	history_holes = {
		enabled: true,
		visible: false,
		elements: [],
		show_recent_n: 99,
		shades_of_gray: false,
		labels: true,
		relative_size_in_generation_task: .5
	}
	recent_hole = {
		enabled: false,
		visible: false,
		relative_size: .15
	}
	generation_snap_cross = {
		visible: false
	}
	coords_generation = {
		visible: false,
		limit: 50/2
	}
	generation_info = {
		visible: false,
		x: 40,
		y: -80,
		width: 0, // computed in draw_generation_info()
		height: 0, // computed in draw_generation_info()
		text: '' // computed in draw_generation_info()
	}
	button = {
		text: '', // '' -> button hidden
		x: -85,
		y: -45,
		width: 70,
		height: 15,
		clicked: false,
		auto_hide_after: .5 // sec
	}
	box2_text_size = 7.5;
	ani = 0;
	mouse_x_raw = 0;
	mouse_y_raw = 0;
	mouse_scaled = [];
	bonus_info_text = [
	'Your bonus depends',
	'on the average amount',
	'of stars that you get:',
	'a higher average will',
	'result in a higher bonus.'
	];
	description = '';
}


// prevent refreshing the website
// window.addEventListener('beforeunload', (event) => {
// 	instructions = ['Refreshing or leaving', 'the website will reset', 'the game'];
// 	draw_box2();
// 	// Cancel the event as stated by the standard.
// 	event.preventDefault();
// 	// Chrome requires returnValue to be set.
// 	event.returnValue = 'You are about to reset the game';
// 	return('You are about to reset the game');
// });

stringify_and_compress = function(array_or_object) {
	var str = JSON.stringify(array_or_object);
	var compressed = LZString.compressToBase64(str);
	return(compressed);
}

compute_bonus = function(average_score) {
	// $1 for 100%
	// $0.50 for 50%
	// 5 stars = 100%
	// 2.99 = 0%
	var bonus = (average_score - 2.9) / (5 - 2.9);
	bonus = Math.max(0, bonus);
	bonus = Math.round(bonus * 100) / 100;
	return(bonus);
}

compute_score = function() {
	// euclidean distance
	diff_x = mole.x - prediction.x;
	diff_y = mole.y - prediction.y;
	diff = Math.sqrt(diff_x*diff_x + diff_y*diff_y)

	// base_distance in exp2 is 16
	base_distance = 16;

	if (diff < base_distance/2) {
		score = 5;
	} else if (diff < base_distance) {
		score = 4;
	} else if (diff < base_distance*2) {
		score = 3;
	} else if (diff < base_distance*3) {
		score = 2;
	} else if (diff < base_distance*4) {
		score = 1;
	} else {
		score = 0;
	}
}

register_score = function() {
	compute_score();
	all_scores.push(score);
	all_scores_this_pattern.push(score);
}

requestFullScreen = function(element) {
	// https://stackoverflow.com/a/7525760/9537542
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

// EXPERIMENT PROCEDURE FUNCTIONS

run_task_predict_patterns = function() {
	run_task_predict_pattern = function() {
		next(function() {
			trial++;
			pattern_id = pattern_ids_randomized[trial];
			mole.visible = false;
			prediction.visible = false;
			history_holes.elements = [];
			step = 0;
			all_scores_this_pattern = [];
			instructions = '';
			button.text = '';
			show_progressboxes = true;
		});
		wait(1);
		next(function() {
			instructions = [
			'Click the button to wake',
			'the mole up!'
			];
			button.text = 'Mole, wake up!';
		});
		wait_for_button_click();
		next(function() {
			instructions = '';
			button.text = '';
			pattern_next_step(pattern_id, step);
		});
		next_mole_appears();
		wait(durations.mole_show);
		next(hole_shrink);
		wait(durations.hole_shrink);
		for (var i = 0; i < steps_per_pattern; i++) {
			next(function() {
				step++;
				instructions = [
				'Predict where the mole',
				'will appear next!'];
			});
			wait_for_click_box1();
			next(function() {
				instructions = '';
				register_prediction();
			});
			wait(durations.hiding/5);
			next(function() {
				recent_hole.visible = false;
			})
			wait(durations.hiding/5);
			next(function() {
				pattern_next_step(pattern_id, step);
			});
			next_mole_appears();
			wait(durations.delay_score);
			next(register_score);
			wait(durations.show_score);
			next(hole_shrink);
			wait(durations.hole_shrink);
		}
		next(function() {
			recent_hole.visible = false;
			if ((trial + 1) < n_trials) {
				instructions = ''
				button.text = 'Begin next round';
			} else {
				instructions = '~ End of first part ~';
				// we autmatically jump to the next next() in higher level
				button.text = 'Continue';
			}
		});
		wait_for_button_click();
	}
	next(function() {
		// CHANGED FOR mole2-try-it-out-html:
		// put pattern_id==0 ("1 line") last, rest randomized
		pattern_ids_randomized = _.shuffle(_.range(1, patterns.length));
		pattern_ids_randomized = pattern_ids_randomized.concat([0]);
		records.push({
			time: Date.now(),
			info: 'begin prediction task',
			box1_size: box1_size
		});
	});
	for (var j = 0; j < n_trials; j++) {
		run_task_predict_pattern();
	}
}

next_mole_appears = function(speedup=1.0) {
	next(hole_grow);
	wait(durations.hole_grow/speedup);
	next(function() {
		mole.visible = true;
		history_holes.elements.push({x: mole.x, y: mole.y});
	});
}

pattern_next_step = function(pattern_id, step) {
	if (typeof patterns[pattern_id] === 'undefined') {
		alert('Pattern ' + pattern_id + " does not exist in 'patterns'")
	}
	pattern_name = patterns[pattern_id]['name'];
	coords = patterns[pattern_id]['coords'][step];
	mole.x = coords.x;
	mole.y = coords.y;

	records.push({
		time: Date.now(),
		item: 'mole',
		trial: trial,
		pattern_id: pattern_id,
		pattern_name: pattern_name,
		step: step,
		x: coords.x,
		y: coords.y
	});
}

register_prediction = function() {
	prediction.x = mousedown_x;
	prediction.y = mousedown_y;
	prediction.visible = true;

	records.push({
		time: Date.now(),
		item: 'prediction',
		trial: trial,
		pattern_id: pattern_id,
		step: step,
		x: prediction.x,
		y: prediction.y
	})
}

register_description = function() {
	records.push({
		time: Date.now(),
		item: 'description',
		trial: trial,
		pattern_id: pattern_id,
		description: description
	})
}



// GENERAL FUNCTIONS

run_after_delay = function(after_seconds, run_function, run_function_args) {
	if (DBUG_FAST) {
		after_seconds = DBUG_FAST;
	}
	timeoutID = window.setTimeout(run_function, after_seconds * 1000, run_function_args);
}

sum = function(array_or_object) {
	var total = 0;
	for (var i in array_or_object) {
	    total += array_or_object[i];
	}
	return(total);
}

// MOUSE FUNCTIONS

mouse_raw_to_canvas_coords = function(canvas, event) {
	// rect = canvas_box1.getBoundingClientRect();
	// scalex = canvas_box1.width / rect.width;
	// scaley = canvas_box1.height / rect.height;
	// x = (event.clientX - rect.left) * scalex;
	// y = (event.clientY - rect.top)  * scaley;

	// account for canvas position on page
	mouse_x_raw = event.clientX - canvas.offsetLeft;
	mouse_y_raw = event.clientY - canvas.offsetTop;

	// scale
	x = mouse_x_raw / canvas.width  * 200;
	y = mouse_y_raw / canvas.height * 200;
	if (canvas === canvas_box2) {
		x = mouse_x_raw / canvas.width * 100;	
	}

	// adjust center to 0,0
	x = x - 100;
	y = y - 100;

	// rounding
	x = Math.round(x);
	y = Math.round(y);

	return({x, y});
}

box1_addEventListener_mousemove = function() {
	mousemove_box1 = function() {} //empty function to overwrite
	canvas_box1.addEventListener('mousemove', function(event) {
		mouse_scaled = mouse_raw_to_canvas_coords(canvas_box1, event);
		mousemove_box1();
	});
}

box1_addEventListener_mousedown = function() {
	mousedown_box1 = function(x, y) {} //empty function to overwrite
	canvas_box1.addEventListener('mousedown', function(event) {
		mouse_scaled = mouse_raw_to_canvas_coords(canvas_box1, event);
		mousedown_box1(mouse_scaled.x, mouse_scaled.y);
	});
}

box2_addEventListener_mousemove = function() {
	canvas_box2.addEventListener('mousemove', function(event) {
		var mouse_scaled_box2 = mouse_raw_to_canvas_coords(canvas_box2, event);
		var located_at_button = coordinates_within_square(mouse_scaled_box2, button);
		if (located_at_button) {
			if (button.text != '') {
				canvas_box2.style.cursor = 'pointer';
			}
		} else {
			canvas_box2.style.cursor = 'default';
		}
	});
}

box2_addEventListener_mousedown = function() {
	mousedown_box2_button = function() {} //empty function to overwrite
	canvas_box2.addEventListener('mousedown', function(event) {
		var mouse_scaled_box2 = mouse_raw_to_canvas_coords(canvas_box2, event);
		var located_at_button = coordinates_within_square(mouse_scaled_box2, button);
		if (located_at_button) {
			mousedown_box2_button();
		}
	});
}

coordinates_within_square = function(coords, b) {
	if (coords.x > b.x) {
		if (coords.x < (b.x + b.width)) {
			if (coords.y > b.y) {
				if (coords.y < (b.y + b.height)) {
					return(true);
				}
			}
		}
	}
	return(false);
}

rescale_to_coords_generation = function(coords, and_back = false) {
	// translate generation coord system, and round ('snap to grid')
	x = coords.x / 100 * coords_generation.limit;
	y = coords.y / 100 * coords_generation.limit;
	x = Math.round(x);
	y = Math.round(y);
	if (and_back) {
		x *= 100 / coords_generation.limit;
		y *= 100 / coords_generation.limit;
	}
	return({x, y});
}

send_data_to_server = function(data, done_function) {
	console.log('sending data to server...');
	$.ajax({
	    url:('/receive_data'),
	    type: 'POST',
	    data: JSON.stringify(data),
	    contentType: 'application/json',
	})
	.done(done_function)
}

test_server_connection = function() {
	document.getElementById('server_feedback').innerHTML = 'no feedback';
	subject_id = document.getElementById('subject_id').value;
	var data = {
	    'subject_id': '(test)' + subject_id,
	    'records_compressed': 'test_message'
	};
	var done_function = function(feedback) {
	    console.log(feedback);
	    document.getElementById('server_feedback').innerHTML = feedback;
	};
	send_data_to_server(data, done_function);
}

go_full_screen = function() {
	var d = document.documentElement;
	if (d.requestFullscreen) {
        d.requestFullscreen();
    }
    else if (d.mozRequestFullScreen) {
        d.mozRequestFullScreen();
    }
    else if (d.webkitRequestFullscreen) {
        d.webkitRequestFullscreen();
    }
    else if (d.msRequestFullscreen) {
        d.msRequestFullscreen();
    }
}

// MAIN

main = function() {
	// main() is called in the html file

	// hide describeField
	document.getElementById('describeField').style.display = 'none';

	// show canvas areas
	document.getElementById('center_area').style.display = null;

	subject_id = 'try-out';

	init_variables();
	canvas_setup();

	if (DBUG_MOUSE) {
		activate_draw_constantly();
	} else {
		if (DBUG_NAVIGATION){
			debug_navigation_buttons();
		}
		// build timline
		if (!DBUG_SKIP_INTRO) {
			next_intro();  // from 'intro.js'
			wait(2);
		}
		next(function() {
			instructions = '';
		});
		if (!DBUG_SKIP_PREDICTION) {
			inner_timeline(function() {
				run_task_predict_patterns();
			});
			next(function() {
				button.text = 'Begin second part';
			});
			wait_for_button_click();
		}
		if (!DBUG_SKIP_GENERATION) {
			inner_timeline(function() {
				run_task_generate_patterns();
			});
		}
		next(function() {
			show_progressboxes = false;
			average_score = sum(all_scores)/all_scores.length;
			average_score_rounded = Math.round(average_score * 100) / 100;
			bonus = compute_bonus(average_score);
			records.push({
				time: Date.now(),
				average_score: average_score,
				bonus: bonus
			});
			instructions = [
				'Your total performance',
				'in the first part was',
				String(average_score_rounded) + ' out of 5 stars.',
				'',
				'Your bonus: $' + String(bonus)];
			button.text = 'Ok';
		});
		next(deactivate_draw_constantly);
		wait_for_button_click();
		next(function() {
			instructions = [
			'End of experiment']; 
			button.text = '';
		});

		timeline_run();	
	}
}
