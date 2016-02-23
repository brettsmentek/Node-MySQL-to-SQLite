function logger(text) {
	atomicLogger(text);
	function atomicLogger(text) {
		console.log(text);
	}
}

logger('Log this');