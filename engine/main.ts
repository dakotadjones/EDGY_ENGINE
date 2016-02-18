/// <reference path="Engine.ts" />
var SRC = 'assets/package';
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

function addThing(thingInfo:JSON, itMoves:boolean) {
	var things = pack["thing"];
	var key_array = thingInfo["filename"].split('_');
	var name = key_array[1];
	var thing_perspective = key_array[2] + "_" + key_array[3].split('.')[0];
	if (!things.hasOwnProperty(name)) {
		things[name] = {};		
	}
	if (!things[name].hasOwnProperty(thing_perspective)) {
		things[name][thing_perspective] = {};
	}
	
	things[name][thing_perspective]['h'] = thingInfo['sourceSize']['h']/pack["packHeight"];
	things[name][thing_perspective]['w'] = thingInfo['sourceSize']['w']/pack["packWidth"];
	things[name][thing_perspective]['y'] = thingInfo['frame']['y']/pack["packHeight"];
	things[name][thing_perspective]['x'] = thingInfo['frame']['x']/pack["packWidth"];
	
}

function getTextureLocations(pixel_locs:JSON) {
	pack = {"thing":{}};
	var total_width = pixel_locs['meta']['size']['w'];
	var total_height = pixel_locs['meta']['size']['h'];
	pack["packHeight"] = total_height;
	pack["packWidth"] = total_width;
	
	for (var i = 0; i < pixel_locs['frames'].length; i++) {
		var key = pixel_locs['frames'][i]['filename'];
		var key_array = key.split('_');
		var pattern = key_array[0];
		if (pattern == "character") {
			addThing(pixel_locs['frames'][i], true);
			continue;
		}
		var surface_perspective = key_array[1] + "_" + key_array[2].split('.')[0];
		if (!pack.hasOwnProperty(pattern)) {
			pack[pattern] = {};
		}
		if (!pack[pattern].hasOwnProperty(surface_perspective)) {
			pack[pattern][surface_perspective] = {};
		}

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

