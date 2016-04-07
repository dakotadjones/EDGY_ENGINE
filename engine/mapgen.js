/* global key */
// mapgen.js
//var mapgrid = document.getElementById("");
/// <reference path="helpers.ts" />
var checkedDirectory = false;
var c = document.getElementById("map");
var ctx = c.getContext("2d");

var gridColor = "#919191"
var definedColor = "#a6a6a6";
var fullyDefinedColor = "#aedba4";
var fullyDefinedStroke = "#5db649";
var selectColor = "#ED686E";
var darkSelect = "#8F383C";
var selectStroke = "#6e2b2e" 
var wallColor = "#4d4d4d";
var selectedWallColor = "#5c2427";

ctx.strokeStyle = gridColor;
ctx.lineWidth = 2;
var square = 20;

// user defined
var devPackChosen;
var uploadPackName;

var map; // JSON containing your new map :) 

var currCoords = [];

function uploadJson() {
	var json_file_data = $("#json").prop("files")[0];
	var form_data = new FormData();// Creating object of FormData class
	form_data.append("file", json_file_data) // Appending parameter named file with properties of file_field to form_data
	$.ajax({
                url: "scripts/upload.php",
                dataType: 'json',
                cache: false,
                contentType: false,
                processData: false,
                data: form_data, // Setting the data attribute of ajax with file_data
                type: 'post',
				complete: function(data) {
					$("#uploaded-file-json").val(data.responseText);
					if ($("#uploaded-file-png").val().length) {
						$("#parse").show();
					}
				}
       });

}

function uploadPng() {
	var png_file_data = $("#png").prop("files")[0];
	var form_data = new FormData();// Creating object of FormData class
	form_data.append("file", png_file_data) // Appending parameter named file with properties of file_field to form_data
	$.ajax({
                url: "scripts/upload.php",
                cache: false,
                contentType: false,
                processData: false,
                data: form_data, // Setting the data attribute of ajax with file_data
                type: 'post',
				complete: function(data) { 
					$("#uploaded-file-png").val(data.responseText);
					if ($("#uploaded-file-json").val().length) { $("#parse").show(); }
				}
				
       });
}

function hideChoices(id, callback) {
	$(id).hide("slide", 500);
	if (typeof callback !== 'undefined') { setTimeout(callback, 500);}
}

function showChoices(id) {
	$(id).show("slide", 500);
}

function getDevOptions() {
	$.ajax({
                url: "scripts/getdev.php",
                dataType: 'json',
                type: 'post',
				complete: function(data) { 
					var json = data.responseJSON
					for (var key in json) {
						var filename = json[key];
						$("#developer-choices").append("<button id='"+filename+"'>" + filename + "</button><br>");
					}
					 if ($("#upload-custom").is(":visible")) { hideChoices("#upload-custom", function() { showChoices("#developer-choices") });  }
					 else { showChoices("#developer-choices"); }
					 checkedDirectory = true;
				}
       });
}

function savePack(filename) {
	// should have the new "pack" object now, overwrite it in the file so that the engine can use it later
	/*
	var json = JSON.stringify(pack);
	var encoded = btoa(json);
	var xhr = new XMLHttpRequest();
	xhr.open('POST','scripts/savepack.php',true);
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	xhr.send('json=' + encoded + "&filename=" + filename);
	*/
	hideChoices("#choose", function() {showChoices("#tile-pattern-panel"); showChoices("#map-options"); showChoices("#coordinate-info-box")})
}

function drawBaseMap(width, height) {
	if (map === undefined) { map = {"player":{"x":1,"y":1,"facing":"east"}, "characters":[]}; }	
	for (var h = 1; h <= height; h++) {
		for (var w = 1; w <= width; w++) {
			var coord = w.toString()+","+h.toString();
			
			if (!map.hasOwnProperty(coord)) { map[coord] = {"ceil":null,"floor":null,"north":null,"south":null,"east":null,"west":null}; } 
			if(map.player.x == w && map.player.y == h) { drawPlayer(w, h); }
			
			ctx.rect(w*square, h*square, square, square);
		}
	}
	ctx.strokeStyle = gridColor;
	ctx.lineWidth = 2;
	ctx.stroke();
	
	ctx.clearRect(0, (height*square)+square+1, c.height-(height*square), c.width);
	ctx.clearRect((width*square)+square+1, 0, c.width-(width*square), c.height);
}

