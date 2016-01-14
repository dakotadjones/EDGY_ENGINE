/*
 * Version 1.0
 * The box module keeps track of a basic map unit
 * The game map will be drawn using boxes
 * Each box has:
 * 	- 2 walls
 * 	- a floor
 *  - a ceiling
 * Each of the parts of a box can be represented using 1 (dungeon area) or 3 tiles (outside area)
 * Walls are always just 1 tile
 *
 * Box initial structure:
 * {
 * 	"ceiling":{},
 * 	"floor":{},
 * 	"north":{},
 * 	"east":{},
 * 	"south":{}
 * }
 * So, a box is just a bunch of textures that is rendered based on the user's view of it
 */
var utils;
(function (utils) {
    var Box = (function () {
        function Box(x, y, parts) {
            this.x = x;
            this.y = y;
            this.ceilingSurface = parts['ceil'];
            this.floorSurface = parts['floor'];
            this.northSurface = parts['north'];
            this.southSurface = parts['south'];
            this.eastSurface = parts['east'];
            this.westSurface = parts['west'];
        }
        Box.prototype.getPattern = function (surface) {
            switch (surface) {
                case "ceiling":
                    return this.ceilingSurface;
                    break;
                case "floor":
                    return this.floorSurface;
                    break;
                case "north":
                    return this.northSurface;
                    break;
                case "south":
                    return this.southSurface;
                    break;
                case "east":
                    return this.eastSurface;
                    break;
                case "west":
                    return this.westSurface;
                    break;
            }
        };
        return Box;
    })();
    utils.Box = Box;
})(utils || (utils = {}));
/*
 * Shader class that creates the programs for specified WebGL context
 */
