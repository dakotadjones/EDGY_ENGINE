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
        Player.prototype.getCoordinates = function () {
            return this.x + ',' + this.y;
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
            this.id = id;
            this.texturePack = new Image();
            this.texturePack.src = SRC + '.png';
            this.texturePack.crossOrigin = 'anonymous';
            this.texturePack.onload = function () { e.init(); };
        };
        Engine.prototype.init = function () {
            var e = this;
            e.canvas = document.getElementById(e.id);
            e.gl = e.canvas.getContext('webgl');
            var shader = new utils.Shader(e.gl);
            shader.getShader('shader-fs');
            shader.getShader('shader-vs');
            var shaderArray = [shader.fragmentShader, shader.vertexShader];
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
            e.loadBoxes();
            e.myPlayer = new player.Player();
        };
        Engine.prototype.loadBoxes = function () {
            console.log("loading boxes");
            for (var coord in map) {
                var x = coord.split(',')[0];
                var y = coord.split(',')[1];
                var box = new utils.Box(x, y, map[coord]);
                if (this.boxes === undefined) {
                    this.boxes = [];
                }
                if (this.boxes[x] === undefined) {
                    this.boxes[x] = [];
                }
                this.boxes[x].push(box);
            }
        };
        Engine.prototype.draw = function () {
            this.getPlayerPosition();
        };
        Engine.prototype.getPlayerPosition = function () {
            return this.myPlayer.getCoordinates();
        };
        return Engine;
    })();
    engine.Engine = Engine;
})(engine || (engine = {}));
function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2]), gl.STATIC_DRAW);
}
/// <reference path="Engine.ts" />
var SRC = 'assets/test_package';
var MAPSRC = 'assets/map.json';
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
request.onload = mapRequestListener;
request.open("get", MAPSRC, true);
request.send();
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
        pack[pattern][surface_perspective]['h'] = pixel_locs['frames'][key]['sourceSize']['h'] / total_height;
        pack[pattern][surface_perspective]['w'] = pixel_locs['frames'][key]['sourceSize']['w'] / total_width;
        pack[pattern][surface_perspective]['y'] = pixel_locs['frames'][key]['frame']['y'] / total_height;
        pack[pattern][surface_perspective]['x'] = pixel_locs['frames'][key]['frame']['x'] / total_width;
    }
}
function run() {
    edgy = new engine.Engine();
    edgy.load("gameport");
}