function drawPlayer(x, y) {
	ctx.fillStyle="black"; 
	ctx.fillRect(x*square, y*square, square, square); 
}

function drawDefined(x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x*square,y*square,square,square);
}

function drawWalls(x, y, walls, color) {
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.beginPath();
	for (var w in walls) {
		switch(walls[w]) {
			case "north":
				ctx.moveTo(x*square, y*square+1);
				ctx.lineTo(x*square + square, y*square+1)
				break;
			case "south":
				ctx.moveTo(x*square, (y*square+square)-1);
				ctx.lineTo(x*square + square, (y*square+square)-1)
				break;
			case "east":
				ctx.moveTo((x*square + square)-1, y*square);
				ctx.lineTo((x*square + square)-1, (y*square +square));
				break;
			case "west":
				ctx.moveTo(x*square+1, (y*square));
				ctx.lineTo(x*square+1, (y*square + square));
				break;
		}
	}
	ctx.stroke();
	
}

function destroyMap() {	
	ctx.clearRect(0, 0, c.width, c.height);
}

function openSelector(e) {
	
	var w = Math.abs(initialW - e.offsetX);
    var h = Math.abs(initialH - e.offsetY);

    $(".ghost-select").css({
        'width': w,
        'height': h
	});
	
	endX = e.offsetX;
	endY = e.offsetY;
	
	$(".ghost-select").css({
      'left': Math.min(e.offsetX, initialW),
      'top': Math.min(e.offsetY, initialH)
    });	
}

$("#map").mousemove(function(e) {
	var cx = Math.ceil(e.offsetX/square)-1;
	var cy = Math.ceil(e.offsetY/square)-1;
	var coord = cx.toString()+","+cy.toString();
	$("#coordinate-info").val(coord);
	if (map !== undefined && map[coord] !== undefined) {
		if (map[coord]["north"]) { $("#north-info").val(map[coord]["north"]); }
		else { $("#north-info").val("Null"); }
		if (map[coord]["south"]) { $("#south-info").val(map[coord]["south"]); }
		else { $("#south-info").val("Null"); }
		if (map[coord]["east"]) { $("#east-info").val(map[coord]["east"]); }
		else { $("#east-info").val("Null"); }
		if (map[coord]["west"]) { $("#west-info").val(map[coord]["west"]); }
		else { $("#west-info").val("Null"); }
		if (map[coord]["ceil"]) { $("#ceiling-info").val(map[coord]["ceil"]); }
		else { $("#ceiling-info").val("Null"); }
		if (map[coord]["floor"]) { $("#floor-info").val(map[coord]["floor"]); }
		else { $("#floor-info").val("Null"); }
	}
	
})

function selectElements() {
    $("#map").unbind("mousemove", openSelector);
    $("#map").unbind("mouseup", selectElements);

	// top left corner of the drawn box
	var l = Math.min(initialW, endX);
	var t = Math.min(initialH, endY);
	
	// opposite corner
	var w = Math.max(initialW, endX);
	var h = Math.max(initialH, endY);
	
	// dimensions of drawn box
	var totalHeight = Math.abs(t-h);
	var totalWidth = Math.abs(l-w);
	
	if (!recentlyCleared) {
		drawSelectedMap(l, t, totalWidth, totalHeight);
	}
    $(".ghost-select").removeClass("ghost-active");
    $(".ghost-select").width(0).height(0);
}

function resetPatterns() {
	$(".tileRep.selectedTile").removeClass("selectedTile");
	$("#apply-pattern").addClass("greyed");
}

