/// <reference path="helpers.ts" />
var pack;

if (document.getElementById("gameport")) {
	var SRC = 'assets/painted_pack';
	var MAPSRC = 'assets/map_courtyard_painted.json'	
	var map;
	var edgy;
	
	// run program when everything loads
	window.onload = run;
	
	// grab the json files for conversion
	var request = new XMLHttpRequest();
	request.onload = locationRequestListener;
	request.overrideMimeType("application/json");
	request.open("get", SRC + '.json', true);
	request.send();
	
	var mapRequest = new XMLHttpRequest();
	mapRequest.onload = mapRequestListener;
	mapRequest.overrideMimeType("application/json");
	mapRequest.open("get", MAPSRC, true);
	mapRequest.send();
} 

