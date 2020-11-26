
// PAINTING FUNCTIONS

myfontsize = function(x) {
	return(String(x) + 'px sans-serif');
}

canvas_setup = function() {
	window.addEventListener('resize', function(event){
	  canvas_resize_and_draw();
	});

	canvas_resize_and_draw();

	preload_images();
	box1.drawImage(mole_img, -900, -900, -900, -900);

	box1_addEventListener_mousedown();
	box2_addEventListener_mousedown();

	box1_addEventListener_mousemove();
	box2_addEventListener_mousemove();
}

preload_images = function() {
	mole_img = new Image();
	mole_img.src = url_mole_png;
	if (grass_background) {
		grass_img = new Image();
		grass_img.src = 'grass2.jpg'
		grass_img.onload = function() {
			draw_box1();
		}
	}
}

canvas_resize_and_draw = function() {
	box1_size = Math.min(.60*($(window).width()), .90*($(window).height()));
	// get canvas
	canvas_box1 = document.getElementById('box1');
	canvas_box2 = document.getElementById('box2');
	// set canvas size in pixels
	canvas_box1.height = box1_size;
	canvas_box1.width  = box1_size;
	canvas_box2.height = box1_size;
	canvas_box2.width  = box1_size/2;
	// get canvas context
	box1 = canvas_box1.getContext('2d');
	box2 = canvas_box2.getContext('2d');
	
	// // coordinate system where 0,0 is center
	box1.translate(box1_size/2, box1_size/2);
	box2.translate(box1_size/2, box1_size/2);
	// // and -100, 100 are the borders; top left is -100,-100
	box1.scale(box1_size/200, box1_size/200);
	box2.scale(box1_size/200, box1_size/200);
	// // // setting bottom left to -100,-100 would also mirror text :(
	// // box1.scale(1, -1);
	// // box2.scale(1, -1);
	// rescale scale-independent settings
	box1.lineWidth = 200/box1_size;
	box2.lineWidth = 200/box1_size;

	draw_box1();
	draw_box2();
}

box1_background = function() {
	box1.fillStyle = 'lightgray';
	box1.fillRect(-100, -100, 200, 200);
	if (grass_background) {
		box1.drawImage(grass_img, -100, -100, 200, 200);
	}
}

draw_history_holes = function() {
	var size = mole.size * history_holes.relative_size_in_generation_task;
	for (var i in history_holes.elements) {
		if ((history_holes.elements.length - i) <= history_holes.show_recent_n) {
			if (history_holes.shades_of_gray) {
				history_hole_color = [hole_color, '#CB7878', '#CA8D8D', '#CBA5A5', '#D5BABA', ][history_holes.elements.length - i]
			} else {
				history_hole_color = hole_color;
			}
			draw_point(history_holes.elements[i].x, history_holes.elements[i].y, size, color = history_hole_color);
			if (history_holes.labels) {
				box1.textAlign = 'center';
				box1.textBaseline = 'middle';
				box1.fillStyle = '#4a4a4a'; // darkdarkgray
				box1.font = myfontsize(9);
				label_text = String(parseInt(i)+1);
				box1.fillText(label_text, history_holes.elements[i].x, history_holes.elements[i].y + 1, mole.size);	
			}	
		}
	}
}

draw_recent_hole = function() {
	if (history_holes.elements.length > 0) {
		var x = history_holes.elements[history_holes.elements.length - 1].x;
		var y = history_holes.elements[history_holes.elements.length - 1].y;
		draw_point(x, y, mole.size*recent_hole.relative_size, color = hole_color);
	}
}

draw_prediction = function() {
	var x = prediction.x;
	var y = prediction.y;

	// // yellow circle
	// draw_point(x, y, 5, 'yellow');

	// // cross
	box1.strokeStyle = 'black';
	box1.beginPath();
	box1.moveTo(x - prediction.size, y);
	box1.lineTo(x + prediction.size, y);
	box1.moveTo(x, y - prediction.size);
	box1.lineTo(x, y + prediction.size);
	box1.stroke();
}

