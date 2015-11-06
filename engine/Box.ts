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

module utils {
	export class Box {
		ceilingSurface:string;
		floorSurface:string;
		northSurface:string;
		eastSurface:string;
		westSurface:string
		southSurface:string;
		x:number;
		y:number;
		z:number;
		occupant:boolean;
		
		constructor(x, y, parts: JSON) {
			this.x = x;
			this.y = y;
			this.ceilingSurface = parts['ceil'];
			this.floorSurface = parts['floor'];
			this.northSurface = parts['north'];
			this.southSurface = parts['south'];
			this.eastSurface = parts['east'];
			this.westSurface = parts['west'];
		}

	}
}