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
		ceiling_surface:string;
		floor_surface:string;
		north_surface:string;
		east_surface:string;
		west_surface:string
		south_surface:string;
		perspective:string;
		z:number;
		
		constructor(parts: JSON) {
			this.ceiling_surface = parts['ceil'];
			this.floor_surface = parts['floor'];
			this.north_surface = parts['north'];
			this.south_surface = parts['south'];
			this.east_surface = parts['east'];
			this.west_surface = parts['west'];
		}
		
		setPerspective(p) {
			switch(p) {
				case 'right':
					this.perspective = 'right';
					break;
				case 'left':
					this.perspective = 'left';
					break;
				default:
					this.perspective = 'center';
			}
		}
				
		setDistance(z:number) {
			this.z = z;
		}
		
		getDistance() {
			return this.z
		}
	}
}