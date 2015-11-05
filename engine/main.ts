/// <reference path="Engine.ts" />
var SRC = 'assets/test_package';
var pack;
var edgy;

window.onload = run;

var request = new XMLHttpRequest();
request.onload = locationRequestListener;
request.overrideMimeType("application/json")
request.open("get", SRC + '.json', true);
request.send();

function locationRequestListener() {
	var pack_json = JSON.parse(this.responseText);
	getTextureLocations(pack_json);
}

function getTextureLocations(pixel_locs) {
	pack = {};
	var total_width = pixel_locs['meta']['size']['w'];
	var total_height = pixel_locs['meta']['size']['h'];
	for (var key in pixel_locs['frames']) {
		var key_array = key.split('_');
		var pattern = key_array[0];
		var surface_perspective = key_array[1] + "_" + key_array[2].split('.')[0];
		if (!pack.hasOwnProperty(pattern)) {
			pack[pattern] = {};
		}
		if (!pack[pattern].hasOwnProperty(surface_perspective)) {
			pack[pattern][surface_perspective] = {};
		}
		pack[pattern][surface_perspective]['h'] = pixel_locs['frames'][key]['sourceSize']['h']/total_height
		pack[pattern][surface_perspective]['w'] = pixel_locs['frames'][key]['sourceSize']['w']/total_width
		pack[pattern][surface_perspective]['y'] = pixel_locs['frames'][key]['frame']['y']/total_height
		pack[pattern][surface_perspective]['x'] = pixel_locs['frames'][key]['frame']['x']/total_width
	}
	
}

function run() {
	edgy = new engine.Engine();
	edgy.load("gameport");
}

