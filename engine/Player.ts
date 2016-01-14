module player {
	export class Player {
		x:number;
		y:number;
		facing:string;
		constructor(x=0, y=0, facing="east") {
			this.x = x;
			this.y = y;
			this.facing = facing;			
		}
		
		setX(x:number) {
			this.x = x;
		}
		
		setY(y:number) {
			this.y = y;
		}
		
		setFacing(facing:string) {
			this.facing = facing;
		}
		
		getFacing() {
			return this.facing;
		}
		
		getCoordinates() {
			console.log("getting coordinates");
			return [this.x, this.y];
		}
	}
}