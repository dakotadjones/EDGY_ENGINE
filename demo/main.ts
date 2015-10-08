
window.onload = main;

function main() {
	var tile = new Image();
	tile.src = 'test.png';
	tile.crossOrigin = 'Anonymous';
	tile.onload = function() {
		render(tile);
	}
}

function render(image) {
	
	// get canvas
	var canvas = <HTMLCanvasElement>document.getElementById('edgy');
	var gl = <WebGLRenderingContext>canvas.getContext('webgl');
	
	// get shaders
	var shader = new utils.Shader(gl);
	shader.getShader('shader-fs');
	shader.getShader('shader-vs');
	var shaderArray = [shader.fragmentShader, shader.vertexShader];
	var program = shader.createProgram(shaderArray);
	gl.useProgram(program);
	
	// look up where the vertex data needs to go.
	var positionLocation = gl.getAttribLocation(program, "a_position");
	var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
	
	// provide texture coordinates for the rectangle.
	var texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  	  0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0		
		]), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(texCoordLocation);
	gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
	// Create a texture.
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	// Set the parameters so we can render any size image.
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	// for some reason this gets rid of the background
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	// Upload the image into the texture.
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	// lookup uniforms
	var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
	
	// set the resolution
	gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
	
	// Create a buffer for the position of the rectangle corners.
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	
	// Set a rectangle the same size as the image.
	setRectangle(gl, 0, 375, image.width, image.height);
	// Draw the rectangle
	gl.drawArrays(gl.TRIANGLES, 0, 6);
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