function setCurrentSelectedCoord(x, y, id) {
	if (!$(id).text().length) {	$(id).append("Selected Coords (x, y)<br>"); }
	$(id).append(x.toString() +",\t\t"+ y.toString() + "<br>")
	currCoords.push(x.toString()+","+y.toString());
}

function eraseLastSelection(x,y,w,h) {
	ctx.clearRect(x,y,w,h);
	ctx.strokeStyle = gridColor;
	ctx.lineWidth = 2;
	for (var i = x; i < x+w; i+=square) {
			for (var j = y; j < h+y; j+=square) {
				var sx = i/square;
				var sy = j/square; 
				if (floorAndCeilNotNull(map[sx.toString()+","+sy.toString()])) { 
					ctx.strokeStyle = fullyDefinedStroke;
					drawDefined(sx, sy, fullyDefinedColor); 
				}
				else if (floorNotNull(map[sx.toString()+","+sy.toString()]) || ceilingNotNull(map[sx.toString()+","+sy.toString()])) { 
					ctx.strokeStyle = gridColor;
					drawDefined(sx, sy, definedColor); 
				} else {
					ctx.strokeStyle = gridColor;
				}
				
				if (map.player.x == sx && map.player.y == sy) { drawPlayer(sx, sy); }				
				ctx.strokeRect(i, j, square, square);
			}
	}
	
	for (var k = x-square; k < x+w+1; k+=square) {
			for (var m = y-square; m < h+y+1; m+=square) {
				var kx = k/square;
				var my = m/square; 		
				var wallsToDraw = getWalls(map[kx.toString()+","+my.toString()]);
				if (wallsToDraw.length > 0) { drawWalls(kx, my, wallsToDraw, wallColor); }
			}
	}
	
}

var lastRect;
function drawSelectedMap(x, y, w, h) {
	resetPatterns();
	var uw = parseInt($("#map-width").val());
	var uh = parseInt($("#map-height").val());
	
	if (w > square && h > square && uw && uh) {
		
		var cx = Math.ceil(x/square) * square;
		var cy = Math.ceil(y/square) * square;
		var cw = Math.floor(Math.abs(w/square)) * square;
		var ch = Math.floor(Math.abs(h/square)) * square;
		
		if ((cx+cw) > uw*square) { cw = (uw*square)-cx + square; }
		if ((cy+ch) > uh*square) { ch = (uh*square)-cy + square; }
		if (cx == 0) cx = square;
		if (cy == 0) cy = square;
		
		// optimize
		if (lastRect !== undefined) { eraseLastSelection(lastRect.x, lastRect.y, lastRect.w, lastRect.h); }
		ctx.clearRect(cx, cy, cw, ch);
		ctx.fillStyle = selectColor;
		ctx.fillRect(cx, cy, cw, ch);
		$("#selected-boxes").empty();
		currCoords = [];
		
		for (var i = cx; i < cw+cx; i+=square) {
			for (var j = cy; j < ch+cy; j+=square) {
				var sx = i/square;
				var sy = j/square; 
				if (floorNotNull(map[sx.toString()+","+sy.toString()]) || ceilingNotNull(map[sx.toString()+","+sy.toString()])) { drawDefined(sx, sy, darkSelect); }
				if (map.player.x == sx && map.player.y == sy) {	drawPlayer(sx, sy); }
				setCurrentSelectedCoord(sx, sy, "#selected-boxes");				
				
				ctx.strokeStyle = selectStroke;
				ctx.lineWidth = 1;
				ctx.strokeRect(i, j, square, square);
				
				var wallsToDraw = getWalls(map[sx.toString()+","+sy.toString()]);
				if (wallsToDraw.length > 0) { drawWalls(sx, sy, wallsToDraw, selectedWallColor);}
			}
		}

		lastRect = {"x":cx, "y":cy, "w":cw, "h":ch};
	}
}

