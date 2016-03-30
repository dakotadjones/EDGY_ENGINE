// mapgen.js
//var mapgrid = document.getElementById("");
/// <reference path="helpers.ts" />
var checkedDirectory = false;
var c = document.getElementById("map");
var ctx = c.getContext("2d");
var square = 20;
var map; // JSON containing your new map :) 
var mapHeight;
var mapWidth;

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
					if ($("#uploaded-file-json").val().length) {
						$("#parse").show();
					}
				}
				
       });
}

function hideChoices(id, callback) {
	$(id).hide("slide", 500);
	if (typeof callback !== 'undefined') {
		 setTimeout(callback, 500);
	}
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
	var json = JSON.stringify(pack);
	var encoded = btoa(json);
	var xhr = new XMLHttpRequest();
	xhr.open('POST','scripts/savepack.php',true);
	xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	xhr.send('json=' + encoded + "&filename=" + filename);
}


function drawBaseMap(width, height) {
	ctx.restore();
	for (var h = 0; h < height; h++) {
		for (var w = 0; w < width; w++) {
			ctx.rect(h*square, w*square, square, square);
		}
	}
	ctx.stroke();
	// clear bigger squares if they're there
	ctx.clearRect(width*square, 0, c.width, c.height);
	ctx.clearRect(0, height*square, c.width, c.height);

}

function destroyMap() {	
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.save();
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
	hideChoices("#upload-custom", function() { showChoices("#map-options")});
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
	var w = parseInt($("#map-width").val());
	var h = parseInt($("#map-height").val());
	if (w <= c.width/square && h <= c.height/square && !(isNaN(w) || isNaN(h)) ) {
		drawBaseMap(w, h);
		setMapDimensions(w, h);
	} else {
		alert("Invalid dimensions");
	}
})

$("#clear").click(destroyMap);

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

function setMapDimensions(width, height) {
	mapWidth = width*square;
	mapHeight = height*square;
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
	
	drawSelectedMap(l, t, totalWidth, totalHeight);
	
    $(".ghost-select").removeClass("ghost-active");
    $(".ghost-select").width(0).height(0);
	
}

function drawSelectedMap(x, y, w, h) {
	if (w > square && h > square) {
		var cx = Math.ceil(x/square) * square;
		var cy = Math.ceil(y/square) * square;
		var cw = Math.floor(Math.abs(w/square)) * square;
		var ch = Math.floor(Math.abs(h/square)) * square;
		
		if ((cx+cw) > mapWidth) { cw = mapWidth-cx; }
		if ((cy+ch) > mapHeight) { ch = mapHeight-cy; }
		
		ctx.clearRect(cx, cy, cw, ch);
		ctx.fillStyle = "red";
		ctx.fillRect(cx, cy, cw, ch);
	}
}
