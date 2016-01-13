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
		// set up object reference 
		var e = this;
		// initialize our player  
		e.myPlayer = new player.Player();

		// initialize texture pack 
		this.id = id;
		this.texturePack = new Image();
		this.texturePack.src = SRC + '.png';
		this.texturePack.crossOrigin = 'anonymous';
		this.texturePack.onload = function() { e.init(); };
	}
	
	init() {
		// set up object reference 
		var e = this;
		// initialize elements
		// canvas
		e.canvas = <HTMLCanvasElement>document.getElementById(e.id);
		// graphics library
		e.gl = <WebGLRenderingContext>e.canvas.getContext('webgl');
		//e.gl = <WebGLRenderingContext> initWebGL(e.canvas)
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
		
		// set up buffers 
		e.positionBuffer = e.gl.createBuffer();
		e.texCoordBuffer = e.gl.createBuffer();
	
		e.loadBoxes();

		// TODO ensure draw gets called after load boxes
		e.draw();
	}
	
	loadBoxes() {
		var e = this;
		for (var coord in map) {
			if (coord == "player") {
					e.myPlayer.setX(map[coord]["x"]);
					e.myPlayer.setY(map[coord]["y"]);
					e.myPlayer.setFacing(map[coord]["facing"]);
			} else {
				var x = coord.split(',')[0];
				var y = coord.split(',')[1];
				var box = new utils.Box(x,y, map[coord]);
				if (e.boxes === undefined) {
					e.boxes = [];				
				}
				if (e.boxes[x] === undefined) {
					e.boxes[x] = [];
				}
				e.boxes[x].push(box)
			}
		}
	}
	
	draw() {
		var e = this;
		var xy = e.getPlayerPosition();
		var x = xy[0];
		var y = xy[1];
		var facing = e.getPlayerFacing();
		var displayBoxes = e.getBoxes(facing, x, y);
		e.drawBoxes(displayBoxes, facing, x, y);
	}
	
	drawBoxes(boxes:Array<utils.Box>, facing:string, myX:number, myY:number) {
		var e = this;
		var absSurfaces = ["ceiling", "floor", "north", "south", "east", "west"];
		var opposites = ["floor", "ceiling", "south", "north", "west","east"];
		console.log(boxes);
		for (var i = 0; i < boxes.length; i++) {
			console.log(i);
			var box = boxes[i];
			var z;
			var relSurfaces;
			var leftRightCenter = null;
			switch (facing) {
				case "north":
					if (myX > box.x) {
						leftRightCenter = "left";
					} else if (myX < box.x) {
						leftRightCenter = "right";
					} else {
						leftRightCenter = "center";
					}
					relSurfaces = ["ceiling", "floor", "front", "front", "right", "left"];
					z = myY - box.y;				
					break;
				case "east":
					if (myY > box.y) {
						// it's to the right
						leftRightCenter = "left";
					
					} else if (myY < box.y) {
						// it's to the left 
						leftRightCenter = "right";
					} else {
						// it's in the center
						leftRightCenter = "center";
					}
					relSurfaces = ["ceiling", "floor", "left", "right", "front", "front"];
					z = box.x - myX;					
					break;
				case "south":
					if (myX > box.x) {
							leftRightCenter = "right";
						} else if (myX < box.x) {
							leftRightCenter = "left";
						} else {
							leftRightCenter = "center";
						}
						relSurfaces = ["ceiling", "floor", "front", "front", "left", "right"];
					    // absSurfaces = ["ceiling", "floor", "south", "north", "east", "west"];
						z = box.y - myY;				
					break;
				case "west":
					if (myY > box.y) {
							// it's to the right
							leftRightCenter = "right";
						} else if (myY < box.y) {
							// it's to the left 
							leftRightCenter = "left";
						} else {
							// it's in the center
							leftRightCenter = "center";
						}
						relSurfaces = ["ceiling", "floor", "right", "left", "front", "front"];
						// absSurfaces = ["ceiling", "floor", "north", "south", "west", "east"];
						z = box.x - myX - 1;	
					break;
			}			

			// TODO optimize
			for (var j = 0; j <= relSurfaces.length; j++) {
				var wasFrontFar = false;
				var rsurface = relSurfaces[j];
				var asurface = absSurfaces[j];
				var pattern = box.getPattern(asurface);
				if (pattern != null && facing != opposites[j]){
				console.log(asurface);
					e.setUpTexture(pattern, rsurface + "_" + leftRightCenter);				
					e.drawSurface(z, pattern, rsurface + "_" + leftRightCenter);
				}
			}
		}
	}
	
	getBoxes(facing:string, myX:number, myY:number) {
		var e = this;
		var displayBoxes = [];
		var order = [-1, 1, 0];
		switch(facing) {
			case "north":
				for (var y = 3; y >= 0; y--) {
						var rowNum = myY - y;
						for (var x = 0; x < order.length; x++) {
							var xx = myX + order[x];
							var pos  = xx.toString() + "," + rowNum.toString();
							console.log(pos);
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
							var pos  = xx.toString() + "," + rowNum.toString();
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
						var pos  = colNum.toString() + "," + yy.toString();
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
							var pos  = colNum.toString() + "," + yy.toString();
							if (map.hasOwnProperty(pos)) {
								displayBoxes.push(e.boxes[colNum][yy]);
							}
						}
				}
			
		}
		return displayBoxes;
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
	}
	
	drawSurface(z:number, pattern:string, surfaceType:string) {
		var e = this;
		e.gl.texImage2D(e.gl.TEXTURE_2D, 0, e.gl.RGBA, e.gl.RGBA, e.gl.UNSIGNED_BYTE, e.texturePack);
		// lookup uniforms
		var resolutionLocation = e.gl.getUniformLocation(e.program, "u_resolution");
		// set the resolution
		e.gl.uniform2f(resolutionLocation, e.canvas.width, e.canvas.height);
		e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.positionBuffer);
		e.gl.enableVertexAttribArray(e.positionLocation);
		e.gl.vertexAttribPointer(e.positionLocation, 2, e.gl.FLOAT, false, 0, 0);
		
		//create a reference scaler variable s
		//lets assume that the closest front_center will be this tall and this wide
		var s = e.canvas.height-e.canvas.height/16;
		
		// TODO fix hard coding numbers	
		var total_width = +pack["packWidth"];
		var total_height = +pack["packHeight"];
		var w = +pack[pattern][surfaceType]["w"] * total_width;
		var h = +pack[pattern][surfaceType]["h"] * total_height;
		switch(surfaceType) {
			case "left_center":
				setRectangle(e.gl, 0, 
							 0, 
							 1, 
							 1);//
				break;
			case "ceiling_center":
				setRectangle(e.gl, 0, 
							 0, 
							 1, 
							 1);//
				break;
			case "floor_center":
				setRectangle(e.gl, e.canvas.width/2-(s/(Math.pow(2,z))), 
							 e.canvas.height/2+(s/(Math.pow(2,z)*2)), 
							 2*s/Math.pow(2,z), 
							 s/Math.pow(2,z));
				break;
			case "right_center":
				setRectangle(e.gl, 0, 
							 0, 
							 1, 
							 1);//
				break;
			case "front_center":
				setRectangle(e.gl, e.canvas.width/2-(s/(Math.pow(2,z)*2)), 
							 e.canvas.height/2-(s/(Math.pow(2,z)*2)), 
							 s/Math.pow(2,z), 
							 s/Math.pow(2,z));
				break;
			case "left_left":
				setRectangle(e.gl, 0, 
							 0, 
							 1, 
							 1);//
				break;
			case "front_left":
				setRectangle(e.gl, e.canvas.width/2-(3*s/(Math.pow(2,z)*2)), 
							 e.canvas.height/2-(s/(Math.pow(2,z)*2)), 
							 s/Math.pow(2,z), 
							 s/Math.pow(2,z));
				break;
			case "floor_left":
				setRectangle(e.gl, 0, 
							 0, 
							 1, 
							 1);//
				break;
			case "ceiling_left":
				setRectangle(e.gl, 0, 
							 0, 
							 1, 
							 1);//
				break;
			case "right_right":
				setRectangle(e.gl, 0, 
							 0, 
							 1, 
							 1);//
				break;
			
			case "front_right":
				setRectangle(e.gl, e.canvas.width/2+(s/(Math.pow(2,z)*2)), 
							 e.canvas.height/2-(s/(Math.pow(2,z)*2)), 
							 s/Math.pow(2,z), 
							 s/Math.pow(2,z));
				break;
			case "floor_right":
				setRectangle(e.gl, 0, 
							 0, 
							 1, 
							 1);//
				break;
			case "ceiling_right":
				setRectangle(e.gl, 0, 
							 0, 
							 1, 
							 1);//
				break;
				
		}
		console.log(surfaceType);	
		e.gl.drawArrays(e.gl.TRIANGLES, 0, 6);
	}
		
} // end engine 
} // end module

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