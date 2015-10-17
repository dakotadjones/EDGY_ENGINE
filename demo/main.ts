window.onload = main;

function loadImage(url, callback) {
	var tile = new Image();
	tile.src = url;
	tile.crossOrigin = 'anonymous';
	tile.onload = callback;
	return tile;
}

function loadImages(urls, callback) {
  var images = [];
  var imagesToLoad = urls.length;
 
  // Called each time an image finished
  // loading.
  var onImageLoad = function() {
    --imagesToLoad;
    // If all the images are loaded call the callback.
    if (imagesToLoad == 0) {
      callback(images);
    }
  };
 
  for (var ii = 0; ii < imagesToLoad; ++ii) {
    var image = loadImage(urls[ii], onImageLoad);
    images.push(image);
  }
}


function main() {
	loadImages([
		"test.png",
		"test-wall.png"
	], render);
}


function render(images) {
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
	
	gl.enableVertexAttribArray(texCoordLocation);
	gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
	
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
   	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	// transparency
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	
	setRectangle(gl, 0.0, 0.0, 1.0, 1.0);
	
 	// Upload the image into the texture.

	
	// Create a texture.
	//var texture = gl.createTexture();
	/*var textures = [];
	for (var i = 0; i < 2; ++i) {
		

	    // add the texture to the array of textures.
    	textures.push(texture);
  	}
	*/
	// http://stackoverflow.com/questions/12321781/drawing-multiple-2d-images-in-webgl
	var positionBuffer = gl.createBuffer();
	
	for (var i = 0; i < 2; i++) {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
	
		// lookup uniforms
		var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
		// set the resolution
		gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		
		if (i==0) {
			// Set a rectangle the same size as the image.
			setRectangle(gl, 0, 375, images[i].width, images[i].height);
		} else {
			setRectangle(gl, 375, 0, images[i].width, images[i].height);
		}
		
		// Draw the rectangle
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