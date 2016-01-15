/// <reference path="Shader.ts" />
/// <reference path="Box.ts" />
/// <reference path="Player.ts" />

module engine {
export class Engine {
	id:string;
	gl:WebGLRenderingContext;
	canvas:HTMLCanvasElement;
	cw:number;
	ch:number;
	program:WebGLProgram;
	positionBuffer:WebGLBuffer;
	positionLocation:number;
	texCoordLocation:number;
	texCoordBuffer:WebGLBuffer;
	texturePack:HTMLImageElement;
	myPlayer:player.Player;
	boxes:Array<Array<utils.Box>>;
	rectangle:Float32Array;
	resolutionLocation:WebGLUniformLocation;
	
	fpsFrames:number;
	fpsTime:number;
	fpsTimeLast:number;
	fpsTimeCounter:number;
	fpsElement:HTMLElement;
		
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
		e.cw = e.canvas.width;
		e.ch = e.canvas.height;
		// graphics library
		e.gl = <WebGLRenderingContext>e.canvas.getContext('webgl', {antialias: true});
		//e.gl = <WebGLRenderingContext> initWebGL(e.canvas)
		// shader
		var shader = new utils.Shader(e.gl);
		shader.getShader('shader-fs');
		shader.getShader('shader-vs');
		var shaderArray = [shader.fragmentShader, shader.vertexShader];
		
		e.rectangle = new Float32Array([0,0,0,0,0,0,0,0,0,0,0,0]);
		
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
	
		// you moved these from drawSurface
		e.gl.texImage2D(e.gl.TEXTURE_2D, 0, e.gl.RGBA, e.gl.RGBA, e.gl.UNSIGNED_BYTE, e.texturePack);
		e.resolutionLocation = e.gl.getUniformLocation(e.program, "u_resolution");
	
		e.loadBoxes();
		
		//fps stuff
		e.fpsFrames=0;
		e.fpsTime=0;
		e.fpsTimeLast=0;
		e.fpsTimeCounter=0;
		e.fpsElement=document.getElementById("fps_counter");
		
		document.onkeydown = function() { console.log("keydown"); e.myPlayer.setFacing("north"); };
		document.addEventListener("keydown", 
			function(evt) {
				switch(evt.key) {
					case "w":
						//e.myPlayer.setX(e.myPlayer.get)
						break;
				}
			}
		);
		
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
		
		//fps
		e.fpsTime = new Date().getTime();
		e.fpsTimeCounter += e.fpsTime - e.fpsTimeLast;
		e.fpsTimeLast = e.fpsTime;
		e.fpsFrames++;
		 if (e.fpsTimeCounter>1000){
			e.fpsElement.innerHTML=Math.round(1000*e.fpsFrames/e.fpsTimeCounter) + " fps";
			e.fpsTimeCounter = 0;
			e.fpsFrames = 0;
		 }
		
		var xy = e.getPlayerPosition();
		var x = xy[0];
		var y = xy[1];
		var facing = e.getPlayerFacing();
		var displayBoxes = e.getBoxes(facing, x, y);
		
   		e.gl.clear(e.gl.COLOR_BUFFER_BIT);
		e.drawBoxes(displayBoxes, facing, x, y);
		e.gl.flush();
		window.requestAnimationFrame(()=>e.draw());
	}
	