draw_mole = function() {
	// // black circle
	// draw_point(mole.x, mole.y, mole.size, 'black');

	// background circle
	draw_point(mole.x, mole.y, mole.size, hole_color);
	// mole png
	mole_img_size = mole.size/.6;
	box1.drawImage(mole_img, mole.x-(mole_img_size/2), mole.y-(mole_img_size/2), mole_img_size, mole_img_size);
}

draw_hole = function() {
	draw_point(mole.x, mole.y, hole_size_now, hole_color);
}

draw_point = function(x, y, size = 3, color = 'black') {
	box1.fillStyle = color;
	box1.beginPath();
	box1.arc(x, y, size, 0, Math.PI*2);
	box1.fill();
}

draw_box1 = function() {
	box1_background();

	if (coords_generation.visible) {
		draw_coords_generation(box1);
	}
	if (recent_hole.visible) {
		draw_recent_hole();
	}
	if (history_holes.visible) {
		draw_history_holes();
	}
	if (prediction.visible) {
		draw_prediction();
	}
	if (mole.visible) {
		draw_mole();
	}
	if (hole_grow_start_time) {
		hole_grow_update();
		draw_hole();
	}
	if (hole_shrink_start_time) {
		hole_shrink_update();
		draw_hole();
	}
	if (generation_snap_cross.visible) {
		draw_generation_snap_cross();
	}
	if (generation_info.visible) {
		draw_generation_info();
	}
	if (DBUG_COORDS) {
		draw_coords(box1);
	}
	if (DBUG_INFO) {
		draw_debug_info();
	}
	if (DBUG_SCORE) {
		draw_debug_score();
	}
}

draw_box2 = function() {
	// background
	box2.fillStyle = 'white';
	box2.fillRect(-100, -100, 200, 200);


	// draw instructions
	var x = -90;
	var y = -90;
	var width = 80;
	box2.textAlign = 'left';
	box2.textBaseline = 'middle';
	box2.fillStyle = 'black';
	box2.font = myfontsize(box2_text_size);
	if (!Array.isArray(instructions)) {
		instructions = [instructions];
	}
	var y_current = y + box2_text_size/2 - box2_text_size;
	for (var i = 0; i < instructions.length; i++) {
		if (instructions[i] == '') {
			// move down only half for new paragraph
			y_current += box2_text_size*.5;
		} else {
			y_current += box2_text_size;	
		}
		box2.fillText(instructions[i], x, y_current, width);
	}

	// draw button
	draw_button();

	// draw stars and progress boxes
	if (show_progressboxes) {
		draw_scorebox();
		draw_progressboxes_steps()
		draw_progressboxes_patterns();
	} else {
		if (intro_draw_score) {
			draw_progressboxes_steps_stars(score, y=0);
		}
	}

	if (DBUG_COORDS) {
		draw_coords(box2);
	}
}

draw_button = function() {
	if (button.text != '') {
		box2.beginPath();
		box2.rect(button.x, button.y, button.width, button.height);
		box2.closePath();
		if (button.clicked) {
			box2.fillStyle = 'darkgrey';
		} else {
			box2.fillStyle = '#eeeeee'; //lightlightgray
		}
		box2.fill();
		box2.strokeStyle = 'black';
		box2.stroke();
		box2.textAlign = 'center';
		box2.fillStyle = 'black';
		box2.fillText(button.text, button.x + button.width/2, button.y + button.height/2 + 1, button.width);
	}
}

draw_star = function(x, y, filled = false, size = progressbox.size/2) {
	// values from we_draw_a_star.rmd
	var xx = [0, -0.29389, -0.95106, -0.47553, -0.58779, 0, 0.58779, 0.47553, 
0.95106, 0.29389, 0, -0.29389];
	var yy = [1, 0.40451, 0.30902, -0.15451, -0.80902, -0.5, -0.80902, -0.15451, 
0.30902, 0.40451, 1, 0.40451]
	box2.beginPath();
	box2.moveTo(x + (xx[0]*size), y - (yy[0]*size));
	for (var i = 1; i < xx.length; i++) {	
		box2.lineTo(x + (xx[i]*size), y - (yy[i]*size));
	}
	box2.closePath();
	if (filled) {
		box2.fillStyle = 'yellow';
		box2.fill();
	}
	box2.strokeStyle = 'black';
	box2.stroke();
}