var utils;
(function (utils) {
    var Shader = (function () {
        function Shader(gl) {
            this.gl = gl;
        }
        Shader.prototype.getShader = function (id) {
            var shaderSource;
            var shaderType;
            var shaderScript = document.getElementById(id);
            shaderSource = shaderScript.innerHTML;
            if (shaderScript.getAttribute('type') == 'x-shader/x-fragment') {
                shaderType = this.gl.FRAGMENT_SHADER;
                this.fragmentShader = this.loadShader(shaderSource, shaderType);
            }
            else if (shaderScript.getAttribute('type') == 'x-shader/x-vertex') {
                shaderType = this.gl.VERTEX_SHADER;
                this.vertexShader = this.loadShader(shaderSource, shaderType);
            }
        };
        Shader.prototype.loadShader = function (source, type) {
            var shader = this.gl.createShader(type);
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            var compiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
            if (!compiled) {
                var lastError = this.gl.getShaderInfoLog(shader);
                alert("Error compiling " + type + " shader");
                console.log("*** Error compiling shader '" + shader + "':" + lastError);
                this.gl.deleteShader(shader);
                return null;
            }
            return shader;
        };
        Shader.prototype.createProgram = function (shaders) {
            this.program = this.gl.createProgram();
            var s = this;
            shaders.forEach(function (shader) {
                s.gl.attachShader(s.program, shader);
            });
            this.gl.linkProgram(this.program);
            var linked = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);
            if (!linked) {
                var lastError = this.gl.getProgramInfoLog(this.program);
                alert("Error in program linking");
                console.log("Error in program linking:" + lastError);
                this.gl.deleteProgram(this.program);
                return null;
            }
            return this.program;
        };
        return Shader;
    })();
    utils.Shader = Shader;
})(utils || (utils = {}));
var player;
(function (player) {
    var Player = (function () {
        function Player(x, y, facing) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (facing === void 0) { facing = "east"; }
            this.x = x;
            this.y = y;
            this.facing = facing;
        }
        Player.prototype.setX = function (x) {
            this.x = x;
        };
        Player.prototype.setY = function (y) {
            this.y = y;
        };
        Player.prototype.setFacing = function (facing) {
            this.facing = facing;
        };
        Player.prototype.getFacing = function () {
            return this.facing;
        };
        Player.prototype.getCoordinates = function () {
            return [this.x, this.y];
        };
        return Player;
    })();
    player.Player = Player;
})(player || (player = {}));
/// <reference path="Shader.ts" />
/// <reference path="Box.ts" />
/// <reference path="Player.ts" />
var engine;
(function (engine) {
    var Engine = (function () {
        function Engine() {
        }
        Engine.prototype.load = function (id) {
            var e = this;
            e.myPlayer = new player.Player();
            this.id = id;
            this.texturePack = new Image();
            this.texturePack.src = SRC + '.png';
            this.texturePack.crossOrigin = 'anonymous';
            this.texturePack.onload = function () { e.init(); };
        };
        Engine.prototype.init = function () {
            var e = this;
            e.canvas = document.getElementById(e.id);
            e.cw = e.canvas.width;
            e.ch = e.canvas.height;
            e.gl = e.canvas.getContext('webgl');
            var shader = new utils.Shader(e.gl);
            shader.getShader('shader-fs');
            shader.getShader('shader-vs');
            var shaderArray = [shader.fragmentShader, shader.vertexShader];
            e.rectangle = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            e.program = shader.createProgram(shaderArray);
            e.gl.useProgram(e.program);
            e.positionLocation = e.gl.getAttribLocation(e.program, "a_position");
            e.texCoordLocation = e.gl.getAttribLocation(e.program, "a_texCoord");
            var texture = e.gl.createTexture();
            e.gl.bindTexture(e.gl.TEXTURE_2D, texture);
            e.gl.texParameteri(e.gl.TEXTURE_2D, e.gl.TEXTURE_WRAP_S, e.gl.CLAMP_TO_EDGE);
            e.gl.texParameteri(e.gl.TEXTURE_2D, e.gl.TEXTURE_WRAP_T, e.gl.CLAMP_TO_EDGE);
            e.gl.texParameteri(e.gl.TEXTURE_2D, e.gl.TEXTURE_MIN_FILTER, e.gl.NEAREST);
            e.gl.texParameteri(e.gl.TEXTURE_2D, e.gl.TEXTURE_MAG_FILTER, e.gl.NEAREST);
            e.gl.blendFunc(e.gl.SRC_ALPHA, e.gl.ONE_MINUS_SRC_ALPHA);
            e.gl.enable(e.gl.BLEND);
            e.positionBuffer = e.gl.createBuffer();
            e.texCoordBuffer = e.gl.createBuffer();
            e.gl.texImage2D(e.gl.TEXTURE_2D, 0, e.gl.RGBA, e.gl.RGBA, e.gl.UNSIGNED_BYTE, e.texturePack);
            e.resolutionLocation = e.gl.getUniformLocation(e.program, "u_resolution");
            e.loadBoxes();
            e.draw();
        };
        Engine.prototype.loadBoxes = function () {
            var e = this;
            for (var coord in map) {
                if (coord == "player") {
                    e.myPlayer.setX(map[coord]["x"]);
                    e.myPlayer.setY(map[coord]["y"]);
                    e.myPlayer.setFacing(map[coord]["facing"]);
                }
                else {
                    var x = coord.split(',')[0];
                    var y = coord.split(',')[1];
                    var box = new utils.Box(x, y, map[coord]);
                    if (e.boxes === undefined) {
                        e.boxes = [];
                    }
                    if (e.boxes[x] === undefined) {
                        e.boxes[x] = [];
                    }
                    e.boxes[x].push(box);
                }
            }
        };
        Engine.prototype.draw = function () {
            var start = new Date().getTime();
            var e = this;
            var xy = e.getPlayerPosition();
            var x = xy[0];
            var y = xy[1];
            var facing = e.getPlayerFacing();
            var getBoxesStart = new Date().getTime();
            var displayBoxes = e.getBoxes(facing, x, y);
            var getBoxesEnd = new Date().getTime();
            var drawBoxesStart = new Date().getTime();
            e.drawBoxes(displayBoxes, facing, x, y);
            var drawBoxesEnd = new Date().getTime();
            var end = new Date().getTime();
            console.log("draw() time");
            console.log(end - start);
            console.log("drawBoxes() time");
            console.log(drawBoxesEnd - drawBoxesStart);
            console.log("getBoxes() time");
            console.log(getBoxesEnd - getBoxesStart);
        };
        Engine.prototype.drawBoxes = function (boxes, facing, myX, myY) {
            var e = this;
            var absSurfaces = ["ceiling", "floor", "north", "south", "east", "west"];
            var opposites = ["floor", "ceiling", "south", "north", "west", "east"];
            var total_time = 0;
            var totalSetUpTexture = 0;
            var totalDrawSurface = 0;
            for (var i = 0; i < boxes.length; i++) {
                var box = boxes[i];
                var z;
                var relSurfaces;
                var leftRightCenter = null;
                switch (facing) {
                    case "north":
                        if (myX > box.x) {
                            leftRightCenter = "left";
                        }
                        else if (myX < box.x) {
                            leftRightCenter = "right";
                        }
                        else {
                            leftRightCenter = "center";
                        }
                        relSurfaces = ["ceiling", "floor", "front", "front", "right", "left"];
                        z = myY - box.y;
                        break;
                    case "east":
                        if (myY > box.y) {
                            leftRightCenter = "left";
                        }
                        else if (myY < box.y) {
                            leftRightCenter = "right";
                        }
                        else {
                            leftRightCenter = "center";
                        }
                        relSurfaces = ["ceiling", "floor", "left", "right", "front", "front"];
                        z = box.x - myX;
                        break;
                    case "south":
                        if (myX > box.x) {
                            leftRightCenter = "right";
                        }
                        else if (myX < box.x) {
                            leftRightCenter = "left";
                        }
                        else {
                            leftRightCenter = "center";
                        }
                        relSurfaces = ["ceiling", "floor", "front", "front", "left", "right"];
                        z = box.y - myY;
                        break;
                    case "west":
                        if (myY > box.y) {
                            leftRightCenter = "right";
                        }
                        else if (myY < box.y) {
                            leftRightCenter = "left";
                        }
                        else {
                            leftRightCenter = "center";
                        }
                        relSurfaces = ["ceiling", "floor", "right", "left", "front", "front"];
                        z = box.x - myX - 1;
                        break;
                }
                for (var j = 0; j <= relSurfaces.length; j++) {
                    var wasFrontFar = false;
                    var rsurface = relSurfaces[j];
                    var asurface = absSurfaces[j];
                    var pattern = box.getPattern(asurface);
                    if (pattern != null && facing != opposites[j]) {
                        var surface = rsurface + "_" + leftRightCenter;
                        var start = new Date().getTime();
                        var setUpTextureStart = new Date().getTime();
                        e.setUpTexture(pattern, surface);
                        var setUpTextureEnd = new Date().getTime();
                        totalSetUpTexture += setUpTextureEnd - setUpTextureStart;
                        var drawSurfaceStart = new Date().getTime();
                        e.drawSurface(z, pattern, surface);
                        var drawSurfaceEnd = new Date().getTime();
                        totalDrawSurface += drawSurfaceEnd - drawSurfaceStart;
                        var end = new Date().getTime();
                        total_time += end - start;
                    }
                }
            }
            console.log("second drawBoxes() loop time:");
            console.log(total_time);
            console.log("Total time to call setUpTexture():");
            console.log(totalSetUpTexture);
            console.log("Total time to call drawSurface():");
            console.log(totalDrawSurface);
        };
        Engine.prototype.getBoxes = function (facing, myX, myY) {
            var e = this;
            var displayBoxes = [];
            var order = [-1, 1, 0];
            switch (facing) {
                case "north":
                    for (var y = 3; y >= 0; y--) {
                        var rowNum = myY - y;
                        for (var x = 0; x < order.length; x++) {
                            var xx = myX + order[x];
                            var pos = xx.toString() + "," + rowNum.toString();
                            if (map.hasOwnProperty(pos)) {
                                displayBoxes.push(e.boxes[xx][rowNum]);
                            }
                        }
                    }
                case "south":
                    for (var y = 3; y >= 0; y--) {
                        var rowNum = myY + y;
                        for (var x = 0; x < order.length; x++) {
                            var xx = myX + order[x];
                            var pos = xx.toString() + "," + rowNum.toString();
                            if (map.hasOwnProperty(pos)) {
                                displayBoxes.push(e.boxes[xx][rowNum]);
                            }
                        }
                    }
                case "east":
                    for (var x = 3; x >= 0; x--) {
                        var colNum = myX + x;
                        for (var y = 0; y < order.length; y++) {
                            var yy = myY + order[y];
                            var pos = colNum.toString() + "," + yy.toString();
                            if (map.hasOwnProperty(pos)) {
                                displayBoxes.push(e.boxes[colNum][yy]);
                            }
                        }
                    }
                case "west":
                    for (var x = 3; x >= 0; x--) {
                        var colNum = myX - x;
                        for (var y = 0; y < order.length; y++) {
                            var yy = myY + order[y];
                            var pos = colNum.toString() + "," + yy.toString();
                            if (map.hasOwnProperty(pos)) {
                                displayBoxes.push(e.boxes[colNum][yy]);
                            }
                        }
                    }
            }
            return displayBoxes;
        };
        Engine.prototype.getPlayerPosition = function () {
            return this.myPlayer.getCoordinates();
        };
        Engine.prototype.getPlayerFacing = function () {
            return this.myPlayer.getFacing();
        };
        Engine.prototype.setUpTexture = function (pattern, surfaceType) {
            var e = this;
            var bufferStart = new Date().getTime();
            e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.texCoordBuffer);
            e.gl.enableVertexAttribArray(e.texCoordLocation);
            e.gl.vertexAttribPointer(e.texCoordLocation, 2, e.gl.FLOAT, false, 0, 0);
            var x = pack[pattern][surfaceType]["x"];
            var y = pack[pattern][surfaceType]["y"];
            var w = pack[pattern][surfaceType]["w"];
            var h = pack[pattern][surfaceType]["h"];
            setRectangle(e.gl, x, y, w, h, e.rectangle);
        };
        Engine.prototype.drawSurface = function (z, pattern, surfaceType) {
            var e = this;
            e.gl.uniform2f(e.resolutionLocation, e.cw, e.ch);
            e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.positionBuffer);
            e.gl.enableVertexAttribArray(e.positionLocation);
            e.gl.vertexAttribPointer(e.positionLocation, 2, e.gl.FLOAT, false, 0, 0);
            var s = e.ch - e.ch / 16;
            var zScale = Math.pow(2, z);
            switch (surfaceType) {
                case "left_center":
                    setRectangle(e.gl, e.cw / 2 - (s / (zScale)), e.ch / 2 - (s / (zScale)), s / (zScale * 2), 2 * s / (zScale), e.rectangle);
                    break;
                case "ceiling_center":
                    setRectangle(e.gl, e.cw / 2 - (s / (zScale)), e.ch / 2 - (s / (zScale)), 2 * s / zScale, s / (zScale * 2), e.rectangle);
                    break;
                case "floor_center":
                    setRectangle(e.gl, e.cw / 2 - (s / (zScale)), e.ch / 2 + (s / (zScale * 2)), 2 * s / zScale, s / (zScale * 2), e.rectangle);
                    break;
                case "right_center":
                    setRectangle(e.gl, e.cw / 2 + (s / (zScale * 2)), e.ch / 2 - (s / (zScale)), s / (zScale * 2), 2 * s / (zScale), e.rectangle);
                    break;
                case "front_center":
                    setRectangle(e.gl, e.cw / 2 - (s / (zScale * 2)), e.ch / 2 - (s / (zScale * 2)), s / zScale, s / zScale, e.rectangle);
                    break;
                case "left_left":
                    setRectangle(e.gl, e.cw / 2 - (3 * s / (zScale)), e.ch / 2 - (s / (zScale)), 3 * s / (zScale * 2), 2 * s / (zScale), e.rectangle);
                    break;
                case "front_left":
                    setRectangle(e.gl, e.cw / 2 - (3 * s / (zScale * 2)), e.ch / 2 - (s / (zScale * 2)), s / zScale, s / zScale, e.rectangle);
                    break;
                case "floor_left":
                    setRectangle(e.gl, e.cw / 2 - (3 * s / (zScale)), e.ch / 2 + (s / (zScale * 2)), 5 * s / (zScale * 2), s / (zScale * 2), e.rectangle);
                    break;
                case "ceiling_left":
                    setRectangle(e.gl, e.cw / 2 - (3 * s / (zScale)), e.ch / 2 - (s / (zScale)), 5 * s / (zScale * 2), s / (zScale * 2), e.rectangle);
                    break;
                case "right_right":
                    setRectangle(e.gl, e.cw / 2 + (3 * s / (zScale * 2)), e.ch / 2 - (s / (zScale)), 3 * s / (zScale * 2), 2 * s / (zScale), e.rectangle);
                    break;
                case "front_right":
                    setRectangle(e.gl, e.cw / 2 + (s / (zScale * 2)), e.ch / 2 - (s / (zScale * 2)), s / zScale, s / zScale, e.rectangle);
                    break;
                case "floor_right":
                    setRectangle(e.gl, e.cw / 2 + (s / (zScale * 2)), e.ch / 2 + (s / (zScale * 2)), 5 * s / (zScale * 2), s / (zScale * 2), e.rectangle);
                    break;
                case "ceiling_right":
                    setRectangle(e.gl, e.cw / 2 + (s / (zScale * 2)), e.ch / 2 - (s / (zScale)), 5 * s / (zScale * 2), s / (zScale * 2), e.rectangle);
                    break;
            }
            e.gl.drawArrays(e.gl.TRIANGLES, 0, 6);
        };
        return Engine;
    })();
    engine.Engine = Engine;
})(engine || (engine = {}));
function setRectangle(gl, x, y, width, height, buffer) {
    var setRectangleStart = new Date().getTime();
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    buffer[0] = x1;
    buffer[1] = y1;
    buffer[2] = x2;
    buffer[3] = y1;
    buffer[4] = x1;
    buffer[5] = y2;
    buffer[6] = x1;
    buffer[7] = y2;
    buffer[8] = x2;
    buffer[9] = y1;
    buffer[10] = x2;
    buffer[11] = y2;
    gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
}
/// <reference path="Engine.ts" />
var SRC = 'assets/test_package2';
var MAPSRC = 'assets/map_fourbythree.json';
var pack;
var map;
var edgy;
window.onload = run;
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
    console.log(pixel_locs['frames'][0]['filename']);
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
        pack[pattern][surface_perspective]['h'] = pixel_locs['frames'][i]['sourceSize']['h'] / total_height;
        pack[pattern][surface_perspective]['w'] = pixel_locs['frames'][i]['sourceSize']['w'] / total_width;
        pack[pattern][surface_perspective]['y'] = pixel_locs['frames'][i]['frame']['y'] / total_height;
        pack[pattern][surface_perspective]['x'] = pixel_locs['frames'][i]['frame']['x'] / total_width;
    }
}
function run() {
    edgy = new engine.Engine();
    edgy.load("gameport");
}
