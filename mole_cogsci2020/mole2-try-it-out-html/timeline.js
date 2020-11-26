
// TIMELINE VARIABLE
// needs timeline = [];

// TIMELINE FUNCTIONS

next = function(fun) {
	timeline.push(fun);
}

inner_timeline = function(build_inner_timeline) {
	// this function allows to insert to the timeline 
	// (instead of adding to the end of the timeline)
	// during the ongoing experiment (ie. after timeline_run() was already called)
	next(function() {
		var outer_timeline = timeline; // [event4, event5]
		timeline = []; // []
		build_inner_timeline(); // timeline = [eventA, eventB]
		timeline = timeline.concat(outer_timeline); // [eventA, eventB, event4, event5]
	});
}

wait = function(seconds) {
	next(function() {
		timeline_paused = true;
		if (DBUG_FAST) {
			seconds = DBUG_FAST;
		}
		run_after_delay(seconds, function() {
			timeline_paused = false;
			timeline_run();
		});
	});
}

wait_for_button_click = function() {
	next(function() {
		timeline_paused = true;
		mousedown_box2_button = function() {
			mousedown_box2_button = function() {}; // reset
			button.clicked = true;
			draw_box2();
			var seconds = button.auto_hide_after;
			if (DBUG_FAST) {
				seconds = DBUG_FAST/5;
			}
			run_after_delay(seconds, function() {
				instructions = '';
				button.text = '';
				button.clicked = false;
				draw_box2();
				run_after_delay(seconds, function() {
					timeline_paused = false;
					timeline_run();
				});
			});
		}
		if (DBUG_AUTO) {
			// simulate click
			mousedown_box2_button();
		}
	});
}

wait_for_click_box1 = function() {
	next(function() {
		timeline_paused = true;
		mousedown_box1 = function(x, y) {
			mousedown_box1 = function() {}; // reset
			mousedown_x = x; // assign globally
			mousedown_y = y; // assign globally
			timeline_paused = false;
			timeline_run();
		}
		if (DBUG_AUTO) {
			// simulate click
			var seconds = button.auto_hide_after;
			if (DBUG_FAST) {
				seconds = DBUG_FAST/5;
			}
			run_after_delay(seconds, function() {
				sim_x = _.random(-50, 50);
				sim_y = _.random(-50, 50);
				mousedown_box1(sim_x, sim_y);
			});
		}
	});
}

timeline_run = function() {
	any_events_left = timeline.length > 0;
	if (any_events_left) {
		event = timeline.shift();
		event();
		draw_box1();
		draw_box2();
		if (!timeline_paused) {
			timeline_run();
		}
	}
}
