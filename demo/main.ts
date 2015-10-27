window.onload = main;
var gl;
var program;
var positionBuffer;
var positionLocation;
var images;
var canvas;
var move;
var movespeed = 0.1;

function loadImage(url, callback) {
	var tile = new Image();
	tile.src = url;
	tile.crossOrigin = 'anonymous';
	tile.onload = callback;
	return tile;
}

function loadImages(urls, callback) {
  images = [];
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
		"test_floor_center.png",
		"test_wall_right.png",
		"test_wall_left.png",
		"test_ceiling_center.png",
		"test_floor_center2.png"
	], render);
}


function render(images) {
	// get canvas
	canvas = <HTMLCanvasElement>document.getElementById('edgy');
	gl = <WebGLRenderingContext>canvas.getContext('webgl');
	
	// get shaders
	var shader = new utils.Shader(gl);
	shader.getShader('shader-fs');
	shader.getShader('shader-vs');
	var shaderArray = [shader.fragmentShader, shader.vertexShader];
	program = shader.createProgram(shaderArray);
	gl.useProgram(program);
	
	// look up where the vertex data needs to go.
	positionLocation = gl.getAttribLocation(program, "a_position");
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
	
	// http://stackoverflow.com/questions/12321781/drawing-multiple-2d-images-in-webgl
	positionBuffer = gl.createBuffer();
	
	move=0;
	
	drawScene(0);
}

function drawScene(z) {
	var scale = .25 * z;
	//var new_x = ;
	//var new_y;
	
	
	for (var i = 0; i < 5; i++) {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
	
		// lookup uniforms
		var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
		// set the resolution
		gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		
		if (i==0) { // bottom
			setRectangle(gl, canvas.width/2-(images[i].width/(Math.pow(2,z)*2)), 
							 canvas.height/2+(images[i].height/(Math.pow(2,z))), 
							 images[i].width/Math.pow(2,z), 
							 images[i].height/Math.pow(2,z));
		} else if (i == 1) { // right
			setRectangle(gl, canvas.width/2+(images[i].width/(Math.pow(2,z))), 
							 canvas.height/2-(images[i].height/(Math.pow(2,z)*2)), 
							 images[i].width/Math.pow(2,z), 
							 images[i].height/Math.pow(2,z));
		} else if (i == 2) { // left
			setRectangle(gl, canvas.width/2-(images[i].width/(Math.pow(2,z-1))), 
							 canvas.height/2-(images[i].height/(Math.pow(2,z)*2)), 
							 images[i].width/Math.pow(2,z), 
							 images[i].height/Math.pow(2,z));
		} else if (i == 3){ // top
			setRectangle(gl, canvas.width/2-(images[i].width/(Math.pow(2,z)*2)), 
							 canvas.height/2-(images[i].height/(Math.pow(2,z-1))), 
							 images[i].width/Math.pow(2,z), 
							 images[i].height/Math.pow(2,z));
		} else if (i == 4){
			z += 1;
			setRectangle(gl, canvas.width/2-(images[i].width/(Math.pow(2,z)*2)), 
							 canvas.height/2+(images[i].height/(Math.pow(2,z))), 
							 images[i].width/Math.pow(2,z), 
							 images[i].height/Math.pow(2,z));
			z -= 1;
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

document.addEventListener("keydown", function(event) {
	switch(event.which) {
		case 38:
			move -= movespeed;
			drawScene(move);
			break;
		case 40:
			move += movespeed;
			drawScene(move);
			break;	
		default:return;
	}
	event.preventDefault();
});