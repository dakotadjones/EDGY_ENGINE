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
var utils;
(function (utils) {
    var Character = (function () {
        function Character(parts) {
            this.x = parts["x"];
            this.y = parts["y"];
            this.name = parts["name"];
            this.facing = parts["facing"];
            this.scale = parts["scale"];
        }
        Character.prototype.getFacing = function () {
            return this.facing;
        };
        Character.prototype.getName = function () {
            return this.name;
        };
        Character.prototype.getX = function () {
            return this.x;
        };
        Character.prototype.getY = function () {
            return this.y;
        };
        Character.prototype.getScale = function () {
            return this.scale;
        };
        Character.prototype.setFacing = function (facing) {
            this.facing = facing;
        };
        Character.prototype.setX = function (x) {
            this.x = x;
        };
        Character.prototype.setY = function (y) {
            this.y = y;
        };
        Character.prototype.update = function () {
            switch (name) {
                case "slenderman":
                    break;
            }
        };
        return Character;
    })();
    utils.Character = Character;
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
            this.lastFacing = "";
            this.lastX = 0;
            this.lastY = 0;
        }
        Player.prototype.getX = function () {
            return this.x;
        };
        Player.prototype.getY = function () {
            return this.y;
        };
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
/// <reference path="Character.ts" />
var engine;
(function (engine) {
    var Engine = (function () {
        function Engine(id) {
            var e = this;
            e.myPlayer = new player.Player();
            this.id = id;
            this.texturePack = new Image();
            this.texturePack.src = SRC + '.png';
            this.texturePack.crossOrigin = 'anonymous';
            this.texturePack.onload = function () { e.init(); };
        }
        Engine.prototype.init = function () {
            var e = this;
            e.canvas = document.getElementById(e.id);
            e.cw = e.canvas.width;
            e.ch = e.canvas.height;
            e.tileSizeRef = e.canvas.height - e.canvas.height / 16;
            e.maxCharacterHeight = e.tileSizeRef / 1.5;
            e.gl = e.canvas.getContext('webgl', { antialias: true });
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
            e.alphaUniform = e.gl.getUniformLocation(e.program, "uAlpha");
            e.tileOpacity = 1;
            e.gl.blendFunc(e.gl.SRC_ALPHA, e.gl.ONE_MINUS_SRC_ALPHA);
            e.gl.enable(e.gl.BLEND);
            e.gl.disable(e.gl.DEPTH_TEST);
            e.gl.uniform1f(e.alphaUniform, e.tileOpacity);
            e.positionBuffer = e.gl.createBuffer();
            e.texCoordBuffer = e.gl.createBuffer();
            e.gl.texImage2D(e.gl.TEXTURE_2D, 0, e.gl.RGBA, e.gl.RGBA, e.gl.UNSIGNED_BYTE, e.texturePack);
            e.resolutionLocation = e.gl.getUniformLocation(e.program, "u_resolution");
            e.myCharacters = {};
            e.loadBoxes();
            e.displayBoxes = [];
            e.fpsFrames = 0;
            e.fpsTime = 0;
            e.fpsTimeLast = 0;
            e.fpsTimeCounter = 0;
            e.fpsElement = document.getElementById("fps_counter");
            e.debugElement = document.getElementById("debug");
            document.addEventListener("keydown", function (evt) { e.readInput(evt); });
            e.zAnim = 0;
            e.zAnimB = false;
            e.zChanged = false;
            e.slide = 0;
            e.turnPush = 0;
            e.drawDistance = 6;
            e.draw();
        };
        Engine.prototype.loadBoxes = function () {
            var e = this;
            for (var coord in map) {
                var x = coord.split(',')[0];
                var y = coord.split(',')[1];
                if (coord == "player") {
                    e.myPlayer.setX(map[coord]["x"]);
                    e.myPlayer.setY(map[coord]["y"]);
                    e.myPlayer.setFacing(map[coord]["facing"]);
                }
                else if (coord == "characters") {
                    for (var c in map[coord]) {
                        var character = new utils.Character(map[coord][c]);
                        e.myCharacters[String(character.getX()) + "," + String(character.getY())] = character;
                    }
                }
                else {
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
            var e = this;
            e.fpsTime = new Date().getTime();
            e.fpsTimeCounter += e.fpsTime - e.fpsTimeLast;
            e.fpsTimeLast = e.fpsTime;
            e.fpsFrames++;
            if (e.fpsTimeCounter > 1000) {
                e.fpsElement.innerHTML = Math.round(1000 * e.fpsFrames / e.fpsTimeCounter) + " fps";
                e.fpsTimeCounter = 0;
                e.fpsFrames = 0;
            }
            var xy = e.getPlayerPosition();
            var x = xy[0];
            var y = xy[1];
            var facing = e.getPlayerFacing();
            var displayBoxes = e.getBoxes(facing, x, y);
            e.gl.clear(e.gl.COLOR_BUFFER_BIT);
            if (e.slide != 0) {
                var turnedBoxes = e.getBoxes(e.turnFace, x, y);
                e.drawBoxes(displayBoxes, facing, x, y, turnedBoxes);
            }
            else {
                e.drawBoxes(displayBoxes, facing, x, y);
            }
            e.gl.flush();
            if (e.zAnim < 0.05 && e.zAnim > -0.05) {
                e.zAnim = 0;
            }
            else if (e.zAnim < 0) {
                e.zAnim += .05;
            }
            else if (e.zAnim > 0) {
                e.zAnim -= .05;
            }
            if (e.slide >= -2 && e.slide <= 8) {
                e.slide = 0;
            }
            else if (e.slide < 0) {
                e.slide += e.cw / 10;
            }
            else if (e.slide > 0) {
                e.slide -= e.cw / 10;
            }
            requestAnimationFrame(this.draw.bind(this));
        };
        Engine.prototype.drawBoxes = function (boxes, facing, myX, myY, turnedBoxes) {
            if (turnedBoxes === void 0) { turnedBoxes = []; }
            var e = this;
            var absSurfaces = ["north", "south", "east", "west", "ceiling", "floor"];
            var totalBoxes = (turnedBoxes.length) ? boxes.length + turnedBoxes.length : boxes.length;
            var push = false;
            var tempFace = facing;
            var z;
            var zCopy;
            var relSurfaces;
            var leftRightCenter = null;
            var box;
            for (var i = 0; i < totalBoxes; i++) {
                if (i < turnedBoxes.length) {
                    box = turnedBoxes[i];
                    facing = e.turnFace;
                    push = true;
                }
                else {
                    box = boxes[i - turnedBoxes.length];
                    facing = tempFace;
                    push = false;
                }
                switch (facing) {
                    case "north":
                        if (myX > box.x) {
                            leftRightCenter = "left";
                            relSurfaces = ["front", null, null, "left", "ceiling", "floor"];
                        }
                        else if (myX < box.x) {
                            leftRightCenter = "right";
                            relSurfaces = ["front", null, "right", null, "ceiling", "floor"];
                        }
                        else {
                            leftRightCenter = "center";
                            relSurfaces = ["front", null, "right", "left", "ceiling", "floor"];
                        }
                        z = myY - box.y;
                        break;
                    case "east":
                        if (myY > box.y) {
                            leftRightCenter = "left";
                            relSurfaces = ["left", null, "front", null, "ceiling", "floor"];
                        }
                        else if (myY < box.y) {
                            leftRightCenter = "right";
                            relSurfaces = [null, "right", "front", null, "ceiling", "floor"];
                        }
                        else {
                            leftRightCenter = "center";
                            relSurfaces = ["left", "right", "front", null, "ceiling", "floor"];
                        }
                        z = box.x - myX;
                        break;
                    case "south":
                        if (myX > box.x) {
                            leftRightCenter = "right";
                            relSurfaces = [null, "front", null, "right", "ceiling", "floor"];
                        }
                        else if (myX < box.x) {
                            leftRightCenter = "left";
                            relSurfaces = [null, "front", "left", null, "ceiling", "floor"];
                        }
                        else {
                            leftRightCenter = "center";
                            relSurfaces = [null, "front", "left", "right", "ceiling", "floor"];
                        }
                        z = box.y - myY;
                        break;
                    case "west":
                        if (myY > box.y) {
                            leftRightCenter = "right";
                            relSurfaces = ["right", null, null, "front", "ceiling", "floor"];
                        }
                        else if (myY < box.y) {
                            leftRightCenter = "left";
                            relSurfaces = [null, "left", null, "front", "ceiling", "floor"];
                        }
                        else {
                            leftRightCenter = "center";
                            relSurfaces = ["right", "left", null, "front", "ceiling", "floor"];
                        }
                        z = myX - box.x;
                        break;
                }
                if (z != zCopy) {
                    zCopy = z;
                    e.zChanged = true;
                    e.tileOpacity = .4;
                    if (e.zAnim > 0 && z == -1) {
                        e.tileOpacity = .4 * e.zAnim;
                    }
                    else if (e.zAnim > 0 && z == e.drawDistance - 1) {
                        e.tileOpacity = .4 + (1 * e.zAnim);
                    }
                    else if (e.zAnim < 0 && z == 0) {
                        e.tileOpacity = .4 * 1 + e.zAnim;
                    }
                    else if (e.zAnim < 0 && z == e.drawDistance) {
                        e.tileOpacity = 1 + e.zAnim;
                    }
                    e.setUpTexture("black", "front_center");
                    e.drawSquare(push);
                }
                for (var j = 0; j <= relSurfaces.length; j++) {
                    var wasFrontFar = false;
                    var rsurface = relSurfaces[j];
                    var asurface = absSurfaces[j];
                    var pattern = box.getPattern(asurface);
                    if (pattern != null && relSurfaces[j] != null) {
                        var surface = rsurface + "_" + leftRightCenter;
                        e.tileOpacity = 1;
                        e.setUpTexture(pattern, surface);
                        e.drawSurface(z, pattern, surface, push);
                    }
                }
                var character = e.getCharacter(box.x, box.y);
                if (character) {
                    var characterPattern = character.getName();
                    var characterPerspective = e.getPlayerPerspective(facing, character.getFacing());
                    e.setUpTexture(characterPattern, characterPerspective, true);
                    e.drawCharacter(z, characterPattern, characterPerspective, leftRightCenter, character.getScale(), push);
                }
            }
        };
        Engine.prototype.getBoxes = function (facing, myX, myY) {
            var e = this;
            var playerBox = (e.zAnim > 0) ? -1 : 0;
            var stop = false;
            var steps = 0;
            if (e.myPlayer.lastFacing == facing && e.myPlayer.lastX == e.myPlayer.x && e.myPlayer.lastY == e.myPlayer.y && !e.zAnimB)
                return e.displayBoxes;
            e.myPlayer.lastFacing = facing;
            e.myPlayer.lastX = e.myPlayer.x;
            e.myPlayer.lastY = e.myPlayer.y;
            e.zAnimB = false;
            if (playerBox == -1)
                e.zAnimB = true;
            e.displayBoxes = [];
            switch (facing) {
                case "north":
                    var getBox = function (i, w) { return e.boxes[myX + w][myY - i]; };
                    var isThere = function (i, w) {
                        return (e.boxes[myX + w] !== undefined && e.boxes[myX + w][myY - i] !== undefined);
                    };
                    var left = "west";
                    var right = "east";
                    break;
                case "east":
                    var getBox = function (i, w) { return e.boxes[myX + i][myY + w]; };
                    var isThere = function (i, w) {
                        return (e.boxes[myX + i] !== undefined && e.boxes[myX + i][myY + w] !== undefined);
                    };
                    var left = "north";
                    var right = "south";
                    break;
                case "south":
                    var getBox = function (i, w) { return e.boxes[myX - w][myY + i]; };
                    var isThere = function (i, w) {
                        return (e.boxes[myX - w] !== undefined && e.boxes[myX - w][myY + i] !== undefined);
                    };
                    var left = "east";
                    var right = "west";
                    break;
                case "west":
                    var getBox = function (i, w) { return e.boxes[myX - i][myY - w]; };
                    var isThere = function (i, w) {
                        return (e.boxes[myX - i] !== undefined && e.boxes[myX - i][myY - w] !== undefined);
                    };
                    var left = "south";
                    var right = "north";
                    break;
            }
            for (steps = playerBox; steps <= e.drawDistance && !stop; steps++) {
                if (!isThere(steps, 0) || getBox(steps, 0).getPattern(facing)) {
                    stop = true;
                }
            }
            var leftUnce = false;
            var rightUnce = false;
            if (stop) {
                if (isThere(steps, -1) && getBox(steps, 0).getPattern(left) == null) {
                    if (isThere(steps + 1, -1) && getBox(steps, -1).getPattern(facing) == null)
                        e.displayBoxes.push(getBox(steps + 1, -1));
                    leftUnce = true;
                }
                if (isThere(steps, 1) && getBox(steps, 0).getPattern(right) == null) {
                    if (isThere(steps + 1, 1) && getBox(steps, 1).getPattern(facing) == null)
                        e.displayBoxes.push(getBox(steps + 1, 1));
                    rightUnce = true;
                }
                if (leftUnce)
                    e.displayBoxes.push(getBox(steps, -1));
                if (rightUnce)
                    e.displayBoxes.push(getBox(steps, 1));
            }
            for (steps--; steps >= playerBox + 1; steps--) {
                if (isThere(steps, -1))
                    e.displayBoxes.push(getBox(steps, -1));
                if (isThere(steps, 1))
                    e.displayBoxes.push(getBox(steps, 1));
                e.displayBoxes.push(getBox(steps, 0));
            }
            if (getBox(playerBox, 0).getPattern(left) == null)
                e.displayBoxes.push(getBox(playerBox, -1));
            if (getBox(playerBox, 0).getPattern(right) == null)
                e.displayBoxes.push(getBox(playerBox, 1));
            e.displayBoxes.push(getBox(playerBox, 0));
            return e.displayBoxes;
        };
        Engine.prototype.getPlayerPosition = function () {
            return this.myPlayer.getCoordinates();
        };
        Engine.prototype.getPlayerFacing = function () {
            return this.myPlayer.getFacing();
        };
        Engine.prototype.getPlayerPerspective = function (myFacing, thingFacing) {
            var e = this;
            if (myFacing == thingFacing) {
                return "back";
            }
            else if (e.leftFace(myFacing) == thingFacing) {
                return "left";
            }
            else if (e.rightFace(myFacing) == thingFacing) {
                return "right";
            }
            else {
                return "front";
            }
        };
        Engine.prototype.rightFace = function (myFacing) {
            switch (myFacing) {
                case "north":
                    return "east";
                    break;
                case "east":
                    return "north";
                    break;
                case "south":
                    return "west";
                    break;
                case "west":
                    return "south";
                    break;
            }
        };
        Engine.prototype.leftFace = function (myFacing) {
            switch (myFacing) {
                case "north":
                    return "west";
                    break;
                case "east":
                    return "south";
                    break;
                case "south":
                    return "east";
                    break;
                case "west":
                    return "north";
                    break;
            }
        };
        Engine.prototype.setUpTexture = function (pattern, surfaceType, thing) {
            if (thing === void 0) { thing = false; }
            var e = this;
            var bufferStart = new Date().getTime();
            e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.texCoordBuffer);
            e.gl.enableVertexAttribArray(e.texCoordLocation);
            e.gl.vertexAttribPointer(e.texCoordLocation, 2, e.gl.FLOAT, false, 0, 0);
            var packObj = pack;
            if (thing) {
                packObj = pack["thing"];
            }
            var x = packObj[pattern][surfaceType]["x"];
            var y = packObj[pattern][surfaceType]["y"];
            var w = packObj[pattern][surfaceType]["w"];
            var h = packObj[pattern][surfaceType]["h"];
            setRectangle(e.gl, x, y, w, h, e.rectangle);
        };
        Engine.prototype.drawSurface = function (z, pattern, surfaceType, push) {
            var e = this;
            e.gl.uniform2f(e.resolutionLocation, e.cw, e.ch);
            e.gl.uniform1f(e.alphaUniform, e.tileOpacity);
            e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.positionBuffer);
            e.gl.enableVertexAttribArray(e.positionLocation);
            e.gl.vertexAttribPointer(e.positionLocation, 2, e.gl.FLOAT, false, 0, 0);
            var w = +pack[pattern][surfaceType]["w"];
            var h = +pack[pattern][surfaceType]["h"];
            w = e.tileSizeRef * w / h;
            h = e.tileSizeRef;
            var zScale = Math.pow(2, z + e.zAnim);
            var scenePush = 0;
            var diff;
            if (push) {
                if (e.slide < 0) {
                    scenePush = e.cw;
                }
                else {
                    scenePush = -e.cw;
                }
            }
            switch (surfaceType) {
                case "left_center":
                    setRectangle(e.gl, (e.cw / 2 - (e.tileSizeRef / (zScale))) + e.slide + scenePush, e.ch / 2 - (e.tileSizeRef / (zScale)) - 1, e.tileSizeRef / (zScale * 2) + 1, 2 * e.tileSizeRef / (zScale) + 2, e.rectangle);
                    break;
                case "ceiling_center":
                    setRectangle(e.gl, (e.cw / 2 - (e.tileSizeRef / (zScale)) - 1) + e.slide + scenePush, e.ch / 2 - (e.tileSizeRef / (zScale)), 2 * e.tileSizeRef / zScale + 2, e.tileSizeRef / (zScale * 2) + 1, e.rectangle);
                    break;
                case "floor_center":
                    diff = h - w / 4;
                    setRectangle(e.gl, (e.cw / 2 - (e.tileSizeRef / (zScale)) - 1) + e.slide + scenePush, e.ch / 2 + ((e.tileSizeRef - diff) / (zScale * 2)), 2 * e.tileSizeRef / zScale + 3, (e.tileSizeRef + diff) / (zScale * 2) + 1.5, e.rectangle);
                    break;
                case "right_center":
                    setRectangle(e.gl, (e.cw / 2 + (e.tileSizeRef / (zScale * 2))) + e.slide + scenePush, e.ch / 2 - (e.tileSizeRef / (zScale)) - 1, e.tileSizeRef / (zScale * 2) + 1, 2 * e.tileSizeRef / (zScale) + 2, e.rectangle);
                    break;
                case "front_center":
                    setRectangle(e.gl, (e.cw / 2 - (e.tileSizeRef / (zScale * 2))) + e.slide + scenePush, e.ch / 2 - (e.tileSizeRef / (zScale * 2)), e.tileSizeRef / zScale + 1, e.tileSizeRef / zScale + 1, e.rectangle);
                    break;
                case "left_left":
                    setRectangle(e.gl, (e.cw / 2 - (3 * e.tileSizeRef / (zScale))) + e.slide + scenePush, e.ch / 2 - (e.tileSizeRef / (zScale)) - 1, 3 * e.tileSizeRef / (zScale * 2) + 1, 2 * e.tileSizeRef / (zScale) + 2, e.rectangle);
                    break;
                case "front_left":
                    setRectangle(e.gl, (e.cw / 2 - (3 * e.tileSizeRef / (zScale * 2))) + e.slide + scenePush, e.ch / 2 - (e.tileSizeRef / (zScale * 2)), e.tileSizeRef / zScale + 1, e.tileSizeRef / zScale + 1, e.rectangle);
                    break;
                case "floor_left":
                    diff = h - w / 5;
                    setRectangle(e.gl, (e.cw / 2 - (3 * e.tileSizeRef / (zScale)) - 1) + e.slide + scenePush, e.ch / 2 + ((e.tileSizeRef - diff) / (zScale * 2)), 5 * e.tileSizeRef / (zScale * 2) + 2, (e.tileSizeRef + diff) / (zScale * 2) + 1.5, e.rectangle);
                    break;
                case "ceiling_left":
                    setRectangle(e.gl, (e.cw / 2 - (3 * e.tileSizeRef / (zScale)) - 1) + e.slide + scenePush, e.ch / 2 - (e.tileSizeRef / (zScale)), 5 * e.tileSizeRef / (zScale * 2) + 2, e.tileSizeRef / (zScale * 2) + 1, e.rectangle);
                    break;
                case "right_right":
                    setRectangle(e.gl, (e.cw / 2 + (3 * e.tileSizeRef / (zScale * 2))) + e.slide + scenePush, e.ch / 2 - (e.tileSizeRef / (zScale)) - 1, 3 * e.tileSizeRef / (zScale * 2) + 1, 2 * e.tileSizeRef / (zScale) + 2, e.rectangle);
                    break;
                case "front_right":
                    setRectangle(e.gl, (e.cw / 2 + (e.tileSizeRef / (zScale * 2))) + e.slide + scenePush, e.ch / 2 - (e.tileSizeRef / (zScale * 2)), e.tileSizeRef / zScale + 1, e.tileSizeRef / zScale + 1, e.rectangle);
                    break;
                case "floor_right":
                    diff = h - w / 5;
                    setRectangle(e.gl, (e.cw / 2 + (e.tileSizeRef / (zScale * 2)) - 1) + e.slide + scenePush, e.ch / 2 + ((e.tileSizeRef - diff) / (zScale * 2)), 5 * e.tileSizeRef / (zScale * 2) + 2, (e.tileSizeRef + diff) / (zScale * 2) + 1.5, e.rectangle);
                    break;
                case "ceiling_right":
                    setRectangle(e.gl, (e.cw / 2 + (e.tileSizeRef / (zScale * 2)) - 1) + e.slide + scenePush, e.ch / 2 - (e.tileSizeRef / (zScale)), 5 * e.tileSizeRef / (zScale * 2) + 2, e.tileSizeRef / (zScale * 2) + 1, e.rectangle);
                    break;
            }
            e.gl.drawArrays(e.gl.TRIANGLES, 0, 6);
        };
        Engine.prototype.drawCharacter = function (z, pattern, perspective, leftRightCenter, scale, push) {
            var e = this;
            e.gl.uniform2f(e.resolutionLocation, e.cw, e.ch);
            e.gl.uniform1f(e.alphaUniform, e.tileOpacity);
            e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.positionBuffer);
            e.gl.enableVertexAttribArray(e.positionLocation);
            e.gl.vertexAttribPointer(e.positionLocation, 2, e.gl.FLOAT, false, 0, 0);
            var w = +pack["thing"][pattern][perspective]["w"];
            var h = +pack["thing"][pattern][perspective]["h"];
            w = 2 * scale * e.tileSizeRef * w / h;
            h = 2 * e.tileSizeRef * scale;
            var zScale = Math.pow(2, z + 0.5 + e.zAnim);
            var scenePush = 0;
            if (push) {
                if (e.slide < 0) {
                    scenePush = e.cw;
                }
                else {
                    scenePush = -e.cw;
                }
            }
            switch (perspective + leftRightCenter) {
                case "frontleft":
                    setRectangle(e.gl, (e.cw / 2 - ((4 * w) / (zScale * 2))) + e.slide + scenePush, e.ch / 2 - (h / (zScale * 2)) + (e.tileSizeRef * (1 - scale)) / (zScale), w / (zScale), (h / zScale), e.rectangle);
                    break;
                case "frontright":
                    setRectangle(e.gl, (e.cw / 2 + (2 * w / (zScale * 2))) + e.slide + scenePush, e.ch / 2 - (h / (zScale * 2)) + (e.tileSizeRef * (1 - scale)) / (zScale), w / (zScale), (h / zScale), e.rectangle);
                    break;
                case "frontcenter":
                    setRectangle(e.gl, (e.cw / 2 - (w / (zScale * 2))) + e.slide + scenePush, e.ch / 2 - (h / (zScale * 2)) + (e.tileSizeRef * (1 - scale)) / (zScale), w / (zScale), (h / zScale), e.rectangle);
                    break;
            }
            e.gl.drawArrays(e.gl.TRIANGLES, 0, 6);
        };
        Engine.prototype.drawSquare = function (push) {
            var e = this;
            var x = 0;
            e.gl.uniform2f(e.resolutionLocation, e.cw, e.ch);
            e.gl.uniform1f(e.alphaUniform, e.tileOpacity);
            e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.positionBuffer);
            e.gl.enableVertexAttribArray(e.positionLocation);
            e.gl.vertexAttribPointer(e.positionLocation, 2, e.gl.FLOAT, false, 0, 0);
            if (push) {
                if (e.slide < 0) {
                    x = e.cw;
                }
                else {
                    x = -e.cw;
                }
            }
            setRectangle(e.gl, x + e.slide, 0, e.cw, e.ch, e.rectangle);
            e.gl.drawArrays(e.gl.TRIANGLES, 0, 6);
        };
        Engine.prototype.readInput = function (keyEvent) {
            var e = this;
            if (e.zAnim != 0 || e.slide != 0)
                return;
            switch (keyEvent.key) {
                case "w":
                    if (e.checkWall()) {
                        e.zAnim = -0.3;
                        return;
                    }
                    if (e.getPlayerFacing() == "east")
                        e.myPlayer.setX(e.myPlayer.getX() + 1);
                    else if (e.getPlayerFacing() == "north")
                        e.myPlayer.setY(e.myPlayer.getY() - 1);
                    else if (e.getPlayerFacing() == "west")
                        e.myPlayer.setX(e.myPlayer.getX() - 1);
                    else
                        e.myPlayer.setY(e.myPlayer.getY() + 1);
                    e.zAnim = 1;
                    break;
                case "a":
                    e.slide = -e.cw;
                    if (e.getPlayerFacing() == "east") {
                        e.turnFace = "east";
                        e.myPlayer.setFacing("north");
                    }
                    else if (e.getPlayerFacing() == "north") {
                        e.turnFace = "north";
                        e.myPlayer.setFacing("west");
                    }
                    else if (e.getPlayerFacing() == "west") {
                        e.turnFace = "west";
                        e.myPlayer.setFacing("south");
                    }
                    else {
                        e.turnFace = "south";
                        e.myPlayer.setFacing("east");
                    }
                    break;
                case "s":
                    if (e.checkWall(true)) {
                        return;
                    }
                    if (e.getPlayerFacing() == "east")
                        e.myPlayer.setX(e.myPlayer.getX() - 1);
                    else if (e.getPlayerFacing() == "north")
                        e.myPlayer.setY(e.myPlayer.getY() + 1);
                    else if (e.getPlayerFacing() == "west")
                        e.myPlayer.setX(e.myPlayer.getX() + 1);
                    else
                        e.myPlayer.setY(e.myPlayer.getY() - 1);
                    e.zAnim = -1;
                    break;
                case "d":
                    e.slide = e.cw;
                    if (e.getPlayerFacing() == "east") {
                        e.turnFace = "east";
                        e.myPlayer.setFacing("south");
                    }
                    else if (e.getPlayerFacing() == "south") {
                        e.turnFace = "south";
                        e.myPlayer.setFacing("west");
                    }
                    else if (e.getPlayerFacing() == "west") {
                        e.turnFace = "west";
                        e.myPlayer.setFacing("north");
                    }
                    else {
                        e.turnFace = "north";
                        e.myPlayer.setFacing("east");
                    }
                    break;
            }
        };
        Engine.prototype.checkWall = function (behind) {
            if (behind === void 0) { behind = false; }
            var e = this;
            var facing = e.getPlayerFacing();
            var pos = e.getPlayerPosition();
            switch (facing) {
                case "north":
                    if (behind)
                        return e.boxes[pos[0]][pos[1]].southSurface != null;
                    else
                        return e.boxes[pos[0]][pos[1]].northSurface != null;
                    break;
                case "south":
                    if (behind)
                        return e.boxes[pos[0]][pos[1]].northSurface != null;
                    else
                        return e.boxes[pos[0]][pos[1]].southSurface != null;
                    break;
                case "east":
                    if (behind)
                        return e.boxes[pos[0]][pos[1]].westSurface != null;
                    else
                        return e.boxes[pos[0]][pos[1]].eastSurface != null;
                    break;
                case "west":
                    if (behind)
                        return e.boxes[pos[0]][pos[1]].eastSurface != null;
                    else
                        return e.boxes[pos[0]][pos[1]].westSurface != null;
                    break;
                default:
                    return false;
            }
        };
        Engine.prototype.getCharacter = function (x, y) {
            var coord = String(x) + "," + String(y);
            if (this.myCharacters[coord] === undefined)
                return null;
            return this.myCharacters[coord];
        };
        Engine.prototype.debug = function (output) {
            var e = this;
            e.debugElement.innerHTML = output;
        };
        return Engine;
    })();
    engine.Engine = Engine;
})(engine || (engine = {}));
function setRectangle(gl, x, y, width, height, buffer) {
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
var SRC = 'assets/package';
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
function addThing(thingInfo) {
    var things = pack["thing"];
    var key_array = thingInfo["filename"].split('_');
    var name = key_array[1];
    var thing_perspective = key_array[2].split('.')[0];
    if (!things.hasOwnProperty(name)) {
        things[name] = {};
    }
    if (!things[name].hasOwnProperty(thing_perspective)) {
        things[name][thing_perspective] = {};
    }
    things[name][thing_perspective]['h'] = thingInfo['sourceSize']['h'] / pack["packHeight"];
    things[name][thing_perspective]['w'] = thingInfo['sourceSize']['w'] / pack["packWidth"];
    things[name][thing_perspective]['y'] = thingInfo['frame']['y'] / pack["packHeight"];
    things[name][thing_perspective]['x'] = thingInfo['frame']['x'] / pack["packWidth"];
}
function getTextureLocations(pixel_locs) {
    pack = { "thing": {} };
    var total_width = pixel_locs['meta']['size']['w'];
    var total_height = pixel_locs['meta']['size']['h'];
    pack["packHeight"] = total_height;
    pack["packWidth"] = total_width;
    for (var i = 0; i < pixel_locs['frames'].length; i++) {
        var key = pixel_locs['frames'][i]['filename'];
        var key_array = key.split('_');
        var pattern = key_array[0];
        if (pattern == "character") {
            addThing(pixel_locs['frames'][i]);
            continue;
        }
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
    edgy = new engine.Engine("gameport");
}
