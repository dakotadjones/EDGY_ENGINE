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
window.onload = main;
var gl;
var program;
var positionBuffer;
var positionLocation;
var texCoordLocation;
var texCoordBuffer;
var images;
var pack;
var canvas;
var move;
var movespeed = 0.1;
function main() {
    pack = new Image();
    pack.src = 'fake-pack.png';
    pack.crossOrigin = 'anonymous';
    pack.onload = render;
    return pack;
}
function render() {
    canvas = document.getElementById('edgy');
    gl = canvas.getContext('webgl');
    var shader = new utils.Shader(gl);
    shader.getShader('shader-fs');
    shader.getShader('shader-vs');
    var shaderArray = [shader.fragmentShader, shader.vertexShader];
    program = shader.createProgram(shaderArray);
    gl.useProgram(program);
    positionLocation = gl.getAttribLocation(program, "a_position");
    texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    texCoordBuffer = gl.createBuffer();
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    setRectangle(gl, 0.0, 0.0, 1.0, 1.0);
    positionBuffer = gl.createBuffer();
    move = 0;
    drawScene(0);
}
function drawScene(z) {
    var scale = .25 * z;
    for (var i = 0; i < 5; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        if (i == 0) {
            setRectangle(gl, 0.5, 0.5, 0.5, 0.25);
        }
        else if (i == 1) {
            setRectangle(gl, 0.5, 0.25, 0.5, 0.25);
        }
        else if (i == 2) {
            setRectangle(gl, 0.125, 0, 0.125, 1);
        }
        else if (i == 3) {
            setRectangle(gl, 0, 0, 0.125, 1);
        }
        else if (i == 4) {
            setRectangle(gl, 0.5, 0, 0.5, 0.25);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pack);
        var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        if (i == 0) {
            z += 1;
            setRectangle(gl, canvas.width / 2 - (500 / (Math.pow(2, z) * 2)), canvas.height / 2 + (125 / (Math.pow(2, z))), 500 / Math.pow(2, z), 125 / Math.pow(2, z));
            z -= 1;
        }
        else if (i == 1) {
            setRectangle(gl, canvas.width / 2 - (500 / (Math.pow(2, z) * 2)), canvas.height / 2 + (125 / (Math.pow(2, z))), 500 / Math.pow(2, z), 125 / Math.pow(2, z));
        }
        else if (i == 2) {
            setRectangle(gl, canvas.width / 2 + (125 / (Math.pow(2, z))), canvas.height / 2 - (500 / (Math.pow(2, z) * 2)), 125 / Math.pow(2, z), 500 / Math.pow(2, z));
        }
        else if (i == 3) {
            setRectangle(gl, canvas.width / 2 - (125 / (Math.pow(2, z - 1))), canvas.height / 2 - (500 / (Math.pow(2, z) * 2)), 125 / Math.pow(2, z), 500 / Math.pow(2, z));
        }
        else if (i == 4) {
            setRectangle(gl, canvas.width / 2 - (500 / (Math.pow(2, z) * 2)), canvas.height / 2 - (125 / (Math.pow(2, z - 1))), 500 / Math.pow(2, z), 125 / Math.pow(2, z));
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}
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
document.addEventListener("keydown", function (event) {
    switch (event.which) {
        case 38:
            move -= movespeed;
            drawScene(move);
            break;
        case 40:
            move += movespeed;
            drawScene(move);
            break;
        default: return;
    }
    event.preventDefault();
});
