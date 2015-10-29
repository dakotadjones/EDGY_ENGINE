/// <reference path="Engine.ts" />

var edgy;
window.onload = run;
function run() {
	edgy = new engine.Engine();
	edgy.load("gameport");
}
