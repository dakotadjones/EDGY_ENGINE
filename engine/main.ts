
/// <reference path="helpers.ts" />
var pack;

if (document.getElementById("gameport")) {
	var SRC,MAPSRC,map;
	if (typeof map_json != 'undefined') {
		if (pack_type == "up") {
			SRC = 'uploads/';
		} else {
			SRC = 'assets/';
		} 
		SRC = SRC + pack_name;
		map = map_json;
	} else {
		SRC = 'assets/painted_pack';
		MAPSRC = 'assets/map_courtyard_grass.json'
	}	

	var edgy;
	
	// run program when everything loads
	window.onload = run;
	
	// grab the json files for conversion
	var request = new XMLHttpRequest();
	request.onload = locationRequestListener;
	request.overrideMimeType("application/json");
	request.open("get", SRC + '.json', true);
	request.send();
	
	if (MAPSRC !== undefined) {
		var mapRequest = new XMLHttpRequest();
		mapRequest.onload = mapRequestListener;
		mapRequest.overrideMimeType("application/json");
		mapRequest.open("get", MAPSRC, true);
		mapRequest.send();
	}
} 

