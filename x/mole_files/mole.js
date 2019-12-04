// all js code for the mole experiment

main = function() {
	// main() is called in mturk.html
	window.setTimeout(function() {
		data = document.getElementById('data');
		data.value = 'abcabc';
	}, 2 * 1000);
}
