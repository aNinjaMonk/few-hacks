function measurePerformance(){
	var startTime = performance.now();
	var sum = 0;
	for(var i=0;i<100000;i++){
		for(var j=0;j<10000;j++){
				sum += j;
		}
	}
	var endTime = performance.now();
	console.log(`${(endTime - startTime)/1000}`);
}

//export default measurePerformance;
