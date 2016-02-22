System Developed for Rendering Engine Capstone 
Last Updated: 2/21/2016
Blender Version: 2.76

(1) Open the template.blend and develope textures on the inside planes of the cube 
	- Template Changes: Delete front face, set camera position/settings, set lamp position

(2) Once satisfied open the exponential script and copy/paste code into the python console of blender (Make sure you are in object mode)
	- This will copy your creation on the center cube onto two more cubes and place them in correct positions 
	- It will then run the exponential perspective code developed by Dr. Palmer 

(3) Delete the inside facing faces of the left and right cube *Hopefully will have this built into a script soon* 
	- select the left cube in object mode 
	- switch to edit mode (tab) and click the face select button on the lower toolbar 
	- right click the innner facing face (closest to center cube) and click delete and select only faces
	- repeat for right side cube 

(4) Open rendering script and make sure file path is configured to your specific system and copy/paste code into the python console of blender 
	- this will output two png files that will allow you to get all correct textures for the rendering engine 
	