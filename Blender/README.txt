System Developed for Rendering Engine Capstone 
Last Updated: 2/24/2016
Blender Version: 2.76

(1) Open the template.blend and develope textures on the inside planes of the cube 
	- Template Changes: Delete front face, set camera position/settings, set lamp position, add two more cameras, make all surfaces their own mesh

* Make sure to specify a correct folder in the rendering_script before running it *
(2) Once satisfied open the rendering_script and copy/paste code into the python console of blender (Make sure you are in object mode)
	- This will copy your creation on the center cube onto two more cubes and place them in correct positions 
	- It will then run the exponential perspective code developed by Dr. Palmer
	- It will then render out every surface needed into a filepath defined by the user  