	drawBoxes(boxes:Array<utils.Box>, facing:string, myX:number, myY:number) {
		var e = this;
		var absSurfaces = ["ceiling", "floor", "north", "south", "east", "west"];
		var opposites = ["floor", "ceiling", "south", "north", "west","east"];
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

			// TODO optimize !!!!!!
			for (var j = 0; j <= relSurfaces.length; j++) {
				var wasFrontFar = false;
				var rsurface = relSurfaces[j];
				var asurface = absSurfaces[j];
				var pattern = box.getPattern(asurface);
				if (pattern != null && facing != opposites[j]){
					var surface = rsurface + "_" + leftRightCenter;		
					e.setUpTexture(pattern, surface);
					e.drawSurface(z, pattern, surface);
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
		var bufferStart = new Date().getTime();
		e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.texCoordBuffer);
		e.gl.enableVertexAttribArray(e.texCoordLocation);
		e.gl.vertexAttribPointer(e.texCoordLocation, 2, e.gl.FLOAT, false, 0, 0);

		var x = pack[pattern][surfaceType]["x"];
		var y = pack[pattern][surfaceType]["y"];
		var w = pack[pattern][surfaceType]["w"];
		var h = pack[pattern][surfaceType]["h"];
	
		setRectangle(e.gl, x, y, w, h, e.rectangle);
		
	}
	
	drawSurface(z:number, pattern:string, surfaceType:string /*surface:string, column:string*/) {
		var e = this;
		// lookup uniforms
		
		// set the resolution
		e.gl.uniform2f(e.resolutionLocation, e.cw, e.ch);
		e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.positionBuffer);
		e.gl.enableVertexAttribArray(e.positionLocation);
		e.gl.vertexAttribPointer(e.positionLocation, 2, e.gl.FLOAT, false, 0, 0);
		
		//create a reference scaler variable s
		//lets assume that the closest front_center will be this tall and this wide
		var s = e.canvas.height-e.canvas.height/16;
		
		// TODO fix hard coding numbers	
		//var total_width = +pack["packWidth"];
		//var total_height = +pack["packHeight"];
		//var w = +pack[pattern][surfaceType]["w"] * total_width;
		//var h = +pack[pattern][surfaceType]["h"] * total_height;
		var zScale = Math.pow(2,z);
		switch(surfaceType) {
			case "left_center":
				setRectangle(e.gl, e.cw/2-(s/(zScale)), 
							 e.ch/2-(s/(zScale)), 
							 s/(zScale*2), 
							 2*s/(zScale), e.rectangle);
				break;
			case "ceiling_center":
				setRectangle(e.gl, e.cw/2-(s/(zScale)), 
							 e.ch/2-(s/(zScale)), 
							 2*s/zScale, 
							 s/(zScale*2), e.rectangle);
				break;
			case "floor_center":
				setRectangle(e.gl, e.cw/2-(s/(zScale)), 
							 e.ch/2+(s/(zScale*2)), 
							 2*s/zScale, 
							 s/(zScale*2), e.rectangle);
				break;
			case "right_center":
				setRectangle(e.gl, e.cw/2+(s/(zScale*2)), 
							 e.ch/2-(s/(zScale)), 
							 s/(zScale*2), 
							 2*s/(zScale), e.rectangle);
				break;
			case "front_center":
				setRectangle(e.gl, e.cw/2-(s/(zScale*2)), 
							 e.ch/2-(s/(zScale*2)), 
							 s/zScale, 
							 s/zScale, e.rectangle);
				break;
			case "left_left":
				setRectangle(e.gl, e.cw/2-(3*s/(zScale)), 
							 e.ch/2-(s/(zScale)), 
							 3*s/(zScale*2), 
							 2*s/(zScale), e.rectangle);
				break;
			case "front_left":
				setRectangle(e.gl, e.cw/2-(3*s/(zScale*2)), 
							 e.ch/2-(s/(zScale*2)), 
							 s/zScale, 
							 s/zScale, e.rectangle);
				break;
			case "floor_left":
				setRectangle(e.gl, e.cw/2-(3*s/(zScale)), 
							 e.ch/2+(s/(zScale*2)), 
							 5*s/(zScale*2), 
							 s/(zScale*2), e.rectangle);
				break;
			case "ceiling_left":
				setRectangle(e.gl, e.cw/2-(3*s/(zScale)), 
							 e.ch/2-(s/(zScale)), 
							 5*s/(zScale*2), 
							 s/(zScale*2), e.rectangle);
				break;
			case "right_right":
				setRectangle(e.gl, e.cw/2+(3*s/(zScale*2)), 
							 e.ch/2-(s/(zScale)), 
							 3*s/(zScale*2), 
							 2*s/(zScale), e.rectangle);
				break;
			
			case "front_right":
				setRectangle(e.gl, e.cw/2+(s/(zScale*2)), 
							 e.ch/2-(s/(zScale*2)), 
							 s/zScale, 
							 s/zScale, e.rectangle);
				break;
			case "floor_right":
				setRectangle(e.gl, e.cw/2+(s/(zScale*2)), 
							 e.ch/2+(s/(zScale*2)), 
							 5*s/(zScale*2), 
							 s/(zScale*2), e.rectangle);
				break;
			case "ceiling_right":
				setRectangle(e.gl, e.cw/2+(s/(zScale*2)), 
							 e.ch/2-(s/(zScale)), 
							 5*s/(zScale*2), 
							 s/(zScale*2), e.rectangle);
				break;
				
		}
		e.gl.drawArrays(e.gl.TRIANGLES, 0, 6);
	}
		
} // end engine 
} // end module

function setRectangle(gl, x, y, width, height, buffer:Float32Array) {
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