function isDefined(element, index, array) {
	return element !== undefined; 
}

function floorNotNull(coordObj) {
	return coordObj["floor"] != null;
}

function ceilingNotNull(coordObj) {
	return coordObj["ceil"] != null;
}

function floorAndCeilNotNull(coordObj) {
	return ceilingNotNull(coordObj) && floorNotNull(coordObj);
}

function getWalls(coordObj) {
	var walls = [];
	if (coordObj !== undefined) {
		if (coordObj["north"] != null) { walls.push("north"); } 
		if (coordObj["south"] != null) { walls.push ("south"); } 
		if (coordObj["east"] != null) { walls.push("east"); }
		if (coordObj["west"] != null) { walls.push("west"); }
	}
	return walls;
}



function getAvailablePatterns(packJson) {
	var rObj = {"ceilings":[], "floors":[], "walls":[] };
	for (key in packJson) {
		if($.inArray(key, ["thing","packHeight","packWidth","black"]) == -1) {
			
			if ([packJson[key]["front_center"],packJson[key]["front_right"],packJson[key]["left_center"],packJson[key]["left_left"],packJson[key]["right_center"],packJson[key]["right_right"]].every(isDefined)) {
				rObj["walls"].push(key)
			}
			if ([packJson[key]["floor_center"],packJson[key]["floor_right"],packJson[key]["floor_left"]].every(isDefined)) {
				rObj["floors"].push(key);
			}
			if ([packJson[key]["ceiling_center"],packJson[key]["ceiling_right"],packJson[key]["ceiling_left"]].every(isDefined)) {
				rObj["ceilings"].push(key);
			}
		}
	}
	return rObj;
}

$("#use-edgy").click( function() { 
	if(!checkedDirectory) {
		getDevOptions();
	} else if ($("#upload-custom").is(":visible")) { hideChoices("#upload-custom", function() { showChoices("#developer-choices") });  }
});

$("#upload-your-own").click( function() { 
	if ($("#developer-choices").is(":visible")) { hideChoices("#developer-choices", function(){	showChoices("#upload-custom");}); }
	else { 	showChoices("#upload-custom"); }
});

$("#parse").click( function() {
	hideChoices("#upload-custom", function() { showChoices("#map-options");});
	uploadPackName = $("#uploaded-file-json").val().split('.')[0];
	var json = $("#uploaded-file-json").val();
	var png = $("#uploaded-file-png").val();
	var request = new XMLHttpRequest();	
	request.onload = locationRequestListener;
	request.overrideMimeType("application/json");
	request.open("get", 'uploads/' +  json, true);
	request.send();
	request.addEventListener("load", function() { savePack(json) });
});

$("#map-size").click(function () {
	recentlyCleared = false;
	var w = parseInt($("#map-width").val());
	var h = parseInt($("#map-height").val());
	if (w <= c.width/square && h <= c.height/square && !(isNaN(w) || isNaN(h)) ) {
		drawBaseMap(w, h);
	} else {
		alert("Invalid dimensions");
	}
});

$("#move-player").click(function() {
	var w = parseInt($("#map-width").val());
	var h = parseInt($("#map-height").val());
	var x = parseInt($("#player-x").val());
	var y = parseInt($("#player-y").val());
	if (!(x<=w && y<=h && !(isNaN(x) || isNaN(y)))) {
		alert("Invalid location");
	} else if (map !== undefined && map.player !== undefined) {
		destroyMap();
		map.player.x = x;
		map.player.y = y;
		map.player.facing = $("#player-face").val();
		drawBaseMap(w,h);
	}
		
});

$("#developer-choices").on("click", "button", function() {
	devPackChosen = $(this).attr('id');
	hideChoices("#choose");
	hideChoices("#developer-choices", function() {showChoices("#tile-pattern-panel"); showChoices("#map-options"); showChoices("#coordinate-info-box")});
	
	var request = new XMLHttpRequest();
	request.onload = locationRequestListener;
	request.overrideMimeType("application/json");
	request.open("get", "assets/" + devPackChosen + '.json', true);
	request.send();
});

