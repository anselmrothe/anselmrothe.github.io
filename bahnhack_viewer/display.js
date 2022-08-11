
display_data = () => {
	earliest = Math.min(...data.map(e => e.abfahrt_unix));
	latest = Math.max(...data.map(e => e.ankunft_unix));
	
	shortest = Math.min(...data.map(d => d.dauer_in_minuten));
	
	preise = data.map(e => e.preis).filter(p => !isNaN(p));
	cheapest = Math.min(...preise);

	u('#bars').empty();

	create_big_status_groups();
	create_groups();

	any_bar_overflow = false;
	data.forEach((d, i) => {
		d.left = convert_unix_to_px(d.abfahrt_unix);
		d.right = convert_unix_to_px(d.ankunft_unix);
		d.width = Math.round((d.right - d.left)*10)/10;
		create_bar(d, i);
	});

	create_vertical_lines_for_days();
	
	// maybe change to '.bar_group' ... each...
	u('#bars').first().style.width = (BARS_WIDTH+50)+'px'; // manually set width, add 50px margin on right side

	if (any_bar_overflow && (BARS_WIDTH < 4000)) {
		BARS_WIDTH += 200;
		display_data();
	}
}

create_big_status_groups = () => {
	u('#bars').append(u('<div>').attr('id', 'favorite'));
	u('#bars').append(u('<div>').attr('id', 'normal'));
	u('#bars').append(u('<div>').attr('id', 'discard'));
}

create_groups = () => {
	groups.forEach(label => {
		bar_group = u('<div>').attr('id', label);
		bar_group.addClass('bar_group');
		u('#normal').append(bar_group);
	});
}

create_bar = (d, i) => {
	id = 'bar'+i;
	bar = u('<div>').addClass('bar').attr('id', id);
	bar.attr('style', `
		left: ${d.left}px;
		width: ${d.width}px;
		`);

	row1 = u('<div>').addClass('row1');
	row2 = u('<div>').addClass('row2');

	row1.append(`<div class='dauer'>${format_dauer(d.dauer)}</div>`);
	row1.append(`<div class='umsteigen'>${format_umsteigen(d.umsteigen)}</div>`);

	row2.append(`<div class='abfahrt'>${d.abfahrt_str}</div>`);
	row2.append(`<div class='preis'>${format_preis(d.preis)}</div>`);
	row2.append(`<div class='ankunft'>${d.ankunft_str}</div>`);
	
	bar.append(row1);
	bar.append(row2);

	if (d.status == 'normal') {
		label = group_label(d)
		u(`#${label}.bar_group`).append(bar);
	} else {
		u(`#${d.status}`).append(bar); // #favorite or #discard
	}

	// click on bar shows .row3 with favorite / discard buttons
	bar.on('click', function() {
		if (u(this).children('.row3').length > 0) {
			u(this).children('.row3').remove();
		} else {
			let this_bar = u(this);
			let this_i = i;
			row3 = u('<div>').addClass('row3');
			favorite = u('<button>').text('Favorit ♥');
			normal = u('<button>').text('Normal');
			discard = u('<button>').text('Ignorieren ☠');
			favorite.on('click', e => {
				data[this_i].status = 'favorite';
				update_text2(data);
				process_data();
			});
			normal.on('click', e => {
				data[this_i].status = 'normal';
				update_text2(data);
				process_data();
			});
			discard.on('click', e => {
				data[this_i].status = 'discard';
				update_text2(data);
				process_data();
			});
			row3.append(favorite);
			row3.append(normal);
			row3.append(discard);
			this_bar.append(row3);
		}
	});
	
	// feature: color
	hue_low = 5;
	hue_high = 90;
	cost_attractiveness = Math.max(cheapest/d.preis || 0.5, 0.0);
	duration_attractiveness = Math.max(shortest/d.dauer_in_minuten || 0.5, 0.0);

	hue_duration = hue_high * duration_attractiveness;
	hue_cost = hue_high * cost_attractiveness;

	// bar.find('.dauer').first()

	// bar.find('.dauer').first().style.backgroundColor = `hsla(${hue_duration}, 68%, 46%, 1)`;
	// bar.find('.preis').first().style.backgroundColor = `hsla(${hue_cost}, 68%, 46%, 1)`;

	// bar.find('.dauer').first().style.backgroundColor = `hsla(${hue_duration}, 53%, 50%, 1)`;
	// bar.find('.preis').first().style.backgroundColor = `hsla(${hue_cost}, 53%, 50%, 1)`;

	bar.find('.dauer').first().style.backgroundColor = `hsla(${hue_duration}, 50%, 50%, 1)`;
	bar.find('.preis').first().style.backgroundColor = `hsla(${hue_cost}, 50%, 50%, 1)`;

	// hue = hue_low;
	// bar.first().style.background = `linear-gradient(to bottom, hsla(${hue_top}, 68%, 46%, 1), hsla(${hue_bottom}, 68%, 46%, 1))`

	// bar.first().style.background = `linear-gradient(to right, rgb(37,196,129), rgb(37,183,196))`
	// bar.first().style.background = `linear-gradient(to right, rgb(157,196,129), rgb(157,183,196))`
	// bar.first().style.background = `linear-gradient(to right, hsl(155, 68%, 46%), hsl(185, 68%, 46%))`
	// bar.first().style.background = `linear-gradient(to right, hsla(31, 68%, 46%, 1), hsla(61, 68%, 46%, 1))`
	// bar.first().style.background = `linear-gradient(to right, #25c481, #25b7c4)`
	// document.getElementsByTagName("body")[0].style.backgroundImage = 'linear-gradient(45deg, rgb(' + lessOne + ',' + lessTwo + ',' + lessThree + '), rgb(' + one + ',' + two + ',' + three + '), rgb(' + moreOne + ',' + moreTwo + ',' + moreThree + '))'


	// feature: opacity
	// cost_attractiveness = Math.max(cheapest/d.preis || 0.6, 0.6);
	attractiveness = d.dauer_in_minuten/d.preis;
	// bar.first().style.opacity = cost_attractiveness;

	if (html_bar_overflown(bar)) any_bar_overflow = true;
}

