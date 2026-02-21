Console.clear();
Console.startBenchmark();


Content.makeFrontInterface(336, 427);

include("Core/include.js");
include("Styles/include.js");
include("FileLoader.js");
include("Random.js");
include("EyesData.js");
include("SpotlightXY.js");
include("DotVideo.js");
include("Motion.js");
include("UI_Misc.js");
include("Router.js");
include("ZoomHandler.js");
include("Defaulter.js");

Console.stopBenchmark();

const var MadeBy_btn = Content.getComponent("MadeBy_btn");
MadeBy_btn.setValue(0);
MadeBy_btn.changed();


DotVideo.setGridSize(50, 50);


inline function onButton1Control(component, value) {
	if (value) {


		Engine.openWebsite('https://sinuslabs.io/');
	}
};

Content.getComponent("Button1").setControlCallback(onButton1Control);
function onNoteOn() {
	Motion.startAnimation();
	SpotlightXY.startAnimation();
}
function onNoteOff() {
	Motion.stopAnimation();
	SpotlightXY.stopAnimation();

}
function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 