
function DATE(year, month , day) {
	return new Date(year, month-1, day); // 0 = January
}

function days(date) {
	var minutes = 1000 * 60;
	var hours = minutes * 60;
	var days = hours * 24;
	var t = date.getTime();
	var date_days = Math.round(t / days);
	return(date_days)
}

countdown = function() {
	var d_end = new DATE(2019, 7, 31);
	var d_today = new Date();
	days_left  = days(d_end) - days(d_today) + 1;
	text = String(days_left) + " days"
	document.getElementById('countdown').innerHTML = text;
}

countdown();