convert_unix_to_px = unix => {
	x = unix - earliest;
	rel_x = x / (latest - earliest);
	px = rel_x * BARS_WIDTH;
	return Math.round(px*10)/10;
}

html_bar_overflown = bar => {
	overflown = false;
	bar.find('div').each(element => {
		if ((bar.size().right + 1) < u(element).size().right) overflown = true;
	});
	return overflown;
}

format_dauer = dauer => {
  // h = Math.floor(mins / 60);
  // m = mins % 60;
  // h = h < 10 ? '0' + h : h;
  // m = m < 10 ? '0' + m : m;
  h = (dauer.h > 0 ? dauer.h+'h ' : '')
  min = dauer.min+'min';
  return h+min;
}

format_umsteigen = x => {
	if (isNaN(x)) return 'no info';
	return (x == 0) ? 'direkt' : `${x} mal umsteigen`;
}

format_preis = x => {
	if (isNaN(x)) return 'no info';
	return x+' EUR';
}

create_vertical_lines_for_days = () => {
	days = {};
	data.forEach(x => {
		// we can't go by x.Datum for uniqueness because sometimes
		// there are different x.Datum's for one day
		// so we go by x_pos
		label = x.Datum;
		date = parse_german_date(x.Datum);
		time = {hour: 0, minute: 0};
		unix = date_time_to_unix(date, time);
		x_pos = convert_unix_to_px(unix);
		if (!days[x_pos]) {
			days[x_pos] = label;
		}
	});
	for (x_pos in days) {
		day_line = u('<div>').addClass('day_vertical_line');
		day_line.attr('style', `
			left: ${x_pos}px;
			`);
		day_line.append(u('<div>').addClass('day_text').text(days[x_pos]));
		// day_line.append(u('<div>').addClass('day_text').text(days[x_pos]));
		// day_line.append(u('<div>').addClass('day_text').text(days[x_pos]));

		u('#bars').append(day_line);
	}
	u('.day_vertical_line').each(e => u(e).first().style.height = u('#bars').size().height+'px')
}
