Console.clear();
Console.startBenchmark();


Content.makeFrontInterface(336, 427);

include("XYPad.js");
include("Core/include.js");
include("Styles/include.js");
include("FileLoader.js");
include("Random.js");
include("Motion.js");
include("UI_Misc.js");
include("Router.js"); 

Console.stopBenchmark();

function onNoteOn()
{
	Motion.startAnimation();
	XYPad.startAnimation();
}
 function onNoteOff()
{
	Motion.stopAnimation();
	XYPad.stopAnimation();
	
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
 