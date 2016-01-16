/// <reference path="Engine.ts" />
var SRC = 'assets/test_package_grass';
var MAPSRC = 'assets/map_courtyard_grass.json'
var pack;
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

function locationRequestListener() {
	var packJson = JSON.parse(this.responseText);
	getTextureLocations(packJson);
}

function mapRequestListener() {
	map = JSON.parse(this.responseText);
}

function getTextureLocations(pixel_locs) {
	pack = {};
	var total_width = pixel_locs['meta']['size']['w'];
	var total_height = pixel_locs['meta']['size']['h'];
	pack["packHeight"] = total_height;
	pack["packWidth"] = total_width;
	/*for (var key in pixel_locs['frames']) {
		var key_array = key.split('_');
		*/
	//console.log(pixel_locs['frames'][0]['filename']);
	for (var i = 0; i < pixel_locs['frames'].length; i++) {
		var key = pixel_locs['frames'][i]['filename'];
		var key_array = key.split('_');
		var pattern = key_array[0];
		var surface_perspective = key_array[1] + "_" + key_array[2].split('.')[0];
		if (!pack.hasOwnProperty(pattern)) {
			pack[pattern] = {};
		}
		if (!pack[pattern].hasOwnProperty(surface_perspective)) {
			pack[pattern][surface_perspective] = {};
		}
		/*
		pack[pattern][surface_perspective]['h'] = pixel_locs['frames'][key]['sourceSize']['h']/total_height
		pack[pattern][surface_perspective]['w'] = pixel_locs['frames'][key]['sourceSize']['w']/total_width
		pack[pattern][surface_perspective]['y'] = pixel_locs['frames'][key]['frame']['y']/total_height
		pack[pattern][surface_perspective]['x'] = pixel_locs['frames'][key]['frame']['x']/total_width*/
		pack[pattern][surface_perspective]['h'] = pixel_locs['frames'][i]['sourceSize']['h']/total_height
		pack[pattern][surface_perspective]['w'] = pixel_locs['frames'][i]['sourceSize']['w']/total_width
		pack[pattern][surface_perspective]['y'] = pixel_locs['frames'][i]['frame']['y']/total_height
		pack[pattern][surface_perspective]['x'] = pixel_locs['frames'][i]['frame']['x']/total_width
	}
}

function run() {
	edgy = new engine.Engine();
	edgy.load("gameport");
}

