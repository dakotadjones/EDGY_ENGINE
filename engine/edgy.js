/* Shader class that creates the programs for specified WebGL context
 *
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
/// <reference path="Shader.ts" />
var engine;
(function (engine) {
    var Engine = (function () {
        function Engine() {
        }
        Engine.prototype.load = function (id) {
            var e = this;
            this.id = id;
            this.texturePack = new Image();
            this.texturePack.src = 'assets/fake-pack.png';
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
            e.draw(0);
        };
        Engine.prototype.draw = function (z) {
            console.log("drawing...");
            var e = this;
            for (var i = 0; i < 5; i++) {
                e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.texCoordBuffer);
                e.gl.enableVertexAttribArray(e.texCoordLocation);
                e.gl.vertexAttribPointer(e.texCoordLocation, 2, e.gl.FLOAT, false, 0, 0);
                if (i == 0) {
                    setRectangle(e.gl, 0.5, 0.5, 0.5, 0.25);
                }
                else if (i == 1) {
                    setRectangle(e.gl, 0.5, 0.25, 0.5, 0.25);
                }
                else if (i == 2) {
                    setRectangle(e.gl, 0.125, 0, 0.125, 1);
                }
                else if (i == 3) {
                    setRectangle(e.gl, 0, 0, 0.125, 1);
                }
                else if (i == 4) {
                    setRectangle(e.gl, 0.5, 0, 0.5, 0.25);
                }
                e.gl.texImage2D(e.gl.TEXTURE_2D, 0, e.gl.RGBA, e.gl.RGBA, e.gl.UNSIGNED_BYTE, e.texturePack);
                var resolutionLocation = e.gl.getUniformLocation(e.program, "u_resolution");
                e.gl.uniform2f(resolutionLocation, e.canvas.width, e.canvas.height);
                e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.positionBuffer);
                e.gl.enableVertexAttribArray(e.positionLocation);
                e.gl.vertexAttribPointer(e.positionLocation, 2, e.gl.FLOAT, false, 0, 0);
                if (i == 0) {
                    z += 1;
                    setRectangle(e.gl, e.canvas.width / 2 - (500 / (Math.pow(2, z) * 2)), e.canvas.height / 2 + (125 / (Math.pow(2, z))), 500 / Math.pow(2, z), 125 / Math.pow(2, z));
                    z -= 1;
                }
                else if (i == 1) {
                    setRectangle(e.gl, e.canvas.width / 2 - (500 / (Math.pow(2, z) * 2)), e.canvas.height / 2 + (125 / (Math.pow(2, z))), 500 / Math.pow(2, z), 125 / Math.pow(2, z));
                }
                else if (i == 2) {
                    setRectangle(e.gl, e.canvas.width / 2 + (125 / (Math.pow(2, z))), e.canvas.height / 2 - (500 / (Math.pow(2, z) * 2)), 125 / Math.pow(2, z), 500 / Math.pow(2, z));
                }
                else if (i == 3) {
                    setRectangle(e.gl, e.canvas.width / 2 - (125 / (Math.pow(2, z - 1))), e.canvas.height / 2 - (500 / (Math.pow(2, z) * 2)), 125 / Math.pow(2, z), 500 / Math.pow(2, z));
                }
                else if (i == 4) {
                    setRectangle(e.gl, e.canvas.width / 2 - (500 / (Math.pow(2, z) * 2)), e.canvas.height / 2 - (125 / (Math.pow(2, z - 1))), 500 / Math.pow(2, z), 125 / Math.pow(2, z));
                }
                e.gl.drawArrays(e.gl.TRIANGLES, 0, 6);
            }
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
var edgy;
window.onload = run;
function run() {
    edgy = new engine.Engine();
    edgy.load("gameport");
}
