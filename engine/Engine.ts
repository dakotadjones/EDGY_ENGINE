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
	zAnim:number;
	zChanged:boolean;
	turnPush:number;
	slide:number;
	turnFace:string;
	tileSizeRef:number;
	// Frames Per Second for developer reference
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
		
		//create a reference scaler variable s
		//lets assume that the closest front_center will be this tall and this wide
		e.tileSizeRef = e.canvas.height-e.canvas.height/16; 
		
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

		document.addEventListener("keydown", function(evt){e.readInput(evt)});
		
		// initialize the smooth scale 
		e.zAnim = 0;
		
		// intialize the z watcher, which helps with turning and depth
		e.zChanged = false;
				
		//initialize the slide
		e.slide = 0;
		
		// intialize the turning accelerator
		e.turnPush = 0;
		
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
		
		if (e.slide !=0) {
			var turnedBoxes = e.getBoxes(e.turnFace, x, y);
			e.drawBoxes(displayBoxes, facing, x, y, turnedBoxes);			
		} else { 
			e.drawBoxes(displayBoxes, facing, x, y);
		}
		e.gl.flush();
        // code for animating movement
		if (e.zAnim < 0.05 && e.zAnim > -0.05){
			e.zAnim=0;
		}
		else if (e.zAnim < 0) {
			e.zAnim += .05;
		}
		else if (e.zAnim > 0) {
			e.zAnim -= .05;
		}
		// code for sliding movement as you turn left or right
		if (e.slide >= -2 && e.slide <= 8) {
			e.slide = 0;
		}
		else if (e.slide < 0) {
			e.slide += 10; //e.cw/10;
		} else if (e.slide > 0) {
			e.slide -= 10;// e.cw/10;
		}
		
		console.log(e.turnPush);
		requestAnimationFrame(this.draw.bind(this));
	}
	
	drawBoxes(boxes:Array<utils.Box>, facing:string, myX:number, myY:number, turnedBoxes:Array<utils.Box>=[]) {
		var e = this;
		var absSurfaces = ["north", "south", "east", "west", "ceiling", "floor"];
		var totalBoxes = (turnedBoxes.length) ? boxes.length+turnedBoxes.length : boxes.length;
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
			} else {
				box = boxes[i-turnedBoxes.length];
				facing = tempFace;
				push = false;
			}
			
			switch (facing) {
				case "north":
					if (myX > box.x) {
						leftRightCenter = "left";
						relSurfaces = ["front", null, null, "left", "ceiling", "floor"];
					} else if (myX < box.x) {
						leftRightCenter = "right";
						relSurfaces = ["front", null, "right", null, "ceiling", "floor"];
					} else {
						leftRightCenter = "center";
						relSurfaces = ["front", null, "right", "left", "ceiling", "floor"];
					}
					z = myY - box.y;				
					break;
				case "east":
					if (myY > box.y) {
						leftRightCenter = "left";
						relSurfaces = ["left", null, "front", null, "ceiling", "floor"];
					} else if (myY < box.y) {
						leftRightCenter = "right";
						relSurfaces = [null, "right", "front", null, "ceiling", "floor"];
					} else {
						leftRightCenter = "center";
						relSurfaces = ["left", "right", "front", null, "ceiling", "floor"];
					}
					z = box.x - myX;					
					break;
				case "south":
					if (myX > box.x) {
							leftRightCenter = "right";
							relSurfaces = [null, "front", null, "right", "ceiling", "floor"];
						} else if (myX < box.x) {
							leftRightCenter = "left";
							relSurfaces = [null, "front", "left", null, "ceiling", "floor"];
						} else {
							leftRightCenter = "center";
							relSurfaces = [null, "front", "left", "right", "ceiling", "floor"];
						}
						z = box.y - myY;				
					break;
				case "west":
					if (myY > box.y) {
							leftRightCenter = "right";
							relSurfaces = ["right", null, null, "front", "ceiling", "floor"];
						} else if (myY < box.y) {
							leftRightCenter = "left";
							relSurfaces = [null, "left", null, "front", "ceiling", "floor"];
						} else {
							leftRightCenter = "center";
							relSurfaces = ["right", "left", null, "front", "ceiling", "floor"];
						}
						z = myX - box.x;	
					break;
			}
			
			if (z != zCopy) {
 				zCopy = z;
				e.zChanged = true;
			}

			for (var j = 0; j <= relSurfaces.length; j++) {
				var wasFrontFar = false;
				var rsurface = relSurfaces[j];
				var asurface = absSurfaces[j];
				var pattern = box.getPattern(asurface);
				if (pattern != null && relSurfaces[j] != null){
					var surface = rsurface + "_" + leftRightCenter;	
					e.setUpTexture(pattern, surface);
					e.drawSurface(z, pattern, surface, push);
				}
			}
		}
	}
	
	getBoxes(facing:string, myX:number, myY:number) {
		var e = this;
		var displayBoxes = [];
		var order = [-1, 1, 0];
		var playerBox = (e.zAnim > 0) ? -1 : 0;
		switch(facing) {
			case "north":
				for (var y = 8; y >= playerBox; y--) {
						var rowNum = myY - y;
						for (var x = 0; x < order.length; x++) {
							var xx = myX + order[x];
							var pos  = xx.toString() + "," + rowNum.toString();
							if (typeof e.boxes[xx] !== "undefined" && typeof e.boxes[xx][rowNum] !== "undefined") {
								displayBoxes.push(e.boxes[xx][rowNum]);
							}
						}
				}
				break;
			case "south":
				for (var y = 8; y >= playerBox; y--) {
						var rowNum = myY + y;
						for (var x = 0; x < order.length; x++) {
							var xx = myX + order[x];
							var pos  = xx.toString() + "," + rowNum.toString();
							if (typeof e.boxes[xx] !== "undefined" && typeof e.boxes[xx][rowNum] !== "undefined") {
								displayBoxes.push(e.boxes[xx][rowNum]);
							}
						}
				}
				break;
			case "east":
				for (var x = 8; x >= playerBox; x--) {
					var colNum = myX + x;
					for (var y = 0; y < order.length; y++) {
						var yy = myY + order[y];
						var pos  = colNum.toString() + "," + yy.toString();
						if (typeof e.boxes[colNum] !== "undefined" && typeof e.boxes[colNum][yy] !== "undefined") {
							displayBoxes.push(e.boxes[colNum][yy]);
						}
					}
				}
				break;
			case "west":
				for (var x = 8; x >= playerBox; x--) {
						var colNum = myX - x;
						for (var y = 0; y < order.length; y++) {
							var yy = myY + order[y];
							var pos  = colNum.toString() + "," + yy.toString();
							if (typeof e.boxes[colNum] !== "undefined" && typeof e.boxes[colNum][yy] !== "undefined") {
								displayBoxes.push(e.boxes[colNum][yy]);
							}
						}
				}
				break;		
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
	
	drawSurface(z:number, pattern:string, surfaceType:string, push:boolean) {
		var e = this;
		// lookup uniforms
		// set the resolution
		e.gl.uniform2f(e.resolutionLocation, e.cw, e.ch);
		e.gl.bindBuffer(e.gl.ARRAY_BUFFER, e.positionBuffer);
		e.gl.enableVertexAttribArray(e.positionLocation);
		e.gl.vertexAttribPointer(e.positionLocation, 2, e.gl.FLOAT, false, 0, 0);

		var w = +pack[pattern][surfaceType]["w"];// * total_width;
		var h = +pack[pattern][surfaceType]["h"];// * total_height;
		w=e.tileSizeRef*w/h;
		h=e.tileSizeRef;
		var zScale = Math.pow(2,z+e.zAnim);
		var scenePush = 0;
		var diff;

		//console.log(easing);
		// logic for setting temp variable to be used for drawing turning farther than canvas size
		if (push) {
            if(e.slide < 0) {
			     scenePush = e.cw;
            }
            else {
                scenePush = -e.cw;
            }
		}
		/*
		if (e.zChanged && e.slide != 0) {
			
		}
		*/
		
		
		switch(surfaceType) {
			case "left_center":
				// diff = w-h/4; //I commented out what is untested
				setRectangle(e.gl, (e.cw/2-(e.tileSizeRef/(zScale)))+e.slide+scenePush+e.turnPush, 
							 e.ch/2-(e.tileSizeRef/(zScale))-1, 
							 e.tileSizeRef/(zScale*2)+1, 
							 2*e.tileSizeRef/(zScale)+2, e.rectangle);
				break;
			case "ceiling_center":
				// diff = h-w/4;
				setRectangle(e.gl, (e.cw/2-(e.tileSizeRef/(zScale))-1)+e.slide+scenePush+e.turnPush, 
							 e.ch/2-(e.tileSizeRef/(zScale)), 
							 2*e.tileSizeRef/zScale+2, 
							 e.tileSizeRef/(zScale*2)+1, e.rectangle);
				break;
			case "floor_center":
				diff = h-w/4;
				setRectangle(e.gl, (e.cw/2-(e.tileSizeRef/(zScale))-1)+e.slide+scenePush+e.turnPush, 
							 e.ch/2+((e.tileSizeRef-diff)/(zScale*2)), 
							 2*e.tileSizeRef/zScale+3, 
							 (e.tileSizeRef+diff)/(zScale*2)+1.5, e.rectangle);
				break;
			case "right_center":
				// diff = w-h/4;
				setRectangle(e.gl, (e.cw/2+(e.tileSizeRef/(zScale*2)))+e.slide+scenePush+e.turnPush, 
							 e.ch/2-(e.tileSizeRef/(zScale))-1, 
							 e.tileSizeRef/(zScale*2)+1, 
							 2*e.tileSizeRef/(zScale)+2, e.rectangle);
				break;
			case "front_center":
				// diff = h-w;//this allows front walls to be extend horizontally
				setRectangle(e.gl, (e.cw/2-(e.tileSizeRef/(zScale*2)))+e.slide+scenePush+e.turnPush, 
							 e.ch/2-(e.tileSizeRef/(zScale*2)), 
							 e.tileSizeRef/zScale+1, 
							 e.tileSizeRef/zScale+1, e.rectangle);
				break;
			case "left_left":
				// diff = w-h/2;
				setRectangle(e.gl, (e.cw/2-(3*e.tileSizeRef/(zScale)))+e.slide+scenePush+e.turnPush, 
							 e.ch/2-(e.tileSizeRef/(zScale))-1, 
							 3*e.tileSizeRef/(zScale*2)+1, 
							 2*e.tileSizeRef/(zScale)+2, e.rectangle);
				break;
			case "front_left":
				// diff = h-w;
				setRectangle(e.gl, (e.cw/2-(3*e.tileSizeRef/(zScale*2)))+e.slide+scenePush+e.turnPush, 
							 e.ch/2-(e.tileSizeRef/(zScale*2)), 
							 e.tileSizeRef/zScale+1, 
							 e.tileSizeRef/zScale+1, e.rectangle);
				break;
			case "floor_left":
				diff = h-w/5;
				setRectangle(e.gl, (e.cw/2-(3*e.tileSizeRef/(zScale))-1)+e.slide+scenePush+e.turnPush, 
							 e.ch/2+((e.tileSizeRef-diff)/(zScale*2)), 
							 5*e.tileSizeRef/(zScale*2)+2, 
							 (e.tileSizeRef+diff)/(zScale*2)+1.5, e.rectangle);
				break;
			case "ceiling_left":
				// diff = h-w/5;
				setRectangle(e.gl, (e.cw/2-(3*e.tileSizeRef/(zScale))-1)+e.slide+scenePush+e.turnPush, 
							 e.ch/2-(e.tileSizeRef/(zScale)), 
							 5*e.tileSizeRef/(zScale*2)+2, 
							 e.tileSizeRef/(zScale*2)+1, e.rectangle);
				break;
			case "right_right":
				// diff = w-h/2;
				setRectangle(e.gl, (e.cw/2+(3*e.tileSizeRef/(zScale*2)))+e.slide+scenePush+e.turnPush, 
							 e.ch/2-(e.tileSizeRef/(zScale))-1, 
							 3*e.tileSizeRef/(zScale*2)+1, 
							 2*e.tileSizeRef/(zScale)+2, e.rectangle);
				break;
			
			case "front_right":
				// diff = h-w;
				setRectangle(e.gl, (e.cw/2+(e.tileSizeRef/(zScale*2)))+e.slide+scenePush+e.turnPush, 
							 e.ch/2-(e.tileSizeRef/(zScale*2)), 
							 e.tileSizeRef/zScale+1, 
							 e.tileSizeRef/zScale+1, e.rectangle);
				break;
			case "floor_right":
				diff = h-w/5;
				setRectangle(e.gl, (e.cw/2+(e.tileSizeRef/(zScale*2))-1)+e.slide+scenePush+e.turnPush, 
							 e.ch/2+((e.tileSizeRef-diff)/(zScale*2)), 
							 5*e.tileSizeRef/(zScale*2)+2, 
							 (e.tileSizeRef+diff)/(zScale*2)+1.5, e.rectangle);
				break;
			case "ceiling_right":
				// diff = h-w/5;
				setRectangle(e.gl, (e.cw/2+(e.tileSizeRef/(zScale*2))-1)+e.slide+scenePush+e.turnPush, 
							 e.ch/2-(e.tileSizeRef/(zScale)), 
							 5*e.tileSizeRef/(zScale*2)+2, 
							 e.tileSizeRef/(zScale*2)+1, e.rectangle);
				break;
		}
		e.gl.drawArrays(e.gl.TRIANGLES, 0, 6);
	}
	
	readInput(keyEvent:KeyboardEvent){
		var e = this;
		if (e.zAnim != 0 || e.slide != 0)
			return;
		switch(keyEvent.key) {
			case "w":
			 	if (e.checkWall()) {
				 	e.zAnim = -0.3;
					return;
				}
				if (e.getPlayerFacing() =="east") 
						e.myPlayer.setX(e.myPlayer.getX()+1);
				else if (e.getPlayerFacing()=="north") 
					e.myPlayer.setY(e.myPlayer.getY()-1);
				else if (e.getPlayerFacing()=="west") 
					e.myPlayer.setX(e.myPlayer.getX()-1);
				else
					e.myPlayer.setY(e.myPlayer.getY()+1);
				e.zAnim = 1;
				break;
			case "a":
				e.slide = -e.cw;
				if (e.getPlayerFacing()=="east") {
					e.turnFace = "east";
				    e.myPlayer.setFacing("north");	
				}
				else if (e.getPlayerFacing()=="north") {
					e.turnFace = "north";
					e.myPlayer.setFacing("west");
				}
				else if (e.getPlayerFacing()=="west") {
					e.turnFace = "west";
					e.myPlayer.setFacing("south");
				}
				else {
					e.turnFace = "south";
					e.myPlayer.setFacing("east");
				}
				break;
			case "s":
				if(e.checkWall(true)) { 
					return;
				}
				if (e.getPlayerFacing()=="east")
					e.myPlayer.setX(e.myPlayer.getX()-1);
				else if (e.getPlayerFacing()=="north")
					e.myPlayer.setY(e.myPlayer.getY()+1);
				else if (e.getPlayerFacing()=="west") 
					e.myPlayer.setX(e.myPlayer.getX()+1);
				else
					e.myPlayer.setY(e.myPlayer.getY()-1);
				e.zAnim = -1;
				break;
			case "d":
                e.slide = e.cw;
				if (e.getPlayerFacing()=="east"){
                    e.turnFace = "east";
					e.myPlayer.setFacing("south");
                }
				else if (e.getPlayerFacing()=="south"){
                    e.turnFace = "south";
					e.myPlayer.setFacing("west");
                }
				else if (e.getPlayerFacing()=="west"){
                    e.turnFace = "west";
					e.myPlayer.setFacing("north");
                }
				else{
                    e.turnFace = "north";
					e.myPlayer.setFacing("east");
                }
				break;
		}
	}
	
	checkWall(behind:boolean=false) {
		var e = this;
		var facing = e.getPlayerFacing();
		var pos = e.getPlayerPosition();
		switch(facing) {
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
	}
		
} // end engine 
} // end module

function setRectangle(gl, x, y, width, height, buffer:Float32Array) {
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