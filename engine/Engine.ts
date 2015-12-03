/// <reference path="Shader.ts" />
/// <reference path="Box.ts" />
/// <reference path="Player.ts" />

module engine {
export class Engine {
	id:string;
	gl:WebGLRenderingContext;
	canvas:HTMLCanvasElement;
	program:WebGLProgram;
	positionBuffer:WebGLBuffer;
	positionLocation:number;
	texCoordLocation:number;
	texCoordBuffer:WebGLBuffer;
	texturePack:HTMLImageElement;
	myPlayer:player.Player;
	boxes:Array<Array<utils.Box>>;
	
	load(id:string) {
		var e = this;
		e.myPlayer = new player.Player();
		this.id = id;
		this.texturePack = new Image();
		this.texturePack.src = SRC + '.png';
		//this.texturePack.src = 'assets/fake-pack.png';
		this.texturePack.crossOrigin = 'anonymous';
		this.texturePack.onload = function() { e.init(); };
	}
	
	init() {
		var e = this;
		// initialize elements
		// canvas
		e.canvas = <HTMLCanvasElement>document.getElementById(e.id);
		// graphics library
		e.gl = <WebGLRenderingContext>e.canvas.getContext('webgl');
		
		// shader
		var shader = new utils.Shader(e.gl);
		shader.getShader('shader-fs');
		shader.getShader('shader-vs');
		var shaderArray = [shader.fragmentShader, shader.vertexShader];
		
		// shader program
		e.program = shader.createProgram(shaderArray);
		e.gl.useProgram(e.program);
		
		// reference the positions for texture and vertices in the program
		e.positionLocation = e.gl.getAttribLocation(e.program, "a_position");
		e.texCoordLocation = e.gl.getAttribLocation(e.program, "a_texCoord");
		
		// texture binding
		var texture = e.gl.createTexture();
		e.gl.bindTexture(e.gl.TEXTURE_2D, texture);
		e.gl.texParameteri(e.gl.TEXTURE_2D, e.gl.TEXTURE_WRAP_S, e.gl.CLAMP_TO_EDGE);
   		e.gl.texParameteri(e.gl.TEXTURE_2D, e.gl.TEXTURE_WRAP_T, e.gl.CLAMP_TO_EDGE);
    	e.gl.texParameteri(e.gl.TEXTURE_2D, e.gl.TEXTURE_MIN_FILTER, e.gl.NEAREST);
    	e.gl.texParameteri(e.gl.TEXTURE_2D, e.gl.TEXTURE_MAG_FILTER, e.gl.NEAREST);
		// transparency
		e.gl.blendFunc(e.gl.SRC_ALPHA, e.gl.ONE_MINUS_SRC_ALPHA);
		e.gl.enable(e.gl.BLEND);
		
		e.positionBuffer = e.gl.createBuffer();
		e.texCoordBuffer = e.gl.createBuffer();
	
		e.loadBoxes();

		//e.draw(0);
	}
	
	loadBoxes() {
		for(var coord in map) {
			var x = coord.split(',')[0];
			var y = coord.split(',')[1];
			var box = new utils.Box(x,y, map[coord]);
			if (this.boxes === undefined) {
				this.boxes = [];				
			}
			if (this.boxes[x] === undefined) {
				this.boxes[x] = [];
			}
			this.boxes[x].push(box)
		}
		// after we load boxes, draw the scene
		// TODO better way to call draw AFTER boxes is loaded
		this.draw();
	}
	
	draw() {
		var xy = this.getPlayerPosition();
		var x = xy[0];
		var y = xy[1];
		var facing = this.getPlayerFacing();
		var e = this;
		switch(facing) {
			case "east":
				// get the three tiles in front of us
				var displayBoxes = [this.boxes[x+3][y], this.boxes[x+2][y], this.boxes[x+1][y]];		
				e.drawBoxes(displayBoxes);
				break;
		}		
	}
	
	drawBoxes(displayBoxes:Array<utils.Box>) {
		var e = this;
		for (var i = 0; i < displayBoxes.length; i++) {
			var box  = displayBoxes[i];
			
			// TODO this needs to be more general
			// Draw surface has to know the position, we have to do the math
			e.setUpTexture(box.ceilingSurface, "ceiling_center");
			e.drawSurface(0);
			
			//e.setUpTexture(box.floorSurface, "floor_center");
			//e.drawSurface(0);
			//e.setUpTexture(box.northSurface, "left_center");
			
			//e.setUpTexture(box.southSurface, "right_center");
		}
		console.log(pack);
	}
	
	getPlayerPosition() {
		return this.myPlayer.getCoordinates();
	}
	
	getPlayerFacing() {
		return this.myPlayer.getFacing();
	}