draw_triangle = function(x) {
	box2.beginPath();
	box2.moveTo(x-4, 72);  // top left
	box2.lineTo(x  , 87);  // bottom
	box2.lineTo(x+4, 72);  // top right
	box2.closePath();
	box2.fillStyle = 'lightgray';
	box2.fill();
}

draw_scorebox = function() {
	box2.fillStyle = 'lightgray';
	box2.fillRect(-90, -25, 80, 100);	
}

draw_progressbox = function(x, y, filled = false, width = progressbox.size) {
	box2.fillStyle = filled ? '#315096' : 'gray';
	box2.fillRect(x - width/2, y - progressbox.size/2, width, progressbox.size);
}

draw_progressboxes_patterns = function() {
	for (var i = 0; i < n_trials; i++) {
		x = -85 + i*(progressbox.gap+progressbox.slim_width());
		if (trial === i) {
			draw_triangle(x);
		}
		draw_progressbox(x, 88, trial >= i, width=progressbox.slim_width());
	}	
}

draw_progressboxes_steps = function() {
	for (var i = 0; i < steps_per_pattern; i++) {
		y = 65 - i*(progressbox.gap+progressbox.size);
		draw_progressbox(-80, y, step > i);
		if (step > i) {
			current_score = all_scores_this_pattern[i];
			if (typeof current_score !== 'undefined') {
				draw_progressboxes_steps_stars(current_score, y);
			}
		}
	}
}

draw_progressboxes_steps_stars = function(score = 0, y) {
	for (var i = 0; i < 5; i++) {
		filled = score > i;
		draw_star(-65 + i*(progressbox.gap+progressbox.size), y, filled);
	}
}

draw_generation_snap_cross = function() {
	// translate generation coord system
	// round ('snap to grid')
	// then translate back to drawing coord system
	coords = rescale_to_coords_generation(mouse_scaled, and_back = true);
	box1.strokeStyle = 'black';
	var temp = box1.lineWidth;
	box1.lineWidth = 1.8;
	box1.beginPath();
	box1.moveTo(x - 4.1, y);
	box1.lineTo(x + 4.1, y);
	box1.moveTo(x, y - 4.1);
	box1.lineTo(x, y + 4.1);
	box1.stroke();
	box1.lineWidth = temp;
}

draw_generation_info = function() {
	// info box in top right corner
	if (generation_info.visible) {
		generation_info.width  =  100-generation_info.x;
		generation_info.height = -100-generation_info.y;
		// draw box
		box1.fillStyle = '#F8F8F8'; // light light gray
		box1.fillRect(generation_info.x, generation_info.y, generation_info.width, generation_info.height);
		// compute values
		recent = history_holes.elements[history_holes.elements.length - 1];
		current = mouse_scaled;
		recent = rescale_to_coords_generation(recent);
		current = rescale_to_coords_generation(current);
		left_or_right = recent.x < current.x ? 'right' : 'left';
		left_or_right_amount = Math.abs(recent.x - current.x);
		up_or_down = recent.y < current.y ? 'down' : 'up';
		up_or_down_amount = Math.abs(recent.y - current.y);
		generation_info.text = left_or_right_amount + ' ' + left_or_right + ', ' + up_or_down_amount + ' ' + up_or_down;
		// draw text
		box1.textBaseline = 'middle';
		box1.textAlign = 'center';
		box1.fillStyle = 'black';
		box1.font = myfontsize(7);
		box1.fillText(generation_info.text, generation_info.x + generation_info.width/2, generation_info.y + generation_info.height/2, generation_info.width-10);
	}
}

draw_debug_info = function() {
	debug_info = [];
	debug_info.push('trial: ' + String(trial));
	debug_info.push('patterns.length: ' + String(patterns.length));
	debug_info.push('Pattern: ' + String(pattern_id));
	debug_info.push('Step: ' + String(step));
	debug_info.push('hole_size_now: ' + String(hole_size_now.toPrecision(2)));
	debug_info.push('ani: ' + String(ani));
	debug_info.push('score: ' + String(score));
	debug_info.push('recent_hole.visible: ' + String(recent_hole.visible));
	if (DBUG_MOUSE) {
		debug_info.push('mouse_x_raw: ' + String(mouse_x_raw));
		debug_info.push('mouse_y_raw: ' + String(mouse_y_raw));
		debug_info.push('mouse_scaled.x: ' + String(mouse_scaled.x));
		debug_info.push('mouse_scaled.y: ' + String(mouse_scaled.y));
	}

	box1.textAlign = 'left';
	box1.textBaseline = 'hanging';
	box1.fillStyle = 'red';
	box1.font = myfontsize(8);
	for (var i = 0; i < debug_info.length; i++) {
		box1.fillText(debug_info[i], -99, -99 + i*10);
	}
}

