
var rep = function(n, value) {
	if (n < 0) { n = 0; }
	return(Array.apply(null, new Array(n)).map(function(){return value}))
}

var days = function(date) {
	var minutes = 1000 * 60;
	var hours = minutes * 60;
	var days = hours * 24;
	var t = date.getTime();
	var date_days = Math.round(t / days);
	return(date_days)
}

// var d_start = new Date(2014, 9, 2);
// var d_today = new Date();
// var d_end   = new Date(2021, 5, 31);

// var so_far  = days(d_today) - days(d_start);
// var to_come = days(d_end)   - days(d_today);

// var data = rep(so_far, ".").concat(rep(to_come, 1));

var timeline = function() {

	var data_to_d3 = function() {
		// Update…
		var sel = d3.select("#timeline").selectAll(".d")
		    .data(data)
		    .text(String);
		// Enter…
		sel.enter().append("div")
			.attr("class","d")
			// .style("background-color", function(d) {
			// 	return("rgba(102, 51, 0, " + (d*0.005) + ")");
			// } )
			.style("color", function(d,i) {
				return("rgba(0,0,0, " + (i>(so_far+360)? 1/(Math.pow(10,-14)*Math.pow(i-(so_far+360), 5)) : 1) + ")");
			} )
		    .text(String);
		// Exit…
		sel.exit().remove();	
	}

	var create_year_integers = function() {
		var d_start = new Date(2014, 9, 2);
		var years = [2015, 2016, 2017, 2018, 2019, 2020]

		for (var i = 0; i < years.length; i++) {
			var d_next = new Date(years[i], 9, 2);
			var days_next  = days(d_next) - days(d_start);
			data = data.concat(rep(days_next, i+1));
			d_start = d_next;
		};
	}

	var create_dots_for_past = function() {
		var d_start = new Date(2014, 9, 2);
		var d_today = new Date();
		so_far  = days(d_today) - days(d_start);

		for (var i = 0; i < so_far; i++) {
			data[i] = ".";
		};
	}

	var data = [];

	create_year_integers();
	create_dots_for_past();
	data_to_d3();
}

timeline();

