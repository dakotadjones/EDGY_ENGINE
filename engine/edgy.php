<!doctype html >
<head>		
    <meta charset="UTF-8">
	<title>Interactive</title>
    <link rel="stylesheet" type="text/css" href="styles/main.css">
</head>
<script id="shader-fs" type="x-shader/x-fragment">
precision mediump float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader
varying vec2 v_texCoord;

// alpha for transparency
uniform float uAlpha;

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    gl_FragColor = vec4(color.rgb, color.a * uAlpha); //color;
}
</script>
<script id="shader-vs" type="x-shader/x-vertex">
attribute vec2 a_position; // position of the vertex
attribute vec2 a_texCoord;

uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
   vec2 zeroToOne = a_position / u_resolution;

   // convert from 0->1 to 0->2
   vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   vec2 clipSpace = zeroToTwo - 1.0;

   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

   // pass the texCoord to the fragment shader
   v_texCoord = a_texCoord;

}
</script>

<body>
    <canvas id="gameport" height="450" width="800" style="background-color:black"></canvas>
    <input type="hidden" id="fps-record"/>
    <div id="fps_counter" style="position: absolute; z-index: 1000; display: block; top: 60px; left: 300px; color: white;
                                 width: 50px; text-align: center; height: 18px; background-color: #111111; font-size: 14px;
                                 color: grey; border-radius: 18px;">FPS</div>
    
    <div id="debug-wrapper" style="position: absolute; z-index: 1000; display: block; top: 10px; right: 10px; color: white;
                                 width: 250px; text-align: center; height: auto; background-color: #111111; font-size: 14px;
                                 border-radius: 8px;">Debug Screen
    <div id="debug"></div>
    </div>
</body>
<script type="text/javascript">
    var map_json;
<?php
if (isset($_POST["map"]) && isset($_POST["packType"]) && isset($_POST["pack"])) {
    echo "map_json=".$_POST["map"].";\n";
    echo "var pack_type=\"".$_POST["packType"]."\";\n";
    echo "var pack_name=\"".$_POST["pack"]."\";";
}
?>
</script>
<script type="text/javascript" src="edgy.js"></script>
</html>
