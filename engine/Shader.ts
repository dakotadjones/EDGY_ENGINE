/* Shader class that creates the programs for specified WebGL context
 *
 */

module utils {
export class Shader {
	fragmentShader:WebGLShader;
	vertexShader:WebGLShader;
	gl: WebGLRenderingContext;
	program: WebGLProgram;
	constructor(gl:WebGLRenderingContext) {
		this.gl = gl;
	}
	// get the text and pass it to load shader
	getShader(id) {
		var shaderSource:string;
		var shaderType;
		var shaderScript = document.getElementById(id);
		shaderSource = shaderScript.innerHTML;
		if (shaderScript.getAttribute('type') == 'x-shader/x-fragment')	{
			shaderType = this.gl.FRAGMENT_SHADER;
			this.fragmentShader = this.loadShader(shaderSource, shaderType);
		} else if (shaderScript.getAttribute('type') == 'x-shader/x-vertex') {
			shaderType = this.gl.VERTEX_SHADER;
			this.vertexShader = this.loadShader(shaderSource, shaderType);
		}			
	}
	// load and compile the shaders
	loadShader(source:string, type) {
		var shader = this.gl.createShader(type);
		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);
		var compiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
		if(!compiled) {
			// Something went wrong during compilation; get the error
      		var lastError = this.gl.getShaderInfoLog(shader);
			alert("Error compiling " + type + " shader");
      		console.log("*** Error compiling shader '" + shader + "':" + lastError);
     		this.gl.deleteShader(shader);
      		return null;
		}
		return shader;
	}
	// finally create and link the program
	createProgram(shaders:Array<WebGLShader>) {
		this.program = this.gl.createProgram();
		var s = this;
		shaders.forEach(function(shader){
			s.gl.attachShader(s.program, shader);
		});
		
		this.gl.linkProgram(this.program);

		// Check the link status
		var linked = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);
		if (!linked) {
			// something went wrong with the link
			var lastError = this.gl.getProgramInfoLog(this.program);
			alert("Error in program linking");
			console.log("Error in program linking:" + lastError);
	
			this.gl.deleteProgram(this.program);
			return null;
		}
		return this.program;
	}
}
}