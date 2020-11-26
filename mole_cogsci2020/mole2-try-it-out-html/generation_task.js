
run_task_generate_patterns = function() {
	run_task_generate_pattern = function(easy_or_difficult_local) {
		next(function() {
			trial++;
			easy_or_difficult = easy_or_difficult_local;
			mole.visible = false;
			prediction.visible = false;
			recent_hole.enabled = false;
			history_holes.elements = [];
			history_holes.visible = true;
			coords_generation.visible = true;
			show_progressboxes = true;
			all_scores_this_pattern = []; // so stars are not shown
			step = 0;
			instructions = '';
			button.text = '';
		})
		wait(1);
		next(function() {
			instruction_top = ['Please generate a pattern'].concat(easy_or_difficult).concat('');
			instructions = instruction_top.concat([
			'Click in the large ' + background_type, 
			'area to specify the', 
			'start location of the mole!'
			]);
		});
		wait_for_click_box1();
		next_register_generation_and_let_mole_follow();
		for (var i = 0; i < steps_per_pattern; i++) {
			next(function() {
				generation_info.visible = true;
				generation_snap_cross.visible = true;
				activate_draw_constantly();
				instructions = instruction_top.concat([
				'Now click at the location',
				'where the mole should',
				'appear next!'
				]);
			});
			wait_for_click_box1();
			next(function() {
				step++;
				instructions = instruction_top;
				generation_snap_cross.visible = false;
				deactivate_draw_constantly();
			});
			next_register_generation_and_let_mole_follow();
		}
		next(function() {
			recent_hole.visible = false;
			history_holes.visible = false;
			coords_generation.visible = false;
			generation_info.visible = false;
			generation_snap_cross.visible = false;
			deactivate_draw_constantly();
			mousemove_box1 = function() {}; // empty function
			if ((trial + 1) < n_trials) {
				instructions = 'Thanks!';
				button.text = 'Continue';
			} else {
				instructions = '~ End of task ~';
				button.text = 'Continue';
			}
		});
		wait_for_button_click();
	}
	// Intro to pattern generation task
	next(function() {
		trial = -1;
		step = -1;
		pattern_id = 'intro_generation_task';
		n_trials = n_trials_generate_easy + n_trials_generate_hard;
		show_progressboxes = false;
		durations.hole_grow *= .2;
		durations.mole_show *= .2;
		mousemove_box1 = draw_generation_info; // generation_info drawn whenever mouse moves
		instructions = [
		'Now it is your turn to', 
		'generate a few patterns!']
		button.text = 'Continue';
		records.push({
			time: Date.now(),
			info: 'begin intro generation task'
		});
		// speed up animations
		// for (var x in durations) {
		// 	durations[x] *= .1
		// }
	});
	if (!DBUG_SKIP_INTRO_GENERATION) {
		wait_for_button_click();
		next(function() {
			instructions = [
			'For that purpose,',
			'the mole will follow',
			'your commands.',
			'',
			'Click 4 times in the',
			'large ' + background_type + ' area to try',
			'out how the mole',
			'is following you!'
			];
		});
		wait_for_click_box1();
		next_register_generation_and_let_mole_follow();
		wait_for_click_box1();
		next_register_generation_and_let_mole_follow();
		wait_for_click_box1();
		next_register_generation_and_let_mole_follow();
		wait_for_click_box1();
		next_register_generation_and_let_mole_follow();
		next(function() {
			instructions = [
			'Great!',
			'We would like you', 
			'to generate ' + String(n_trials_generate_easy) + ' easy',
			'and ' + String(n_trials_generate_hard) + ' difficult patterns.'];
			button.text = 'Ok';
			records.push({
				time: Date.now(),
				info: 'begin generation task'
			});
		});
		wait_for_button_click();
	}

	if (Math.random() > .5) {
		for (var j = 0; j < n_trials_generate_easy; j++) {
			run_task_generate_pattern(['that is EASY (everybody', 'should be able to learn it).']);
		}
		for (var j = 0; j < n_trials_generate_hard; j++) {
			run_task_generate_pattern(['that is DIFFICULT (about', '2 out of 10 people should', 'be able to learn it).']);
		}
	} else {
		for (var j = 0; j < n_trials_generate_hard; j++) {
			run_task_generate_pattern(['that is DIFFICULT (about', '2 out of 10 people should', 'be able to learn it).']);
		}
		for (var j = 0; j < n_trials_generate_easy; j++) {
			run_task_generate_pattern(['that is EASY (everybody', 'should be able to learn it).']);
		}
	}
}

next_register_generation_and_let_mole_follow = function() {
	next(register_generation);
	wait(durations.hiding / 3);
	next_mole_appears(speedup = 3);
	wait(durations.mole_show / 3);
	next(function() {
		mole.visible = false;
		prediction.visible = false;
	});
}

register_generation = function() {
	prediction.x = mousedown_x;
	prediction.y = mousedown_y;

	// translate generation coord system
	// round ('snap to grid')
	// then translate back to drawing coord system
	prediction = rescale_to_coords_generation(prediction, and_back = true);
	
	prediction.visible = true;

	mole.x = prediction.x;
	mole.y = prediction.y;

	records.push({
		time: Date.now(),
		item: 'generation',
		easy_or_difficult: easy_or_difficult,
		trial: trial,
		pattern_id: pattern_id,
		step: step,
		x: prediction.x,
		y: prediction.y
	})
}

