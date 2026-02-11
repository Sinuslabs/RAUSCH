Console.clear();
Console.startBenchmark();

include("XYPad.js");
include("Core/include.js");

Content.makeFrontInterface(448, 536);


include("Styles/include.js");

Console.stopBenchmark();

include("FileLoader.js");

include("Random.js");


include("Motion.js");
include("UI_Misc.js");
include("Router.js"); 
//include("Drop.js");function onNoteOn()
{
	Motion.startAnimation();
}
 function onNoteOff()
{
	Motion.stopAnimation();
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
 