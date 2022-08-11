// unit tests

tests = [];
run_tests = () => {
	n = 0;
	for (let i = 0; i < tests.length; i++) {
		x = tests[i];
		if (typeof x === 'function') {
			x_str = x.toString().toString().split('=>')[1].trim();
			try {
				result = x();
			} catch (error) {
				result = error;
			}
			if (result == true) { // exact comparison to 'true' is necessary here
				n++;
			} else {
				console.log(`[${result}] ${x_str}`);
			}
		}
	}
	console.log(`Tests: ${n} of ${tests.length} ok.`);
}

tests.push(
	() => parse_german_date('04.05.2022').day === 4
);
tests.push(
	() => parse_german_date('04.05.2022').month === 5
);
tests.push(
	() => parse_german_date('04.05.2022').year === 2022
);
tests.push(
	() => parse_german_date('04.05.22').year === 2022
);
tests.push(
	() => parse_german_date('Dienstag, 26.07.22').day === 26
);
tests.push(
	() => parse_german_date('Dienstag, 26.07.22').month === 7
);
tests.push(
	() => parse_german_date('Dienstag, 26.07.22').year === 2022
);
tests.push(
	() => parse_time('04:19').hour === 4
);
tests.push(
	() => parse_time('04:19').minute === 19
);
tests.push(
	() => date_time_to_unix({year: 2022, month: 5, day: 4}, {hour: 4, minute: 19}) === 1651630740000
);
tests.push(
	() => {
		a = date_time_to_unix({year: 2022, month: 5, day: 4}, {hour: 4, minute: 20})
		b = date_time_to_unix({year: 2022, month: 5, day: 4}, {hour: 4, minute: 19})
		return (a - b) === (60000); // 60 * 1000 milliseconds
	}
);
tests.push(
	() => parse_dauer('|6h 43min').h === 6
);
tests.push(
	() => parse_dauer('|6h 43min').min === 43
);
tests.push(
	() => parse_dauer('6h 43min').h === 6
);
tests.push(
	() => parse_preis('ab 67,90 €') === 68
);
tests.push(
	() => parse_preis('ab 67,10 €') === 68
);
tests.push(
	() => parse_preis('ab 68 €') === 68
);
tests.push(
	() => parse_preis('ab 68') === 68
);
tests.push(
	() => parse_preis('68 €') === 68
);
tests.push(
	() => parse_umsteigen('0 Umstiege') === 0
);
tests.push(
	() => parse_umsteigen('1 Umstiege ') === 1
);
tests.push(
	() => format_dauer({h: 1, min: 1}) === '1h 1min'
);
tests.push(
	() => format_dauer({h: 0, min: 1}) === '1min'
);
tests.push(
	() => format_dauer({h: 0, min: 65}) === '65min'
);




run_tests();