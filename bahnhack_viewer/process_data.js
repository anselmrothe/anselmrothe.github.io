
setup_process_data = () => {
	retrieve_data_from_url_param();	
	process_data();
}

process_data = notused => {
	data = get_text2_data();
	data = add_data_from_text1(data);
	data = data.map(process_verbindung);
	data = only_unique(data);
	// feature: filter
	// filter_data(d => d.preis < 80);

	// feature: sorting
	// sort_data('umsteigen');
	// sort_data('dauer_in_viertelstunden');
	sort_data('abfahrt_unix');
	sort_data('preis');
	sort_data('favorit');

	// feature: groups
	make_groups('preis', format_preis);

	BARS_WIDTH = window.innerWidth * .95 || 500;
	display_data();
	
	update_text2(data);
	update_share_link(data);
}

get_text2_data = () => {
	data = [];
	txt = u('#text2').first().value;
	if (txt.length) {
		data_t2 = JSON.parse(txt);
		data = data.concat(data_t2);
	}
	return data;
}

add_data_from_text1 = data => {
	txt = u('#text1').first().value;
	if (txt.length) {
		data_t1 = JSON.parse(txt);
		data = data.concat(data_t1);
		u('#text1').first().value = '';
	}
	return data;
}

update_text2 = data => {
	data_txt = JSON.stringify(data, null, 1);
	u('#text2').first().value = data_txt;
}

only_unique = data => {
	data_as_object = {};
	for (d of data) {
		dna = compute_dna(d);
		data_as_object[dna] = d;
	}
	return Object.values(data_as_object);
}

compute_dna = d => {
	values = ['Von', 'Nach', 'abfahrt_unix', 'ankunft_unix', 'preis', 'umsteigen'].map(e => d[e]);
	str = values.join(', ');
	return str;
}

process_verbindung = d => {
	date = parse_german_date(d.Datum);
	time = parse_time(d.Abfahrt);
	d.abfahrt_unix = date_time_to_unix(date, time);
	d.abfahrt_str = d.Abfahrt

	d.dauer = parse_dauer(d.Dauer);
	d.dauer_in_minuten = d.dauer.in_minutes; // un-nested entry we can use for sorting
	d.dauer_in_viertelstunden = Math.round(d.dauer.in_minutes/15); // un-nested entry we can use for sorting
	
	time2 = time;
	time2.hour += d.dauer.h;
	time2.minute += d.dauer.min;
	d.ankunft_unix = date_time_to_unix(date, time2); // takes care of 62 min -> 1 hour 2min etc.
	d.ankunft_str = d.Ankunft;
	
	d.preis = parse_preis(d.Preis);
	d.umsteigen = parse_umsteigen(d.Umstiege);

	// if it doesn't have any, add status 
	('status' in d) || (d.status = 'normal');

	return d;
}

parse_german_date = x => {
	y = x.split('.');
	day = parseInt(y[0].split(',').pop());
	month = parseInt(y[1]);
	year = parseInt(y[2]);
	if (year < 100) year += 2000;
	return {year, month, day};
}

parse_time = x => {
	y = x.split(':');
	hour = parseInt(y[0]);
	minute = parseInt(y[1]);
	return {hour, minute};
}

date_time_to_unix = (date, time) => {
	// only work with Date() to get the int to compare datetime differences
	// Date() needs month - 1 // 
	// Date() doesn't really work with timezones // https://stackoverflow.com/a/15171030
	// so the hour in js_date will probably be shifted, not a problem here because we will only compare datetime differences that will all have the same hour shift
	// for timezone sensitive display one can use .toLocaleString('de') // https://stackoverflow.com/a/63160519
	// but we will only use the int
	// also Date() takes care of 62 min -> 1 hour 2 min etc.
	js_date = new Date(date.year, date.month - 1, date.day, time.hour, time.minute);
	int = Number(js_date);
	return int;
}

parse_dauer = x => {
	y = x.replace('|', '').split(' ');
	h = parseInt(y[0]);
	min = parseInt(y[1]);
	in_minutes = h*60 + min;
	return {h, min, in_minutes};
}

parse_preis = x => {
	y = x.replace('ab', '').replace(',', '.').replace('€', '').trim();
	if (y.includes('Teilstreckenpreis')) y = 'no info';
	return Math.ceil(parseFloat(y));
}

parse_umsteigen = x => {
	y = x.replace('Umstiege', '').trim();
	return parseInt(y);
};

filter_data = fun => {
	data = data.filter(fun);
}

sort_data = key => {
	data.sort((a, b) => {
		x = isNaN(a[key]) ? Infinity : a[key];
		y = isNaN(b[key]) ? Infinity : b[key];
		return x - y;
	});
}

make_groups = (key, format_group_label) => {
	get_group_id = d => key+'-'+d[key];
	get_group_label = d => format_group_label(d[key]);
	groups = {};
	data.forEach(d => {
		group_id = get_group_id(d);
		group_label = get_group_label(d);
		groups[group_id] = group_label;
	});
}

retrieve_data_from_url_param = () => {
	params = new URLSearchParams(location.search);
	url_data_txt = params.get('data');
	if (url_data_txt) {
		// data_txt = JSON.stringify(data, null, 1);
		data_txt = LZString.decompressFromEncodedURIComponent(url_data_txt);
		data = JSON.parse(data_txt);
		update_text2(data);
	}
}

update_share_link = data => {
	data_txt = JSON.stringify(data, null, 1);
	base64encoded = LZString.compressToEncodedURIComponent(data_txt);

	url = new URL(window.location.href);
	url.searchParams.set('data', base64encoded);

	u('#share')
	.text('Link for this display and data')
	.attr('href', url);
}

setup_process_data();