var recentlyCleared = false;
$("#clear").click(function() { 
	destroyMap(); 
	resetPatterns();
	recentlyCleared = true;
	map = {"player":{"x":1,"y":1,"facing":"east"}, "characters":[]};
});

var initialW, initialH;
var endX,endY;
$("#map").mousedown(function(e) {
        $(".ghost-select").addClass("ghost-active");
		
	    $(".ghost-select").css({
            'left': e.offsetX,
            'top': 	e.offsetY,
        });
        initialW = e.offsetX;
        initialH = e.offsetY;
        $("#map").bind("mouseup", selectElements); 
        $("#map").bind("mousemove", openSelector);
});


$(".tileRep").click(function() {
	var id = $(this).attr('id');
	$(this).addClass("selectedTile").siblings(".tileRep").removeClass("selectedTile");
	var availablePatterns = getAvailablePatterns(pack);
	if (currCoords.length > 0) $("#apply-pattern").removeClass("greyed");
	$("#package-options").html("<option value='null'>None</option>");
	switch(id) {
		case "north":
		case "south":
		case "west":
		case "east":
			$(availablePatterns.walls).each(function(i,v) {
				$("#package-options").append("<option value='"+v+"'>"+v+"</option>");			
			})
			break;
		case "floor":
			$(availablePatterns.floors).each(function(i,v) {
				$("#package-options").append("<option value='"+v+"'>"+v+"</option>");			
			})
			break;
		case "ceil":
			$(availablePatterns.ceilings).each(function(i,v) {
				$("#package-options").append("<option value='"+v+"'>"+v+"</option>");			
			})
			break;		
	}
});

$("#apply-pattern").click(function() {
	var surface = $(".tileRep.selectedTile").attr('id');
	var texture = $("#package-options").val();
	if (texture == "null") { texture = null; }
	if(!$(this).hasClass("greyed")) {
		for (var c in currCoords) {
			map[currCoords[c]][surface] = texture;
			
			// feedback after map changes
			if (floorNotNull(map[currCoords[c]]) || ceilingNotNull(map[currCoords[c]])) {
				var x = parseInt(currCoords[c].split(',')[0]);
				var y = parseInt(currCoords[c].split(',')[1]);
				drawDefined(x,y, darkSelect);
				ctx.strokeStyle = selectStroke;
				ctx.lineWidth = 1;
				ctx.strokeRect(x*square, y*square, square, square);
				
			} 
			else {
				var x = parseInt(currCoords[c].split(',')[0]);
				var y = parseInt(currCoords[c].split(',')[1]);
				drawDefined(x,y, selectColor);
				ctx.strokeStyle = selectStroke;
				ctx.lineWidth = 1;
				ctx.strokeRect(x*square, y*square, square, square);
			}
			if (map.player.x == x && map.player.y == y) { drawPlayer(x, y);}
			var wallsToDraw = getWalls(map[currCoords[c]]);
			if (wallsToDraw.length > 0) { drawWalls(x, y, wallsToDraw, selectedWallColor);}
		}
	}
});

$("#submit").click( function() {
	
	for (var i = 0; i <= $("#map-width").val(); i++ ){
		for (var j = 0; j <= $("#map-height").val(); j++) {
			var coord = i.toString()+","+j.toString();
			if (!map.hasOwnProperty(coord)) { map[coord] = {"ceil":null,"floor":null,"north":null,"south":null,"east":null,"west":null}; } 
		}
	}

	$("#map-json").val(JSON.stringify(map));
	if (devPackChosen !== undefined) {
		$("#user-or-dev").val("dev");
		$("#package-name").val(devPackChosen);
	} else if (uploadPackName !== undefined) {
		$("#user-or-dev").val("up");
		$("#package-name").val(uploadPackName);
	}
	$("#map-form").submit();
});