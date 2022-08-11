
setup_process_data = () => {
	retrieve_data_from_url_param();	
	process_data();
}

process_data = notused => {
	data = get_text2_data();
	data = add_data_from_text1(data);
	data = only_unique(data);
	data = data.map(process_verbindung);
	// feature: filter
	// filter_data(d => d.preis < 80);
	// date = {year:2022, month:7, day:30};
	// time = {hour:15, minute:0};
	// unix = date_time_to_unix(date, time);
	// filter_data(d => d.ankunft_unix < unix);

	// feature: sorting
	// sort_data('umsteigen');
	// sort_data('dauer_in_viertelstunden');
	sort_data('abfahrt_unix');
	sort_data('preis');
	sort_data('favorit');

	// feature: groups
	make_groups('preis');

	BARS_WIDTH = window.innerWidth * .95 || 500;
	display_data();	
	
	update_text2(data);
	update_share_link(data);

	// func = () => {
	// 	u('.bar').scroll();
	// }
	// setTimeout(func, 1*1000);
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
		// use hash as unique id
		d.hash = ''; // compute hash without old hash value if it did exist
		hash = hash_cyrb53(JSON.stringify(d));
		d.hash = hash; // save hash for later as id
		data_as_object[hash] = d;
	}
	return Object.values(data_as_object);
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
	
	// duration_in_minutes = (d.ankunft_unix - d.abfahrt_unix) / 1000 / 60;
	// duration_in_minutes2 = d.dauer.h * 60 + d.dauer.min;
	// duration_in_minutes === duration_in_minutes2;

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

make_groups = key => {
	key_for_groups = key;
	groups = [];
	data.forEach(d => {
		label = group_label(d);
		if (!groups.includes(label)) groups.push(label);
	});
}

group_label = d => {
	return key_for_groups+'-'+d[key_for_groups];
}

hash_cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

retrieve_data_from_url_param = () => {
	params = new URLSearchParams(location.search);
	url_data_txt = params.get('data');
	if (url_data_txt) {
		data_txt = LZString.decompressFromEncodedURIComponent(url_data_txt);
		data = JSON.parse(data_txt);
		// data_txt = JSON.stringify(data, null, 1);
		// data = JSON.parse(data_txt);
		update_text2(data);
	}
}

update_share_link = data => {
	data_txt = JSON.stringify(data, null, 1);
	base64encoded = LZString.compressToEncodedURIComponent(data_txt);

	url = new URL(window.location.href);
	url.searchParams.set('data', base64encoded);

	u('#share')
	.text('Link für genau diese Ansicht')
	.attr('href', url);
}

setup_process_data();