	setUpTexture(pattern:string, surfaceType:string) {
		// this is good
		var e = this;
		e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.texCoordBuffer);
		e.gl.enableVertexAttribArray(e.texCoordLocation);
		e.gl.vertexAttribPointer(e.texCoordLocation, 2, e.gl.FLOAT, false, 0, 0);
		var x = pack[pattern][surfaceType]["x"];
		var y = pack[pattern][surfaceType]["y"];
		var w = pack[pattern][surfaceType]["w"];
		var h = pack[pattern][surfaceType]["h"];
		setRectangle(e.gl, x, y, w, h);
		//pack[pattern][surfaceType]["x"];			
	}
	
	drawSurface(z:number) {
		var e = this;
		e.gl.texImage2D(e.gl.TEXTURE_2D, 0, e.gl.RGBA, e.gl.RGBA, e.gl.UNSIGNED_BYTE, e.texturePack);
		// lookup uniforms
		var resolutionLocation = e.gl.getUniformLocation(e.program, "u_resolution");
		// set the resolution
		e.gl.uniform2f(resolutionLocation, e.canvas.width, e.canvas.height);
		e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.positionBuffer);
		e.gl.enableVertexAttribArray(e.positionLocation);
		e.gl.vertexAttribPointer(e.positionLocation, 2, e.gl.FLOAT, false, 0, 0);
		
		// TODO fix hard coding numbers
		setRectangle(e.gl, e.canvas.width/2-(500/(Math.pow(2,z)*2)), 
 					 e.canvas.height/2-(125/(Math.pow(2,z-1))), 
					 500/Math.pow(2,z), 
					 125/Math.pow(2,z));
		e.gl.drawArrays(e.gl.TRIANGLES, 0, 6);
	}

/*
	draw(z) {

		var e = this;
		for (var i = 0; i < 5; i++) {
			// do it in a loop now
			e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.texCoordBuffer);
			e.gl.enableVertexAttribArray(e.texCoordLocation);
			e.gl.vertexAttribPointer(e.texCoordLocation, 2, e.gl.FLOAT, false, 0, 0);
			if(i == 0) { // far tile
				setRectangle(e.gl, 0.5, 0.5, 0.5, 0.25);
			} else if (i == 1) { // close tile
				setRectangle(e.gl, 0.5, 0.25, 0.5, 0.25);
			} else if (i == 2) { // right
				setRectangle(e.gl, 0.125, 0, 0.125, 1);
			} else if (i == 3) { // left
				setRectangle(e.gl, 0, 0, 0.125, 1);
			} else if (i == 4) { // ceil
				setRectangle(e.gl, 0.5, 0, 0.5, 0.25);
			}
	
			e.gl.texImage2D(e.gl.TEXTURE_2D, 0, e.gl.RGBA, e.gl.RGBA, e.gl.UNSIGNED_BYTE, e.texturePack);
			// lookup uniforms
			var resolutionLocation = e.gl.getUniformLocation(e.program, "u_resolution");
			// set the resolution
			e.gl.uniform2f(resolutionLocation, e.canvas.width, e.canvas.height);
			e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.positionBuffer);
			e.gl.enableVertexAttribArray(e.positionLocation);
			e.gl.vertexAttribPointer(e.positionLocation, 2, e.gl.FLOAT, false, 0, 0);
			
			if (i==0) { // far tile
				z += 1;
				setRectangle(e.gl, e.canvas.width/2-(500/(Math.pow(2,z)*2)), 
								e.canvas.height/2+(125/(Math.pow(2,z))), 
								500/Math.pow(2,z), 
								125/Math.pow(2,z));
				z -= 1;
			} else if (i == 1) { // close tile
				setRectangle(e.gl, e.canvas.width/2-(500/(Math.pow(2,z)*2)), 
								e.canvas.height/2+(125/(Math.pow(2,z))), 
								500/Math.pow(2,z), 
								125/Math.pow(2,z));
				
			} else if (i == 2) { // right
				setRectangle(e.gl, e.canvas.width/2+(125/(Math.pow(2,z))), 
								e.canvas.height/2-(500/(Math.pow(2,z)*2)), 
								125/Math.pow(2,z), 
								500/Math.pow(2,z));
				
			} else if (i == 3) { // left
				setRectangle(e.gl, e.canvas.width/2-(125/(Math.pow(2,z-1))), 
								e.canvas.height/2-(500/(Math.pow(2,z)*2)), 
								125/Math.pow(2,z), 
								500/Math.pow(2,z));
				
			} else if (i == 4) { // ceiling
				setRectangle(e.gl, e.canvas.width/2-(500/(Math.pow(2,z)*2)), 
								e.canvas.height/2-(125/(Math.pow(2,z-1))), 
								500/Math.pow(2,z), 
								125/Math.pow(2,z));
			}
			
			// Draw the rectangle
			e.gl.drawArrays(e.gl.TRIANGLES, 0, 6);
		}
	}
	*/
	
	
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