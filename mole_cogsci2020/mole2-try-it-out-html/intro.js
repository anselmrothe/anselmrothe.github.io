// introduction sequence for the mole experiment


next_intro = function() {
	next(function() {
		instructions = [
			'Before we begin, two',
			'notes:',
			'',
			'1) Do not reload the',
			'website. Your current',
			'progress would be lost.'
		];
		button.text = "OK";
	});
	wait_for_button_click();
	next(function() {
		canvas_resize_and_draw();
		canvas_resize_and_draw();
		canvas_resize_and_draw();
		canvas_resize_and_draw();
		canvas_resize_and_draw();
		instructions = [
			'2) Please maximize the',
			'size of your browser',
			'window for optimal',
			'display.'
		];
		button.text = "OK. Let's begin";
	});
	wait_for_button_click();
	next(function() {
		instructions = 'Look, there is a mole!';
		mole.x = 0;
		mole.y = 0;
		records.push({
			time: Date.now(),
			info: 'begin intro',
			box1_size: box1_size
		});
	});
	wait(durations.hiding);
	next_mole_appears();
	wait(durations.mole_show);
	next(function() {
		instructions = ['Look, there is a mole!', '', 'Click the button to make', 'the mole hide!'];
	});
	wait(durations.mole_show);
	next(function() {
		button.text = 'Mole, hide!';
	})
	wait_for_button_click();
	next(hole_shrink);
	wait(durations.hole_shrink);
	next(function() {
		recent_hole.visible = true;
		instructions = ['A gray circle shows', 'where the mole has been.', '', 
		'Where will it be next?'];
		button.text = 'Mole, wake up!';
		mole.x = 20;
		mole.y =-20;
	});
	wait_for_button_click();
	wait(durations.hiding);
	next_mole_appears();
	next(function() {
		instructions = ['The mole moved', 'a bit right and a bit up.'];
	});
	wait(durations.mole_show);
	next(function() {
		button.text = "Let's observe more";
	})
	wait_for_button_click();
	next(hole_shrink);
	wait(durations.hole_shrink);
	wait(durations.hiding);
	next(function() {
		instructions = '';
		button.text = '';
		mole.x = 40;
		mole.y =-40;
	})
	next_mole_appears();
	wait(durations.mole_show);
	next(hole_shrink);
	wait(durations.hole_shrink);
	next(function() {
		instructions = [
		'Now, click in the big',
		background_type + ' area to mark exactly',
		'that location where',
		'you think the mole',
		'will show up next!'];
		mole.x = 60;
		mole.y =-60;
	});
	wait_for_click_box1();
	next(function() {
		register_prediction();
	});
	wait(1);
	next(function() {
		recent_hole.visible = false;
	})
	wait(1);
	next_mole_appears();
	wait(durations.delay_score);
	next(compute_score);
	next(function() {
		instructions = ['Great! You will get stars', 'based on how good your', 'prediction was.', '', 
			'You got ' + String(score) + ' out of 5 stars.'];
		button.text = 'Continue';
		intro_draw_score = true;
	});
	wait_for_button_click();
	next(function() {
		instructions = bonus_info_text;
		button.text = 'Continue';
	})
	wait_for_button_click();
	next(hole_shrink);
	wait(durations.hole_shrink);
	next(function() {
		recent_hole.visible = false;
		intro_draw_score = false;
		instructions = '';
		button.text = 'Start the game';
	});
	wait_for_button_click();
}
