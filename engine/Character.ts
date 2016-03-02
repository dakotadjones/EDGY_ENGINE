module utils {
	export class Character {
		x:number;
		y:number;
		facing:string;
		name:string;
		scale:number;
			
		constructor(parts:JSON) {
			this.x = parts["x"];
			this.y = parts["y"];
			this.name = parts["name"];
			this.facing = parts["facing"];
			this.scale = parts["scale"];
		}
		
		getFacing() {
			return this.facing;
		}
		
		getName() {
			return this.name;
		}
		
		getX() {
			return this.x;
		}
		
		getY() {
			return this.y;
		}
		
		getScale() {
			return this.scale;
		}
		
		setFacing(facing:string) {
			this.facing = facing;
		}
		
		setX(x:number) {
			this.x = x;
		}
		
		setY(y:number) {
			this.y = y;
		}
		
		update(){
			switch(name){
				case "slenderman":
				  //do stuff
				break;
			}
		}
	}
}

//cx = x + w/2 - cw/2 + shift
//cy = (s/2)*scale //roughly