draw_debug_score = function() {
	box1.textBaseline = 'hanging';
	box1.fillStyle = 'black';
	box1.font = myfontsize(6);
	box1.beginPath();
	for (var x = -100; x < 101; x += 10) {
		for (var y = -100; y < 101; y += 10) {
			box1.moveTo(x - 1.8, y);
			box1.lineTo(x + 1.8, y);
			box1.moveTo(x, y - 1.8);
			box1.lineTo(x, y + 1.8);
			// if (x === y) {
			prediction.x = x;
			prediction.y = y;
			compute_score();
			box1.fillText(String(score), x, y);
			// }
		}
	}
	box1.strokeStyle = 'black';
	box1.stroke();
}

draw_coords = function(box) {
	box.textBaseline = 'hanging';
	box.fillStyle = 'black';
	box.font = myfontsize(6);
	box.beginPath();
	for (var x = -100; x < 101; x += 10) {
		for (var y = -100; y < 101; y += 10) {
			box.moveTo(x - 1.8, y);
			box.lineTo(x + 1.8, y);
			box.moveTo(x, y - 1.8);
			box.lineTo(x, y + 1.8);
			if (DBUG_COORDS) {
				if (x === y) {
					box.fillText(String(Math.round(x)), x, y);
				}
			}
		}
	}
	box.strokeStyle = 'black';
	box.stroke();
}

draw_coords_generation = function(box) {
	// stepsize = 4 in coords equals stepsize = 1 in coords_generation
	box.fillStyle = 'black';
	for (var x = -100; x < 101; x += 4) {
		for (var y = -100; y < 101; y += 4) {
			box.fillRect(x - .25, y - .25, .5, .5);
		}
	}
}

// ANIMATION FUNCTIONS

activate_draw_constantly = function() {
	if (!animation_running) {
		animation_running = true;
		ani = window.requestAnimationFrame(draw_constantly);
	}
}

deactivate_draw_constantly = function() {
	animation_running = false;
	window.cancelAnimationFrame(ani);	
}

draw_constantly = function() {
	if (animation_running) {
		draw_box1();
		ani = window.requestAnimationFrame(draw_constantly);
	}
}

hole_grow = function() {
	// start animation
	hole_grow_start_time = Date.now();
	activate_draw_constantly();
}

hole_shrink = function() {
	mole.visible = false;
	prediction.visible = false;
	// start animation
	hole_shrink_start_time = Date.now();
	activate_draw_constantly();
}

hole_grow_update = function() {
	duration = DBUG_FAST? DBUG_FAST : durations.hole_grow;
	duration =  duration * 1000;
	now = Date.now();
	percent = (now - hole_grow_start_time) / duration;
	if (percent > 1) {
		// end animation
		deactivate_draw_constantly();
		hole_grow_start_time = 0;
	} else {
		hole_size_now = percent * mole.size;
	}
}

hole_shrink_update = function() {
	duration = DBUG_FAST? DBUG_FAST : durations.hole_shrink;
	duration =  duration * 1000;
	now = Date.now();
	percent = 1 - ((now - hole_shrink_start_time) / duration);
	
	if (recent_hole.enable) {
		too_small = percent < recent_hole.relative_size;
	} else {
		too_small = percent < .02;
	}
	if (too_small) {
		if (recent_hole.enabled) {
			recent_hole.visible = true;
		}
		if (history_holes.enabled) {
			history_holes.visible = true;
		}
		// end animation
		deactivate_draw_constantly();
		hole_shrink_start_time = 0;
	} else {
		hole_size_now = percent * mole.size;
	}
}
